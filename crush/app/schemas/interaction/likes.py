from uuid import UUID

from pydantic import BaseModel, Field, field_serializer


class Likes(BaseModel):
  user_id: UUID = Field()
  place_ids: list[UUID] = Field()

  @field_serializer('user_id')
  def serialize_user_id(self, user_id: UUID):
    return str(user_id)

  @field_serializer('place_ids')
  def serialize_place_ids(self, place_ids: list[UUID]):
    return [str(place_id) for place_id in place_ids]
