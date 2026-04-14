from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CourseBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=180)
    description: str = Field(..., min_length=1)


class CourseRead(CourseBase):
    id: int
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    created_at: datetime
    updated_at: datetime
    pdf_url: str

    model_config = ConfigDict(from_attributes=True)


class AdminStats(BaseModel):
    total_courses: int
    total_pdf_files: int
    total_storage_bytes: int
    latest_course: CourseRead | None
