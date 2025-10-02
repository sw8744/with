from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.users.IdentityModel import IdentityModel
from app.models.users.RelationshipModel import RelationshipState, RelationshipModel
from app.schemas.relationship.follow import Following
from app.schemas.relationship.follow_reqs import FollowRequest, FollowPatchRequest
from app.schemas.user.identity import Identity

RELATIONSHIP_FOLLOWING = [
  [False, True, False, False],
  [True, False, False, False],
  [True, False, False, False],
  [True, False, False, False],
]


def query_following(
  identity: Identity,
  friend_id: UUID,
  db: Session
) -> RelationshipState | None:
  if identity is None:
    raise HTTPException(status_code=404, detail="User not found")

  relation = (
    db.query(RelationshipModel)
    .filter(
      RelationshipModel.user_id == identity.uid,
      RelationshipModel.friend_id == friend_id
    )
    .scalar()
  )

  if relation is None:
    return None

  return relation.state


def follow(
  identity: Identity,
  body: FollowRequest,
  db: Session
):
  if identity is None:
    raise HTTPException(status_code=404, detail="User not found")

  no_friend = (
                db.query(IdentityModel)
                .filter(IdentityModel.uid == body.friend_id)
                .scalar()
              ) is None

  if no_friend:
    raise HTTPException(status_code=404, detail="Friend to follow was not found")

  relation = RelationshipModel(
    user_id=identity.uid,
    friend_id=body.friend_id,
    state=body.relationship
  )
  db.add(relation)
  db.commit()


def patch_relationship(
  identity: Identity,
  friend_id: UUID,
  body: FollowPatchRequest,
  db: Session
):
  if identity is None:
    raise HTTPException(status_code=404, detail="User not found")

  relation: RelationshipModel = (
    db.query(RelationshipModel)
    .filter(
      RelationshipModel.user_id == identity.uid,
      RelationshipModel.friend_id == friend_id
    )
    .scalar()
  )

  if relation is None:
    raise HTTPException(status_code=404, detail="Relationship was not found")

  if not RELATIONSHIP_FOLLOWING[relation.state.value][body.relationship.value]:
    raise HTTPException(status_code=400, detail="Relationship change may not be done")

  relation.state = body.relationship
  db.commit()


def unfollow(
  identity: Identity,
  friend_id: UUID,
  db: Session
):
  if identity is None:
    raise HTTPException(status_code=404, detail="User not found")

  relation = (
    db.query(RelationshipModel)
    .filter(
      RelationshipModel.user_id == identity.uid,
      RelationshipModel.friend_id == friend_id
    )
    .scalar()
  )

  if relation is None:
    raise HTTPException(status_code=404, detail="Relationship was not found")

  db.delete(relation)
  db.commit()


def list_followings(identity, query, db):
  if identity is None:
    raise HTTPException(status_code=404, detail="User not found")

  followings_query = (
    db.query(RelationshipModel)
    .filter(
      RelationshipModel.user_id == identity.uid
    )
  )

  if query.state is not None:
    followings_query = followings_query.filter(RelationshipModel.state == query.state)
  if query.head is not None:
    head_subquery = (
      db.query(RelationshipModel.updated_at)
      .filter(
        RelationshipModel.user_id == identity.uid,
        RelationshipModel.friend_id == query.head
      )
      .subquery()
    )
    followings_query = followings_query.filter(RelationshipModel.created_at < head_subquery)

  followings_query = (
    followings_query
    .order_by(RelationshipModel.updated_at.desc())
    .limit(query.limit)
  )

  followings = followings_query.all()
  return [Following(following) for following in followings]
