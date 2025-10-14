from uuid import UUID as PyUUID

from sqlalchemy import Column, event
from sqlalchemy.dialects.postgresql import UUID, VARCHAR, TEXT
from sqlalchemy.orm import Mapped

from app.core.database.database import BaseTable
from app.core.hangul.umso import 풀어쓰기


class RegionModel(BaseTable):
  __tablename__ = "regions"
  __table_args__ = {
    "schema": "locations"
  }

  uid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, unique=True, nullable=False,
                               server_default="gen_random_uuid()")
  name: Mapped[str] = Column(VARCHAR(64), nullable=False, server_default="")
  name_umso: Mapped[str] = Column(VARCHAR(320), nullable=False, server_default="")
  description: Mapped[str] = Column(TEXT, nullable=False, server_default="")
  thumbnail: Mapped[str] = Column(TEXT)


@event.listens_for(RegionModel, 'before_insert')
@event.listens_for(RegionModel, 'before_update')
def region_name_save_umso(mapper, db, target: RegionModel):
  target.name_umso = 풀어쓰기(target.name)
