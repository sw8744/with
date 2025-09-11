import json
from typing import Optional
from uuid import UUID

import google_auth_oauthlib.flow
import requests
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.auth.core_oauth import get_session_state
from app.core.config_store import config
from app.database import redis_db0
from app.models.auth.GoogleAuth import GoogleAuthModel
from app.models.users.identities import IdentityModel
from app.schemas.user.identity import Identity


def create_auth_url() -> (str, str):
  flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
    'client_secret.json',
    scopes=config['auth']['oauth']['google']['scope']
  )

  flow.redirect_uri = config['auth']['oauth']['google']['redirect-uri']

  authorization_url, state = flow.authorization_url(
    access_type=config['auth']['oauth']['google']['access-type'],
  )

  return authorization_url, state


def google_login(
  url: str,
  state_session_uuid: str,
  db: Session
) -> (Optional[Identity], dict[str, any]):
  state = get_session_state(state_session_uuid)
  flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
    'client_secret.json',
    scopes=config['auth']['oauth']['google']['scope'],
    state=state
  )

  flow.redirect_uri = config['auth']['oauth']['google']['redirect-uri']

  flow.fetch_token(authorization_response=url)
  token = flow.credentials.token

  userinfo = get_google_user(token)
  identity: Optional[Identity] = find_sub_from_database(userinfo["sub"], db)

  return identity, userinfo


def get_google_user(token: str) -> dict[str, any]:
  response = requests.get("https://www.googleapis.com/oauth2/v3/userinfo", params={"access_token": token})
  if response.status_code != 200:
    raise HTTPException(status_code=500, detail="Google API error")

  userinfo = response.json()

  return userinfo


def get_register_session(register_session_uuid: UUID) -> dict[str, any]:
  content = redis_db0.get(str(register_session_uuid))

  if content is None:
    raise HTTPException(status_code=404, detail="Session not found")

  return json.loads(content)


def find_sub_from_database(
  sub: str,
  db: Session
) -> Optional[Identity]:
  google_auth: Optional[GoogleAuthModel] = (
    db.query(GoogleAuthModel)
    .filter(GoogleAuthModel.sub == sub)
    .first()
  )

  if google_auth is None:
    return None
  else:
    im: IdentityModel = google_auth.user
    return Identity(
      uid=im.uid,
      name=im.name,
      email=im.email,
      email_verified=im.email_verified,
      sex=im.sex,
      birthday=im.birthday,
      role=im.role
    )
