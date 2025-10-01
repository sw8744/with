from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict, field_serializer


class Region(BaseModel):
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

  @field_serializer('uid')
  def serialize_uid(self, uid: UUID):
    return str(uid)

  model_config = ConfigDict(
    from_attributes=True
  )
