from datetime import date, time
from enum import Enum
from uuid import UUID as PyUUID

from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, VARCHAR, TEXT, DATE, TIME
from sqlalchemy.orm import Mapped, relationship, backref

from app.core.database.database import BaseTable, EnumAsValue
from app.models.plan.PlanModel import PlanModel


class ActivityCategory(Enum):
  ACTIVITY = 0
  MEAL = 1
  MOVEMENT = 2


class PlanActivityModel(BaseTable):
  __tablename__ = "activities"
  __table_args__ = {
    "schema": "plans"
  }

  uid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, unique=True, nullable=False,
                               server_default="gen_random_uuid()")
  plan_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), ForeignKey("plans.plans.uid"), nullable=False)
  name: Mapped[str] = Column(VARCHAR(128), nullable=False)
  description: Mapped[str] = Column(TEXT, nullable=True)
  place_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), ForeignKey("locations.places.uid"), nullable=True)
  at_date: Mapped[date] = Column(DATE, nullable=False)
  at_time: Mapped[time] = Column(TIME, nullable=True)
  category: Mapped[ActivityCategory] = Column(EnumAsValue(ActivityCategory), nullable=False)

  plan: Mapped[PlanModel] = relationship(
    "PlanModel",
    uselist=False,
    backref=backref(
      "activities",
      uselist=True,
      cascade="all, delete-orphan",
      passive_deletes=True
    )
  )
