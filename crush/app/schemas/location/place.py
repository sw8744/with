from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_serializer


class Place(BaseModel):
  uid: UUID = Field()
  name: str = Field(
    default='',
    min_length=0, max_length=64
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
    min_length=1, max_length=128
  )
  region_uid: Optional[UUID] = Field(default=None)
  thumbnail: Optional[str] = Field(
    default=None,
    min_length=0, max_length=512
  )
  metadata: dict = Field(
    default={}
  )

  @field_serializer('uid')
  def serialize_uid(self, uid: UUID):
    return str(uid)

  @field_serializer('region_uid')
  def serialize_region_uid(self, uid: UUID):
    return str(uid)
