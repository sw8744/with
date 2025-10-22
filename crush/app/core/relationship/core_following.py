import logging
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.users.IdentityModel import IdentityModel
from app.models.users.RelationshipModel import RelationshipState, RelationshipModel
from app.schemas.relationship.follow import Following
from app.schemas.relationship.follow_reqs import FollowRequest, FollowPatchRequest, ListingRelationshipRequest
from app.schemas.user.identity import Identity

log = logging.getLogger(__name__)

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
    log.warning("Identity is None and query following cannot be done")
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
    log.warning("Relationship %r->%r was not found", identity.uid, friend_id)
    return None

  log.info("Found relationship %r->%r is %d", identity.uid, friend_id, relation.state.value)
  return relation.state


def follow(
  identity: Identity,
  body: FollowRequest,
  db: Session
):
  if identity is None:
    log.warning("Identity is None and follow cannot be done")
    raise HTTPException(status_code=404, detail="User not found")

  no_friend = (
                db.query(IdentityModel)
                .filter(IdentityModel.uid == body.friend_id)
                .scalar()
              ) is None

  if no_friend:
    log.warning("Friend %r to follow was not found", body.friend_id)
    raise HTTPException(status_code=404, detail="Friend to follow was not found")

  relation = RelationshipModel(
    user_id=identity.uid,
    friend_id=body.friend_id,
    state=body.relationship
  )
  db.add(relation)
  db.commit()

  log.info("Relationship %r->%r=%d was commited", identity.uid, body.friend_id, relation.state.value)


def patch_relationship(
  identity: Identity,
  friend_id: UUID,
  body: FollowPatchRequest,
  db: Session
):
  if identity is None:
    log.warning("Identity is None and patch following cannot be done")
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
    log.warning("Relationship %r->%r was not found", identity.uid, friend_id)
    raise HTTPException(status_code=404, detail="Relationship was not found")

  if not RELATIONSHIP_FOLLOWING[relation.state.value][body.relationship.value]:
    log.warning("Relationship %r->%r change %d to %d is escalating", identity.uid, friend_id, relation.state.value,
                body.relationship.value)
    raise HTTPException(status_code=400, detail="Relationship change may not be done")

  relation.state = body.relationship
  db.commit()
  log.info("Relationship %r->%r=%d was committed", identity.uid, friend_id, relation.state)


def unfollow(
  identity: Identity,
  friend_id: UUID,
  db: Session
):
  if identity is None:
    log.warning("Identity is None and unfollow following cannot be done")
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
    log.warning("Relationship %r->%r was not found", identity.uid, friend_id)
    raise HTTPException(status_code=404, detail="Relationship was not found")

  db.delete(relation)
  db.commit()

  log.info("Removing relationship %r->%r was committed", identity.uid, relation.state.value)


def list_followings(
  identity: Identity,
  query: ListingRelationshipRequest,
  db: Session
):
  if identity is None:
    log.warning("Identity is None and list_followings cannot be done")
    raise HTTPException(status_code=404, detail="User not found")

  followings_query = (
    db.query(RelationshipModel)
    .filter(
      RelationshipModel.user_id == identity.uid
    )
  )

  if query.state is not None:
    if query.up:
      log.debug("Listing relationship closer than %d with %r", query.state.value, identity.uid)
      followings_query = followings_query.filter(RelationshipModel.state >= query.state)
    else:
      log.debug("Listing relationship of %d with %r", query.state.value, identity.uid)
      followings_query = followings_query.filter(RelationshipModel.state == query.state)
  if query.head is not None:
    log.debug("Listing relationship head is %r", identity.uid)
    head_subquery = (
      db.query(RelationshipModel.updated_at)
      .filter(
        RelationshipModel.user_id == identity.uid,
        RelationshipModel.friend_id == query.head
      )
      .subquery()
    )
    followings_query = followings_query.filter(RelationshipModel.updated_at < head_subquery)

  followings_query = (
    followings_query
    .order_by(RelationshipModel.updated_at.desc())
    .limit(query.limit)
  )

  followings = followings_query.all()
  log.info("Found %d followings", len(followings))

  return [Following(following) for following in followings]


def count_following(
  identity: Identity,
  db: Session
):
  if identity is None:
    log.warning("Identity is None and count_following cannot be done")
    raise HTTPException(status_code=404, detail="User not found")

  cnt = (
    db.query(RelationshipModel)
    .filter(RelationshipModel.user_id == identity.uid)
    .count()
  )

  log.info("Found %d followings of %s", cnt, identity.uid)
  return cnt
