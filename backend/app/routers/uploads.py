from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

from app.services.file_service import ensure_safe_upload_path


router = APIRouter()


@router.get("/{filename}")
def get_upload(filename: str) -> FileResponse:
    file_path = ensure_safe_upload_path(filename)
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fichier introuvable.")

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=filename,
        content_disposition_type="inline",
    )
