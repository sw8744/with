import json
import logging
from datetime import datetime
from typing import Optional
from uuid import UUID

import google_auth_oauthlib.flow
import requests
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.auth.core_oauth import get_session_state
from app.core.config_store import config
from app.core.database.database import redis_db0
from app.core.hash import sha256
from app.models.auth.GoogleAuth import GoogleAuthModel
from app.models.users.IdentityModel import IdentityModel
from app.schemas.user.identity import Identity

log = logging.getLogger(__name__)


def create_auth_url() -> (str, str):
  flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
    "client_secret.json",
    scopes=config["auth"]["oauth"]["google"]["scope"]
  )

  flow.redirect_uri = config["auth"]["oauth"]["google"]["redirect-uri"]

  authorization_url, state = flow.authorization_url(
    access_type=config["auth"]["oauth"]["google"]["access-type"],
  )

  return authorization_url, state


def google_login(
  url: str,
  state_session_uuid: str,
  db: Session
) -> (Optional[Identity], dict[str, any]):
  state = get_session_state(state_session_uuid)

  flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
    "client_secret.json",
    scopes=config["auth"]["oauth"]["google"]["scope"],
    state=state
  )

  flow.redirect_uri = config["auth"]["oauth"]["google"]["redirect-uri"]

  flow.fetch_token(authorization_response=url)
  token = flow.credentials.token
  log.debug("Acquired OAuth token from Google")

  userinfo = get_google_user(token)
  identity: Optional[Identity] = find_sub_from_database(userinfo["sub"], db)

  return identity, userinfo


def get_google_user(token: str) -> dict[str, any]:
  response = requests.get("https://www.googleapis.com/oauth2/v3/userinfo", params={"access_token": token})
  if response.status_code != 200:
    log.warning("Failed to get user info from Google. status=%d, response=[%s]", response.status_code, response.text)
    raise HTTPException(status_code=500, detail="Google API error")

  userinfo = response.json()
  log.debug("Acquired user info from Google")

  return userinfo


def get_register_session(register_session_uuid: UUID) -> dict[str, any]:
  content = redis_db0.get(str(register_session_uuid))

  if content is None:
    log.warning("Register session %s was not found", sha256(str(register_session_uuid)))
    raise HTTPException(status_code=404, detail="Session not found")

  return json.loads(content)


def find_sub_from_database(
  sub: str,
  db: Session
) -> Optional[Identity]:
  google_auth: Optional[GoogleAuthModel] = (
    db.query(GoogleAuthModel)
    .filter(GoogleAuthModel.sub == sub)
    .scalar()
  )

  if google_auth is None:
    log.debug("Google user sub=%s is in the database", sub)
    return None
  else:
    log.debug("Google user sub=%s is in the database", sub)
    im: IdentityModel = google_auth.user
    google_auth.last_used = datetime.now()
    log.info("Google user sub=%s was successfully logged in", sub)
    return Identity(im)
