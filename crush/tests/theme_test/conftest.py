import pytest
from sqlalchemy.orm import Session
from typing_extensions import Generator

from app.models.preferences.ThemeModel import ThemeModel


@pytest.fixture
def themes(
  db: Session
) -> Generator[list[ThemeModel]]:
  themes = []

  for i in range(3):
    theme = ThemeModel(
      uid=i + 96,
      name=f"t{i}",
      color=f"{i}" * 6
    )
    db.add(theme)
    db.commit()
    db.refresh(theme)
    themes.append(theme)

  yield themes

  for theme in themes:
    db.delete(theme)
  db.commit()
