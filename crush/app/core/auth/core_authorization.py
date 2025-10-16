import logging

from fastapi import HTTPException
from fastapi.security import APIKeyHeader
from jwt import InvalidTokenError

from app.core.user import core_jwt

log = logging.getLogger(__name__)


class APIKeyHeaderBearer(APIKeyHeader):
  def __init__(self):
    super().__init__(name="Authorization")


authorization_header = APIKeyHeaderBearer()


def authorize_jwt(token: str) -> dict[str, str]:
  if token is None:
    log.warning("Auth failed: Authorization header was not provided")
    raise HTTPException(status_code=400, detail="Authorization header was not provided")

  if not token.startswith("Bearer "):
    log.warning("Auth failed: Authorization must be Bearer token")
    raise HTTPException(status_code=400, detail="Authorization must be Bearer token")

  jwt_token = token[7:]

  try:
    jwt_body = core_jwt.decode_access_token(jwt_token)
  except InvalidTokenError as e:
    log.warning(f"Auth failed: Access token is invalid or unauthorized {e}")
    raise HTTPException(status_code=401, detail="Access token is invalid or unauthorized")

  if not jwt_body:
    log.warning("Auth failed: Access token is invalid or unauthorized")
    raise HTTPException(status_code=401, detail="Access token is invalid or unauthorized")

  log.info("Authorized access token. sub=\"{}\"".format(jwt_body.get("sub")))
  return jwt_body
