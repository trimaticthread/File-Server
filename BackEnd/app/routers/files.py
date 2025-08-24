import os, re, unicodedata
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Response, status, Form, Request
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
    """Unicode (Türkçe dahil) harfleri korur, diğer riskli karakterleri '_' yapar."""
    base = os.path.basename(name or "file").strip()
    if not base:
        base = "file"

    base = unicodedata.normalize("NFC", base)
    base = base.replace("\\", "_").replace("/", "_")

    out_chars: list[str] = []
    for ch in base:
        cat = unicodedata.category(ch)
        if cat.startswith("L") or cat.startswith("N"):
            out_chars.append(ch)
        elif ch in {".", "-", "_", " ", "(", ")"}:
            out_chars.append(ch)
        else:
            out_chars.append("_")

    sanitized = "".join(out_chars).strip()
    sanitized = re.sub(r"\s+", "_", sanitized)

    return sanitized or "file"


def resolve_collision(dirpath: str, filename: str) -> str:
    name, ext = os.path.splitext(filename)
    candidate = filename
    i = 1
    while os.path.exists(os.path.join(dirpath, candidate)):
        candidate = f"{name}-{i}{ext}"
        i += 1
    return candidate


@router.post("/upload", response_model=FileOut)
async def upload(
    request: Request,
    db: Session = Depends(get_db),
):
    # Manuel form parsing
    form = await request.form()
    file = form.get('file')
    parent_id_raw = form.get('parent_id')
    
    print(f"🔍 BACKEND DEBUG - Upload başlıyor:")
    print(f"  - filename: {file.filename if file else 'None'}")
    print(f"  - parent_id_raw: {parent_id_raw}")
    print(f"  - parent_id_raw type: {type(parent_id_raw)}")
    print(f"  - form keys: {list(form.keys())}")
    
    if not file or not hasattr(file, 'filename'):
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # parent_id normalize et
    parsed_parent_id: int | None = None
    if parent_id_raw is not None and str(parent_id_raw).strip():
        s = str(parent_id_raw).strip().lower()
        print(f"  - normalized string: '{s}'")
        if s not in ("", "null", "undefined", "none"):
            try:
                parsed_parent_id = int(s)
                print(f"  - parsed parent_id: {parsed_parent_id}")
            except ValueError:
                print(f"  - ERROR: parent_id parse hatası")
                raise HTTPException(status_code=400, detail="parent_id must be integer")
    
    print(f"  - final parent_id: {parsed_parent_id}")
    # parent_id normalize et
    parent_id: int | None = None
    if parent_id_raw is not None:
        s = str(parent_id_raw).strip().lower()
        if s not in ("", "null", "undefined", "none"):
            try:
                parent_id = int(s)
            except ValueError:
                raise HTTPException(status_code=400, detail="parent_id must be integer")

    # MIME tipi kontrolü
    if ALLOWED_MIME and (file.content_type not in ALLOWED_MIME):
        raise HTTPException(status_code=415, detail=f"Unsupported media type: {file.content_type}")

    # Hedef klasör belirle
    target_dir = STORAGE_DIR
    if parsed_parent_id is not None:
        parent = db.get(FileModel, parsed_parent_id)
        if not parent or not parent.is_directory:
            print(f"  - ERROR: Invalid parent folder - parent: {parent}")
            raise HTTPException(status_code=400, detail="Invalid parent folder")
        target_dir = parent.path
        print(f"  - target_dir (klasör içi): {target_dir}")
    else:
        print(f"  - target_dir (ana dizin): {target_dir}")

    original = safe_name(file.filename)
    final_name = resolve_collision(target_dir, original)
    dest_path = os.path.join(target_dir, final_name)

    # Boyut limiti
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
        parent_id=parsed_parent_id,
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

    if rec.is_directory:
        children = db.query(FileModel).filter(FileModel.parent_id == file_id).all()
        for child in children:
            delete_file(child.id, db)
        try:
            if os.path.exists(rec.path):
                os.rmdir(rec.path)
        except OSError:
            pass
    else:
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
    target_dir = STORAGE_DIR
    if request.parent_id:
        parent = db.get(FileModel, request.parent_id)
        if not parent or not parent.is_directory:
            raise HTTPException(status_code=400, detail="Invalid parent folder")
        target_dir = parent.path

    folder_name = safe_name(request.name)
    final_name = resolve_collision(target_dir, folder_name)
    folder_path = os.path.join(target_dir, final_name)

    os.makedirs(folder_path, exist_ok=True)

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
