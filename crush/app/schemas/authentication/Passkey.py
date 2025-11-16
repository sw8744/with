from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_serializer

from app.models.auth.PasskeyAuthModel import PasskeyAuthModel


class Passkey(BaseModel):
  def __init__(self, passkey_model: type[PasskeyAuthModel]):
    super().__init__(
      uid=passkey_model.uid,
      name=passkey_model.name,
      created_at=passkey_model.created_at,
      last_used=passkey_model.last_used,
      aaguid=passkey_model.aaguid
    )

  uid: UUID = Field()
  name: str = Field(
    min_length=1, max_length=128
  )
  created_at: datetime = Field()
  last_used: datetime = Field()
  aaguid: UUID = Field()

  @field_serializer("uid", "aaguid")
  def serialize_uuid(self, value: UUID) -> str:
    return str(value)

  @field_serializer("created_at", "last_used")
  def serialize_datetime(self, value: datetime) -> str:
    return value.isoformat()
