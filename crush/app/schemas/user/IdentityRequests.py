from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from uuid import UUID

from app.models.users.IdentityModel import SEX


class IdentityPatchRequest(BaseModel):
  name: Optional[str] = Field(
    default=None,
    min_length=1, max_length=64
  ),
  email: Optional[EmailStr] = Field(
    default=None,
    min_length=1, max_length=64
  ),
  sex: Optional[SEX] = Field(
    default=None
  )
  birthday: Optional[datetime] = Field(
    default=None
  )


class IdentitySearchRequest(BaseModel):
  uid: Optional[UUID] = Field(
    default=None
  )
  name: Optional[str] = Field(
    default=None,
    min_length=1, max_length=64
  )
  limit: int = Field(
    default=10,
    ge=1, le=10
  )
