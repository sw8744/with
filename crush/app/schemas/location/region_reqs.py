from uuid import UUID

from pydantic import BaseModel, Field


class RegionSearchQuery(BaseModel):
  name: str = Field(
    default=None,
    min_length=1, max_length=64,
  )
  uid: UUID = Field(default=None)
  limit: int = Field(100, ge=0, le=100)


class AddRegion(BaseModel):
  name: str = Field(
    min_length=1, max_length=64,
  )


class PatchRegion(BaseModel):
  name: str = Field(
    default=None,
    min_length=1, max_length=64,
  )
