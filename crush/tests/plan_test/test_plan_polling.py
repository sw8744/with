from datetime import date, datetime, timedelta

from starlette.testclient import TestClient

from app.main import app
from app.models.plan.PlanModel import PlanModel

client = TestClient(app)


def test_open_poll(
  plan, date_vote_factory, db
):
  date_vote_factory(
    plan.get("plan").uid,
    plan.get("host").get("user").uid,
    [date(2025, 10, 28), date(2025, 10, 29)]
  )

  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/open",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    },
    json={
      "dateFrom": "2025-10-27",
      "dateTo": "2025-10-30",
      "endIn": "2025-09-30T09:00:00"
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"

  db.expire_all()
  new_plan = (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .scalar()
  )

  assert new_plan.polling_date == datetime(2025, 9, 30, 9, 0, 0)
  assert new_plan.date_from == date(2025, 10, 27)
  assert new_plan.date_to == date(2025, 10, 30)
  assert new_plan.votes == []


def test_open_poll_again(
  plan, db
):
  (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .update({
      "polling_date": datetime.now() + timedelta(days=1),
      "date_from": date(2025, 10, 27),
      "date_to": date(2025, 10, 30)
    })
  )
  db.commit()

  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/open",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    },
    json={
      "dateFrom": "2025-10-27",
      "dateTo": "2025-10-30",
      "endIn": "2025-09-30T18:00:00"
    }
  )

  assert response.status_code == 400
  assert response.json()["code"] == 400
  assert response.json()["status"] == "Bad Request"
  assert response.json()["message"] == "Polling is already opened"


def test_open_poll_by_member(
  plan, db
):
  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/open",
    headers={
      "Authorization": f"Bearer {plan.get("members")[1].get("at")}"
    },
    json={
      "dateFrom": "2025-10-27",
      "dateTo": "2025-10-30",
      "endIn": "2025-09-30T18:00:00"
    }
  )

  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["status"] == "Forbidden"
  assert response.json()["message"] == "Forbidden"


def test_open_poll_by_outsider(
  plan, access_token, db
):
  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/open",
    headers={
      "Authorization": f"Bearer {access_token}"
    },
    json={
      "dateFrom": "2025-10-27",
      "dateTo": "2025-10-30",
      "endIn": "2025-09-30T18:00:00"
    }
  )

  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["status"] == "Forbidden"
  assert response.json()["message"] == "Forbidden"


def test_close_poll(
  plan, db
):
  (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .update({
      "polling_date": datetime.now() + timedelta(days=1),
      "date_from": date(2025, 10, 27),
      "date_to": date(2025, 10, 30)
    })
  )
  db.commit()

  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/close",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"

  db.expire_all()
  new_plan = (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .scalar()
  )

  assert new_plan.polling_date <= datetime.now()


def test_close_poll_again(
  plan, db
):
  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/close",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    }
  )

  assert response.status_code == 400
  assert response.json()["code"] == 400
  assert response.json()["status"] == "Bad Request"
  assert response.json()["message"] == "Polling is not opened"


def test_close_poll_closed_by_time(
  plan, db
):
  (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .update({
      "polling_date": datetime.now() - timedelta(days=1),
      "date_from": date(2025, 10, 27),
      "date_to": date(2025, 10, 30)
    })
  )
  db.commit()

  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/close",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    }
  )

  assert response.status_code == 400
  assert response.json()["code"] == 400
  assert response.json()["status"] == "Bad Request"
  assert response.json()["message"] == "Polling is not opened"


def test_close_by_member(
  plan, db
):
  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/close",
    headers={
      "Authorization": f"Bearer {plan.get("members")[1].get("at")}"
    }
  )

  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["status"] == "Forbidden"
  assert response.json()["message"] == "Forbidden"


def test_close_by_outsider(
  plan, access_token, db
):
  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/close",
    headers={
      "Authorization": f"Bearer {access_token}"
    }
  )

  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["status"] == "Forbidden"
  assert response.json()["message"] == "Forbidden"


