import logging

from fastapi import APIRouter, UploadFile
from fastapi.params import Security, Depends, File
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.database.database import create_connection
from app.core.user import core_user
from app.core.user.core_jwt import require_role, Role, get_sub
from app.schemas.user.IdentityRequests import IdentityPatchRequest

log = logging.getLogger(__name__)

router = APIRouter(
  prefix="/api/v1/user",
  tags=["user"]
)


@router.get(
  path=""
)
def get_user(
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)

  identity = core_user.get_identity(token, db)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "user": identity.model_dump()
    }
  )


@router.patch(
  path=""
)
def update_user_identity(
  request: IdentityPatchRequest,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  log.info("Patching identity %r", get_sub(token))
  core_user.update_identity(request, get_sub(token), db)
  log.info("Update of identity %r was committed", get_sub(token))

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )


@router.patch(
  path="/picture"
)
async def update_user_profile_picture(
  file: UploadFile = File(...),
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  log.info("Updating profile picture for identity %r", get_sub(token))
  img_uuid = await core_user.update_profile_picture(file, get_sub(token), db)
  log.info("Update of profile picture for identity %r was committed", get_sub(token))

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "uid": str(img_uuid)
    }
  )
