import logging
from typing import Tuple

from fastapi import HTTPException

from app.core.user.core_jwt import create_access_token, create_refresh_token, Role
from app.schemas.user.Identity import Identity

log = logging.getLogger(__name__)

def login(identity: Identity) -> Tuple[str, str]:
  if identity is None:
    log.warning("Login was attempted with none identity")
    raise HTTPException(status_code=401, detail="Unauthorized")
  if Role.CORE_USER.value not in identity.role:
    log.warning(f"Login was attempted with insufficient role: {identity.role}")
    raise HTTPException(status_code=403, detail="Forbidden")

  access_token = create_access_token(
    identity.uid,
    identity.role
  )

  refresh_token = create_refresh_token(
    identity.uid
  )

  return access_token, refresh_token
