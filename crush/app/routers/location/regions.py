import logging
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.database.database import create_connection
from app.core.location import core_region
from app.schemas.location.region import Region
from app.schemas.location.region_reqs import AddRegion, RegionSearchQuery, PatchRegion

router = APIRouter(
  prefix="/api/v1/location/region",
  tags=["region"]
)

log = logging.getLogger(__name__)

@router.get(
  path="",
)
async def search_region(
  query: Annotated[RegionSearchQuery, Query()],
  db: Session = Depends(create_connection)
):
  log.info("Searching region. query=[%s]", query)
  regions: list[Region] = core_region.search_region(query, db)
  log.info("Found %d regions" % len(regions))

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
  log.info("Adding region. new_region=[%s]", region)
  region: Region = core_region.add_region(region, db)
  log.info("New region uid=%s, name=%s was committed", region.uid, region.name)

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
  log.info("Patching region. region_id=%s", region_id)
  core_region.patch_region(region_id, query, db)
  log.info("Patched region uid=%s was commited", region_id)

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
  log.debug("Deleting region. region_id=%s", region_id)
  deleted = core_region.delete_region(region_id, db)
  log.debug("Deleted region uid=%s was committed", region_id)

  return JSONResponse({
    "code": 200,
    "status": "OK",
    "deleted": deleted
  }, 200)
