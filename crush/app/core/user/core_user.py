import io
import json
import logging
from typing import Optional, Tuple
from uuid import uuid4, UUID

from PIL import Image
from fastapi import HTTPException
from sqlalchemy import Row
from sqlalchemy.orm import Session, aliased
from sqlalchemy.sql.expression import case
from starlette.datastructures import UploadFile

from app.core.database.database import redis_db0
from app.core.hash import sha256
from app.core.recommendation import core_prefer_vector
from app.core.resources import core_image
from app.core.user.core_jwt import get_sub
from app.models.auth.GoogleAuthModel import GoogleAuthModel
from app.models.preferences.UserPrefer import UserPrefer
from app.models.users.IdentityModel import IdentityModel
from app.models.users.RelationshipModel import RelationshipModel
from app.schemas.user.Identity import Identity
from app.schemas.user.IdentityRegisterRequests import RegisterIdentityReq
from app.schemas.user.IdentityRequests import IdentityPatchRequest, IdentitySearchRequest

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


def update_identity(
  request: IdentityPatchRequest,
  identity_uid: UUID,
  db: Session
):
  identity: IdentityModel = (
    db.query(IdentityModel)
    .filter(IdentityModel.uid == identity_uid)
    .scalar()
  )

  if identity is None:
    log.warning("Identity %r was not found for update", identity_uid)
    raise HTTPException(status_code=404, detail="Identity not found")

  if request.name is not None:
    log.debug("Applying change of name in identity %r", identity.uid)
    identity.name = request.name
  if request.email is not None and request.email != identity.email:
    log.debug("Applying change of email in identity %r", identity.uid)
    log.info("Verification of email %r of identity %r is no more valid", request.email, identity.uid)
    identity.email = request.email
    identity.email_verified = False
  if request.birthday is not None:
    log.debug("Applying change of birthday in identity %r", identity.uid)
    identity.birthday = request.birthday
  if request.sex is not None:
    log.debug("Applying change of sex in identity %r", identity.uid)
    identity.sex = request.sex

  db.commit()


async def update_profile_picture(
  profile_picture: UploadFile,
  identity_uid: UUID,
  db: Session
) -> str:
  identity: IdentityModel = (
    db.query(IdentityModel)
    .filter(IdentityModel.uid == identity_uid)
    .scalar()
  )

  if identity is None:
    log.warning("Identity %r was not found for profile picture update", identity_uid)
    raise HTTPException(status_code=404, detail="Identity not found")

  image_byte = await profile_picture.read()
  image = Image.open(io.BytesIO(image_byte))

  w = image.width;
  h = image.height

  if w != h:
    side = min(w, h)
    log.debug("Cropping profile picture for identity %r from %dx%d to %dx%d", identity_uid, w, h, side, side)
    left = (w - side) / 2
    top = (h - side) / 2
    right = (w + side) / 2
    bottom = (h + side) / 2
    image = image.crop((left, top, right, bottom))

  image = image.resize((96, 96))

  buffer = io.BytesIO()
  image.save(buffer, format="JPEG")
  binary = buffer.getvalue()

  img_uuid = core_image.upload_binary(binary, "image/jpeg", db)

  identity.profile_picture = img_uuid
  db.commit()

  return img_uuid


def search_identities(
  query: IdentitySearchRequest,
  sub: UUID,
  db: Session
):
  # 검색 우선순위(이름이 일치하는 사람 중에서)
  # 1. 내가 팔로우
  # 2. 나를 팔로잉
  # 3. 내가 팔로우 하는 사람이 팔로우

  priority_one = (
    db.query()
    .filter(
      RelationshipModel.user_id == sub,
      RelationshipModel.friend_id == IdentityModel.uid
    )
    .correlate(IdentityModel)
    .exists()
  )

  priority_two = (
    db.query()
    .filter(
      RelationshipModel.user_id == IdentityModel.uid,
      RelationshipModel.friend_id == sub
    )
    .correlate(IdentityModel)
    .exists()
  )

  r1 = aliased(RelationshipModel)
  r2 = aliased(RelationshipModel)

  priority_three = (
    db.query()
    .select_from(r1)
    .join(
      r2,
      r1.friend_id == r2.user_id
    )
    .filter(
      r1.user_id == sub,
      r2.friend_id == IdentityModel.uid
    )
    .correlate(IdentityModel)
    .exists()
  )

  priority_case = case(
    (priority_one, 1),
    (priority_two, 2),
    (priority_three, 3),
    else_=4
  )

  result: list[Row[Tuple[IdentityModel, int]]] = (
    db.query(
      IdentityModel,
      priority_case
    )
    .filter(
      IdentityModel.name.ilike(f"%{query.name}%"),
      IdentityModel.uid != sub
    )
    .order_by(priority_case.asc())
    .all()
  )

  return [
    {
      "uid": str(iden[0].uid),
      "name": iden[0].name,
    } for iden in result
  ]
