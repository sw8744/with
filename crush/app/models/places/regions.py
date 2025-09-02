from uuid import UUID as PyUUID

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import UUID, VARCHAR
from sqlalchemy.orm import Mapped

from app.database import BaseTable


class RegionModel(BaseTable):
  __tablename__ = "regions"
  __table_args__ = {
    "schema": "locations"
  }

  uid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, unique=True, nullable=False,
                               server_default='gen_random_uuid()')
  name: Mapped[str] = Column(VARCHAR(64), nullable=False)
