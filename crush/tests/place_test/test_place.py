import json

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.locations.PlaceModel import PlaceModel

client = TestClient(app)


def assert_place(response, place):
  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"
  assert len(response.json()['content']) == 1
  assert response.json()['content'][0]['name'] == place.name
  assert response.json()['content'][0]['description'] == place.description
  assert response.json()['content'][0]['address'] == place.address
  assert response.json()['content'][0]['coordinate'] == place.coordinate
  assert response.json()['content'][0]['uid'] == str(place.uid)
  assert response.json()['content'][0]['thumbnail'] == place.thumbnail
  assert dict(response.json()['content'][0]['metadata']) == place.place_meta


def test_place_creation(
  db: Session
):
  response = client.post(
    "/api/v1/location/place",
    content=json.dumps({
      "name": "4233마음센터 연남점",
      "address": "서울 마포구 월드컵북로4길 43 지하1층",
      "description": "설명",
      "thumbnail": "thumbnail",
      "coordinate": [37.558147, 126.921673],
      "metadata": {
        "parking": False,
        "reservation": True
      }
    })
  )

  assert response.status_code == 201
  assert response.json()['code'] == 201
  assert response.json()['status'] == "Created"
  assert response.json()['content']['name'] == "4233마음센터 연남점"
  assert response.json()['content']['address'] == "서울 마포구 월드컵북로4길 43 지하1층"
  assert response.json()['content']['description'] == "설명"
  assert response.json()['content']['thumbnail'] == "thumbnail"
  assert response.json()['content']['coordinate'] == [37.558147, 126.921673]
  assert dict(response.json()['content']['metadata']).get("parking", None) == False
  assert dict(response.json()['content']['metadata']).get("reservation", None) == True

  db.query(PlaceModel).filter(PlaceModel.uid == response.json()['content']['uid']).delete()
  db.commit()


def test_place_read_by_name(
  places: list[PlaceModel],
):
  response = client.get(
    "/api/v1/location/place",
    params={
      "name": "r0p0"
    }
  )

  assert_place(response, places[0])


def test_place_read_by_address(
  places: list[PlaceModel],
):
  response = client.get(
    "/api/v1/location/place",
    params={
      "address": "r0p0"
    }
  )

  assert_place(response, places[0])


def test_place_read_by_metadata(
  places: list[PlaceModel]
):
  response = client.get(
    "/api/v1/location/place",
    params={
      "reservation": True,
      "parking": True,
    }
  )

  assert_place(response, places[0])


def test_place_read_limit(
  places: list[PlaceModel],
):
  response = client.get(
    "/api/v1/location/place",
    params={
      "name": "r0",
      "limit": 2
    }
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"
  assert len(response.json()['content']) == 2


def test_place_search_nothing():
  response = client.get(
    "/api/v1/location/place",
    params={
      "name": "메가박스"
    }
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"
  assert len(response.json()['content']) == 0


def test_place_search_nothing_from_param(
  places: list[PlaceModel]
):
  response = client.get(
    "/api/v1/location/place",
    params={
      "instagram": "username"
    }
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"
  assert len(response.json()['content']) == 0


def test_place_patch(
  places: list[PlaceModel],
  db: Session
):
  response = client.patch(
    "/api/v1/location/place/" + str(places[0].uid),
    content=json.dumps({
      "name": "케이팝 스퀘어 홍대",
      "address": "서울 마포구 양화로 141",
      "description": "케이팝 성지",
      "coordinate": [47.558147, 226.921673],
      "thumbnail": "nail",
      "metadata": {
        "parking": True,
        "reservation": True
      }
    })
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"

  db.expire_all()
  patched_place: PlaceModel = db.query(PlaceModel).get(places[0].uid)
  assert patched_place.name == "케이팝 스퀘어 홍대"
  assert patched_place.description == "케이팝 성지"
  assert patched_place.address == "서울 마포구 양화로 141"
  assert patched_place.coordinate == [47.558147, 226.921673]
  assert patched_place.uid == places[0].uid
  assert patched_place.thumbnail == "nail"
  assert patched_place.place_meta == {
    "parking": True,
    "reservation": True,
  }

  db.delete(patched_place)
  db.commit()


def test_place_patch_meta_not_set(
  places: list[PlaceModel],
  db: Session
):
  response = client.patch(
    "/api/v1/location/place/" + str(places[0].uid),
    content=json.dumps({
      "coordinate": [47.558147, 226.921673],
      "metadata": {
        "parking": "True",
        "reservation": False
      }
    })
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"

  db.expire_all()
  patched_place: PlaceModel = db.query(PlaceModel).get(places[0].uid)
  assert patched_place.coordinate == [47.558147, 226.921673]
  assert patched_place.uid == places[0].uid
  assert patched_place.place_meta == {
    "reservation": False
  }

  db.delete(patched_place)
  db.commit()


def test_patch_null_region():
  response = client.patch(
    "/api/v1/location/place/a2ffae9b-04be-4b29-a529-aa4e55146cc4",
    content=json.dumps({
      "name": "룸이스케이프 홍대"
    })
  )
  assert response.status_code == 404


def test_place_delete(
  places: list[PlaceModel],
  db: Session
):
  response = client.delete(
    "/api/v1/location/place/" + str(places[0].uid),
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"
  assert response.json()['deleted'] == 1
  assert db.query(PlaceModel).filter(PlaceModel.uid == places[0].uid).scalar() is None


def test_place_delete_null():
  response = client.delete(
    "/api/v1/location/place/a2ffae9b-04be-4b29-a529-aa4e55146cc4",
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"
  assert response.json()['deleted'] == 0
