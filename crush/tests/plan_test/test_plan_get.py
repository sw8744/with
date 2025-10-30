from unittest import TestCase

from starlette.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_plan_get(
  plan
):
  response = client.get(
    "/api/v1/plan/" + str(plan.get("plan").uid),
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    }
  )

  case = TestCase()

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert (
    response.json()["plan"].items() >=
    {
      "uid": str(plan.get("plan").uid),
      "name": plan.get("plan").name,
      "date": {
        "polling": None,
        "from": plan.get("plan").date_from.isoformat(),
        "to": plan.get("plan").date_to.isoformat()
      },
    }.items()
  )

  case.assertCountEqual(
    response.json()["plan"]["members"],
    [
      {
        "uid": str(plan.get("host").get("user").uid),
        "name": plan.get("host").get("user").name,
        "role": 0
      }
    ] + [
      {
        "uid": str(member.get("user").uid),
        "name": member.get("user").name,
        "role": idx + 1
      } for (idx, member) in enumerate(plan.get("members"))
    ]
  )


def test_plan_get_by_observer(
  plan
):
  response = client.get(
    "/api/v1/plan/" + str(plan.get("plan").uid),
    headers={
      "Authorization": f"Bearer {plan.get("members")[2].get("at")}"
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"


def test_plan_get_not_found(
  plan
):
  response = client.get(
    "/api/v1/plan/00000000-0000-0000-0000-000000000000",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    }
  )

  assert response.status_code == 404
  assert response.json()["code"] == 404
  assert response.json()["status"] == "Not Found"


def test_plan_get_outsider(
  plan, access_token_factory
):
  o, o_at = access_token_factory("outsider")

  response = client.get(
    "/api/v1/plan/" + str(plan.get("plan").uid),
    headers={
      "Authorization": f"Bearer {o_at}"
    }
  )

  assert response.status_code == 404
  assert response.json()["code"] == 404
  assert response.json()["status"] == "Not Found"
