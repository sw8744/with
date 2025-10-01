from typing import Optional
from uuid import UUID

from pydantic import Field, BaseModel


class LikeSearchRequest(BaseModel):
  head: Optional[UUID] = Field(default=None)
  limit: int = Field(100, ge=0, le=100)



class LikeRequest(BaseModel):
  place_id: UUID = Field(alias="placeId")

