from pydantic import BaseModel, Field

from app.schemas.user import UserRead


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=80)
    password: str = Field(..., min_length=1, max_length=256)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
