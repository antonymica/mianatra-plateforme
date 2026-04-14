from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.course import Course
from app.models.user import User
from app.routers.auth import get_current_admin
from app.schemas.course import AdminStats, CourseRead
from app.services.course_service import count_total_storage, course_to_read
from app.services.file_service import delete_pdf_file, save_pdf_upload


router = APIRouter()
admin_router = APIRouter()


def get_course_or_404(course_id: int, db: Session) -> Course:
    course = db.query(Course).filter(Course.id == course_id).first()
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cours introuvable.")
    return course


@router.get("", response_model=list[CourseRead])
def list_courses(db: Session = Depends(get_db)) -> list[CourseRead]:
    courses = db.query(Course).order_by(Course.created_at.desc()).all()
    return [course_to_read(course) for course in courses]


@router.get("/{course_id}", response_model=CourseRead)
def get_course(course_id: int, db: Session = Depends(get_db)) -> CourseRead:
    return course_to_read(get_course_or_404(course_id, db))


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
async def create_course(
    title: str = Form(..., min_length=3, max_length=180),
    description: str = Form(..., min_length=1),
    file: UploadFile = File(...),
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> CourseRead:
    file_data = await save_pdf_upload(file)
    course = Course(title=title.strip(), description=description.strip(), **file_data)
    db.add(course)
    db.commit()
    db.refresh(course)
    return course_to_read(course)


@router.put("/{course_id}", response_model=CourseRead)
async def update_course(
    course_id: int,
    title: str = Form(..., min_length=3, max_length=180),
    description: str = Form(..., min_length=1),
    file: UploadFile | None = File(default=None),
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> CourseRead:
    course = get_course_or_404(course_id, db)
    course.title = title.strip()
    course.description = description.strip()

    old_filename: str | None = None
    if file is not None and file.filename:
        file_data = await save_pdf_upload(file)
        old_filename = course.filename
        course.filename = str(file_data["filename"])
        course.original_filename = str(file_data["original_filename"])
        course.file_path = str(file_data["file_path"])
        course.file_size = int(file_data["file_size"])

    db.commit()
    db.refresh(course)
    if old_filename:
        delete_pdf_file(old_filename)
    return course_to_read(course)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> None:
    course = get_course_or_404(course_id, db)
    filename = course.filename
    db.delete(course)
    db.commit()
    delete_pdf_file(filename)


@admin_router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> AdminStats:
    total_courses = db.query(Course).count()
    latest_course = db.query(Course).order_by(Course.created_at.desc()).first()

    return AdminStats(
        total_courses=total_courses,
        total_pdf_files=total_courses,
        total_storage_bytes=count_total_storage(db),
        latest_course=course_to_read(latest_course) if latest_course else None,
    )
