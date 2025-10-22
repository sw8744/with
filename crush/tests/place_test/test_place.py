import json
import random

import numpy as np
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.user.core_jwt import Role
from app.main import app
from app.models.locations.PlaceModel import PlaceModel
from app.models.preferences.PlaceThemeModel import PlaceThemeModel
from app.schemas.location.place import Place

client = TestClient(app)


def assert_place(response, place):
  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert len(response.json()["content"]) == 1
  assert response.json()["content"][0] == Place(place).model_dump()


@pytest.mark.parametrize(
  "theme_length",
  [90, 100, 110]
)
def test_place_creation(
  theme_length,
  access_token_factory,
  db
):
  theme_vector = [random.uniform(0, 1) for _ in range(theme_length)]
  _, i_at = access_token_factory("test", Role.PLACE_ADD)

  response = client.post(
    "/api/v1/location/place",
    headers={
      'Authorization': f'Bearer {i_at}'
    },
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
      },
      "theme": theme_vector,
    })
  )

  if theme_length > 100:
    assert response.status_code == 400
    assert response.json()["code"] == 400
    return

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

  new_theme_vector = db.query(PlaceThemeModel).filter(
    PlaceThemeModel.place_id == response.json()["content"]["uid"]).scalar()
  theme_vector += [0.0] * (100 - theme_length)
  assert np.isclose(new_theme_vector.theme, theme_vector).all()

  db.delete(new_place)
  db.commit()


def test_place_creation_without_role(
  access_token_factory,
  db
):
  theme_vector = [random.uniform(0, 1) for _ in range(100)]
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.post(
    "/api/v1/location/place",
    headers={
      'Authorization': f'Bearer {i_at}'
    },
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
      },
      "theme": theme_vector,
    })
  )

  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["message"] == "Forbidden"


def test_place_read_by_name(
  access_token_factory,
  places
):
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.get(
    "/api/v1/location/place",
    headers={
      'Authorization': f'Bearer {i_at}'
    },
    params={
      "name": "ㅣ역0장소0"
    }
  )

  assert_place(response, places[0])


def test_place_read_by_address(
  access_token_factory,
  places
):
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.get(
    "/api/v1/location/place",
    headers={
      'Authorization': f'Bearer {i_at}'
    },
    params={
      "address": "주소-지역0장소0"
    }
  )

  assert_place(response, places[0])


def test_place_read_by_region(
  access_token_factory,
  places
):
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.get(
    "/api/v1/location/place",
    headers={
      'Authorization': f'Bearer {i_at}'
    },
    params={
      "regionUid": str(places[0].region_uid)
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert response.json()["content"] == [Place(place).model_dump() for place in places[0:3]]


def test_place_read_by_metadata(
  access_token_factory,
  places
):
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.get(
    "/api/v1/location/place",
    headers={
      'Authorization': f'Bearer {i_at}'
    },
    params={
      "metadata": "reservation.required=true,operation.parking=true"
    }
  )

  assert_place(response, places[0])


def test_place_read_limit(
  access_token_factory,
  places
):
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.get(
    "/api/v1/location/place",
    headers={
      'Authorization': f'Bearer {i_at}'
    },
    params={
      "name": "지역0",
      "limit": 2
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert len(response.json()["content"]) == 2


def test_place_search_nothing(
  access_token_factory
):
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.get(
    "/api/v1/location/place",
    headers={
      'Authorization': f'Bearer {i_at}'
    },
    params={
      "name": "메가박스"
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert len(response.json()["content"]) == 0


def test_place_search_nothing_from_param(
  access_token_factory,
  places: list[PlaceModel]
):
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.get(
    "/api/v1/location/place",
    headers={
      'Authorization': f'Bearer {i_at}'
    },
    params={
      "metadata": "contact.instagram=username"
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert len(response.json()["content"]) == 0


@pytest.mark.parametrize(
  "theme_length",
  [90, 100, 110]
)
def test_place_patch(
  access_token_factory,
  theme_length,
  places,
  db
):
  new_theme = [random.uniform(0, 1) for _ in range(theme_length)]
  _, i_at = access_token_factory("test", Role.PLACE_EDIT)

  response = client.patch(
    "/api/v1/location/place/" + str(places[0].uid),
    headers={
      'Authorization': f'Bearer {i_at}'
    },
    content=json.dumps({
      "name": "케이팝 스퀘어 홍대",
      "address": "서울 마포구 양화로 141",
      "description": "케이팝 성지",
      "coordinate": [47.558147, 226.921673],
      "thumbnail": "nail",
      "metadata": {
        "parking": True,
        "reservation": False
      },
      "theme": new_theme,
    })
  )

  if theme_length > 100:
    assert response.status_code == 400
    assert response.json()["code"] == 400
    return

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
    "reservation": False,
  }
  assert patched_place.name_umso == "ㅋㅔㅇㅣㅍㅏㅂ ㅅㅡㅋㅜㅔㅇㅓ ㅎㅗㅇㄷㅐ"
  new_theme += [0.0] * (100 - theme_length)
  assert np.isclose(patched_place.theme.theme, new_theme).all()

  db.delete(patched_place)
  db.commit()


def test_patch_null_region(
  access_token_factory
):
  _, i_at = access_token_factory("test", Role.PLACE_EDIT)

  response = client.patch(
    "/api/v1/location/place/a2ffae9b-04be-4b29-a529-aa4e55146cc4",
    headers={
      'Authorization': f'Bearer {i_at}'
    },
    content=json.dumps({
      "name": "룸이스케이프 홍대"
    })
  )
  assert response.status_code == 404


def test_place_patch_without_role(
  access_token_factory,
  places,
  db
):
  new_theme = [random.uniform(0, 1) for _ in range(100)]
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.patch(
    "/api/v1/location/place/" + str(places[0].uid),
    headers={
      'Authorization': f'Bearer {i_at}'
    },
    content=json.dumps({
      "name": "케이팝 스퀘어 홍대",
      "address": "서울 마포구 양화로 141",
      "description": "케이팝 성지",
      "coordinate": [47.558147, 226.921673],
      "thumbnail": "nail",
      "metadata": {
        "parking": True,
        "reservation": False
      },
      "theme": new_theme,
    })
  )

  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["message"] == "Forbidden"


def test_place_delete(
  access_token_factory,
  places: list[PlaceModel],
  db: Session
):
  _, i_at = access_token_factory("test", Role.PLACE_DELETE)

  response = client.delete(
    "/api/v1/location/place/" + str(places[0].uid),
    headers={
      'Authorization': f'Bearer {i_at}'
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert response.json()["deleted"] == 1
  assert db.query(PlaceModel).filter(PlaceModel.uid == places[0].uid).scalar() is None


def test_place_delete_null(
  access_token_factory
):
  _, i_at = access_token_factory("test", Role.PLACE_DELETE)

  response = client.delete(
    "/api/v1/location/place/a2ffae9b-04be-4b29-a529-aa4e55146cc4",
    headers={
      'Authorization': f'Bearer {i_at}'
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert response.json()["deleted"] == 0


def test_place_delete_without_role(
  access_token_factory,
  places: list[PlaceModel],
  db: Session
):
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.delete(
    "/api/v1/location/place/" + str(places[0].uid),
    headers={
      'Authorization': f'Bearer {i_at}'
    }
  )

  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["message"] == "Forbidden"
