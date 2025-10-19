import logging
from typing import Annotated

from fastapi import APIRouter
from fastapi.params import Depends
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.database.database import create_connection
from app.core.recommendation import core_theme
from app.schemas.recommendation.theme_reqs import ThemeSearchQuery, AddTheme, PatchTheme

log = logging.getLogger(__name__)

router = APIRouter(
  prefix='/api/v1/recommendation/theme',
  tags=['preference']
)


@router.get(
  path=""
)
def list_themes(
  query: Annotated[ThemeSearchQuery, Depends()],
  db: Session = Depends(create_connection)
):
  log.info("Searching themes. query=[%s]", query)
  themes = core_theme.get_themes(query, db)
  log.info("Found %d themes", len(themes))

  return JSONResponse(
    status_code=200,
    content={
      'code': 200,
      'status': 'OK',
      'themes': [
        theme.model_dump() for theme in themes
      ]
    }
  )


@router.post(
  path=""
)
def add_theme(
  theme: AddTheme,
  db: Session = Depends(create_connection)
):
  log.info("Adding theme. theme=[%s]", theme)
  new_theme = core_theme.add_theme(theme, db)
  log.info("New theme uid=%d, name=%d was committed", )

  return JSONResponse(
    status_code=201,
    content={
      'code': 201,
      'status': 'CREATED',
      'theme': new_theme.model_dump()
    }
  )


@router.patch(
  path="/{theme_id}"
)
def patch_theme(
  theme_id: int,
  patch_info: PatchTheme,
  db: Session = Depends(create_connection)
):
  log.info("Patching theme. theme_id=%d", theme_id)
  core_theme.patch_theme(theme_id, patch_info, db)
  log.info("Patched theme uid=%d was committed", theme_id)

  return JSONResponse(
    status_code=200,
    content={
      'code': 200,
      'status': 'OK'
    }
  )
