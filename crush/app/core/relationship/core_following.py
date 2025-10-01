from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.users.identities import IdentityModel
from app.models.users.relationship import RelationshipState, RelationshipModel
from app.schemas.relationship.following_reqs import FollowRequest, FollowPatchRequest
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
