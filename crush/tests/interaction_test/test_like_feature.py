import json
from typing import Callable

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.interacrions.LikeModel import LikesModel
from app.models.locations.PlaceModel import PlaceModel
from app.models.users.IdentityModel import IdentityModel
from app.schemas.location.place import Place

client = TestClient(app)


def test_like(
  place: PlaceModel,
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
      "placeId": str(place.uid)
    })
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"

  like = (
    db.query(LikesModel)
    .filter(
      LikesModel.place_id == place.uid,
      LikesModel.user_id == identity.uid
    )
    .scalar()
  )
  assert like is not None


def test_dislike(
  place: PlaceModel,
  identity: IdentityModel,
  access_token: str,
  db: Session
):
  like = LikesModel(
    place_id=place.uid,
    user_id=identity.uid
  )
  db.add(like)
  db.commit()

  response = client.delete(
    "/api/v1/interaction/like/" + str(place.uid),
    headers={
      "Authorization": f"Bearer {access_token}"
    }
  )
  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"

  like = (
    db.query(LikesModel)
    .filter(
      LikesModel.place_id == place.uid,
      LikesModel.user_id == identity.uid
    )
    .scalar()
  )
  assert like is None


def test_list_likes(
  identity: IdentityModel,
  place_factory: Callable[[str, str, str], PlaceModel],
  access_token: str,
  db: Session
):
  places = []
  for i in range(10):
    place = place_factory("a", "a", "")

    like = LikesModel(
      user_id=identity.uid,
      place_id=place.uid
    )
    db.add(like)

    places.append(
      Place(
        uid=place.uid,
        name=place.name,
        description=place.description,
        coordinate=place.coordinate,
        address=place.address,
        region_uid=place.region_uid,
        thumbnail=place.thumbnail,
        metadata=place.place_meta,
      ).model_dump()
    )

  db.commit()

  response = client.get(
    "/api/v1/interaction/like",
    headers={
      "Authorization": f"Bearer {access_token}"
    }
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"
  assert response.json()['likes'] == places


def test_liked_single_place_liked(
  place: PlaceModel,
  identity: IdentityModel,
  access_token: str,
  db: Session
):
  like = LikesModel(
    user_id=identity.uid,
    place_id=place.uid,
  )
  db.add(like)
  db.commit()

  response = client.get(
    "/api/v1/interaction/like/" + str(place.uid),
    headers={
      "Authorization": f"Bearer {access_token}"
    }
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"
  assert response.json()['liked'] == True


def test_liked_single_place_not_liked(
  place: PlaceModel,
  identity: IdentityModel,
  access_token: str,
  db: Session
):
  response = client.get(
    "/api/v1/interaction/like/" + str(place.uid),
    headers={
      "Authorization": f"Bearer {access_token}"
    }
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"
  assert response.json()['liked'] == False
