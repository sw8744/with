import json

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.interacrions.likes import LikesModel
from app.models.locations.places import PlaceModel
from app.models.users.identities import IdentityModel

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

  print(response.json())

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
    "/api/v1/interaction/like",
    params={
      "place_id": str(place.uid),
      "placeId": str(place.uid)
    },
    headers={
      "Authorization": f"Bearer {access_token}"
    }
  )
  print(response.url)
  print(response.json())

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
