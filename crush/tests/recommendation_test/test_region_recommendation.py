from typing import Tuple

from starlette.testclient import TestClient

from app.main import app
from app.models.users.IdentityModel import IdentityModel
from app.models.users.RelationshipModel import RelationshipState
from tests.conftest import like_factory

client = TestClient(app)


def test_recommendation(
  access_token_factory,
  places,
  like_factory,
  relation_factory,
  db
):
  users: list[Tuple[IdentityModel, str]] = [
    access_token_factory(f"u{i}")
    for i in range(3)
  ]

  for u in users[1:]:
    relation_factory(users[0][0], u[0], RelationshipState.FRIEND)

  for i in range(3):
    for j in range(i + 1):
      like_factory(users[i][0], places[j * 3 + i])

  resp = client.get(
    "/api/v1/recommendation/region",
    headers={
      "Authorization": f"Bearer {users[0][1]}"
    },
    params={
      "users": ".".join([str(user[0].uid) for user in users])
    }
  )

  assert resp.status_code == 200
  assert resp.json()["code"] == 200
  assert resp.json()["status"] == "OK"
  assert len(resp.json()["recommendation"]) == 3
  assert resp.json()["recommendation"] == [
    {
      "region": str(places[i * 3].region.uid),
      "score": 3 - i
    }
    for i in range(3)
  ]


def test_recommendation_of_not_friend(
  access_token_factory,
  places,
  like_factory,
  relation_factory,
  db
):
  users: list[Tuple[IdentityModel, str]] = [
    access_token_factory(f"u{i}")
    for i in range(3)
  ]

  for u in users[2:]:
    relation_factory(users[0][0], u[0], RelationshipState.LIKED)

  for i in range(3):
    for j in range(i + 1):
      like_factory(users[i][0], places[j * 3 + i])

  resp = client.get(
    "/api/v1/recommendation/region",
    headers={
      "Authorization": f"Bearer {users[0][1]}"
    },
    params={
      "users": ".".join([str(user[0].uid) for user in users])
    }
  )

  assert resp.status_code == 400
  assert resp.json()["code"] == 400
  assert resp.json()["status"] == "Bad Request"
  assert resp.json()["message"] == "Followee is not your friend"
