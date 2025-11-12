import logging
import re
from typing import Tuple
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException

from app.models.resources.ImageStoreModel import ImageStoreModel
from app.models.users.IdentityModel import IdentityModel

log = logging.getLogger(__name__)


def profile_image(
  user_uuid: UUID,
  db: Session
) -> str:
  user = (
    db.query(IdentityModel.profile_picture)
    .filter(IdentityModel.uid == user_uuid)
    .scalar()
  )

  if user is None:
    log.warning("User with UUID %r not found when querying user's profile picture", user_uuid)
    raise HTTPException(status_code=404, detail="User not found")

  if re.match("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", user):
    return "/api/v1/resources/image/store/" + str(user)
  else:
    return user


def stored_image(
  image_uuid: UUID,
  db: Session
) -> Tuple[str, str]:
  metadata = (
    db.query(ImageStoreModel)
    .filter(ImageStoreModel.uid == image_uuid)
    .scalar()
  )

  if metadata is None:
    log.warning("Image with UUID %r not found when querying stored image", image_uuid)
    raise HTTPException(status_code=404, detail="Image not found")

  return "images/" + str(metadata.uid), metadata.mime_type


def upload(
  file: UploadFile,
  db: Session
) -> str:
  metadata = ImageStoreModel(
    mime_type=file.content_type
  )
  db.add(metadata)
  db.flush()

  image_uuid = metadata.uid
  path = "images/" + str(image_uuid)

  with open(path, "wb") as image_file:
    content = file.file.read()
    image_file.write(content)

  db.commit()
  return image_uuid


def upload_binary(
  binary: bytes,
  mime_type: str,
  db: Session
) -> str:
  metadata = ImageStoreModel(
    mime_type=mime_type
  )
  db.add(metadata)
  db.flush()

  image_uuid = metadata.uid
  path = "images/" + str(image_uuid)

  with open(path, "wb") as image_file:
    image_file.write(binary)

  return image_uuid
