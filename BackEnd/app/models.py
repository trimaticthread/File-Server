from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, func, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class File(Base):
    __tablename__ = "files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)

    content_type: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    path: Mapped[str] = mapped_column(String(1024), nullable=False)

    is_directory: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    parent_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
