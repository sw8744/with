import json

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.locations.PlaceModel import PlaceModel
from app.schemas.location.place import Place

client = TestClient(app)


def assert_place(response, place):
  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert len(response.json()["content"]) == 1
  assert response.json()["content"][0] == Place(place).model_dump()


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
        "operation": {
          "parking": False,
        },
        "reservation": {
          "required": True
        }
      }
    })
  )

  assert response.status_code == 201
  assert response.json()["code"] == 201
  assert response.json()["status"] == "Created"
  assert response.json()["content"]["name"] == "4233마음센터 연남점"
  assert response.json()["content"]["address"] == "서울 마포구 월드컵북로4길 43 지하1층"
  assert response.json()["content"]["description"] == "설명"
  assert response.json()["content"]["thumbnail"] == "thumbnail"
  assert response.json()["content"]["coordinate"] == [37.558147, 126.921673]
  assert dict(response.json()["content"]["metadata"]) == {
    "operation": {
      "parking": False,
    },
    "reservation": {
      "required": True
    }
  }

  new_place: PlaceModel = db.query(PlaceModel).filter(PlaceModel.uid == response.json()["content"]["uid"]).scalar()
  assert new_place.name == "4233마음센터 연남점"
  assert new_place.address == "서울 마포구 월드컵북로4길 43 지하1층"
  assert new_place.description == "설명"
  assert new_place.thumbnail == "thumbnail"
  assert new_place.coordinate == [37.558147, 126.921673]
  assert new_place.place_meta == {
    "operation": {
      "parking": False,
    },
    "reservation": {
      "required": True
    }
  }
  assert new_place.name_umso == "4233ㅁㅏㅇㅡㅁㅅㅔㄴㅌㅓ ㅇㅕㄴㄴㅏㅁㅈㅓㅁ"

  db.delete(new_place)
  db.commit()


def test_place_read_by_name(
  places: list[PlaceModel],
):
  response = client.get(
    "/api/v1/location/place",
    params={
      "name": "ㅣ역0장소0"
    }
  )

  assert_place(response, places[0])


def test_place_read_by_address(
  places: list[PlaceModel],
):
  response = client.get(
    "/api/v1/location/place",
    params={
      "address": "주소-지역0장소0"
    }
  )

  assert_place(response, places[0])


def test_place_read_by_region(
  places: list[PlaceModel]
):
  response = client.get(
    "/api/v1/location/place",
    params={
      "regionUid": str(places[0].region_uid)
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert response.json()["content"] == [Place(place).model_dump() for place in places[0:3]]

def test_place_read_by_metadata(
  places: list[PlaceModel]
):
  response = client.get(
    "/api/v1/location/place",
    params={
      "metadata": "reservation.required=true,operation.parking=true"
    }
  )

  assert_place(response, places[0])


def test_place_read_limit(
  places: list[PlaceModel],
):
  response = client.get(
    "/api/v1/location/place",
    params={
      "name": "지역0",
      "limit": 2
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert len(response.json()["content"]) == 2


def test_place_search_nothing():
  response = client.get(
    "/api/v1/location/place",
    params={
      "name": "메가박스"
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert len(response.json()["content"]) == 0


def test_place_search_nothing_from_param(
  places: list[PlaceModel]
):
  response = client.get(
    "/api/v1/location/place",
    params={
      "metadata": "contact.instagram=username"
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert len(response.json()["content"]) == 0


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
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"

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
  assert patched_place.name_umso == "ㅋㅔㅇㅣㅍㅏㅂ ㅅㅡㅋㅜㅔㅇㅓ ㅎㅗㅇㄷㅐ"

  db.delete(patched_place)
  db.commit()


def test_place_patch_meta_set(
  places: list[PlaceModel],
  db: Session
):
  response = client.patch(
    "/api/v1/location/place/" + str(places[0].uid),
    content=json.dumps({
      "coordinate": [47.558147, 226.921673],
      "metadata": {
        "reservation": False
      }
    })
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"

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
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert response.json()["deleted"] == 1
  assert db.query(PlaceModel).filter(PlaceModel.uid == places[0].uid).scalar() is None


def test_place_delete_null():
  response = client.delete(
    "/api/v1/location/place/a2ffae9b-04be-4b29-a529-aa4e55146cc4",
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert response.json()["deleted"] == 0
