import logging
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.params import Security
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.database.database import create_connection
from app.core.location import core_place
from app.core.user.core_jwt import require_role, Role
from app.schemas.location.place import Place
from app.schemas.location.place_reqs import AddPlace, PlaceSearchQuery, PatchPlace

log = logging.getLogger(__name__)

router = APIRouter(
  prefix="/api/v1/location/place",
  tags=["place"]
)


@router.get(
  path="",
)
async def search_place(
  query: Annotated[PlaceSearchQuery, Depends()],
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  log.info("Searching place. query=[%s]", query)

  places: list[Place] = core_place.search_place(query, db)
  log.info("Found %d places" % len(places))

  return JSONResponse({
    "code": 200,
    "status": "OK",
    "content": [
      r.model_dump() for r in places
    ]
  })


@router.post(
  path="",
)
async def add_place(
  new_place: AddPlace,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.PLACE_ADD)

  log.info("Adding place. new_place=[%s]", new_place)
  place: Place = core_place.add_place(new_place, db)
  log.info("New place uid=%s, name=%s was commited", place.uid, place.name)

  return JSONResponse({
    "code": 201,
    "status": "Created",
    "content": place.model_dump()
  }, 201)


@router.patch(
  path="/{place_id}",
)
async def patch_place(
  place_id: UUID,
  query: PatchPlace,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.PLACE_EDIT)

  log.info("Patching place. place_id=[%s]", place_id)
  core_place.patch_place(place_id, query, db)
  log.info("Patched place uid=%s was commited", place_id)

  return JSONResponse({
    "code": 200,
    "status": "OK"
  }, 200)


@router.delete(
  path="/{place_id}",
)
async def delete_place(
  place_id: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.PLACE_DELETE)

  log.debug("Deleting place. place_id=[%s]", place_id)
  deleted = core_place.delete_place(place_id, db)
  log.debug("Deleted place uid=%s was commited", place_id)

  return JSONResponse({
    "code": 200,
    "status": "OK",
    "deleted": deleted
  }, 200)
