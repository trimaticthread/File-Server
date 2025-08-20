from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class File(Base):
    __tablename__ = "files"

    # 1,2,3 diye artan id
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Dosya sisteminde de bu isimle tutacağız
    filename: Mapped[str] = mapped_column(String(255), nullable=False)

    content_type: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Tam dosya yolu (orijinal adla)
    path: Mapped[str] = mapped_column(String(1024), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
