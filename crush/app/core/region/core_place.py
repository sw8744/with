import logging
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions.exceptions import ItemNotFoundError
from app.models.places.places import PlaceModel
from app.models.places.regions import RegionModel
from app.schemas.place import Place
from app.schemas.place_reqs import AddPlace, PatchPlace, PlaceSearchQuery
from app.schemas.region import Region
from app.schemas.region_reqs import AddRegion, RegionSearchQuery, PatchRegion

log = logging.getLogger(__name__)


def add_place(
  place_data: AddPlace,
  db: Session
) -> Place:
  place = PlaceModel()
  place.name = place_data.name
  place.region_uid = place_data.region_uid
  place.coordinate = place_data.coordinate
  place.address = place_data.address

  db.add(place)
  db.commit()

  return Place(
    uid=place.uid,
    name=place.name,
    coordinate=place.coordinate,
    address=place.address,
    region_uid=place.region_uid
  )


def search_place(
  q: PlaceSearchQuery,
  db: Session
) -> list[Place]:
  query = db.query(PlaceModel)

  if q.uid is not None:
    places_db = (
      query
      .filter(PlaceModel.uid == q.uid)
      .all()
    )
  else:
    if q.name is not None:
      query.filter(PlaceModel.name.like("%"+q.name+"%"))
    if q.region_uid is not None:
      query.filter(PlaceModel.region_uid == q.region_uid)
    if q.address is not None:
      query.filter(PlaceModel.address.like("%"+q.address+"%"))
    query.limit(q.limit)
    places_db = query.all()

  places: list[Place] = []
  for place in places_db:
    places.append(
      Place(
        uid=place.uid,
        name=place.name,
        coordinate=place.coordinate,
        address=place.address,
        region_uid=place.region_uid
      )
    )

  return places


def delete_place(
  place_id: UUID,
  db: Session
) -> int:
  delete = (
    db.query(PlaceModel)
    .filter(PlaceModel.uid == place_id)
    .delete()
  )
  db.commit()
  return delete


def patch_place(
  place_id: UUID,
  query: PatchPlace,
  db: Session
):
  place: Optional[PlaceModel] = (
    db.query(PlaceModel)
    .filter(PlaceModel.uid == place_id)
    .first()
  )

  if place is None:
    raise ItemNotFoundError()

  if query.name is not None:
    place.name = query.name
  if query.region_uid is not None:
    place.region_uid = query.region_uid
  if query.coordinate is not None:
    place.coordinate = query.coordinate
  if query.address is not None:
    place.address = query.address

  db.commit()
