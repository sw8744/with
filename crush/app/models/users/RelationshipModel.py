import enum
from datetime import datetime
from uuid import UUID as PyUUID

from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.orm import Mapped, relationship, backref

from app.core.database.database import BaseTable, EnumAsValue
from app.models.users.IdentityModel import IdentityModel


class RelationshipState(enum.IntEnum):
  BLOCKED = 0  # user 의 정보를 friend 에게 비공개
  FOLLOWING = 1  # user 가 friend 를 팔로우
  FRIEND = 2  # user가 friend를 초대할 수 있음
  LIKED = 3  # 쌍방 사랑(꺅)


class RelationshipModel(BaseTable):
  __tablename__ = "relationship"
  __table_args__ = {
    "schema": "users"
  }

  user_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), ForeignKey("users.identities.uid"), primary_key=True,
                                   nullable=False)
  friend_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), ForeignKey("users.identities.uid"), primary_key=True,
                                     nullable=False)
  created_at: Mapped[datetime] = Column(TIMESTAMP, nullable=False, server_default="CURRENT_TIMESTAMP")
  updated_at: Mapped[datetime] = Column(TIMESTAMP, nullable=False, server_default="CURRENT_TIMESTAMP")
  state: Mapped[RelationshipState] = Column(EnumAsValue(RelationshipState), nullable=False)

  user: Mapped[IdentityModel] = relationship(
    "IdentityModel",
    foreign_keys="RelationshipModel.user_id",
    uselist=False,
    backref=backref(
      "relationship",
      uselist=True,
      cascade="all, delete-orphan",
      passive_deletes=True
    )
  )

  friend: Mapped[IdentityModel] = relationship(
    "IdentityModel",
    foreign_keys="RelationshipModel.friend_id",
    uselist=False
  )
