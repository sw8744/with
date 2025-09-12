from fastapi import HTTPException
from jwt import InvalidTokenError
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.core.user import core_jwt
from app.core.user.core_jwt import get_sub
from app.core.user.core_login import login
from app.database import redis_refresh_token_blacklist_db1
from app.models.users.identities import IdentityModel


def use_refresh_token(
  refresh_token: str,
  db: Session
) -> (str, str):
  if refresh_token is None:
    raise HTTPException(status_code=400, detail="No refresh token was provided")

  try:
    token = core_jwt.decode_refresh_token(refresh_token)
  except (InvalidTokenError, Exception) as e:
    logger.debug("Auth failed: Refresh token is invalid or unauthorized[{}]".format(e))
    raise HTTPException(status_code=401, detail="Refresh token is invalid or unauthorized")

  if redis_refresh_token_blacklist_db1.exists(token.get('rti')):
    raise HTTPException(status_code=401, detail="Refresh token cannot be used")
  else:
    redis_refresh_token_blacklist_db1.set(
      name=token.get('rti'),
      value=1,
      ex=2419200
    )

  sub = get_sub(token)
  identity = (
    db.query(IdentityModel)
      .filter(IdentityModel.uid == sub)
      .scalar()
  )

  if identity is None:
    raise HTTPException(status_code=404, detail="User was not found")

  access_token, new_refresh_token = login(identity)
  return access_token, new_refresh_token
