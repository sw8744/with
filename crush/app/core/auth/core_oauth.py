import logging
from typing import Optional
from uuid import uuid4

from fastapi import HTTPException

from app.core.database.database import redis_db0
from app.core.hash import sha256

log = logging.getLogger(__name__)


def set_session_state(state: str) -> str:
  session_uuid = str(uuid4())

  if redis_db0.exists(session_uuid) != 0:
    log.warning("OAuth state session has crashed %s", sha256(session_uuid))
    raise HTTPException(500, "Session UUID crash")

  redis_db0.set(
    name=session_uuid,
    value=state,
    ex=600
  )
  log.info("OAuth state session %s linked to state %s was saved", sha256(session_uuid), sha256(state))

  return session_uuid


def get_session_state(session_uuid: str) -> Optional[str]:
  if session_uuid is None:
    log.warning("OAuth state session UUID is None")
    raise HTTPException(status_code=400, detail="Session UUID is None")
  if redis_db0.exists(session_uuid) is None:
    log.warning("OAuth state session %s has not been saved", sha256(session_uuid))
    raise HTTPException(status_code=400, detail="Session UUID was not found")

  val = redis_db0.get(session_uuid)
  if val is None:
    log.warning("OAuth state session %s value is None", sha256(session_uuid))
    raise HTTPException(status_code=400, detail="Session value is None")

  redis_db0.delete(session_uuid)

  log.info("OAuth state %s linked to session %s was cleared", sha256(val), sha256(session_uuid))

  return val
