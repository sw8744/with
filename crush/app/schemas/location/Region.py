from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict, field_serializer

from app.models.locations.RegionModel import RegionModel


class Region(BaseModel):
  def __init__(self, region_model: RegionModel):
    super().__init__(
      uid=region_model.uid,
      name=region_model.name,
      description=region_model.description,
      thumbnail=region_model.thumbnail
    )

  uid: UUID = Field()
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

  @field_serializer("uid")
  def serialize_uid(self, uid: UUID):
    return str(uid)

  model_config = ConfigDict(
    from_attributes=True
  )
