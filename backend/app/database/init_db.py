from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.database.connection import Base, SessionLocal, engine
from app.models.course import Course
from app.models.user import User


def create_default_admin(db: Session) -> None:
    admin_exists = db.query(User).filter(User.is_admin.is_(True)).first()
    if admin_exists:
        return

    admin = User(
        username=settings.DEFAULT_ADMIN_USERNAME,
        hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
        is_admin=True,
    )
    db.add(admin)
    db.commit()


def init_database() -> None:
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        create_default_admin(db)
    finally:
        db.close()


__all__ = ["Course", "User", "init_database"]
