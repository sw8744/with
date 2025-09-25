from uuid import UUID as PyUUID

from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, VARCHAR, FLOAT, ARRAY, JSONB, TEXT
from sqlalchemy.orm import Mapped, relationship, backref

from app.database import BaseTable
from app.models.locations.regions import RegionModel


class PlaceModel(BaseTable):
  __tablename__ = "places"
  __table_args__ = {
    "schema": "locations"
  }

  uid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, unique=True, nullable=False,
                               server_default='gen_random_uuid()')
  name: Mapped[str] = Column(VARCHAR(64), nullable=False, server_default='')
  description: Mapped[str] = Column(TEXT, nullable=False, server_default='')
  coordinate: Mapped[list[float]] = Column(ARRAY(FLOAT))
  address: Mapped[str] = Column(VARCHAR(128))
  region_uid: Mapped[PyUUID] = Column(UUID(as_uuid=True), ForeignKey('locations.regions.uid'))
  thumbnail: Mapped[str] = Column(TEXT)
  place_meta: Mapped[dict] = Column('metadata', JSONB)

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
