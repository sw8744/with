import logging
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.themes.ThemeModel import ThemeModel
from app.schemas.recommendation.theme import Theme
from app.schemas.recommendation.theme_reqs import ThemeSearchQuery, AddTheme, PatchTheme

log = logging.getLogger(__name__)

MAX_FEATURES = 100


def get_themes(
  query: ThemeSearchQuery,
  db: Session
) -> list[Theme]:
  q = db.query(ThemeModel)

  if query.uid is not None:
    q.filter(ThemeModel.uid == query.uid)
  else:
    if query.name is not None:
      q = q.filter(ThemeModel.name.like('%' + query.name + '%'))
    q = q.order_by(ThemeModel.uid.asc())
    q = q.limit(100)

  themes = q.all()

  return [Theme(theme) for theme in themes]


def add_theme(
  theme: AddTheme,
  db: Session
) -> Theme:
  themes = (
    db.query(ThemeModel)
    .count()
  )
  if themes > MAX_FEATURES:
    raise HTTPException(status_code=400, detail="Features limit exceeded")

  theme_model = ThemeModel(
    name=theme.name,
    color=theme.color,
  )

  db.add(theme_model)
  db.commit()

  return Theme(theme_model)


def patch_theme(
  theme_id: int,
  patch_info: PatchTheme,
  db: Session
):
  theme: Optional[ThemeModel] = (
    db.query(ThemeModel)
    .filter(ThemeModel.uid == theme_id)
    .scalar()
  )

  if theme is None:
    log.debug("Theme %s was not found", theme_id)
    raise HTTPException(status_code=404, detail="No theme was found")

  if patch_info.name is not None:
    log.debug("Applying change of name in theme %d", theme_id)
    theme.name = patch_info.name
  if patch_info.color is not None:
    log.debug("Applying change of color in theme %d", theme_id)
    theme.color = patch_info.color

  db.commit()
