import logging
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.users.RelationshipModel import RelationshipModel, RelationshipState
from app.schemas.relationship.follow import Follower
from app.schemas.relationship.follow_reqs import FollowPatchRequest, ListingRelationshipRequest
from app.schemas.user.identity import Identity

log = logging.getLogger(__name__)

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
    log.warning("Identity is None and query_follower cannot be done")
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
    log.warning("Relationship %r<-%r was not found", identity.uid, follower_id)
    return None

  log.info("Found relationship %r<-%r is %d", identity.uid, follower_id, relation.state.value)
  return relation.state


def unfollow(
  identity: Identity,
  follower_id: UUID,
  db: Session
):
  if identity is None:
    log.warning("Identity is None and delete follower cannot be done")
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
    log.warning("Relationship %r<-%r was not found", identity.uid, follower_id)
    raise HTTPException(status_code=404, detail="Relationship was not found")

  # 차단중이면 차단 해제 불가
  if relation.state == RelationshipState.BLOCKED:
    log.warning("Relationship %r<-%r was blocked", identity.uid, follower_id)
    raise HTTPException(status_code=400, detail="Relationship change may not be done")

  db.delete(relation)
  db.commit()

  log.info("Deleted relationship %r<-%r was committed", identity.uid, follower_id)


def patch_relationship(
  identity: Identity,
  follower_id: UUID,
  body: FollowPatchRequest,
  db: Session
):
  if identity is None:
    log.warning("Identity is None and update follower cannot be done")
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
    log.warning("Relationship %r<-%r was not found", identity.uid, follower_id)
    raise HTTPException(status_code=404, detail="Relationship was not found")

  if not RELATIONSHIP_FOLLOWER[relation.state.value][body.relationship.value]:
    log.warning("Relationship %r<-%r change %d to %d is not allowed", identity.uid, follower_id, relation.state.value,
                body.relationship.value)
    raise HTTPException(status_code=400, detail="Relationship change may not be done")

  relation.state = body.relationship
  db.commit()

  log.info("Relationship %r<-%r=%d was updated", identity.uid, follower_id, relation.state)


def list_followers(
  identity: Identity,
  query: ListingRelationshipRequest,
  db: Session
) -> list[Follower]:
  if identity is None:
    log.warning("Identity is None and list_followers cannot be done")
    raise HTTPException(status_code=404, detail="User not found")

  followers_query = (
    db.query(RelationshipModel)
    .filter(
      RelationshipModel.friend_id == identity.uid
    )
  )

  if query.state is not None:
    if query.up:
      log.debug("Listing relationship closer than %d", query.state.value)
      followers_query = followers_query.filter(RelationshipModel.state >= query.state)
    else:
      log.debug("Listing relationship of %d", query.state.value)
      followers_query = followers_query.filter(RelationshipModel.state == query.state)
  if query.head is not None:
    log.debug("Listing relationship head is %r", query.head)
    head_subquery = (
      db.query(RelationshipModel.updated_at)
      .filter(
        RelationshipModel.user_id == query.head,
        RelationshipModel.friend_id == identity.uid
      )
      .subquery()
    )
    followers_query = followers_query.filter(RelationshipModel.updated_at < head_subquery)

  followers_query = (
    followers_query
    .order_by(RelationshipModel.updated_at.desc())
    .limit(query.limit)
  )

  followers = followers_query.all()
  log.info("Found %d followers" % len(followers))

  return [Follower(follower) for follower in followers]


def count_follower(
  identity: Identity,
  db: Session
):
  if identity is None:
    log.warning("Identity is None and count_follower cannot be done")
    raise HTTPException(status_code=404, detail="User not found")

  cnt = (
    db.query(RelationshipModel)
    .filter(RelationshipModel.friend_id == identity.uid)
    .count()
  )
  log.info("Found %d followings of %s", cnt, identity.uid)

  return cnt
