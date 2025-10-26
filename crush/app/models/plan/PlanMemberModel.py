from enum import Enum
from uuid import UUID as PyUUID

from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, relationship

from app.core.database.database import BaseTable, EnumAsValue
from app.models.users.IdentityModel import IdentityModel


class PlanRole(Enum):
  HOST = 0
  COHOST = 1
  MEMBER = 2
  OBSERVER = 3


class PlanMemberModel(BaseTable):
  __tablename__ = "members"
  __table_args__ = {
    "schema": "plans"
  }

  plan_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), ForeignKey("plans.plans.uid"), nullable=False, primary_key=True)
  user_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), ForeignKey("users.identities.uid"), nullable=False,
                                   primary_key=True)
  role: Mapped[PlanRole] = Column(EnumAsValue(PlanRole), nullable=False, default=PlanRole.MEMBER)

  user: Mapped[IdentityModel] = relationship(
    "IdentityModel",
    foreign_keys="PlanMemberModel.user_id",
    uselist=False
  )
