from uuid import UUID

from pydantic import BaseModel, Field


class PlaceSearchQuery(BaseModel):
  name: str = Field(
    default=None,
    min_length=1, max_length=64,
  )
  uid: UUID = Field(default=None)
  region_uid: UUID = Field(default=None)
  coordinate: list[float] = Field(
    default=None,
    min_length=2, max_length=2
  )
  address: str = Field(
    default=None,
    min_length=1, max_length=128
  )

  limit: int = Field(default=100, ge=0, le=100)


class AddPlace(BaseModel):
  name: str = Field(
    default=None,
    min_length=1, max_length=64,
  )
  coordinate: list[float] = Field(
    default=None,
    min_length=2, max_length=2
  )
  address: str = Field(
    default=None,
    min_length=1, max_length=128
  )
  metadata: dict = Field(
    default={}
  )
  region_uid: UUID = Field(default=None)


class PatchPlace(BaseModel):
  name: str = Field(
    default=None,
    min_length=1, max_length=64,
  )
  coordinate: list[float] = Field(
    default=None,
    min_length=2, max_length=2
  )
  address: str = Field(
    default=None,
    min_length=1, max_length=128
  )
  region_uid: UUID = Field(default=None)
  metadata: dict = Field(
    default=None
  )
