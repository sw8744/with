from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.exceptions.exceptions import ItemNotFoundError
from app.core.region import core_region
from app.database import create_connection
from app.schemas.region import Region
from app.schemas.region_reqs import AddRegion, RegionSearchQuery, PatchRegion

router = APIRouter(
  prefix="/location/region",
  tags=["region"]
)


@router.get(
  path="",
)
async def search_region(
  query: Annotated[RegionSearchQuery, Query()],
  db: Session = Depends(create_connection)
):
  regions: list[Region] = core_region.search_region(query, db)

  if len(regions) == 0:
    raise HTTPException(status_code=404, detail="No region was found")
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
async def add_region(
  region: AddRegion,
  db: Session = Depends(create_connection)
):
  region: Region = core_region.add_region(region, db)

  return JSONResponse({
    "code": 201,
    "status": "Created",
    "content": region.model_dump()
  }, 201)


@router.patch(
  path="/{region_id}",
)
async def patch_region(
  region_id: UUID,
  query: PatchRegion,
  db: Session = Depends(create_connection)
):
  try:
    core_region.patch_region(region_id, query, db)
  except ItemNotFoundError:
    raise HTTPException(status_code=404, detail="No region was found")

  return JSONResponse({
    "code": 200,
    "status": "OK"
  }, 200)


@router.delete(
  path="/{region_id}",
)
async def delete_region(
  region_id: UUID,
  db: Session = Depends(create_connection)
):
  deleted = core_region.delete_region(region_id, db)

  return JSONResponse({
    "code": 200,
    "status": "OK",
    "deleted": deleted
  }, 200)
