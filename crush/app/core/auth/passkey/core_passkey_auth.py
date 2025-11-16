import base64
import json
import logging
import os
import uuid
from datetime import datetime
from typing import Tuple
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session
from webauthn import generate_registration_options, generate_authentication_options, options_to_json, \
  verify_registration_response, verify_authentication_response
from webauthn.helpers.structs import UserVerificationRequirement

from app.core.auth.passkey.paykey_aaguid import get_authenticator
from app.core.config_store import config
from app.core.database.database import redis_db0
from app.core.hash import sha256, sha256_bytes
from app.core.user import core_login
from app.models.auth.PasskeyAuthModel import PasskeyAuthModel
from app.schemas.authentication.PasskeyRequests import PasskeyAttestationRequest
from app.schemas.user.Identity import Identity

log = logging.getLogger(__name__)


def begin_authentication() -> Tuple[str, dict]:
  challenge = os.urandom(32)
  authentication_id = str(uuid.uuid4())

  if redis_db0.exists(authentication_id):
    log.warning("Passkey authentication ID %r is duplicated", authentication_id)
    raise HTTPException(status_code=400, detail="Registration ID already exists")

  auth_option = generate_authentication_options(
    rp_id=config['security']['webauthn']['rp_id'],
    challenge=challenge,
    user_verification=UserVerificationRequirement.REQUIRED,
    timeout=300,
  )

  redis_db0.set(authentication_id, base64.encodebytes(challenge).decode('ascii'))
  log.info("Passkey authentication option %r has been saved", authentication_id)

  return (
    authentication_id,
    json.loads(options_to_json(auth_option))
  )


def begin_registration(
  identity: Identity
) -> Tuple[str, dict]:
  if identity is None:
    log.warning("Identity was not found during passkey registration")
    raise HTTPException(status_code=404, detail="Identity not found")

  challenge = os.urandom(32)
  registration_id = str(uuid.uuid4())

  if redis_db0.exists(registration_id):
    log.warning("Passkey registration ID %r is duplicated", registration_id)
    raise HTTPException(status_code=400, detail="Registration ID already exists")

  reg_option = generate_registration_options(
    rp_id=config['security']['webauthn']['rp_id'],
    rp_name=config['security']['webauthn']['rp_name'],
    challenge=challenge,
    user_name=identity.name,
    user_id=identity.uid.bytes,
    user_display_name=identity.name,
    timeout=300,
  )

  redis_db0.set(registration_id, base64.encodebytes(challenge).decode('ascii'))
  log.info("Passkey registration option %r has been saved", registration_id)

  return (
    registration_id,
    json.loads(options_to_json(reg_option))
  )


def complete_registration(
  identity: Identity,
  request: PasskeyAttestationRequest,
  register_option: str,
  db: Session
) -> UUID:
  if identity is None:
    log.warning("Identity not found during passkey registration")
    raise HTTPException(status_code=404, detail="Identity not found")

  challenge_b64 = redis_db0.get(register_option)
  redis_db0.delete(register_option)

  if challenge_b64 is None:
    log.warning("Register option not found when registering passkey of user %r", identity.user_id)
    raise HTTPException(status_code=400, detail="Registration option not found")

  challenge = base64.decodebytes(challenge_b64.encode('ascii'))

  registration = verify_registration_response(
    credential=request.attestation,
    expected_rp_id=config['security']['webauthn']['rp_id'],
    expected_challenge=challenge,
    expected_origin=config['security']['webauthn']['rp_origin'],
  )

  aaguid = UUID(registration.aaguid)

  authenticator = get_authenticator(aaguid)

  if authenticator is None:
    log.warning("Authenticator with aaguid of %r was not found", registration.aaguid)
    raise HTTPException(status_code=400, detail="Authenticator not found")

  passkey_auth = PasskeyAuthModel(
    credential_id=registration.credential_id,
    name=authenticator.name,
    user_id=identity.uid,
    public_key=registration.credential_public_key,
    aaguid=aaguid,
    counter=registration.sign_count
  )
  db.add(passkey_auth)
  db.commit()
  db.refresh(passkey_auth)

  return passkey_auth.uid


def auth_passkey(
  body: PasskeyAttestationRequest,
  PSK_AUTH_SEK: str,
  db: Session
) -> Tuple[str, str]:
  response = body.attestation.get("response", {})

  if response is None:
    log.warning("'Response' field was not found in passkey authentication body")
    raise HTTPException(status_code=400, detail="Malformed request")

  credential_id_b64: str = str(body.attestation.get('rawId'))
  credential_id = base64.urlsafe_b64decode(credential_id_b64 + "==")

  passkey_auth: PasskeyAuthModel = (
    db.query(PasskeyAuthModel)
    .filter(PasskeyAuthModel.credential_id == credential_id)
    .scalar()
  )
  if passkey_auth is None:
    log.warning("Passkey %r was not found", sha256_bytes(credential_id))
    raise HTTPException(status_code=400, detail="Passkey not found")

  identity = passkey_auth.identity
  if identity is None:
    log.warning("Identity was not found for passkey %r", sha256_bytes(credential_id))
    raise HTTPException(status_code=400, detail="Identity not found")

  challenge_b64 = redis_db0.get(PSK_AUTH_SEK)
  redis_db0.delete(PSK_AUTH_SEK)

  if challenge_b64 is None:
    log.warning("Passkey authentication option not found")
    raise HTTPException(status_code=400, detail="Authentication option not found")

  challenge = base64.decodebytes(challenge_b64.encode('ascii'))

  auth = verify_authentication_response(
    credential=body.attestation,
    expected_rp_id=config['security']['webauthn']['rp_id'],
    expected_challenge=challenge,
    expected_origin=config['security']['webauthn']['rp_origin'],
    credential_public_key=passkey_auth.public_key,
    credential_current_sign_count=passkey_auth.counter,
  )

  passkey_auth.counter = auth.new_sign_count
  passkey_auth.last_used = datetime.now()
  log.info("%r used passkey %r to authenticate", identity.uid, sha256_bytes(credential_id))

  at, rt = core_login.login(Identity(identity))
  log.info("Access token %s and refresh token %s was issued for user %s", sha256(at), sha256(rt),
           identity.uid)

  db.commit()

  return at, rt
