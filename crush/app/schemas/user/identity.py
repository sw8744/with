from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, EmailStr, field_serializer

from app.models.users.IdentityModel import SEX, IdentityModel


class Identity(BaseModel):
  def __init__(self, identity_model: IdentityModel):
    super().__init__(
      uid=identity_model.uid,
      name=identity_model.name,
      email=identity_model.email,
      email_verified=identity_model.email_verified,
      sex=identity_model.sex,
      birthday=identity_model.birthday,
      role=identity_model.role
    )

  uid: UUID = Field()
  name: str = Field(
    min_length=1, max_length=64
  )
  email: EmailStr = Field(
    min_length=1, max_length=64
  )
  email_verified: bool = Field()
  sex: SEX = Field(default=SEX.OTHER)
  birthday: datetime = Field()
  role: list[str] = Field()

  @field_serializer("uid")
  def serialize_uid(self, uid: UUID):
    return str(uid)

  @field_serializer("sex")
  def serialize_sex(self, sex: SEX):
    return sex.value

  @field_serializer("birthday")
  def serialize_birthday(self, birthday: datetime):
    return birthday.isoformat()
