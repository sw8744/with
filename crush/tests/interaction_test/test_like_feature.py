import json

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.interacrions.LikeModel import LikesModel
from app.schemas.location.place import Place
from tests.conftest import like_factory, identity

client = TestClient(app)


def test_like(
  places,
  identity,
  access_token,
  db
):
  response = client.post(
    "/api/v1/interaction/like",
    headers={
      "Authorization": f"Bearer {access_token}"
    },
    content=json.dumps({
      "placeId": str(places[0].uid)
    })
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"

  like = (
    db.query(LikesModel)
    .filter(
      LikesModel.place_id == places[0].uid,
      LikesModel.user_id == identity.uid
    )
    .scalar()
  )
  assert like is not None


def test_dislike(
  places,
  identity,
  access_token,
  db
):
  # FIXME: 이거 like factory로 바꿔야 하는데 왜 바꾸면 teardown에서 오류나는지...?
  for place in places:
    like = LikesModel(
      user_id=identity.uid,
      place_id=place.uid
    )
    db.add(like)

  db.commit()

  response = client.delete(
    "/api/v1/interaction/like/" + str(places[0].uid),
    headers={
      "Authorization": f"Bearer {access_token}"
    }
  )
  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"

  like = (
    db.query(LikesModel)
    .filter(
      LikesModel.place_id == places[0].uid,
      LikesModel.user_id == identity.uid
    )
    .scalar()
  )
  assert like is None


def test_list_likes(
  identity,
  places,
  access_token,
  like_factory,
  db: Session
):
  for place in places:
    like_factory(identity, place)

  response = client.get(
    "/api/v1/interaction/like",
    headers={
      "Authorization": f"Bearer {access_token}"
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert response.json()["likes"] == list(reversed([Place(place).model_dump() for place in places]))


def test_list_likes_limit(
  identity,
  places,
  access_token,
  like_factory,
  db: Session
):
  for place in places:
    like_factory(identity, place)

  response = client.get(
    "/api/v1/interaction/like",
    headers={
      "Authorization": f"Bearer {access_token}"
    },
    params={
      "limit": 4
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert len(response.json()["likes"]) == 4


def test_liked_single_place_liked(
  places,
  identity,
  access_token,
  like_factory,
  db: Session
):
  like_factory(identity, places[0])

  response = client.get(
    "/api/v1/interaction/like/" + str(places[0].uid),
    headers={
      "Authorization": f"Bearer {access_token}"
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert response.json()["liked"] == True


def test_liked_single_place_not_liked(
  places,
  identity,
  access_token,
  like_factory,
  db: Session
):
  for place in places[1:-1]:
    like_factory(identity, place)

  response = client.get(
    "/api/v1/interaction/like/" + str(places[0].uid),
    headers={
      "Authorization": f"Bearer {access_token}"
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert response.json()["liked"] == False
