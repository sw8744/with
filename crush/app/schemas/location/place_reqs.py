from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PlaceSearchQuery(BaseModel):
  name: Optional[str] = Field(
    default=None,
    min_length=1, max_length=64,
  )
  uid: Optional[UUID] = Field(default=None)
  region_uid: Optional[UUID] = Field(default=None)
  coordinate: Optional[list[float]] = Field(
    default=None,
    min_length=2, max_length=2
  )
  address: Optional[str] = Field(
    default=None,
    min_length=1, max_length=128
  )

  limit: int = Field(default=100, ge=0, le=100)


class AddPlace(BaseModel):
  name: str = Field(
    default='',
    min_length=0, max_length=64,
  )
  description: str = Field(
    default='',
    min_length=0, max_length=512
  )
  coordinate: Optional[list[float]] = Field(
    default=None,
    min_length=2, max_length=2
  )
  address: Optional[str] = Field(
    default=None,
    min_length=0, max_length=128
  )
  thumbnail: Optional[str] = Field(
    default=None,
    min_length=0, max_length=512
  )
  metadata: dict = Field(
    default={}
  )
  region_uid: Optional[UUID] = Field(default=None)


class PatchPlace(BaseModel):
  name: Optional[str] = Field(
    default=None,
    min_length=0, max_length=64,
  )
  description: Optional[str] = Field(
    default=None,
    min_length=0, max_length=512
  )
  coordinate: Optional[list[float]] = Field(
    default=None,
    min_length=2, max_length=2
  )
  address: Optional[str] = Field(
    default=None,
    min_length=0, max_length=128
  )
  region_uid: Optional[UUID] = Field(default=None)
  thumbnail: Optional[str] = Field(
    default=None,
    min_length=0, max_length=512
  )
  metadata: Optional[dict] = Field(
    default=None
  )
