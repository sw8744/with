from uuid import UUID as PyUUID

from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, VARCHAR, FLOAT, ARRAY
from sqlalchemy.orm import Mapped, relationship, backref

from app.database import BaseTable
from app.models.places.regions import RegionModel


class PlaceModel(BaseTable):
  __tablename__ = "places"
  __table_args__ = {
    "schema": "locations"
  }

  uid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, unique=True, nullable=False,
                               server_default='gen_random_uuid()')
  name: Mapped[str] = Column(VARCHAR(64))
  coordinate: Mapped[list[float]] = Column(ARRAY(FLOAT))
  address: Mapped[str] = Column(VARCHAR(128))
  region_uid: Mapped[PyUUID] = Column(UUID(as_uuid=True), ForeignKey('locations.regions.uid'))

  region: Mapped[RegionModel] = relationship(
    "RegionModel",
    uselist=False,
    backref=backref(
      "places",
      uselist=True,
      cascade="all, delete-orphan",
      passive_deletes=True
    )
  )
