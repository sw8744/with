import logging
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.preferences.ThemeModel import ThemeModel
from app.schemas.recommendation.theme import Theme
from app.schemas.recommendation.theme_reqs import ThemeSearchQuery, SetTheme, PatchTheme

log = logging.getLogger(__name__)


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


def set_theme(
  theme: SetTheme,
  db: Session
) -> Theme:
  existing_theme: ThemeModel = (
    db.query(ThemeModel)
    .filter(ThemeModel.uid == theme.uid)
    .scalar()
  )

  if existing_theme is None:
    if theme.name is None or theme.color is None:
      raise HTTPException(status_code=400, detail="Theme name and color is required")
    log.debug("Adding theme. theme=[%s]", theme)
    theme_model = ThemeModel(
      uid=theme.uid,
      name=theme.name,
      color=theme.color,
    )
    db.add(theme_model)
    db.commit()
    return Theme(theme_model)
  else:
    log.debug("Patching theme. theme_id=%d", theme.uid)
    if theme.name is not None:
      log.debug("Applying change of name in theme %d", existing_theme.uid)
      existing_theme.name = theme.name
    if theme.color is not None:
      log.debug("Applying change of color in theme %d", existing_theme.uid)
      existing_theme.color = theme.color
    db.commit()
    return Theme(existing_theme)


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
