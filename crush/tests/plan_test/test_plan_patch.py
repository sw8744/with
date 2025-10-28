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
