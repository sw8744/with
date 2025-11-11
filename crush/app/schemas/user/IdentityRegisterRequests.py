from datetime import datetime

from pydantic import BaseModel, Field, EmailStr

from app.models.users.IdentityModel import SEX


class RegisterIdentityReq(BaseModel):
  name: str = Field(
    min_length=1, max_length=64
  ),
  profile_picture: str = Field(
    min_length=0, max_length=256
  ),
  email: EmailStr = Field(
    min_length=1, max_length=64
  ),
  sex: SEX = Field()
  birthday: datetime = Field()
  prefer: list[float] = Field(
    default=[0.0] * 100,
    min_length=0, max_length=100
  )
