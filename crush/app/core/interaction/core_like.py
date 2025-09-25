from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.interacrions.likes import LikesModel
from app.schemas.interaction.like_reqs import LikeRequest
from app.schemas.user.identity import Identity


def like_place(
  identity: Identity,
  body: LikeRequest,
  db: Session
):
  if identity is None:
    raise HTTPException(status_code=404, detail="User not found")

  like = LikesModel(
    user_id=identity.uid,
    place_id=body.place_id
  )
  db.add(like)
  db.commit()


def dislike_place(
  identity: Identity,
  body: LikeRequest,
  db: Session
):
  if identity is None:
    raise HTTPException(status_code=404, detail="User not found")

  like: LikesModel = (
    db.query(LikesModel)
    .filter(
      LikesModel.user_id == identity.uid,
      LikesModel.place_id == body.place_id
    )
    .scalar()
  )

  if like is None:
    raise HTTPException(status_code=404, detail="Not liked")

  db.delete(like)
  db.commit()
