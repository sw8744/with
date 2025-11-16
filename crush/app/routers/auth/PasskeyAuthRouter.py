import logging
from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.params import Cookie, Security
from fastapi.routing import APIRouter
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.auth.passkey import core_passkey, core_passkey_auth
from app.core.config_store import config
from app.core.database.database import create_connection
from app.core.user import core_user
from app.core.user.core_jwt import require_role, Role, get_sub
from app.schemas.authentication.PasskeyRequests import PasskeyAttestationRequest

log = logging.getLogger(__name__)

router = APIRouter(
  prefix="/api/v1/auth/passkey",
  tags=["auth", "passkey"]
)


@router.get(
  path="/challenge/option"
)
def get_passkey_challenge_options():
  log.debug("User requested authentication option")

  (session_id, option) = core_passkey_auth.begin_authentication()

  response = JSONResponse(
    content={
      'code': 200,
      'state': 'OK',
      'option': option
    }
  )
  response.set_cookie(
    key='PSK_AUTH_SEK',
    value=session_id,
    httponly=True,
    max_age=300,
    secure=config['cookie']['secure'],
    samesite='strict'
  )

  return response


@router.post(
  path="/challenge"
)
def create_passkey_challenge(
  body: PasskeyAttestationRequest,
  PSK_AUTH_SEK: Annotated[str | None, Cookie()],
  db: Session = Depends(create_connection)
):
  if PSK_AUTH_SEK is None:
    log.warning("Passkey authentication attempt without authentication session cookie")
    raise HTTPException(
      status_code=400,
      detail="Missing authentication session cookie"
    )

  at, rt = core_passkey_auth.auth_passkey(body, PSK_AUTH_SEK, db)

  response = JSONResponse(
    status_code=200,
    content={
      'code': 200,
      'state': 'OK',
      'jwt': at
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


@router.get(
  path="/register/option"
)
def get_passkey_register_options(
  jwt: str = Depends(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  sub = get_sub(token)

  identity = core_user.get_identity(token, db)

  (session_id, option) = core_passkey_auth.begin_registration(identity)
  response = JSONResponse(
    content={
      'code': 200,
      'state': 'OK',
      'option': option
    },
  )
  response.set_cookie(
    key='PSK_REG_SEK',
    value=session_id,
    httponly=True,
    max_age=300,
    secure=config['cookie']['secure'],
    samesite='strict'
  )

  return response


@router.post(
  path="/register"
)
def register_passkey(
  body: PasskeyAttestationRequest,
  PSK_REG_SEK: Annotated[str | None, Cookie()],
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  if PSK_REG_SEK is None:
    log.warning("Passkey registration attempt without registration session cookie")
    raise HTTPException(
      status_code=400,
      detail="Missing registration session cookie"
    )

  identity = core_user.get_identity(token, db)
  passkey_uuid = core_passkey_auth.complete_registration(identity, body, PSK_REG_SEK, db)

  log.info("Passkey %r was registered for user %r", passkey_uuid, identity.uid)

  return JSONResponse(
    status_code=200,
    content={
      'code': 200,
      'status': 'OK',
      'passkey': str(passkey_uuid)
    }
  )
