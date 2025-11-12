from datetime import datetime

from pydantic import BaseModel, Field, EmailStr

from app.models.users.IdentityModel import SEX


class IdentityPatchRequest(BaseModel):
  name: str = Field(
    min_length=1, max_length=64
  ),
  email: EmailStr = Field(
    min_length=1, max_length=64
  ),
  sex: SEX = Field()
  birthday: datetime = Field()
