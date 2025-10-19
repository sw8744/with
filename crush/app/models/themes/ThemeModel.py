from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import INTEGER, VARCHAR, CHAR
from sqlalchemy.orm import Mapped

from app.core.database.database import BaseTable


class ThemeModel(BaseTable):
  __tablename__ = "theme"
  __table_args__ = {
    "schema": "preferences"
  }

  uid: Mapped[int] = Column(INTEGER, primary_key=True, autoincrement=True, nullable=False)
  name: Mapped[str] = Column(VARCHAR(32), nullable=False)
  color: Mapped[str] = Column(CHAR(6), nullable=False)
