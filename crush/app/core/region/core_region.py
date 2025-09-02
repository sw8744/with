import logging
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions.exceptions import ItemNotFoundError
from app.models.places.regions import RegionModel
from app.schemas.region import Region
from app.schemas.region_reqs import AddRegion, RegionSearchQuery, PatchRegion

log = logging.getLogger(__name__)


def add_region(
  region_data: AddRegion,
  db: Session
) -> Region:
  region = RegionModel()
  region.name = region_data.name

  db.add(region)
  db.commit()

  return Region(
    uid=region.uid,
    name=region.name
  )


def search_region(
  query: RegionSearchQuery,
  db: Session
) -> list[Region]:

  if query.uid is not None:
    regions_db = (
      db.query(RegionModel)
      .filter(RegionModel.uid == query.uid)
      .all()
    )
  else:
    regions_db = (
      db.query(RegionModel)
      .filter(RegionModel.name.like("%" + query.name + "%"))
      .limit(query.limit)
      .all()
    )

  regions: list[Region] = []
  for region in regions_db:
    regions.append(
      Region(
        uid=region.uid,
        name=region.name
      )
    )

  return regions


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
    .first()
  )

  if region is None:
    raise ItemNotFoundError()

  if query.name is not None:
    region.name = query.name

  db.commit()
