import logging

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.auth.GoogleAuthModel import GoogleAuthModel
from app.models.auth.PasskeyAuthModel import PasskeyAuthModel
from app.schemas.user.Identity import Identity

log = logging.getLogger(__name__)


def get_auth_methods(
  identity: Identity,
  db: Session
):
  if identity is None:
    log.warning("Identity was not found when finding auth methods")
    raise HTTPException(status_code=404, detail="Identity not found")

  ret = {}

  google_auth = (
                  db.query(GoogleAuthModel)
                  .filter(GoogleAuthModel.user_id == identity.uid)
                  .scalar()
                ) is not None

  passkey_auth = (
    db.query(PasskeyAuthModel)
    .filter(PasskeyAuthModel.user_id == identity.uid)
    .count()
  )

  ret["google"] = google_auth
  ret["passkey"] = passkey_auth

  return ret
