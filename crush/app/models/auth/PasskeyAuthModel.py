from datetime import datetime

from sqlalchemy import Column, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import VARCHAR, BYTEA, INTEGER
from sqlalchemy.dialects.postgresql.base import UUID
from sqlalchemy.orm import Mapped, relationship, backref
from uuid import UUID as PyUUID

from app.core.database.database import BaseTable
from app.models.users.IdentityModel import IdentityModel


class PasskeyAuthModel(BaseTable):
  __tablename__ = "passkey_auths"
  __table_args__ = {
    "schema": "auth"
  }

  uid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, unique=True, nullable=False,
                               server_default="gen_random_uuid()")
  credential_id: Mapped[bytes] = Column(BYTEA, unique=True, nullable=False)
  name: Mapped[str] = Column(VARCHAR(128), nullable=False)

  user_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), ForeignKey("users.identities.uid"), nullable=False)

  public_key: Mapped[bytes] = Column(BYTEA, nullable=False)
  aaguid: Mapped[UUID] = Column(UUID(as_uuid=True), nullable=False)
  counter: Mapped[int] = Column(INTEGER, nullable=False, server_default="0")
  created_at: Mapped[datetime] = Column(TIMESTAMP, nullable=False, server_default="current_timestamp")
  last_used: Mapped[datetime] = Column(TIMESTAMP, nullable=False, server_default="current_timestamp")

  identity: Mapped[IdentityModel] = relationship(
    "IdentityModel",
    uselist=False,
    backref=backref(
      "passkeys",
      uselist=True,
      cascade="all, delete-orphan",
      passive_deletes=True
    )
  )
