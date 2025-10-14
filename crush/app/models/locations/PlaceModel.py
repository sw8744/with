from uuid import UUID as PyUUID

from sqlalchemy import Column, ForeignKey, event
from sqlalchemy.dialects.postgresql import UUID, VARCHAR, DOUBLE_PRECISION, ARRAY, JSONB, TEXT
from sqlalchemy.orm import Mapped, relationship, backref

from app.core.database.database import BaseTable
from app.core.hangul.umso import 풀어쓰기
from app.models.locations.RegionModel import RegionModel


class PlaceModel(BaseTable):
  __tablename__ = "places"
  __table_args__ = {
    "schema": "locations"
  }

  uid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, unique=True, nullable=False,
                               server_default="gen_random_uuid()")
  name: Mapped[str] = Column(VARCHAR(64), nullable=False, server_default="")
  name_umso: Mapped[str] = Column(VARCHAR(320), nullable=False, server_default="")
  description: Mapped[str] = Column(TEXT, nullable=False, server_default="")
  coordinate: Mapped[list[float]] = Column(ARRAY(DOUBLE_PRECISION))
  address: Mapped[str] = Column(VARCHAR(128))
  region_uid: Mapped[PyUUID] = Column(UUID(as_uuid=True), ForeignKey("locations.regions.uid"))
  thumbnail: Mapped[str] = Column(TEXT)
  place_meta: Mapped[dict] = Column("metadata", JSONB, server_default="{}", nullable=False)

  region: Mapped[RegionModel] = relationship(
    "RegionModel",
    uselist=False,
    backref=backref(
      "locations",
      uselist=True,
      cascade="all, delete-orphan",
      passive_deletes=True
    )
  )


@event.listens_for(PlaceModel, 'before_insert')
@event.listens_for(PlaceModel, 'before_update')
def place_name_save_umso(mapper, db, target: PlaceModel):
  target.name_umso = 풀어쓰기(target.name)
