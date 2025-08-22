import os, re, unicodedata
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from starlette.responses import FileResponse

from ..db import get_db
from ..models import File as FileModel
from ..schemas import FileOut, CreateFolderRequest

router = APIRouter()
STORAGE_DIR = os.getenv("STORAGE_DIR", "/storage")
os.makedirs(STORAGE_DIR, exist_ok=True)

# ENV tabanlı kısıtlar
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "100"))
ALLOWED_MIME = {m.strip() for m in os.getenv("ALLOWED_MIME_TYPES", "").split(",") if m.strip()}

def safe_name(name: str) -> str:
    """
    Unicode (Türkçe dahil) harf ve rakamları korur.
    Boşlukları '_' yapar, riskli karakterleri '_' ile değiştirir.
    NFC normalize ederek platformlar arası aynı görsel ada aynı baytları üretir.
    """
    base = os.path.basename(name or "file").strip()
    if not base:
        base = "file"

    # Normalize: NFD -> NFC (macOS gibi sistemlerde aksanlı harf ayrışmasını toparlar)
    base = unicodedata.normalize("NFC", base)

    # klasör ayırıcıları temizle
    base = base.replace("\\", "_").replace("/", "_")

    out_chars: list[str] = []
    for ch in base:
        cat = unicodedata.category(ch)  # 'L*'/'N*' harf/rakam
        if cat.startswith("L") or cat.startswith("N"):
            out_chars.append(ch)
        elif ch in {".", "-", "_", " ", "(", ")"}:
            out_chars.append(ch)
        else:
            out_chars.append("_")

    sanitized = "".join(out_chars).strip()
    sanitized = re.sub(r"\s+", "_", sanitized)

    if not sanitized or set(sanitized) == {"."}:
        sanitized = "file"

    return sanitized

def resolve_collision(dirpath: str, filename: str) -> str:
    name, ext = os.path.splitext(filename)
    candidate = filename
    i = 1
    while os.path.exists(os.path.join(dirpath, candidate)):
        candidate = f"{name}-{i}{ext}"
        i += 1
    return candidate

@router.post("/upload", response_model=FileOut)
async def upload(file: UploadFile = File(...), parent_id: int = None, db: Session = Depends(get_db)):
    # MIME tipi kontrolü (opsiyonel; .env boş ise kontrol yapılmaz)
    if ALLOWED_MIME and (file.content_type not in ALLOWED_MIME):
        raise HTTPException(status_code=415, detail=f"Unsupported media type: {file.content_type}")

    # Parent klasör kontrolü
    target_dir = STORAGE_DIR
    if parent_id:
        parent = db.get(FileModel, parent_id)
        if not parent or not parent.is_directory:
            raise HTTPException(status_code=400, detail="Invalid parent folder")
        target_dir = parent.path

    original = safe_name(file.filename)
    final_name = resolve_collision(target_dir, original)
    dest_path = os.path.join(target_dir, final_name)

    # Boyut limiti (stream halinde kontrol)
    size = 0
    limit = MAX_UPLOAD_MB * 1024 * 1024
    with open(dest_path, "wb") as out:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > limit:
                out.close()
                try:
                    os.remove(dest_path)
                except FileNotFoundError:
                    pass
                raise HTTPException(status_code=413, detail=f"File too large (> {MAX_UPLOAD_MB} MB)")
            out.write(chunk)

    rec = FileModel(
        filename=final_name,
        content_type=file.content_type,
        size=size,
        path=dest_path,
        is_directory=False,
        parent_id=parent_id,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

@router.get("/", response_model=list[FileOut])
def list_files(parent_id: int = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(FileModel)
    if parent_id is None:
        query = query.filter(FileModel.parent_id.is_(None))
    else:
        query = query.filter(FileModel.parent_id == parent_id)
    
    return (query.order_by(FileModel.is_directory.desc(), FileModel.created_at.desc())
              .offset(skip).limit(limit).all())

@router.get("/download/{file_id}")
def download(file_id: int, db: Session = Depends(get_db)):
    rec = db.get(FileModel, file_id)
    if not rec:
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(
        rec.path,
        media_type=rec.content_type or "application/octet-stream",
        filename=rec.filename
    )

@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(file_id: int, db: Session = Depends(get_db)):
    rec = db.get(FileModel, file_id)
    if not rec:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Klasör ise içindeki dosyaları da sil
    if rec.is_directory:
        # Önce alt öğeleri sil
        children = db.query(FileModel).filter(FileModel.parent_id == file_id).all()
        for child in children:
            delete_file(child.id, db)  # Recursive delete
        
        # Klasörü dosya sisteminden sil
        try:
            if os.path.exists(rec.path):
                os.rmdir(rec.path)
        except OSError:
            pass  # Klasör boş değilse devam et
    else:
        # Dosya ise doğrudan sil
        try:
            if os.path.exists(rec.path):
                os.remove(rec.path)
        except FileNotFoundError:
            pass
    
    db.delete(rec)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post("/folders", response_model=FileOut)
def create_folder(request: CreateFolderRequest, db: Session = Depends(get_db)):
    # Parent klasör kontrolü
    target_dir = STORAGE_DIR
    if request.parent_id:
        parent = db.get(FileModel, request.parent_id)
        if not parent or not parent.is_directory:
            raise HTTPException(status_code=400, detail="Invalid parent folder")
        target_dir = parent.path

    folder_name = safe_name(request.name)
    final_name = resolve_collision(target_dir, folder_name)
    folder_path = os.path.join(target_dir, final_name)

    # Klasörü dosya sisteminde oluştur
    os.makedirs(folder_path, exist_ok=True)

    # Veritabanına kaydet
    rec = FileModel(
        filename=final_name,
        content_type=None,
        size=None,
        path=folder_path,
        is_directory=True,
        parent_id=request.parent_id,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec
