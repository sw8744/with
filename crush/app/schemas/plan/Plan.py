from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_serializer

from app.models.plan.PlanModel import PlanModel


class Plan(BaseModel):
  def __init__(self, plan_model: PlanModel | type[PlanModel]) -> None:
    super().__init__(
      uid=plan_model.uid,
      name=plan_model.name,
      host_id=plan_model.host_id,
      date_from=plan_model.date_from,
      date_to=plan_model.date_to,
      polling_date=plan_model.polling_date
    )

  uid: UUID = Field()
  name: str = Field(
    min_length=1, max_length=256,
  )
  host_id: UUID = Field()
  polling_date: Optional[datetime] = Field()
  date_from: Optional[datetime] = Field()
  date_to: Optional[datetime] = Field()

  @field_serializer("uid")
  def serialize_uid(self, uid: UUID) -> str:
    return str(uid)

  @field_serializer("host_id")
  def serialize_host_id(self, host_id: UUID) -> str:
    return str(host_id)

  @field_serializer("date_from", "date_to", "polling_date")
  def serialize_dates(self, date: datetime) -> Optional[str]:
    if date is None:
      return None
    else:
      return date.isoformat()
