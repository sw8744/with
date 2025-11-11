import logging
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.hangul.umso import 풀어쓰기
from app.models.locations.RegionModel import RegionModel
from app.schemas.location.Region import Region
from app.schemas.location.RegionsRequests import AddRegion, RegionSearchQuery, PatchRegion

log = logging.getLogger(__name__)


def add_region(
  region_data: AddRegion,
  db: Session
) -> Region:
  region = RegionModel(
    name=region_data.name,
    description=region_data.description,
    thumbnail=region_data.thumbnail
  )

  db.add(region)
  db.commit()

  return Region(region)


def search_region(
  query: RegionSearchQuery,
  db: Session
) -> list[Region]:
  if query.uid is not None:
    log.debug("Searching region with uid=%s", query.uid)

    regions_db = (
      db.query(RegionModel)
      .filter(RegionModel.uid == query.uid)
      .all()
    )
  elif query.name is not None:
    qname_umso = 풀어쓰기(query.name)
    log.debug("Searching region with name=%s", qname_umso)

    regions_db = (
      db.query(RegionModel)
      .filter(RegionModel.name_umso.like("%" + qname_umso + "%"))
      .limit(query.limit)
      .all()
    )
  else:
    log.debug("No condition available for region search")
    regions_db = []

  return [Region(region) for region in regions_db]


def delete_region(
  region_id: UUID,
  db: Session
) -> int:
  delete = (
    db.query(RegionModel)
    .filter(RegionModel.uid == region_id)
    .delete()
  )
  db.commit()
  return delete


def patch_region(
  region_id: UUID,
  query: PatchRegion,
  db: Session
):
  region: Optional[RegionModel] = (
    db.query(RegionModel)
    .filter(RegionModel.uid == region_id)
    .scalar()
  )

  if region is None:
    log.warning("Region %s was not found", region_id)
    raise HTTPException(status_code=404, detail="Region not found")

  if query.name is not None:
    log.debug("Applying change of name in region %s", region_id)
    region.name = query.name
  if query.description is not None:
    log.debug("Applying change of description in region %s", region_id)
    region.description = query.description
  if query.thumbnail is not None:
    log.debug("Applying change of thumbnail in region %s", region_id)
    region.thumbnail = query.thumbnail

  db.commit()
