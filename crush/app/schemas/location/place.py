from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_serializer

from app.models.locations.PlaceModel import PlaceModel


class Place(BaseModel):
  def __init__(self, place_model: PlaceModel):
    super().__init__(
      uid=place_model.uid,
      name=place_model.name,
      description=place_model.description,
      coordinate=place_model.coordinate,
      address=place_model.address,
      region_uid=place_model.region_uid,
      thumbnail=place_model.thumbnail,
      metadata=place_model.place_meta
    )


  uid: UUID = Field()
  name: str = Field(
    min_length=1, max_length=64
  )
  description: str = Field(
    min_length=1, max_length=512
  )
  coordinate: Optional[list[float]] = Field(
    default=None,
    min_length=2, max_length=2
  )
  address: Optional[str] = Field(
    min_length=0, max_length=128
  )
  region_uid: Optional[UUID] = Field(default=None)
  thumbnail: Optional[str] = Field(
    default=None,
    min_length=0, max_length=512
  )
  metadata: dict = Field(
    default={}
  )

  @field_serializer("uid")
  def serialize_uid(self, uid: UUID):
    return str(uid)

  @field_serializer("region_uid")
  def serialize_region_uid(self, uid: Optional[UUID]):
    return str(uid) if uid is not None else None
