from datetime import date
from uuid import UUID as PyUUID

from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, UUID, DATE
from sqlalchemy.orm import Mapped, relationship, backref

from app.core.database.database import BaseTable
from app.models.plan.PlanModel import PlanModel


class PlanPollingModel(BaseTable):
  __tablename__ = "date_poll"
  __table_args__ = {
    "schema": "plans",
  }

  plan_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), ForeignKey("plans.plans.uid"), nullable=False, primary_key=True)
  user_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), ForeignKey("users.identities.uid"), nullable=False,
                                   primary_key=True)
  dates: Mapped[list[date]] = Column(ARRAY(DATE), nullable=False)

  plan: Mapped["PlanModel"] = relationship(
    "PlanModel",
    uselist=False,
    backref=backref(
      "votes",
      uselist=True,
      cascade="all, delete-orphan",
      passive_deletes=True
    )
  )
