import json

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.places.places import PlaceModel

client = TestClient(app)


def test_place_creation(
  db: Session
):
  response = client.post(
    "/api/v1/location/place",
    content=json.dumps({
      "name": "4233마음센터 연남점",
      "address": "서울 마포구 월드컵북로4길 43 지하1층",
      "description": "하트시그널",
      "thumbnail": "axaxaxax",
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
  assert response.json()['content']['description'] == "하트시그널"
  assert response.json()['content']['address'] == "서울 마포구 월드컵북로4길 43 지하1층"
  assert response.json()['content']['thumbnail'] == "axaxaxax"
  assert dict(response.json()['content']['metadata']).get("parking", None) == False
  assert dict(response.json()['content']['metadata']).get("reservation", None) == True

  db.query(PlaceModel).filter(PlaceModel.uid == response.json()['content']['uid']).delete()
  db.commit()


def test_place_read_by_name(
  place: PlaceModel,
  db: Session
):
  response = client.get(
    "/api/v1/location/place",
    params={
      "name": "마음센터"
    }
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"
  assert len(response.json()['content']) == 1
  assert response.json()['content'][0]['name'] == "4233마음센터 연남점"
  assert response.json()['content'][0]['description'] == "하트시그널"
  assert response.json()['content'][0]['address'] == "서울 마포구 월드컵북로4길 43 지하1층"
  assert response.json()['content'][0]['uid'] == str(place.uid)
  assert response.json()['content'][0]['thumbnail'] == "axaxax"


def test_place_read_by_address(
  place: PlaceModel,
  db: Session
):
  response = client.get(
    "/api/v1/location/place",
    params={
      "address": "월드컵북로4길 43"
    }
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"
  assert len(response.json()['content']) == 1
  assert response.json()['content'][0]['name'] == "4233마음센터 연남점"
  assert response.json()['content'][0]['description'] == "하트시그널"
  assert response.json()['content'][0]['address'] == "서울 마포구 월드컵북로4길 43 지하1층"
  assert response.json()['content'][0]['uid'] == str(place.uid)
  assert response.json()['content'][0]['thumbnail'] == "axaxax"


def test_place_read_by_metadata(
  place: PlaceModel,
  db: Session
):
  response = client.get(
    "/api/v1/location/place",
    params={
      "reservation": True,
      "parking": False,
    }
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"
  assert len(response.json()['content']) == 1
  assert response.json()['content'][0]['name'] == "4233마음센터 연남점"
  assert response.json()['content'][0]['description'] == "하트시그널"
  assert response.json()['content'][0]['address'] == "서울 마포구 월드컵북로4길 43 지하1층"
  assert response.json()['content'][0]['uid'] == str(place.uid)
  assert response.json()['content'][0]['thumbnail'] == "axaxax"


def test_place_search_nothing(
  place: PlaceModel,
  db: Session
):
  response = client.get(
    "/api/v1/location/place",
    params={
      "name": "메가박스"
    }
  )

  assert response.status_code == 404


def test_place_search_nothing_from_param(
  place: PlaceModel,
  db: Session
):
  response = client.get(
    "/api/v1/location/place",
    params={
      "parking": True
    }
  )

  assert response.status_code == 404


def test_place_patch(
  place: PlaceModel,
  db: Session
):
  response = client.patch(
    "/api/v1/location/place/" + str(place.uid),
    content=json.dumps({
      "description": "환승연애",
      "coordinate": [37.558147, 126.921673],
      "thumbnail": "kkkkkkkk",
      "metadata": {
        "parking": True,
        "reservation": True
      }
    })
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"

  patched_place: PlaceModel = db.query(PlaceModel).get(place.uid)
  assert patched_place.name == "4233마음센터 연남점"
  assert patched_place.description == "환승연애"
  assert patched_place.address == "서울 마포구 월드컵북로4길 43 지하1층"
  assert patched_place.coordinate == [37.558147, 126.921673]
  assert patched_place.uid == place.uid
  assert patched_place.thumbnail == "kkkkkkkk"
  assert patched_place.place_meta == {
    "parking": True,
    "reservation": True,
  }

  db.delete(patched_place)
  db.commit()


def test_place_patch_meta_not_set(
  place: PlaceModel,
  db: Session
):
  response = client.patch(
    "/api/v1/location/place/" + str(place.uid),
    content=json.dumps({
      "coordinate": [37.558147, 126.921673],
      "metadata": {
        "parking": "True",
        "reservation": False
      }
    })
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"

  patched_place: PlaceModel = db.query(PlaceModel).get(place.uid)
  assert patched_place.name == "4233마음센터 연남점"
  assert patched_place.address == "서울 마포구 월드컵북로4길 43 지하1층"
  assert patched_place.coordinate == [37.558147, 126.921673]
  assert patched_place.uid == place.uid
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
  place: PlaceModel
):
  response = client.delete(
    "/api/v1/location/place/" + str(place.uid),
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"
  assert response.json()['deleted'] == 1
