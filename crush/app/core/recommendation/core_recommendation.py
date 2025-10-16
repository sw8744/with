import logging
from typing import Tuple
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import Row, and_
from sqlalchemy.orm import Session
from sqlalchemy.sql.functions import count

from app.core.relationship import core_following
from app.models.interacrions.LikeModel import LikesModel
from app.models.locations.PlaceModel import PlaceModel
from app.models.users.RelationshipModel import RelationshipState
from app.schemas.user.identity import Identity

log = logging.getLogger(__name__)

def recommend_region_from_users(
  host: Identity,
  by_users: list[UUID],
  db: Session
) -> list[dict[str, str | int]]:
  # 모든 users가 host를 친구로 추가했는지 확인
  for user in by_users:
    if user == host.uid:
      continue
    state = core_following.query_following(host, user, db)
    if state is None or state.value < RelationshipState.FRIEND.value:
      log.warning("Illegal recommendation request. %r->%r=%d", host.uid, user, state.value)
      raise HTTPException(status_code=400, detail="Followee is not your friend")

  # host, users가 좋아한 place의 region 중 place의 수가 많은 것 순서로 쿼리
  recommended_regions: list[Row[Tuple[UUID, int]]] = (
    db.query(
      PlaceModel.region_uid,
      count(PlaceModel.uid).label("score")
    ).select_from(
      LikesModel
    ).filter(
      LikesModel.user_id.in_(by_users)
    ).join(
      PlaceModel, LikesModel.place_id == PlaceModel.uid
    ).group_by(
      PlaceModel.region_uid
    ).order_by(
      count(PlaceModel.uid).desc()
    ).all()
  )

  log.info("Found %d recommended regions for %r", len(recommended_regions), by_users)
  return [{
    "region": str(region[0]),
    "score": region[1]
  } for region in recommended_regions]


def recommend_place_from_users(
  host: Identity,
  by_users: list[UUID],
  from_region: list[UUID],
  db: Session
) -> list[dict[str, str | int]]:
  for user in by_users:
    if user == host.uid:
      continue
    state = core_following.query_following(host, user, db)
    if state is None or state.value < RelationshipState.FRIEND.value:
      log.warning("Illegal recommendation request. %r->%r=%d", host, user, state.value)
      raise HTTPException(status_code=400, detail="Followee is not your friend")

  recommended_places: list[Row[Tuple[UUID, int]]] = (
    db.query(
      PlaceModel.uid,
      count(LikesModel.user_id).label("score")
    ).select_from(
      LikesModel
    ).filter(
      and_(
        LikesModel.user_id.in_(by_users),
        PlaceModel.region_uid.in_(from_region)
      )
    ).join(
      PlaceModel, LikesModel.place_id == PlaceModel.uid
    ).group_by(
      PlaceModel.uid
    ).order_by(
      count(PlaceModel.uid).desc()
    ).all()
  )

  log.info("Found %d recommended places for %r", len(recommended_places), by_users)

  return [{
    "place": str(place[0]),
    "score": place[1]
  } for place in recommended_places]
