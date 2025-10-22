from typing import Optional

from pydantic import BaseModel, Field


class ThemeSearchQuery(BaseModel):
  uid: Optional[int] = Field(default=None)
  name: Optional[str] = Field(
    default=None,
    min_length=1, max_length=32
  )


class SetTheme(BaseModel):
  uid: int = Field(
    default=None,
    ge=0, le=99
  )
  name: str = Field(
    default=None,
    min_length=1, max_length=32
  )
  color: str = Field(
    default=None,
    min_length=6, max_length=6
  )


class PatchTheme(BaseModel):
  name: Optional[str] = Field(
    default=None,
    min_length=1, max_length=32
  )
  color: Optional[str] = Field(
    default=None,
    min_length=6, max_length=6
  )
