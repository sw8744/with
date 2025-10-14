from typing import Tuple
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import or_, Row
from sqlalchemy.orm import Session
from sqlalchemy.sql.functions import count

from app.core.relationship import core_following
from app.models.interacrions.LikeModel import LikesModel
from app.models.locations.PlaceModel import PlaceModel
from app.models.users.RelationshipModel import RelationshipState
from app.schemas.recommendation.recommendation_reqs import RecommendByUsersParam
from app.schemas.user.identity import Identity


def recommend_region_from_users(
  host: Identity,
  by_users: RecommendByUsersParam,
  db: Session
) -> list[dict[str, str | int]]:
  # 모든 users가 host를 친구로 추가했는지 확인
  users = by_users.users
  for user in users:
    state = core_following.query_following(host, user, db)
    if state is None or state.value < RelationshipState.FRIEND.value:
      raise HTTPException(status_code=400, detail="Followee is not your friend")

  # host, users가 좋아한 place의 region 중 place의 수가 많은 것 순서로 쿼리
  recommended_regions: list[Row[Tuple[UUID, int]]] = (db.query(
    PlaceModel.region_uid,
    count(PlaceModel.uid).label("score")
  ).select_from(
    LikesModel
  ).filter(
    or_(
      LikesModel.user_id.in_(users),
      LikesModel.user_id == host.uid
    )
  ).join(
    PlaceModel, LikesModel.place_id == PlaceModel.uid
  ).group_by(
    PlaceModel.region_uid
  ).order_by(
    count(PlaceModel.uid).desc()
  ).all())

  return [{
    "region": str(region[0]),
    "score": region[1]
  } for region in recommended_regions]
