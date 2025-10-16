import logging
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.database.database import jsonb_path_equals
from app.core.hangul.umso import 풀어쓰기
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

  return Place(place)


# TODO: 허용 검색 쿼리 가변적으로 만들기
ALLOWED_QUERY = {
  "operation.parking": bool,
  "reservation.required": bool,
  "reservation.method": str,
  "reservation.web": str,
  "reservation.tel": str,
  "contact.instagram": str,
  "contact.tel": str,
  "contact.email": str,
  "contact.web": str,
}


def search_place(
  q: PlaceSearchQuery,
  db: Session
) -> list[Place]:
  query = db.query(PlaceModel)

  if q.uid is not None:
    log.debug("Searching place with uid=%s", q.uid)
    places_db = (
      query
      .filter(PlaceModel.uid == q.uid)
      .all()
    )
  else:
    if q.name is not None:
      log.debug("Added name %s filter for place search", q.name)
      qname_umso = 풀어쓰기(q.name)
      query = query.filter(PlaceModel.name_umso.like("%" + qname_umso + "%"))
    if q.region_uid is not None:
      log.debug("Added region %s filter for place search", q.region_uid)
      query = query.filter(PlaceModel.region_uid == q.region_uid)
    if q.address is not None:
      log.debug("Added address %s filter for place search", q.address)
      query = query.filter(PlaceModel.address.like("%" + q.address + "%"))

    if q.metadata != '':
      meta_pairs = q.metadata.split(',')
      meta = [meta_pair.split('=') for meta_pair in meta_pairs]
      for mdata in meta:
        key, value = mdata[0], mdata[1]
        mtype = ALLOWED_QUERY.get(key, None)
        if mtype is not None:
          log.debug("Added metadata %s=%s filter for place search", key, value)

          query = query.filter(
            jsonb_path_equals(PlaceModel.place_meta, key, value)
          )

    query = query.limit(q.limit)
    log.debug("Query limit set to %d", q.limit)

    places_db = query.all()

  return [Place(place) for place in places_db]


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
    .scalar()
  )

  if place is None:
    log.warning("Place %s was not found", place_id)
    raise HTTPException(status_code=404, detail="No region was found")

  if query.name is not None:
    log.debug("Applying change of name in place %s", place_id)
    place.name = query.name
  if query.description is not None:
    log.debug("Applying change of description in place %s", place_id)
    place.description = query.description
  if query.region_uid is not None:
    log.debug("Applying change of region_uid in place %s", place_id)
    place.region_uid = query.region_uid
  if query.coordinate is not None:
    log.debug("Applying change of coordinate in place %s", place_id)
    place.coordinate = query.coordinate
  if query.address is not None:
    log.debug("Applying change of address in place %s", place_id)
    place.address = query.address
  if query.thumbnail is not None:
    log.debug("Applying change of thumbnail in place %s", place_id)
    place.thumbnail = query.thumbnail
  if query.metadata is not None:
    log.debug("Applying change of metadata in place %s", place_id)
    place.place_meta = query.metadata

  db.commit()
