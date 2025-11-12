from datetime import datetime

from starlette.testclient import TestClient

from app.main import app
from app.models.users.IdentityModel import IdentityModel, SEX

client = TestClient(app)


def test_patch_identity(
  access_token_factory,
  db
):
  u, uat = access_token_factory("TestUser")

  response = client.patch(
    "/api/v1/user",
    headers={
      "Authorization": f"Bearer {uat}"
    },
    json={
      "name": "UpdatedTestUser",
      "email": "abcd@gmail.com",
      "birthday": "2007-01-01",
      "sex": 1
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"

  db.expire_all()
  updated_identity: IdentityModel = (
    db.query(IdentityModel)
    .filter(IdentityModel.uid == u.uid)
    .scalar()
  )

  assert updated_identity is not None
  assert updated_identity.name == "UpdatedTestUser"
  assert updated_identity.email == "abcd@gmail.com"
  assert updated_identity.email_verified == False
  assert updated_identity.birthday == datetime(2007, 1, 1).date()
  assert updated_identity.sex == SEX.FEMALE

  db.delete(updated_identity)
  db.commit()
