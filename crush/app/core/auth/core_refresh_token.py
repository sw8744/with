import logging

from fastapi import HTTPException
from jwt import InvalidTokenError
from sqlalchemy.orm import Session

from app.core.database.database import redis_refresh_token_blacklist_db1
from app.core.hash import sha256
from app.core.logger import logger
from app.core.user import core_jwt
from app.core.user.core_jwt import get_sub
from app.core.user.core_login import login
from app.models.users.IdentityModel import IdentityModel

log = logging.getLogger(__name__)


def use_refresh_token(
  refresh_token: str,
  db: Session
) -> (str, str):
  if refresh_token is None:
    log.warning("Missing refresh token in refresh request")
    raise HTTPException(status_code=400, detail="No refresh token was provided")

  try:
    token = core_jwt.decode_refresh_token(refresh_token)
  except InvalidTokenError as e:
    logger.warning(f"Auth failed: Refresh token is invalid or unauthorized {e}")
    raise HTTPException(status_code=401, detail="Refresh token is invalid or unauthorized")

  if redis_refresh_token_blacklist_db1.exists(token.get("rti")):
    log.warning("Auth failed: Blacklisted refresh token was re-used. token_hash=%s", sha256(refresh_token))
    raise HTTPException(status_code=401, detail="Refresh token cannot be used")
  else:
    log.info("Blacklisted token %s", sha256(refresh_token))
    redis_refresh_token_blacklist_db1.set(
      name=token.get("rti"),
      value=1,
      ex=2419200
    )

  sub = get_sub(token)
  log.info("Refreshing tokens for user %s", sub)

  identity = (
    db.query(IdentityModel)
    .filter(IdentityModel.uid == sub)
    .scalar()
  )

  if identity is None:
    log.warning("Identity %s was not found")
    raise HTTPException(status_code=404, detail="User was not found")

  access_token, new_refresh_token = login(identity)
  log.info("Access token %s and refresh token %s was issued for user %s", sha256(access_token),
           sha256(new_refresh_token), sub)
  return access_token, new_refresh_token
