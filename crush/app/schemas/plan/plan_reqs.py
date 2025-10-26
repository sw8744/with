from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class AddPlanRequest(BaseModel):
  name: str = Field(
    min_length=1, max_length=256
  )
  members: list[UUID] = Field()
  regions: list[UUID] = Field()
  places: list[UUID] = Field()
  themes: list[int] = Field()
  date_from: Optional[datetime] = Field(
    default=None,
    alias="dateFrom"
  )
  date_to: Optional[datetime] = Field(
    default=None,
    alias="dateTo"
  )
