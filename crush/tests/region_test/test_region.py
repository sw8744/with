import json

from fastapi.testclient import TestClient

from app.core.user.core_jwt import Role
from app.main import app
from app.models.locations.RegionModel import RegionModel

client = TestClient(app)


def test_region_creation(
  access_token_factory,
  db
):
  _, i_at = access_token_factory("test", Role.REGION_ADD)

  response = client.post(
    "/api/v1/location/region",
    headers={"Authorization": f"Bearer {i_at}"},
    content=json.dumps({
      "name": "홍대/연남",
      "description": "설명",
      "thumbnail": "thumbnail"
    })
  )
  assert response.status_code == 201
  assert response.json()["code"] == 201
  assert response.json()["status"] == "Created"
  assert response.json()["content"]["name"] == "홍대/연남"
  assert response.json()["content"]["description"] == "설명"
  assert response.json()["content"]["thumbnail"] == "thumbnail"

  new_region: RegionModel = db.query(RegionModel).filter(RegionModel.uid == response.json()["content"]["uid"]).scalar()
  assert new_region.name == "홍대/연남"
  assert new_region.description == "설명"
  assert new_region.thumbnail == "thumbnail"
  assert new_region.name_umso == "ㅎㅗㅇㄷㅐ/ㅇㅕㄴㄴㅏㅁ"

  db.delete(new_region)
  db.commit()


def test_region_creation_without_role(
  access_token_factory,
  db
):
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.post(
    "/api/v1/location/region",
    headers={"Authorization": f"Bearer {i_at}"},
    content=json.dumps({
      "name": "홍대/연남",
      "description": "설명",
      "thumbnail": "thumbnail"
    })
  )

  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["message"] == "Forbidden"


def test_region_read(
  access_token_factory,
  regions,
  db
):
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.get(
    "/api/v1/location/region",
    headers={"Authorization": f"Bearer {i_at}"},
    params={
      "name": "지역1"
    }
  )
  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert len(response.json()["content"]) == 1
  assert response.json()["content"][0]["name"] == "이름-지역1"
  assert response.json()["content"][0]["description"] == "설명-지역1"
  assert response.json()["content"][0]["thumbnail"] == "thumbnail"
  assert response.json()["content"][0]["uid"] == str(regions[1].uid)


def test_region_read_limit(
  access_token_factory,
  regions,
  db
):
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.get(
    "/api/v1/location/region",
    headers={"Authorization": f"Bearer {i_at}"},
    params={
      "name": "지역",
      "limit": 2
    }
  )
  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert len(response.json()["content"]) == 2


def test_region_patch(
  access_token_factory,
  regions,
  db
):
  _, i_at = access_token_factory("test", Role.REGION_EDIT)

  response = client.patch(
    "/api/v1/location/region/" + str(regions[0].uid),
    headers={"Authorization": f"Bearer {i_at}"},
    content=json.dumps({
      "name": "한글ing",
      "description": "a",
      "thumbnail": "a"
    })
  )
  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"

  db.expire_all()
  patched_region: RegionModel = db.query(RegionModel).get(regions[0].uid)
  assert patched_region.name == "한글ing"
  assert patched_region.description == "a"
  assert patched_region.thumbnail == "a"
  assert patched_region.name_umso == "ㅎㅏㄴㄱㅡㄹing"

  db.delete(patched_region)
  db.commit()


def test_patch_null_region(
  access_token_factory,
):
  _, i_at = access_token_factory("test", Role.REGION_EDIT)

  response = client.patch(
    "/api/v1/location/region/a2ffae9b-04be-4b29-a529-aa4e55146cc4",
    headers={"Authorization": f"Bearer {i_at}"},
    content=json.dumps({
      "name": "신촌"
    })
  )
  assert response.status_code == 404


def test_region_patch_without_role(
  access_token_factory,
  regions,
  db
):
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.patch(
    "/api/v1/location/region/" + str(regions[0].uid),
    headers={"Authorization": f"Bearer {i_at}"},
    content=json.dumps({
      "name": "한글ing",
      "description": "a",
      "thumbnail": "a"
    })
  )

  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["message"] == "Forbidden"


def test_region_delete(
  access_token_factory,
  regions,
  db
):
  _, i_at = access_token_factory("test", Role.REGION_DELETE)

  response = client.delete(
    "/api/v1/location/region/" + str(regions[0].uid),
    headers={"Authorization": f"Bearer {i_at}"}
  )
  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert response.json()["deleted"] == 1
  assert db.query(RegionModel).filter(RegionModel.uid == regions[0].uid).scalar() is None


def test_region_delete_without_role(
  access_token_factory,
  regions,
  db
):
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.delete(
    "/api/v1/location/region/" + str(regions[0].uid),
    headers={"Authorization": f"Bearer {i_at}"}
  )
  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["message"] == "Forbidden"


def test_delete_null_region(
  access_token_factory,
):
  _, i_at = access_token_factory("test", Role.REGION_DELETE)

  response = client.delete(
    "/api/v1/location/region/a2ffae9b-04be-4b29-a529-aa4e55146cc4",
    headers={"Authorization": f"Bearer {i_at}"}
  )
  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert response.json()["deleted"] == 0
