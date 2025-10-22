import logging
from typing import Annotated

from fastapi import APIRouter
from fastapi.params import Depends, Security
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.database.database import create_connection
from app.core.recommendation import core_theme
from app.core.user.core_jwt import require_role, Role
from app.schemas.recommendation.theme_reqs import ThemeSearchQuery, SetTheme

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
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  log.info("Searching themes. query=[%s]", query)
  themes = core_theme.get_themes(query, db)
  log.info("Found %d themes", len(themes))

  return JSONResponse(
    status_code=200,
    content={
      'code': 200,
      'status': 'OK',
      'themes': themes
    }
  )


@router.post(
  path=""
)
def set_theme(
  theme: SetTheme,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.THEME_EDIT)

  log.info("Setting theme. theme=[%s]", theme)
  new_theme = core_theme.set_theme(theme, db)
  log.info("Theme uid=%d, name=%d was committed", )

  return JSONResponse(
    status_code=200,
    content={
      'code': 200,
      'status': 'OK',
      'theme': new_theme.model_dump()
    }
  )
