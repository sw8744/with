import logging
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions.exceptions import ItemNotFoundError
from app.models.locations.PlaceModel import PlaceModel
from app.schemas.location.place import Place
from app.schemas.location.place_reqs import AddPlace, PatchPlace, PlaceSearchQuery

log = logging.getLogger(__name__)


def add_place(
  place_data: AddPlace,
  db: Session
) -> Place:
  place: PlaceModel = PlaceModel(
    name=place_data.name,
    description=place_data.description,
    region_uid=place_data.region_uid,
    coordinate=place_data.coordinate,
    address=place_data.address,
    thumbnail=place_data.thumbnail,
    place_meta=place_data.metadata
  )

  db.add(place)
  db.commit()

  return Place(
    uid=place.uid,
    name=place.name,
    description=place.description,
    coordinate=place.coordinate,
    address=place.address,
    region_uid=place.region_uid,
    thumbnail=place.thumbnail,
    metadata=place.place_meta
  )


# TODO: 허용 검색 쿼리 가변적으로 만들기
ALLOWED_QUERY = {
  'parking': bool,
  'reservation': bool,
  'contact': str,
  'instagram': str
}


def search_place(
  q: PlaceSearchQuery,
  meta: dict[str, str],
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
      query = query.filter(PlaceModel.name.like("%" + q.name + "%"))
    if q.region_uid is not None:
      query = query.filter(PlaceModel.region_uid == q.region_uid)
    if q.address is not None:
      query = query.filter(PlaceModel.address.like("%" + q.address + "%"))
    if meta is not None:
      for key in meta.keys():
        type = ALLOWED_QUERY.get(key, None)
        if type is not None:
          try:
            if type == bool:
              val = meta[key] == 'true'
            elif type == str:
              val = meta[key]
            elif type == int:
              val = int(meta[key])
            else:
              val = meta[key]
          except:
            val = meta[key]
          query = query.filter(PlaceModel.place_meta.contains({key: val}))

    query.limit(q.limit)
    places_db = query.all()

  places: list[Place] = []
  for place in places_db:
    places.append(
      Place(
        uid=place.uid,
        name=place.name,
        description=place.description,
        coordinate=place.coordinate,
        address=place.address,
        region_uid=place.region_uid,
        thumbnail=place.thumbnail,
        metadata=place.place_meta,
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
  if query.description is not None:
    place.description = query.description
  if query.region_uid is not None:
    place.region_uid = query.region_uid
  if query.coordinate is not None:
    place.coordinate = query.coordinate
  if query.address is not None:
    place.address = query.address
  if query.thumbnail is not None:
    place.thumbnail = query.thumbnail
  if query.metadata is not None:
    meta = {}
    for key in query.metadata.keys():
      type = ALLOWED_QUERY.get(key, None)
      if (
        query.metadata[key] is not None and
        type is not None and
        isinstance(query.metadata[key], type)
      ):
        meta[key] = query.metadata[key]

    place.place_meta = meta

  db.commit()
