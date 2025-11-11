import numpy as np
from numpy.typing import NDArray
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, relationship, backref

from app.core.database.database import BaseTable
from app.schemas.location.Place import Place


class PlaceThemeModel(BaseTable):
  __tablename__ = "place_theme"
  __table_args__ = {
    "schema": "preferences"
  }

  place_id: Mapped[UUID] = Column(UUID(as_uuid=True), ForeignKey("locations.places.uid"), primary_key=True,
                                  nullable=False, unique=True)
  theme: Mapped[NDArray[np.float32]] = Column(Vector(100), nullable=False)

  place: Mapped[Place] = relationship(
    "PlaceModel",
    foreign_keys="PlaceThemeModel.place_id",
    uselist=False,
    backref=backref(
      "theme",
      uselist=False,
      cascade="all, delete-orphan",
      passive_deletes=True
    ),
  )
