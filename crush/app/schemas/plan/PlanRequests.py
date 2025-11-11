from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class AddPlanRequest(BaseModel):
  name: str = Field(
    min_length=1, max_length=256
  )
  members: list[UUID] = Field(
    min_length=0, max_length=100
  )
  regions: list[UUID] = Field(
    min_length=0, max_length=20
  )
  places: list[UUID] = Field(
    min_length=0, max_length=50
  )
  themes: list[int] = Field(
    min_length=0, max_length=30
  )
  date_from: Optional[datetime] = Field(
    default=None,
    alias="dateFrom"
  )
  date_to: Optional[datetime] = Field(
    default=None,
    alias="dateTo"
  )


class FixDateRequest(BaseModel):
  date_from: datetime = Field(
    alias="dateFrom"
  )
  date_to: datetime = Field(
    alias="dateTo"
  )


class ChangePlanNameRequest(BaseModel):
  name: str = Field(
    min_length=1, max_length=256
  )
