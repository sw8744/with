from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.users.RelationshipModel import RelationshipModel, RelationshipState
from app.schemas.relationship.follow import Follower
from app.schemas.relationship.follow_reqs import FollowPatchRequest, ListingRelationshipRequest
from app.schemas.user.identity import Identity

RELATIONSHIP_FOLLOWER = [
  [False, False, False, False],
  [False, False, True, True],
  [False, True, False, True],
  [False, True, True, False]
]


def query_follower(
  identity: Identity,
  follower_id: UUID,
  db: Session
) -> RelationshipModel | None:
  if identity is None:
    raise HTTPException(status_code=404, detail="User not found")

  relation = (
    db.query(RelationshipModel)
    .filter(
      RelationshipModel.user_id == follower_id,
      RelationshipModel.friend_id == identity.uid
    )
    .scalar()
  )

  if relation is None:
    return None

  return relation.state


def unfollow(
  identity: Identity,
  follower_id: UUID,
  db: Session
):
  if identity is None:
    raise HTTPException(status_code=404, detail="User not found")

  relation: RelationshipModel = (
    db.query(RelationshipModel)
    .filter(
      RelationshipModel.user_id == follower_id,
      RelationshipModel.friend_id == identity.uid
    )
    .scalar()
  )

  if relation is None:
    raise HTTPException(status_code=404, detail="Relationship was not found")

  # 차단중이면 차단 해제 불가
  if relation.state == RelationshipState.BLOCKED:
    raise HTTPException(status_code=400, detail="Relationship change may not be done")

  db.delete(relation)
  db.commit()


def patch_relationship(
  identity: Identity,
  follower_id: UUID,
  body: FollowPatchRequest,
  db: Session
):
  if identity is None:
    raise HTTPException(status_code=404, detail="User not found")

  relation: RelationshipModel = (
    db.query(RelationshipModel)
    .filter(
      RelationshipModel.user_id == follower_id,
      RelationshipModel.friend_id == identity.uid
    )
    .scalar()
  )

  if relation is None:
    raise HTTPException(status_code=404, detail="Relationship was not found")

  if not RELATIONSHIP_FOLLOWER[relation.state.value][body.relationship.value]:
    raise HTTPException(status_code=400, detail="Relationship change may not be done")

  relation.state = body.relationship
  db.commit()


def list_followers(
  identity: Identity,
  query: ListingRelationshipRequest,
  db: Session
) -> list[Follower]:
  if identity is None:
    raise HTTPException(status_code=404, detail="User not found")

  followers_query = (
    db.query(RelationshipModel)
    .filter(
      RelationshipModel.friend_id == identity.uid
    )
  )

  if query.state is not None:
    followers_query = followers_query.filter(RelationshipModel.state == query.state)
  if query.head is not None:
    head_subquery = (
      db.query(RelationshipModel.updated_at)
      .filter(
        RelationshipModel.user_id == query.head,
        RelationshipModel.friend_id == identity.uid
      )
      .subquery()
    )
    followers_query = followers_query.filter(RelationshipModel.created_at < head_subquery)

  followers_query = (
    followers_query
    .order_by(RelationshipModel.updated_at.desc())
    .limit(query.limit)
  )

  followers = followers_query.all()
  return [Follower(follower) for follower in followers]
