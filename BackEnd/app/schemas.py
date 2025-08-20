from pydantic import BaseModel
from datetime import datetime

class FileOut(BaseModel):
    id: int
    filename: str
    content_type: str | None = None
    size: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True
