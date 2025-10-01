from uuid import UUID

from pydantic import Field, BaseModel


class LikeRequest(BaseModel):
  place_id: UUID = Field(alias="placeId")

