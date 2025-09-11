from typing import Optional
from uuid import uuid4

from fastapi import HTTPException

from app.database import redis_db0


def set_session_state(state: str) -> str:
  session_uuid = str(uuid4())

  if redis_db0.exists(session_uuid) != 0:
    raise HTTPException(500, "Session UUID crash")

  redis_db0.set(
    name=session_uuid,
    value=state,
    ex=600
  )

  return session_uuid


def get_session_state(session_uuid: str) -> Optional[str]:
  val = redis_db0.get(session_uuid)
  redis_db0.delete(session_uuid)

  return val
