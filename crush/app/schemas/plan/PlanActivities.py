from datetime import date, time
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_serializer

from app.models.plan.PlanActivityModel import ActivityCategory, PlanActivityModel


class PlanActivity(BaseModel):
  def __init__(self, plan_activity_model: PlanActivityModel):
    super().__init__(
      uid=plan_activity_model.uid,
      name=plan_activity_model.name,
      description=plan_activity_model.description,
      place_id=plan_activity_model.place_id,
      at_date=plan_activity_model.at_date,
      at_time=plan_activity_model.at_time,
      category=plan_activity_model.category
    )

  uid: UUID = Field()
  name: str = Field()
  description: str = Field()
  place_id: Optional[UUID] = Field(default=None)
  at_date: date = Field()
  at_time: time = Field()
  category: ActivityCategory

  @field_serializer("uid")
  def serialize_uid(self, uid: UUID) -> str:
    return str(uid)

  @field_serializer("place_id")
  def serialize_place_id(self, place_id: Optional[UUID]) -> Optional[str]:
    if place_id is None:
      return None
    return str(place_id)

  @field_serializer("at_date")
  def serialize_at_date(self, at_date: date) -> str:
    return at_date.isoformat()

  @field_serializer("at_time")
  def serialize_at_time(self, at_time: time) -> Optional[str]:
    if at_time is None:
      return None
    return at_time.strftime("%H:%M:%S")

  @field_serializer("category")
  def serialize_category(self, category: ActivityCategory) -> int:
    return category.value
