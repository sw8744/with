import logging
from uuid import UUID

from fastapi import APIRouter, UploadFile
from fastapi.params import Security, Depends, File
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse, RedirectResponse, FileResponse, Response

from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.database.database import create_connection
from app.core.resources import core_image
from app.core.user.core_jwt import require_role, Role, get_sub

log = logging.getLogger(__name__)

router = APIRouter(
  prefix="/api/v1/resources/image",
  tags=["resources", "image"],
)


@router.get(
  path="/store/{image_uuid}"
)
def get_stored_image(
  image_uuid: UUID,
  db: Session = Depends(create_connection)
):
  log.info("Querying stored image %r", image_uuid)
  path, mime = core_image.stored_image(image_uuid, db)

  return FileResponse(
    path,
    media_type=mime,
  )


@router.post(
  path="/store"
)
def upload_image(
  file: UploadFile = File(...),
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.IMAGE_UPLOAD)
  log.info("%r is uploading an image", get_sub(token))
  uuid = core_image.upload(file, db)
  log.info("Image uploaded by %r has been assigned UUID %r", get_sub(token), uuid)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "image_id": uuid,
    }
  )


@router.get(
  path="/profile/{user_uuid}"
)
def get_profile_image(
  user_uuid: UUID,
  db: Session = Depends(create_connection)
):
  log.info("Querying profile image for user %r", user_uuid)
  path = core_image.profile_image(user_uuid, db)
  log.debug("Profile image path of %r is %r", user_uuid, path)

  return RedirectResponse(url=path)


@router.get(
  path="/authenticator/{aaguid}"
)
def get_authenticator_image(
        aaguid: UUID,
):
  log.info("Querying authenticator image for AAGUID %r", aaguid)
  path, mime = core_image.authenticator_image(aaguid)
  log.debug("Authenticator image path for AAGUID %r is %r", aaguid, path)

  return Response(
    content=path,
    media_type=mime
  )
