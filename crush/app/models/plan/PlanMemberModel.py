from enum import Enum
from uuid import UUID as PyUUID

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped

from app.core.database.database import BaseTable, EnumAsValue


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

  plan_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), nullable=False, primary_key=True)
  user_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), nullable=False, primary_key=True)
  role: Mapped[PlanRole] = Column(EnumAsValue(PlanRole), nullable=False, default=PlanRole.MEMBER)
