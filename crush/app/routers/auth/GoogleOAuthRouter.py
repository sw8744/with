from typing import Annotated
from uuid import UUID

from fastapi import APIRouter
from fastapi.params import Cookie, Depends
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.responses import RedirectResponse, JSONResponse

from app.core.auth import core_google_auth
from app.core.auth.core_google_auth import create_auth_url
from app.core.auth.core_oauth import set_session_state
from app.core.config_store import config
from app.core.user.core_login import login
from app.core.user.core_user import create_signup_session
from app.database import create_connection

router = APIRouter(
  prefix="/api/v1/auth/oauth/google",
  tags=["auth", "auth", "google"],
)


@router.get(
  path="",
)
def begin_authentication():
  (authorization_url, state) = create_auth_url()

  session_uuid = set_session_state(state)

  response = RedirectResponse(authorization_url)
  response.set_cookie(
    "OAuthState",
    session_uuid,
    max_age=600,
    httponly=True,
    samesite='strict',
    secure=config['cookie']['secure']
  )

  return response


@router.get(
  path="/callback"
)
def callback_authentication(
  request: Request,
  db: Session = Depends(create_connection)
):
  state_session_uuid = request.cookies.get('OAuthState')

  identity, userinfo = core_google_auth.google_login(str(request.url), state_session_uuid, db)

  if identity is None:
    register_session_uuid = create_signup_session({
      "name": userinfo["name"],
      "email": userinfo["email"],
      "email_verified": userinfo["email_verified"],
      "auth": {
        "type": "google",
        "sub": userinfo["sub"]
      }
    })

    response = RedirectResponse("/register/google")
    response.delete_cookie("OAuthState")
    response.set_cookie(
      "session",
      register_session_uuid,
      max_age=3600,
      httponly=True,
      samesite='strict',
      secure=config['cookie']['secure']
    )
  else:
    access_token, refresh_token = login(identity)

    response = RedirectResponse("/login/set-token?at={}".format(access_token))
    response.delete_cookie("OAuthState")
    response.set_cookie(
      'WAUTHREF',
      refresh_token,
      max_age=2592000,
      httponly=True,
      samesite='strict',
      secure=config['cookie']['secure'],
      path='/api/v1'
    )

  return response


@router.get(
  path="/register-info",
  tags=["register"]
)
def get_register_session(
  session: Annotated[UUID | None, Cookie()] = None
):
  content = core_google_auth.get_register_session(session)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "content": content
    }
  )
