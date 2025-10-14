from typing import Annotated

from fastapi import APIRouter, Security, Cookie
from fastapi.params import Depends
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.auth import core_refresh_token
from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.config_store import config
from app.core.database.database import create_connection

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
  WAUTHREF: Annotated[str | None, Cookie()] = None,
  db: Session = Depends(create_connection)
):
  at, rt = core_refresh_token.use_refresh_token(WAUTHREF, db)

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
