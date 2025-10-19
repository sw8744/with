import json

from starlette.testclient import TestClient

from app.main import app
from app.models.themes.ThemeModel import ThemeModel

client = TestClient(app)


def test_theme_creation(
  db
):
  response = client.post(
    '/api/v1/recommendation/theme',
    content=json.dumps({
      "name": "TestTheme",
      "color": "4435ff"
    })
  )

  assert response.status_code == 201
  assert response.json()["code"] == 201
  assert response.json()["status"] == "CREATED"

  new_theme = db.query(ThemeModel).filter(ThemeModel.uid == response.json()["theme"]["uid"]).scalar()
  assert new_theme.name == "TestTheme"
  assert new_theme.color == "4435ff"

  db.delete(new_theme)
  db.commit()


def test_theme_patch(
  themes,
  db
):
  response = client.patch(
    '/api/v1/recommendation/theme/' + str(themes[0].uid),
    content=json.dumps({
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
  themes,
  db
):
  response = client.get(
    '/api/v1/recommendation/theme'
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
