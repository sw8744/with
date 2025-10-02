import json

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.interacrions.LikeModel import LikesModel
from app.models.locations.PlaceModel import PlaceModel
from app.models.users.IdentityModel import IdentityModel
from app.schemas.location.place import Place

client = TestClient(app)


def test_like(
  places: list[PlaceModel],
  identity: IdentityModel,
  access_token: str,
  db: Session
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
  places: list[PlaceModel],
  identity: IdentityModel,
  access_token: str,
  db: Session
):
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
  identity: IdentityModel,
  places: list[PlaceModel],
  access_token: str,
  db: Session
):
  for place in places:
    like = LikesModel(
      user_id=identity.uid,
      place_id=place.uid
    )
    db.add(like)

  db.commit()

  response = client.get(
    "/api/v1/interaction/like",
    headers={
      "Authorization": f"Bearer {access_token}"
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert response.json()["likes"] == [Place(place).model_dump() for place in places]


def test_list_likes_limit(
  identity: IdentityModel,
  places: list[PlaceModel],
  access_token: str,
  db: Session
):
  for place in places:
    like = LikesModel(
      user_id=identity.uid,
      place_id=place.uid
    )
    db.add(like)

  db.commit()

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
  places: list[PlaceModel],
  identity: IdentityModel,
  access_token: str,
  db: Session
):
  like = LikesModel(
    user_id=identity.uid,
    place_id=places[0].uid,
  )
  db.add(like)
  db.commit()

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
  places: list[PlaceModel],
  identity: IdentityModel,
  access_token: str,
  db: Session
):
  for place in places[1:-1]:
    like = LikesModel(
      user_id=identity.uid,
      place_id=place.uid
    )
    db.add(like)

  db.commit()

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
