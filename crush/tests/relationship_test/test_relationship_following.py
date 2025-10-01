import json
from typing import Callable, Tuple

import pytest
from sqlalchemy.orm import Session
from starlette.testclient import TestClient

from app.main import app
from app.models.users.IdentityModel import IdentityModel
from app.models.users.RelationshipModel import RelationshipModel, RelationshipState

client = TestClient(app)


def test_follow_friend(
  db: Session,
  access_token_factory: Callable[[str], Tuple[IdentityModel, str]]
):
  user, u_at = access_token_factory("user")
  friend, f_at = access_token_factory("friend")

  resp = client.post(
    '/api/v1/user/following',
    headers={
      "Authorization": f"Bearer {u_at}"
    },
    json={
      "friendId": str(friend.uid),
      "relationship": RelationshipState.FOLLOWING.value
    }
  )
  assert resp.status_code == 200
  assert resp.json()['code'] == 200
  assert resp.json()['status'] == "OK"

  relation: RelationshipModel = (
    db.query(RelationshipModel)
    .filter(
      RelationshipModel.user_id == user.uid,
      RelationshipModel.friend_id == friend.uid
    )
    .scalar()
  )
  assert relation is not None
  assert relation.state == RelationshipState.FOLLOWING


def test_unfollow_following(
  access_token_factory: Callable[[str], Tuple[IdentityModel, str]],
  relation_factory: Callable[[IdentityModel, IdentityModel, RelationshipState], RelationshipModel],
  db: Session
):
  user, u_at = access_token_factory("user")
  friend, f_at = access_token_factory("friend")
  _ = relation_factory(user, friend, RelationshipState.FOLLOWING)

  resp = client.delete(
    '/api/v1/user/following/' + str(friend.uid),
    headers={
      "Authorization": f"Bearer {u_at}"
    }
  )
  assert resp.status_code == 200
  assert resp.json()['code'] == 200
  assert resp.json()['status'] == "OK"

  deleted_relation: RelationshipModel = (
    db.query(RelationshipModel)
    .filter(
      RelationshipModel.user_id == user.uid,
      RelationshipModel.friend_id == friend.uid
    )
    .scalar()
  )
  assert deleted_relation is None


def test_query_relationship_following(
  access_token_factory: Callable[[str], Tuple[IdentityModel, str]],
  relation_factory: Callable[[IdentityModel, IdentityModel, RelationshipState], RelationshipModel],
  db: Session
):
  user, u_at = access_token_factory("user")
  friend, f_at = access_token_factory("friend")
  _ = relation_factory(user, friend, RelationshipState.FOLLOWING)

  resp = client.get(
    '/api/v1/user/following/' + str(friend.uid),
    headers={
      "Authorization": f"Bearer {u_at}"
    }
  )
  assert resp.status_code == 200
  assert resp.json()['code'] == 200
  assert resp.json()['status'] == "OK"
  assert resp.json()['relationship'] == RelationshipState.FOLLOWING.value


@pytest.mark.parametrize(
  "fr, to, exp_code",
  [
    (RelationshipState.BLOCKED, RelationshipState.BLOCKED, 400),
    (RelationshipState.BLOCKED, RelationshipState.FOLLOWING, 200),
    (RelationshipState.BLOCKED, RelationshipState.FRIEND, 400),
    (RelationshipState.BLOCKED, RelationshipState.LIKED, 400),
    (RelationshipState.FOLLOWING, RelationshipState.BLOCKED, 200),
    (RelationshipState.FOLLOWING, RelationshipState.FOLLOWING, 400),
    (RelationshipState.FOLLOWING, RelationshipState.FRIEND, 400),
    (RelationshipState.FOLLOWING, RelationshipState.LIKED, 400),
    (RelationshipState.FRIEND, RelationshipState.BLOCKED, 200),
    (RelationshipState.FRIEND, RelationshipState.FOLLOWING, 400),
    (RelationshipState.FRIEND, RelationshipState.FRIEND, 400),
    (RelationshipState.FRIEND, RelationshipState.LIKED, 400),
    (RelationshipState.LIKED, RelationshipState.BLOCKED, 200),
    (RelationshipState.LIKED, RelationshipState.FOLLOWING, 400),
    (RelationshipState.LIKED, RelationshipState.FRIEND, 400),
    (RelationshipState.LIKED, RelationshipState.LIKED, 400),
  ]
)
def test_change_relationship_following(
  fr: RelationshipState, to: RelationshipState, exp_code: int,
  access_token_factory: Callable[[str], Tuple[IdentityModel, str]],
  relation_factory: Callable[[IdentityModel, IdentityModel, RelationshipState], RelationshipModel],
  db: Session
):
  user, u_at = access_token_factory("user")
  friend, f_at = access_token_factory("friend")
  _ = relation_factory(user, friend, fr)

  resp = client.patch(
    '/api/v1/user/following/' + str(friend.uid),
    headers={
      "Authorization": f"Bearer {u_at}"
    },
    content=json.dumps({
      "relationship": to.value
    })
  )
  if exp_code == 200:
    assert resp.status_code == 200
    assert resp.json()['code'] == 200
    assert resp.json()['status'] == "OK"

    db.expire_all()
    new_relation: RelationshipModel = (
      db.query(RelationshipModel)
      .filter(
        RelationshipModel.user_id == user.uid,
        RelationshipModel.friend_id == friend.uid
      )
      .scalar()
    )
    assert new_relation is not None
    assert new_relation.state == to
  elif exp_code == 400:
    assert resp.status_code == 400
    assert resp.json()['code'] == 400
    assert resp.json()['status'] == "Bad Request"
    assert resp.json()['message'] == "Relationship change may not be done"
