import logging
from sys import prefix
from uuid import UUID

from fastapi.params import Security, Depends
from fastapi.routing import APIRouter
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.auth.passkey import core_passkey
from app.core.database.database import create_connection
from app.core.user import core_user
from app.core.user.core_jwt import require_role, Role, get_sub
from app.schemas.authentication.PasskeyRequests import PasskeyRenameRequest

log = logging.getLogger(__name__)

router = APIRouter(
  prefix="/api/v1/auth/passkey",
  tags=["passkey"]
)


@router.get(
  path="/list"
)
def get_passkeys(
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  sub = get_sub(token)

  passkeys = core_passkey.list_passkeys(sub, db)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "passkeys": [passkey.model_dump() for passkey in passkeys]
    }
  )


@router.patch(
  path="/{passkey_id}"
)
def rename_passkey(
  passkey_id: UUID,
  body: PasskeyRenameRequest,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  identity = core_user.get_identity(token, db)

  core_passkey.rename_passkey(passkey_id, identity, body.name, db)
  log.info("Passkey %r renamed to %r", passkey_id, body.name)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )


@router.delete(
  path="/{passkey_id}"
)
def delete_passkey(
  passkey_id: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  identity = core_user.get_identity(token, db)

  core_passkey.delete_passkey(passkey_id, identity, db)
  log.info("Passkey %r deleted", passkey_id)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )
