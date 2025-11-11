from uuid import uuid4

from starlette.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_get_profile_picture(
  access_token_factory,
):
  u, u_at = access_token_factory("test")

  response = client.get(
    f"/api/v1/resources/image/profile/{u.uid}",
    headers={
      "Authorization": f"Bearer {u_at}"
    },
    follow_redirects=False
  )

  assert response.status_code == 307
  assert "Location" in response.headers
  assert response.headers["Location"] == "/api/v1/resources/image/store/" + u.profile_picture


def test_get_profile_picture_user_not_found(
  access_token_factory
):
  non_existent_uuid = uuid4()
  u, u_at = access_token_factory("test")

  response = client.get(
    f"/api/v1/resources/image/profile/{non_existent_uuid}",
    headers={
      "Authorization": f"Bearer {u_at}"
    },
    follow_redirects=False
  )

  assert response.status_code == 404
  assert response.json()["code"] == 404
  assert response.json()["status"] == "Not Found"
