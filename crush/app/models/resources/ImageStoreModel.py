from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import UUID, VARCHAR
from sqlalchemy.orm import Mapped

from app.core.database.database import BaseTable


class ImageStoreModel(BaseTable):
  __tablename__ = "image_store"
  __table_args__ = {
    "schema": "resources"
  }

  uid: Mapped[str] = Column(UUID(as_uuid=True), primary_key=True, nullable=False, unique=True,
                            server_default="gen_random_uuid()")
  mime_type: Mapped[str] = Column(VARCHAR(32), nullable=False)
