from datetime import datetime
from uuid import UUID as PyUUID

from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.orm import Mapped, relationship, backref

from app.database import BaseTable
from app.models.locations.PlaceModel import PlaceModel
from app.models.users.IdentityModel import IdentityModel


class LikesModel(BaseTable):
  __tablename__ = "likes"
  __table_args__ = {
    "schema": "interactions"
  }

  user_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), ForeignKey('users.identities.uid'), primary_key=True,
                                   nullable=False)
  place_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), ForeignKey('locations.places.uid'), primary_key=True,
                                    nullable=False)
  liked_at: Mapped[datetime] = Column(TIMESTAMP, nullable=False, server_default="CURRENT_TIMESTAMP")

  user: Mapped[IdentityModel] = relationship(
    "IdentityModel",
    uselist=False,
    backref=backref(
      "likes",
      uselist=True,
      cascade="all, delete-orphan",
      passive_deletes=True
    )
  )

  place: Mapped[PlaceModel] = relationship(
    "PlaceModel",
    uselist=False,
    backref=backref(
      "liker",
      uselist=True,
      cascade="all, delete-orphan",
      passive_deletes=True
    )
  )
