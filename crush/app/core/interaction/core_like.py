from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.interacrions.LikeModel import LikesModel
from app.schemas.interaction.like_reqs import LikeRequest, LikeSearchRequest
from app.schemas.location.place import Place
from app.schemas.user.identity import Identity


def like_place(
  identity: Identity,
  body: LikeRequest,
  db: Session
):
  if identity is None:
    raise HTTPException(status_code=404, detail="User not found")

  exists_already = (
                     db.query(LikesModel)
                     .filter(
                       LikesModel.user_id == identity.uid,
                       LikesModel.place_id == body.place_id
                     )
                     .scalar()
                   ) is not None
  if exists_already:
    raise HTTPException(status_code=409, detail="Already liked")

  like = LikesModel(
    user_id=identity.uid,
    place_id=body.place_id
  )
  db.add(like)
  db.commit()


def dislike_place(
  identity: Identity,
  place_id: UUID,
  db: Session
):
  if identity is None:
    raise HTTPException(status_code=404, detail="User not found")

  like: LikesModel = (
    db.query(LikesModel)
    .filter(
      LikesModel.user_id == identity.uid,
      LikesModel.place_id == place_id
    )
    .scalar()
  )

  if like is None:
    raise HTTPException(status_code=404, detail="Not liked")

  db.delete(like)
  db.commit()


def list_liked(
  identity: Identity,
  query: LikeSearchRequest,
  db: Session
) -> list[Place]:
  if identity is None:
    raise HTTPException(status_code=404, detail="User not found")

  liked_places_query = db.query(LikesModel)

  liked_places_query = liked_places_query.filter(LikesModel.user_id == identity.uid)

  if query.head is not None:
    head_subquery = db.query(LikesModel.liked_at).filter(LikesModel.place_id == query.head).subquery()
    liked_places_query = liked_places_query.filter(LikesModel.liked_at > head_subquery)

  liked_places_query = liked_places_query.order_by(LikesModel.liked_at.desc())
  liked_places_query = liked_places_query.limit(query.limit)

  liked_places: list[LikesModel] = liked_places_query.all()

  places = [liked_place.place for liked_place in liked_places]

  return [Place(place) for place in places]


def did_liked_place(
  identity: Identity,
  place_id: UUID,
  db: Session
) -> bool:
  if identity is None:
    raise HTTPException(status_code=404, detail="User not found")

  liked_place = (
                  db.query(LikesModel)
                  .filter(
                    LikesModel.user_id == identity.uid,
                    LikesModel.place_id == place_id
                  )
                  .scalar()
                ) is not None

  return liked_place
