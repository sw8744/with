from uuid import UUID

from pydantic import BaseModel, Field, field_serializer

from app.models.users.RelationshipModel import RelationshipModel


class Follower(BaseModel):
  def __init__(self, relationship_model: RelationshipModel):
    user = relationship_model.user
    super().__init__(
      uid=user.uid,
      name=user.name
    )

  uid: UUID = Field()
  name: str = Field(min_length=1, max_length=64)

  @field_serializer("uid")
  def serialize_uid(self, uid: UUID):
    return str(uid)


class Following(BaseModel):
  def __init__(self, relationship_model: RelationshipModel):
    user = relationship_model.friend
    super().__init__(
      uid=user.uid,
      name=user.name
    )

  uid: UUID = Field()
  name: str = Field(min_length=1, max_length=64)

  @field_serializer("uid")
  def serialize_uid(self, uid: UUID):
    return str(uid)
