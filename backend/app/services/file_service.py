import re
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings


PDF_MIME_TYPES = {"application/pdf", "application/x-pdf", "application/octet-stream"}


def sanitize_filename(filename: str) -> str:
    name = Path(filename).name.strip()
    name = re.sub(r"[^A-Za-z0-9_.-]+", "-", name)
    name = re.sub(r"-{2,}", "-", name).strip(".-")
    return name or "course.pdf"


def ensure_safe_upload_path(filename: str) -> Path:
    safe_name = Path(filename).name
    if filename != safe_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nom de fichier invalide.")

    file_path = settings.UPLOAD_DIR / safe_name
    try:
        file_path.resolve().relative_to(settings.UPLOAD_DIR.resolve())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chemin invalide.") from exc
    return file_path


async def save_pdf_upload(file: UploadFile) -> dict[str, str | int]:
    original_filename = file.filename or ""
    safe_original = sanitize_filename(original_filename)

    if not safe_original.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seuls les fichiers PDF sont acceptés.",
        )

    if file.content_type and file.content_type not in PDF_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le type MIME du fichier doit être PDF.",
        )

    content = await file.read()
    file_size = len(content)

    if file_size == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Le fichier PDF est vide.")

    if file_size > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Le fichier dépasse la taille maximale de {settings.MAX_UPLOAD_SIZE_MB} Mo.",
        )

    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    stored_filename = f"{uuid4().hex}-{safe_original}"
    file_path = ensure_safe_upload_path(stored_filename)
    file_path.write_bytes(content)

    return {
        "filename": stored_filename,
        "original_filename": safe_original,
        "file_path": str(file_path),
        "file_size": file_size,
    }


def delete_pdf_file(filename: str) -> None:
    file_path = ensure_safe_upload_path(filename)
    if file_path.exists():
        file_path.unlink()
