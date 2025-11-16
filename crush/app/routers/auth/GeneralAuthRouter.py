from typing import Annotated

from fastapi import APIRouter, Security, Cookie
from fastapi.params import Depends, Header
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.auth import core_refresh_token, core_authentication
from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.config_store import config
from app.core.database.database import create_connection
from app.core.user import core_user
from app.core.user.core_jwt import require_role, Role

router = APIRouter(
  prefix="/api/v1/auth",
  tags=["auth"]
)


@router.get(
  path="/authorize",
)
def authorize_access_token(
  at: str = Security(authorization_header)
):
  authorize_jwt(at)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "auth": True
    }
  )


@router.post(
  path="/refresh"
)
def refresh_access_token(
  x_refresh_token: Annotated[str | None, Header()] = None,
  WAUTHREF: Annotated[str | None, Cookie()] = None,
  db: Session = Depends(create_connection)
):
  token = WAUTHREF

  if WAUTHREF is None and x_refresh_token is not None:
    token = x_refresh_token

  at, rt = core_refresh_token.use_refresh_token(token, db)

  response = JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "accessToken": at
    }
  )

  response.delete_cookie("WAUTHREF")
  response.set_cookie(
    "WAUTHREF",
    rt,
    max_age=2592000,
    httponly=True,
    samesite="strict",
    secure=config["cookie"]["secure"],
    path="/api/v1/auth/refresh"
  )

  return response


@router.post(
  path="/logout"
)
def logout_user(
  x_refresh_token: Annotated[str | None, Header()] = None,
  WAUTHREF: Annotated[str | None, Cookie()] = None,
):
  token = WAUTHREF
  if WAUTHREF is None and x_refresh_token is not None:
    token = x_refresh_token

  if token is not None:
    core_refresh_token.revoke_refresh_token(token)

  response = JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )

  response.delete_cookie("WAUTHREF", path="/api/v1/auth/refresh")

  return response


@router.get(
  path="/methods"
)
def get_auth_methods(
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  identity = core_user.get_identity(token, db)

  methods = core_authentication.get_auth_methods(identity, db)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "methods": methods
    }
  )
