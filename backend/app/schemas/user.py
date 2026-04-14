from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserRead(BaseModel):
    id: int
    username: str
    is_admin: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