def test_vote(
  plan, db
):
  (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .update({
      "polling_date": datetime.now() + timedelta(days=1),
      "date_from": date(2025, 10, 27),
      "date_to": date(2025, 10, 30)
    })
  )
  db.commit()

  response = client.post(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/vote",
    headers={
      "Authorization": f"Bearer {plan.get("members")[1].get("at")}"
    },
    json={
      "dates": ["2025-10-28", "2025-10-29"]
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"

  db.expire_all()
  new_plan = (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .scalar()
  )
  assert len(new_plan.votes) == 1
  assert new_plan.votes[0].user_id == plan.get("members")[1].get("user").uid
  assert new_plan.votes[0].dates == [date(2025, 10, 28), date(2025, 10, 29)]


def test_vote_by_observer(
  plan, db
):
  (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .update({
      "polling_date": datetime.now() + timedelta(days=1),
      "date_from": date(2025, 10, 27),
      "date_to": date(2025, 10, 30)
    })
  )
  db.commit()

  response = client.post(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/vote",
    headers={
      "Authorization": f"Bearer {plan.get("members")[2].get("at")}"
    },
    json={
      "dates": ["2025-10-28", "2025-10-29"]
    }
  )

  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["status"] == "Forbidden"
  assert response.json()["message"] == "Forbidden"


def test_vote_by_outsider(
  plan, access_token, db
):
  (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .update({
      "polling_date": datetime.now() + timedelta(days=1),
      "date_from": date(2025, 10, 27),
      "date_to": date(2025, 10, 30)
    })
  )
  db.commit()

  response = client.post(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/vote",
    headers={
      "Authorization": f"Bearer {access_token}"
    },
    json={
      "dates": ["2025-10-28", "2025-10-29"]
    }
  )

  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["status"] == "Forbidden"
  assert response.json()["message"] == "Forbidden"


def test_vote_when_closed(
  plan, db
):
  response = client.post(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/vote",
    headers={
      "Authorization": f"Bearer {plan.get("members")[1].get("at")}"
    },
    json={
      "dates": ["2025-10-28", "2025-10-29"]
    }
  )

  assert response.status_code == 400
  assert response.json()["code"] == 400
  assert response.json()["status"] == "Bad Request"
  assert response.json()["message"] == "Polling is not opened"


def test_vote_when_expired(
  plan, db
):
  (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .update({
      "polling_date": datetime.now() - timedelta(days=1),
      "date_from": date(2025, 10, 27),
      "date_to": date(2025, 10, 30)
    })
  )

  response = client.post(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/vote",
    headers={
      "Authorization": f"Bearer {plan.get("members")[1].get("at")}"
    },
    json={
      "dates": ["2025-10-28", "2025-10-29"]
    }
  )

  assert response.status_code == 400
  assert response.json()["code"] == 400
  assert response.json()["status"] == "Bad Request"
  assert response.json()["message"] == "Polling is not opened"


def test_vote_out_of_range(
  plan, db
):
  (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .update({
      "polling_date": datetime.now() + timedelta(days=1),
      "date_from": date(2025, 10, 27),
      "date_to": date(2025, 10, 30)
    })
  )
  db.commit()

  response = client.post(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/vote",
    headers={
      "Authorization": f"Bearer {plan.get("members")[1].get("at")}"
    },
    json={
      "dates": ["2025-10-29", "2025-11-01"]
    }
  )

  assert response.status_code == 400
  assert response.json()["code"] == 400
  assert response.json()["status"] == "Bad Request"
  assert response.json()["message"] == "Date out of range"


def test_change_vote(
  plan, date_vote_factory, db
):
  date_vote_factory(
    plan.get("plan").uid,
    plan.get("members")[1].get("user").uid,
    [date(2025, 10, 28)]
  )

  (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .update({
      "polling_date": datetime.now() + timedelta(days=1),
      "date_from": date(2025, 10, 27),
      "date_to": date(2025, 10, 30)
    })
  )
  db.commit()

  response = client.post(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/vote",
    headers={
      "Authorization": f"Bearer {plan.get("members")[1].get("at")}"
    },
    json={
      "dates": ["2025-10-29", "2025-10-30"]
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"

  db.expire_all()
  new_plan = (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .scalar()
  )
  assert len(new_plan.votes) == 1
  assert new_plan.votes[0].user_id == plan.get("members")[1].get("user").uid
  assert new_plan.votes[0].dates == [date(2025, 10, 29), date(2025, 10, 30)]


def test_vote_nonexistent_plan(
  plan, db
):
  response = client.post(
    f"/api/v1/plan/00000000-0000-0000-0000-000000000000/poll/vote",
    headers={
      "Authorization": f"Bearer {plan.get("members")[1].get("at")}"
    },
    json={
      "dates": ["2025-10-28", "2025-10-29"]
    }
  )

  assert response.status_code == 404
  assert response.json()["code"] == 404
  assert response.json()["status"] == "Not Found"
  assert response.json()["message"] == "The requested resource could not be found"


def test_get_my_vote(
  plan, date_vote_factory, db
):
  date_vote_factory(
    plan.get("plan").uid,
    plan.get("members")[1].get("user").uid,
    [date(2025, 10, 28), date(2025, 10, 29)]
  )

  response = client.get(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/vote",
    headers={
      "Authorization": f"Bearer {plan.get("members")[1].get("at")}"
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert response.json()["vote"] == ["2025-10-28", "2025-10-29"]


def test_get_my_vote_by_observer(
  plan, db
):
  response = client.get(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/vote",
    headers={
      "Authorization": f"Bearer {plan.get("members")[2].get("at")}"
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert response.json()["vote"] == []


def test_get_my_vote_by_outsider(
  plan, access_token, db
):
  response = client.get(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/vote",
    headers={
      "Authorization": f"Bearer {access_token}"
    }
  )

  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["status"] == "Forbidden"
  assert response.json()["message"] == "Forbidden"


def test_get_my_vote_nonexistent_plan(
  plan, db
):
  response = client.get(
    f"/api/v1/plan/00000000-0000-0000-0000-000000000000/poll/vote",
    headers={
      "Authorization": f"Bearer {plan.get("members")[1].get("at")}"
    }
  )

  assert response.status_code == 404
  assert response.json()["code"] == 404
  assert response.json()["status"] == "Not Found"
  assert response.json()["message"] == "The requested resource could not be found"


def test_get_poll_status(
  plan, date_vote_factory, db
):
  end_in = datetime.now() + timedelta(days=1)
  (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan.get("plan").uid)
    .update({
      "polling_date": end_in,
      "date_from": date(2025, 10, 27),
      "date_to": date(2025, 10, 30)
    })
  )
  db.commit()

  date_vote_factory(
    plan.get("plan").uid,
    plan.get("host").get("user").uid,
    [date(2025, 10, 28), date(2025, 10, 30)]
  )
  date_vote_factory(
    plan.get("plan").uid,
    plan.get("members")[1].get("user").uid,
    [date(2025, 10, 28), date(2025, 10, 29)]
  )

  response = client.get(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/status",
    headers={
      "Authorization": f"Bearer {plan.get("members")[2].get("at")}"
    }
  )

  assert response.status_code == 200
  assert response.json()["code"] == 200
  assert response.json()["status"] == "OK"
  assert response.json()["poll"]["pollingOpen"] == end_in.isoformat()
  assert response.json()["poll"]["dateFrom"] == "2025-10-27"
  assert response.json()["poll"]["dateTo"] == "2025-10-30"
  assert response.json()["poll"]["voted"] == 2
  assert response.json()["poll"]["votes"] == {
    "2025-10-28": 2,
    "2025-10-29": 1,
    "2025-10-30": 1
  }


def test_get_poll_status_nonexistent_plan(
  plan, db
):
  response = client.get(
    f"/api/v1/plan/00000000-0000-0000-0000-000000000000/poll/status",
    headers={
      "Authorization": f"Bearer {plan.get("members")[1].get("at")}"
    }
  )

  assert response.status_code == 404
  assert response.json()["code"] == 404
  assert response.json()["status"] == "Not Found"
  assert response.json()["message"] == "The requested resource could not be found"


def test_get_poll_status_by_outsider(
  plan, access_token, db
):
  response = client.get(
    f"/api/v1/plan/{plan.get("plan").uid}/poll/status",
    headers={
      "Authorization": f"Bearer {access_token}"
    }
  )

  assert response.status_code == 403
  assert response.json()["code"] == 403
  assert response.json()["status"] == "Forbidden"
  assert response.json()["message"] == "Forbidden"
