import logging
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.interacrions.LikeModel import LikesModel
from app.schemas.interaction.like_reqs import LikeRequest, LikeSearchRequest
from app.schemas.location.place import Place
from app.schemas.user.identity import Identity

log = logging.getLogger(__name__)

def like_place(
  identity: Identity,
  body: LikeRequest,
  db: Session
):
  if identity is None:
    log.warning("Identity is None and like_place cannot be done")
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
    log.warning("User %r already liked place %r", identity.uid, body.place_id)
    raise HTTPException(status_code=409, detail="Already liked")

  like = LikesModel(
    user_id=identity.uid,
    place_id=body.place_id
  )
  db.add(like)
  db.commit()

  log.info("User %r liked place %r was committed", identity.uid, body.place_id)


def dislike_place(
  identity: Identity,
  place_id: UUID,
  db: Session
):
  if identity is None:
    log.warning("Identity is None and dislike_place cannot be done")
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
    log.warning("User %r didn't liked place %r", identity.uid, place_id)
    raise HTTPException(status_code=404, detail="Not liked")

  db.delete(like)
  db.commit()

  log.info("User %r dislike place %r was committed", identity.uid, place_id)

def list_liked(
  identity: Identity,
  query: LikeSearchRequest,
  db: Session
) -> list[Place]:
  if identity is None:
    log.warning("Identity is None and list_liked cannot be done")
    raise HTTPException(status_code=404, detail="User not found")

  liked_places_query = db.query(LikesModel)

  liked_places_query = liked_places_query.filter(LikesModel.user_id == identity.uid)

  if query.head is not None:
    log.debug("Listing liked place head: %r", query.head)
    head_subquery = db.query(LikesModel.liked_at).filter(LikesModel.place_id == query.head).subquery()
    liked_places_query = liked_places_query.filter(LikesModel.liked_at > head_subquery)

  liked_places_query = liked_places_query.order_by(LikesModel.liked_at.desc())
  liked_places_query = liked_places_query.limit(query.limit)

  liked_places: list[LikesModel] = liked_places_query.all()

  log.info("Found %d liked places %s", len(liked_places), query.head)

  places = [liked_place.place for liked_place in liked_places]

  return [Place(place) for place in places]


def did_liked_place(
  identity: Identity,
  place_id: UUID,
  db: Session
) -> bool:
  if identity is None:
    log.warning("Identity is None and did_liked_place cannot be done")
    raise HTTPException(status_code=404, detail="User not found")

  liked_place = (
                  db.query(LikesModel)
                  .filter(
                    LikesModel.user_id == identity.uid,
                    LikesModel.place_id == place_id
                  )
                  .scalar()
                ) is not None

  log.info("User %r %s", identity.uid, 'liked place' if place_id else 'disliked place')
  return liked_place
