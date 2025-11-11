from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class RegionSearchQuery(BaseModel):
  name: Optional[str] = Field(
    default=None,
    min_length=1, max_length=64,
  )
  uid: Optional[UUID] = Field(default=None)
  limit: int = Field(100, ge=0, le=100)


class AddRegion(BaseModel):
  name: str = Field(
    min_length=1, max_length=64,
  )
  description: str = Field(
    min_length=1, max_length=512
  )
  thumbnail: Optional[str] = Field(
    default=None,
    min_length=0, max_length=512
  )


class PatchRegion(BaseModel):
  name: Optional[str] = Field(
    default=None,
    min_length=1, max_length=64,
  )
  description: Optional[str] = Field(
    default=None,
    min_length=1, max_length=512
  )
  thumbnail: Optional[str] = Field(
    default=None,
    min_length=0, max_length=512
  )
