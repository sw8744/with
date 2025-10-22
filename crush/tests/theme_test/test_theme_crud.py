import json

from starlette.testclient import TestClient

from app.core.user.core_jwt import Role
from app.main import app
from app.models.preferences.ThemeModel import ThemeModel

client = TestClient(app)


def test_theme_creation(
  access_token_factory,
  db
):
  _, i_at = access_token_factory("test", Role.THEME_EDIT)

  response = client.post(
    '/api/v1/recommendation/theme',
    headers={'Authorization': f'Bearer {i_at}'},
    content=json.dumps({
      "uid": 99,
      "name": "TestTheme",
      "color": "4435ff"
    })
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"

  new_theme: ThemeModel = db.query(ThemeModel).filter(ThemeModel.uid == 99).scalar()
  assert new_theme.uid == 99
  assert new_theme.name == "TestTheme"
  assert new_theme.color == "4435ff"

  db.delete(new_theme)
  db.commit()


def test_theme_set_without_role(
  access_token_factory,
  db
):
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.post(
    '/api/v1/recommendation/theme',
    headers={'Authorization': f'Bearer {i_at}'},
    content=json.dumps({
      "uid": 99,
      "name": "TestTheme",
      "color": "4435ff"
    })
  )
  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["message"] == "Forbidden"


def test_theme_creation_without_name(
  access_token_factory,
  db
):
  _, i_at = access_token_factory("test", Role.THEME_EDIT)

  response = client.post(
    '/api/v1/recommendation/theme',
    headers={'Authorization': f'Bearer {i_at}'},
    content=json.dumps({
      "color": "4435ff"
    })
  )

  assert response.status_code == 400
  assert response.json()["code"] == 400
  assert response.json()["message"] == "Theme name and color is required"


def test_theme_creation_without_role(
  access_token_factory,
  db
):
  _, i_at = access_token_factory("test", Role.THEME_EDIT)

  response = client.post(
    '/api/v1/recommendation/theme',
    headers={'Authorization': f'Bearer {i_at}'},
    content=json.dumps({
      "name": "TestTheme"
    })
  )

  assert response.status_code == 400
  assert response.json()["code"] == 400
  assert response.json()["message"] == "Theme name and color is required"


def test_theme_patch(
  access_token_factory,
  themes,
  db
):
  _, i_at = access_token_factory("test", Role.THEME_EDIT)

  response = client.post(
    '/api/v1/recommendation/theme',
    headers={'Authorization': f'Bearer {i_at}'},
    content=json.dumps({
      "uid": themes[0].uid,
      "name": "TestTheme",
      "color": "4435ff"
    })
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"

  db.expire_all()
  patched_theme = db.query(ThemeModel).get(themes[0].uid)
  assert patched_theme.name == "TestTheme"
  assert patched_theme.color == "4435ff"

  db.delete(patched_theme)
  db.commit()


def test_list_themes(
  access_token_factory,
  themes,
  db
):
  _, i_at = access_token_factory("test", Role.CORE_USER)

  response = client.get(
    '/api/v1/recommendation/theme',
    headers={'Authorization': f'Bearer {i_at}'},
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert response.json()["themes"] == [
    {
      "name": theme.name,
      "uid": theme.uid,
      "color": theme.color,
    } for theme in themes
  ]
