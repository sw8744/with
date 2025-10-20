import uuid

import numpy as np
from numpy._typing import NDArray
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, UUID, ForeignKey
from sqlalchemy.orm import Mapped, relationship, backref

from app.core.database.database import BaseTable
from app.schemas.user.identity import Identity


class UserPrefer(BaseTable):
  __tablename__ = "user_prefer"
  __table_args__ = {
    "schema": "preferences"
  }

  user_id: Mapped[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey('users.identities.uid'), primary_key=True,
                                      nullable=False, unique=True)
  prefer: Mapped[NDArray[np.float32]] = Column(Vector(100), nullable=False)

  user: Mapped[Identity] = relationship(
    "IdentityModel",
    foreign_keys="UserPrefer.user_id",
    uselist=False,
    backref=backref(
      "prefer",
      uselist=False,
      cascade="all, delete-orphan",
      passive_deletes=True
    )
  )
