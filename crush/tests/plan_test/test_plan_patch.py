from datetime import datetime, timedelta, date

from starlette.testclient import TestClient

from app.main import app
from app.models.plan.PlanModel import PlanModel

client = TestClient(app)


def test_plan_date_fix(
  plan, db
):
  (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .update({
      "polling_date": datetime.now() + timedelta(days=1),
      "date_from": date(2025, 12, 1),
      "date_to": date(2025, 12, 31)
    })
  )
  db.commit()

  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/date",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    },
    json={
      "dateFrom": "2025-12-24",
      "dateTo": "2025-12-25"
    },
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"

  db.expire_all()
  new_plan: PlanModel = (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .scalar()
  )

  assert new_plan.polling_date is None
  assert new_plan.date_from == datetime(2025, 12, 24).date()
  assert new_plan.date_to == datetime(2025, 12, 25).date()


def test_plan_date_fix_reverse(
  plan
):
  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/date",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    },
    json={
      "dateFrom": "2025-12-25",
      "dateTo": "2025-12-24"
    },
  )

  assert response.status_code == 400
  assert response.json()["code"] == 400
  assert response.json()["status"] == "Bad Request"
  assert response.json()["message"] == "Reversed date"


def test_plan_date_fix_by_member(
  plan
):
  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/date",
    headers={
      "Authorization": f"Bearer {plan.get("members")[1].get("at")}"
    },
    json={
      "dateFrom": "2025-12-24",
      "dateTo": "2025-12-25"
    },
  )

  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["status"] == "Forbidden"


def test_plan_date_fix_by_outsider(
  plan, access_token_factory
):
  o, o_at = access_token_factory("outsider")
  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/date",
    headers={
      "Authorization": f"Bearer {o_at}"
    },
    json={
      "dateFrom": "2025-12-24",
      "dateTo": "2025-12-25"
    },
  )

  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["status"] == "Forbidden"


def test_plan_date_plan_not_found(
  access_token_factory
):
  a, a_at = access_token_factory("anyone")
  response = client.patch(
    f"/api/v1/plan/00000000-0000-0000-0000-000000000000/date",
    headers={
      "Authorization": f"Bearer {a_at}"
    },
    json={
      "dateFrom": "2025-12-24",
      "dateTo": "2025-12-25"
    },
  )


def test_plan_rename(
  plan, db
):
  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/name",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    },
    json={
      "name": "New Plan Name"
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"

  db.expire_all()
  new_plan: PlanModel = (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .scalar()
  )
  assert new_plan.name == "New Plan Name"


def test_plan_rename_by_observer(
  plan
):
  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/name",
    headers={
      "Authorization": f"Bearer {plan.get("members")[2].get("at")}"
    },
    json={
      "name": "Another New Plan Name"
    }
  )

  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["status"] == "Forbidden"


def test_plan_rename_by_outsider(
  plan, access_token_factory
):
  o, o_at = access_token_factory("outsider")
  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/name",
    headers={
      "Authorization": f"Bearer {o_at}"
    },
    json={
      "name": "Another New Plan Name"
    }
  )
  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["status"] == "Forbidden"


def test_plan_rename_plan_not_found(
  access_token_factory
):
  a, a_at = access_token_factory("anyone")
  response = client.patch(
    f"/api/v1/plan/00000000-0000-0000-0000-000000000000/name",
    headers={
      "Authorization": f"Bearer {a_at}"
    },
    json={
      "name": "New Plan Name"
    }
  )
  assert response.status_code == 404
  assert response.json()["code"] == 404
  assert response.json()["status"] == "Not Found"


def test_plan_rename_empty(
  plan
):
  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/name",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    },
    json={
      "name": ""
    }
  )
  assert response.status_code == 400
  assert response.json()["code"] == 400
  assert response.json()["status"] == "Bad Request"


def test_plan_rename_too_long(
  plan
):
  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/name",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    },
    json={
      "name": "N" * 257
    }
  )
  assert response.status_code == 400
  assert response.json()["code"] == 400
  assert response.json()["status"] == "Bad Request"
