import json
from typing import Optional
from uuid import uuid4, UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.user.core_jwt import get_sub
from app.database import redis_db0
from app.models.auth.GoogleAuth import GoogleAuthModel
from app.models.users.identities import IdentityModel
from app.schemas.user.identity import Identity
from app.schemas.user.register_reqs import RegisterIdentityReq


def create_signup_session(
  application: dict[str, any]
) -> str:
  session_uuid = str(uuid4())

  if redis_db0.exists(session_uuid) != 0:
    raise HTTPException(500, "Session UUID crash")

  redis_db0.set(
    name=session_uuid,
    value=json.dumps(application),
    ex=3600
  )

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
    return None
  else:
    return Identity(
      uid=iden.uid,
      name=iden.name,
      email=iden.email,
      email_verified=iden.email_verified,
      sex=iden.sex,
      birthday=iden.birthday,
      role=iden.role
    )


def register_using_session(
  application: RegisterIdentityReq,
  reg_session_uuid: UUID,
  db: Session
) -> Identity:
  reg_session = redis_db0.get(str(reg_session_uuid))
  if reg_session is None:
    raise HTTPException(status_code=404, detail="Session not found")

  reg: dict[str, any] = json.loads(reg_session)

  identity = IdentityModel(
    name=application.name,
    email=str(application.email),
    email_verified=(
      application.email == reg.get('email', None) and
      reg.get('email_verified', False)
    ),
    sex=application.sex,
    birthday=application.birthday,
    role=['core:user']
  )
  db.add(identity)
  db.flush()

  auth_ctx = reg['auth']

  if auth_ctx['type'] == 'google':
    register_google_auth(identity.uid, auth_ctx, db)
  else:
    raise HTTPException(status_code=400, detail="Unknown authentication context")

  db.commit()

  return Identity(
    uid=identity.uid,
    name=identity.name,
    email=identity.email,
    email_verified=identity.email_verified,
    sex=identity.sex,
    birthday=identity.birthday,
    role=identity.role
  )


def register_google_auth(
  uid: UUID,
  auth_ctx: dict[str, any],
  db: Session
):
  google_auth = GoogleAuthModel(
    user_id=uid,
    sub=auth_ctx['sub']
  )

  db.add(google_auth)
