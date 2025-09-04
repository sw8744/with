from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.exceptions.exceptions import ItemNotFoundError
from app.core.region import core_region, core_place
from app.database import create_connection
from app.schemas.place import Place
from app.schemas.place_reqs import AddPlace, PlaceSearchQuery, PatchPlace

router = APIRouter(
  prefix="/location/place",
  tags=["place"]
)


@router.get(
  path="",
)
async def search_place(
  query: Annotated[PlaceSearchQuery, Query()],
  db: Session = Depends(create_connection)
):
  regions: list[Place] = core_place.search_place(query, db)

  if len(regions) == 0:
    raise HTTPException(status_code=404, detail="No place was found")
  else:
    return JSONResponse({
      "code": 200,
      "status": "OK",
      "content": [
        r.model_dump() for r in regions
      ]
    })


@router.post(
  path="",
)
async def add_place(
  new_place: AddPlace,
  db: Session = Depends(create_connection)
):
  place: Place = core_place.add_place(new_place, db)

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
  db: Session = Depends(create_connection)
):
  try:
    core_place.patch_place(place_id, query, db)
  except ItemNotFoundError:
    raise HTTPException(status_code=404, detail="No region was found")

  return JSONResponse({
    "code": 200,
    "status": "OK"
  }, 200)


@router.delete(
  path="/{place_id}",
)
async def delete_place(
  place_id: UUID,
  db: Session = Depends(create_connection)
):
  deleted = core_place.delete_place(place_id, db)

  return JSONResponse({
    "code": 200,
    "status": "OK",
    "deleted": deleted
  }, 200)
