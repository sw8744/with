from uuid import UUID

from pydantic import BaseModel, Field

from app.models.users.RelationshipModel import RelationshipState


class FollowRequest(BaseModel):
  friend_id: UUID = Field(alias="friendId")
  relationship: RelationshipState = Field()


class FollowPatchRequest(BaseModel):
  relationship: RelationshipState = Field()
