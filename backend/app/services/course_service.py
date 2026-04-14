from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.course import Course
from app.schemas.course import CourseRead


def course_to_read(course: Course) -> CourseRead:
    return CourseRead(
        id=course.id,
        title=course.title,
        description=course.description,
        filename=course.filename,
        original_filename=course.original_filename,
        file_path=course.file_path,
        file_size=course.file_size,
        created_at=course.created_at,
        updated_at=course.updated_at,
        pdf_url=f"/api/uploads/{course.filename}",
    )


def count_total_storage(db: Session) -> int:
    return int(db.query(func.coalesce(func.sum(Course.file_size), 0)).scalar() or 0)
