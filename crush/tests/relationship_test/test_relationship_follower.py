import json
from typing import Callable, Tuple

import pytest
from sqlalchemy.orm import Session
from starlette.testclient import TestClient

from app.main import app
from app.models.users.IdentityModel import IdentityModel
from app.models.users.RelationshipModel import RelationshipModel, RelationshipState

client = TestClient(app)


def test_delete_follower(
  access_token_factory: Callable[[str], Tuple[IdentityModel, str]],
  relation_factory: Callable[[IdentityModel, IdentityModel], RelationshipModel],
  db: Session
):
  user, u_at = access_token_factory("user")
  friend, f_at = access_token_factory("friend")
  _ = relation_factory(user, friend)

  resp = client.delete(
    "/api/v1/user/follower/" + str(user.uid),
    headers={
      "Authorization": f"Bearer {f_at}"
    }
  )
  assert resp.status_code == 200
  assert resp.json()["code"] == 200
  assert resp.json()["status"] == "OK"

  deleted_relation: RelationshipModel = (
    db.query(RelationshipModel)
    .filter(
      RelationshipModel.user_id == user.uid,
      RelationshipModel.friend_id == friend.uid
    )
    .scalar()
  )
  assert deleted_relation is None


def test_delete_null_follower(
  access_token: str
):
  resp = client.delete(
    "/api/v1/user/follower/a2ffae9b-04be-4b29-a529-aa4e55146cc4",
    headers={
      "Authorization": f"Bearer {access_token}"
    }
  )
  assert resp.status_code == 404
  assert resp.json()["code"] == 404
  assert resp.json()["status"] == "Not found"


def test_query_relationship_follower(
  access_token_factory: Callable[[str], Tuple[IdentityModel, str]],
  relation_factory: Callable[[IdentityModel, IdentityModel, RelationshipState], RelationshipModel],
  db: Session
):
  user, u_at = access_token_factory("user")
  friend, f_at = access_token_factory("friend")
  _ = relation_factory(user, friend, RelationshipState.FRIEND)

  resp = client.get(
    "/api/v1/user/follower/" + str(user.uid),
    headers={
      "Authorization": f"Bearer {f_at}"
    }
  )
  assert resp.status_code == 200
  assert resp.json()["code"] == 200
  assert resp.json()["status"] == "OK"
  assert resp.json()["relationship"] == RelationshipState.FRIEND.value


def test_query_follower_list(
  access_token_factory: Callable[[str], Tuple[IdentityModel, str]],
  relation_factory: Callable[[IdentityModel, IdentityModel, RelationshipState], RelationshipModel],
  db: Session
):
  user, u_at = access_token_factory("user")
  friends: list[IdentityModel] = []
  for i in range(5):
    f, f_at = access_token_factory(f"f{i}")
    _ = relation_factory(f, user, RelationshipState.FOLLOWING)
    friends.append(f)

  resp = client.get(
    "/api/v1/user/follower",
    headers={
      "Authorization": f"Bearer {u_at}"
    },
    params={
      "limit": 2,
      "head": str(friends[3].uid)
    }
  )

  assert resp.status_code == 200
  assert resp.json()["code"] == 200
  assert resp.json()["status"] == "OK"
  assert list(resp.json()["followers"]) == [{"uid": str(friend.uid), "name": friend.name} for friend in friends[1:3]][
    ::-1]


@pytest.mark.parametrize(
  "fr, to, exp_code",
  [
    (RelationshipState.BLOCKED, RelationshipState.BLOCKED, 400),
    (RelationshipState.BLOCKED, RelationshipState.FOLLOWING, 400),
    (RelationshipState.BLOCKED, RelationshipState.FRIEND, 400),
    (RelationshipState.BLOCKED, RelationshipState.LIKED, 400),
    (RelationshipState.FOLLOWING, RelationshipState.BLOCKED, 400),
    (RelationshipState.FOLLOWING, RelationshipState.FOLLOWING, 400),
    (RelationshipState.FOLLOWING, RelationshipState.FRIEND, 200),
    (RelationshipState.FOLLOWING, RelationshipState.LIKED, 200),
    (RelationshipState.FRIEND, RelationshipState.BLOCKED, 400),
    (RelationshipState.FRIEND, RelationshipState.FOLLOWING, 200),
    (RelationshipState.FRIEND, RelationshipState.FRIEND, 400),
    (RelationshipState.FRIEND, RelationshipState.LIKED, 200),
    (RelationshipState.LIKED, RelationshipState.BLOCKED, 400),
    (RelationshipState.LIKED, RelationshipState.FOLLOWING, 200),
    (RelationshipState.LIKED, RelationshipState.FRIEND, 200),
    (RelationshipState.LIKED, RelationshipState.LIKED, 400),
  ]
)
def test_change_relationship_follower(
  fr: RelationshipState, to: RelationshipState, exp_code: int,
  access_token_factory: Callable[[str], Tuple[IdentityModel, str]],
  relation_factory: Callable[[IdentityModel, IdentityModel, RelationshipState], RelationshipModel],
  db: Session
):
  user, u_at = access_token_factory("user")
  friend, f_at = access_token_factory("friend")
  _ = relation_factory(user, friend, fr)

  resp = client.patch(
    "/api/v1/user/follower/" + str(user.uid),
    headers={
      "Authorization": f"Bearer {f_at}"
    },
    content=json.dumps({
      "relationship": to.value
    })
  )
  if exp_code == 200:
    assert resp.status_code == 200
    assert resp.json()["code"] == 200
    assert resp.json()["status"] == "OK"

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
    assert resp.json()["code"] == 400
    assert resp.json()["status"] == "Bad Request"
    assert resp.json()["message"] == "Relationship change may not be done"


def test_change_null_relationship_follower(
  access_token: str
):
  resp = client.patch(
    "/api/v1/user/follower/a2ffae9b-04be-4b29-a529-aa4e55146cc4",
    headers={
      "Authorization": f"Bearer {access_token}"
    },
    content=json.dumps({
      "relationship": RelationshipState.BLOCKED.value
    })
  )

  assert resp.status_code == 404
  assert resp.json()["code"] == 404
  assert resp.json()["status"] == "Not found"


def test_count_followers(
  access_token_factory: Callable[[str], Tuple[IdentityModel, str]],
  relation_factory: Callable[[IdentityModel, IdentityModel, RelationshipState], RelationshipModel],
  db: Session
):
  user, u_at = access_token_factory("user")
  friends: list[IdentityModel] = []
  for i in range(5):
    f, f_at = access_token_factory(f"f{i}")
    _ = relation_factory(f, user, RelationshipState.FOLLOWING)
    friends.append(f)

  resp = client.get(
    "/api/v1/user/follower/count",
    headers={
      "Authorization": f"Bearer {u_at}"
    }
  )

  assert resp.status_code == 200
  assert resp.json()["code"] == 200
  assert resp.json()["status"] == "OK"
  assert resp.json()["count"] == len(friends)
