from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.users.RelationshipModel import RelationshipState


class ListingRelationshipRequest(BaseModel):
  head: Optional[UUID] = Field(default=None)
  limit: int = Field(default=50, ge=0, le=50),
  state: Optional[RelationshipState] = Field(default=None)
  up: bool = Field(default=False)


class FollowRequest(BaseModel):
  friend_id: UUID = Field(alias="friendId")
  relationship: RelationshipState = Field()


class FollowPatchRequest(BaseModel):
  relationship: RelationshipState = Field()
