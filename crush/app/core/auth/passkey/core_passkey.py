import logging
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.auth.PasskeyAuthModel import PasskeyAuthModel
from app.schemas.authentication.Passkey import Passkey
from app.schemas.user.Identity import Identity

log = logging.getLogger(__name__)


def list_passkeys(
  user_id: UUID,
  db: Session
) -> list[Passkey]:
  passkeys = (
    db.query(PasskeyAuthModel)
    .filter(PasskeyAuthModel.user_id == user_id)
    .all()
  )

  return [Passkey(passkey) for passkey in passkeys]


def rename_passkey(
  passkey_id: UUID,
  identity: Identity,
  name: str,
  db: Session
):
  if identity is None:
    log.warning("Identity was not found when renaming passkey %r", passkey_id)
    raise HTTPException(status_code=404, detail="Identity not found")

  passkey: PasskeyAuthModel = (
    db.query(PasskeyAuthModel)
    .filter(PasskeyAuthModel.uid == passkey_id)
    .filter(PasskeyAuthModel.user_id == identity.uid)
    .scalar()
  )

  if passkey is None:
    log.warning("Passkey %r was not found for identity %r. Cannot be renamed", passkey_id, identity.uid)
    raise HTTPException(status_code=404, detail="Passkey not found")

  passkey.name = name
  db.commit()


def delete_passkey(
  passkey_id: UUID,
  identity: Identity,
  db: Session
):
  if identity is None:
    log.warning("Identity was not found when deleting passkey %r", passkey_id)
    raise HTTPException(status_code=404, detail="Identity not found")

  passkey: PasskeyAuthModel = (
    db.query(PasskeyAuthModel)
    .filter(PasskeyAuthModel.uid == passkey_id)
    .filter(PasskeyAuthModel.user_id == identity.uid)
    .scalar()
  )

  if passkey is None:
    log.warning("Passkey %r was not found for identity %r. Cannot be removed", passkey_id, identity.uid)
    raise HTTPException(status_code=404, detail="Passkey not found")

  db.delete(passkey)
  db.commit()
