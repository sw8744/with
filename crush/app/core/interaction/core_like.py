from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.interacrions.likes import LikesModel
from app.schemas.interaction.like_reqs import LikeRequest
from app.schemas.interaction.likes import Likes
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
  db: Session
) -> Likes:
  if identity is None:
    raise HTTPException(status_code=404, detail="User not found")

  liked_places = (
    db.query(LikesModel)
    .filter(LikesModel.user_id == identity.uid)
    .all()
  )

  likes = Likes(
    user_id=identity.uid,
    place_ids=[place.place_id for place in liked_places]
  )

  return likes


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
