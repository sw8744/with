import json

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.locations.regions import RegionModel

client = TestClient(app)


def test_region_creation(
  db: Session
):
  response = client.post(
    "/api/v1/location/region",
    content=json.dumps({
      "name": "홍대/연남",
      "description": "설명",
      "thumbnail": "thumbnail"
    })
  )

  assert response.status_code == 201
  assert response.json()['code'] == 201
  assert response.json()['status'] == "Created"
  assert response.json()['content']['name'] == "홍대/연남"
  assert response.json()['content']['description'] == "설명"
  assert response.json()['content']['thumbnail'] == "thumbnail"

  db.query(RegionModel).filter(RegionModel.uid == response.json()['content']['uid']).delete()
  db.commit()


def test_region_read(
  region: RegionModel,
  db: Session
):
  response = client.get(
    "/api/v1/location/region",
    params={
      "name": "홍대"
    }
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"
  assert len(response.json()['content']) == 1
  assert response.json()['content'][0]['name'] == "홍대/연남"
  assert response.json()['content'][0]['description'] == "홍대와 연남"
  assert response.json()['content'][0]['thumbnail'] == "thumbnail"
  assert response.json()['content'][0]['uid'] == str(region.uid)


def test_region_patch(
  region: RegionModel,
  db: Session
):
  response = client.patch(
    "/api/v1/location/region/" + str(region.uid),
    content=json.dumps({
      "name": "신촌",
      "description": "신촌을 못가",
      "thumbnail": "nail"
    })
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"

  db.expire_all()
  patched_region: RegionModel = db.query(RegionModel).get(region.uid)
  assert patched_region.name == "신촌"
  assert patched_region.description == "신촌을 못가"
  assert patched_region.thumbnail == "nail"

  db.delete(patched_region)
  db.commit()


def test_region_delete(
  region: RegionModel,
  db: Session
):
  response = client.delete(
    "/api/v1/location/region/" + str(region.uid),
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"
  assert response.json()['deleted'] == 1


def test_patch_null_region():
  response = client.patch(
    "/api/v1/location/region/a2ffae9b-04be-4b29-a529-aa4e55146cc4",
    content=json.dumps({
      "name": "신촌"
    })
  )
  assert response.status_code == 404
