import os, re, unicodedata
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from starlette.responses import FileResponse

from ..db import get_db
from ..models import File as FileModel
from ..schemas import FileOut

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
async def upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # MIME tipi kontrolü (opsiyonel; .env boş ise kontrol yapılmaz)
    if ALLOWED_MIME and (file.content_type not in ALLOWED_MIME):
        raise HTTPException(status_code=415, detail=f"Unsupported media type: {file.content_type}")

    original = safe_name(file.filename)
    final_name = resolve_collision(STORAGE_DIR, original)
    dest_path = os.path.join(STORAGE_DIR, final_name)

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
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

@router.get("/", response_model=list[FileOut])
def list_files(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return (db.query(FileModel)
              .order_by(FileModel.created_at.desc())
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
    try:
        if os.path.exists(rec.path):
            os.remove(rec.path)
    finally:
        db.delete(rec)
        db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
