import uuid
from datetime import datetime

from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, VARCHAR, TIMESTAMP
from sqlalchemy.orm import Mapped, relationship, backref

from app.database import BaseTable
from app.models.users.IdentityModel import IdentityModel


class GoogleAuthModel(BaseTable):
  __tablename__ = "google_auths"
  __table_args__ = {
    "schema": "auth"
  }

  uid: Mapped[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, unique=True, nullable=False,
                                  server_default="gen_random_uuid()")
  user_id: Mapped[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey("users.identities.uid"), unique=True,
                                      nullable=False)

  sub: Mapped[str] = Column(VARCHAR(21), nullable=False, unique=True)
  last_used: Mapped[datetime] = Column(TIMESTAMP, nullable=False, server_default="current_timestamp")

  user: Mapped[IdentityModel] = relationship(
    "IdentityModel",
    uselist=False,
    backref=backref(
      "auths",
      uselist=True,
      cascade="all, delete-orphan",
      passive_deletes=True
    )
  )
