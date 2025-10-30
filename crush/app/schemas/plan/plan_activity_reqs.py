import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.plan.PlanActivityModel import ActivityCategory


class CreatePlanActivityRequest(BaseModel):
  name: str = Field(
    min_length=1, max_length=128
  )
  description: str = Field(
    min_length=1, max_length=512
  )
  date: datetime.date = Field()
  time: datetime.time = Field()
  place_id: Optional[UUID] = Field(default=None)
  category: ActivityCategory = Field()


class PatchPlanActivityRequest(BaseModel):
  name: Optional[str] = Field(
    default=None,
    min_length=1, max_length=128
  )
  description: Optional[str] = Field(
    default=None,
    min_length=1, max_length=512
  )
  date: Optional[datetime.date] = Field(default=None)
  time: Optional[datetime.time] = Field(default=None)
  place_id: Optional[UUID] = Field(default=None)
  category: Optional[ActivityCategory] = Field(default=None)
