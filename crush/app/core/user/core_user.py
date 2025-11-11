import json
import logging
from typing import Optional
from uuid import uuid4, UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.database.database import redis_db0
from app.core.hash import sha256
from app.core.recommendation import core_prefer_vector
from app.core.user.core_jwt import get_sub
from app.models.auth.GoogleAuth import GoogleAuthModel
from app.models.preferences.UserPrefer import UserPrefer
from app.models.users.IdentityModel import IdentityModel
from app.schemas.user.Identity import Identity
from app.schemas.user.IdentityRegisterRequests import RegisterIdentityReq

log = logging.getLogger(__name__)


def create_signup_session(
  application: dict[str, any]
) -> str:
  session_uuid = str(uuid4())

  if redis_db0.exists(session_uuid) != 0:
    log.warning("Registration session has crashed %s", sha256(session_uuid))
    raise HTTPException(500, "Session UUID crash")

  redis_db0.set(
    name=session_uuid,
    value=json.dumps(application),
    ex=3600
  )
  log.info("New registration session %s was saved", sha256(session_uuid))

  return session_uuid


def get_identity(
  token: dict[str, any],
  db: Session
) -> Optional[Identity]:
  uid = get_sub(token)

  iden = (
    db.query(IdentityModel)
    .filter(IdentityModel.uid == uid)
    .scalar()
  )

  if iden is None:
    log.warning("Identity %s was not found", uid)
    return None
  else:
    return Identity(iden)


def register_using_session(
  application: RegisterIdentityReq,
  reg_session_uuid: UUID,
  db: Session
) -> Identity:
  reg_session = redis_db0.get(str(reg_session_uuid))
  if reg_session is None:
    log.warning("Registration session %s was not found", sha256(str(reg_session_uuid)))
    raise HTTPException(status_code=404, detail="Session not found")

  reg: dict[str, any] = json.loads(reg_session)

  identity = IdentityModel(
    name=application.name,
    profile_picture=reg.get("profile_picture", "00000000-0000-4000-0000-000000000000"),
    email=str(application.email),
    email_verified=(
      application.email == reg.get("email", None) and
      reg.get("email_verified", False)
    ),
    sex=application.sex,
    birthday=application.birthday,
    role=["core:user"]
  )
  db.add(identity)
  db.flush()

  n_array = core_prefer_vector.process_vector(application.prefer)
  user_preference = UserPrefer(
    user_id=identity.uid,
    prefer=n_array
  )
  db.add(user_preference)

  auth_ctx = reg["auth"]

  if auth_ctx["type"] == "google":
    register_google_auth(identity.uid, auth_ctx, db)
  else:
    log.warning("Invalid auth type %s", auth_ctx["type"])
    raise HTTPException(status_code=400, detail="Unknown authentication context")

  db.commit()
  log.info("New user %s was committed", identity.uid)

  return Identity(identity)


def register_google_auth(
  uid: UUID,
  auth_ctx: dict[str, any],
  db: Session
):
  google_auth = GoogleAuthModel(
    user_id=uid,
    sub=auth_ctx["sub"]
  )
  log.debug("Google auth model created for user %s, sub=%s", uid, auth_ctx["sub"])

  db.add(google_auth)
