from pydantic import BaseModel, Field

from app.models.preferences.ThemeModel import ThemeModel


class Theme(BaseModel):
  def __init__(self, theme_model: ThemeModel):
    super().__init__(
      uid=theme_model.uid,
      name=theme_model.name,
      color=theme_model.color
    )

  uid: int = Field()
  name: str = Field(
    min_length=1, max_length=32
  )
  color: str = Field(
    min_length=6, max_length=6
  )
