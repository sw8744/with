from typing import Optional

from pydantic import BaseModel, Field


class ThemeSearchQuery(BaseModel):
  uid: Optional[int] = Field(default=None)
  name: Optional[str] = Field(
    default=None,
    min_length=1, max_length=32
  )


class AddTheme(BaseModel):
  name: str = Field(
    min_length=1, max_length=32
  )
  color: str = Field(
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
