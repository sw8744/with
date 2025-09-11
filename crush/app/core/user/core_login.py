from app.core.user.core_jwt import create_access_token, create_refresh_token
from app.schemas.user.identity import Identity


def login(identity: Identity) -> (str, str):
  access_token = create_access_token(
    identity.uid,
    identity.role
  )

  refresh_token = create_refresh_token(
    identity.uid
  )

  return access_token, refresh_token
