from datetime import datetime, timedelta
from uuid import UUID

from starlette.testclient import TestClient

from app.main import app
from app.models.plan.PlanActivityModel import PlanActivityModel, ActivityCategory
from app.schemas.plan.PlanActivities import PlanActivity

client = TestClient(app)


def test_create_plan_activity_none_place(
  plan, db
):
  response = client.post(
    f"/api/v1/plan/{plan.get("plan").uid}/activities",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    },
    json={
      "name": "산책",
      "description": "야경보면서 산책",
      "date": datetime.now().date().isoformat(),
      "time": "18:00:00",
      "place_id": None,
      "category": 0
    }
  )

  assert response.status_code == 201
  assert response.json().get("code") == 201
  assert response.json().get("status") == "Created"

  id = response.json().get("id")
  assert id is not None
  uuid = UUID(id)

  db.expire_all()
  activity = (
    db.query(PlanActivityModel)
    .filter(PlanActivityModel.uid == uuid)
    .scalar()
  )
  assert activity is not None
  assert activity.name == "산책"
  assert activity.description == "야경보면서 산책"
  assert activity.place_id is None
  assert activity.category.value == ActivityCategory.ACTIVITY.value
  assert activity.plan_id == plan.get("plan").uid
  assert activity.at_date == datetime.now().date()
  assert activity.at_time.strftime("%H:%M:%S") == "18:00:00"

  db.delete(activity)
  db.commit()


def test_create_plan_activity_with_place(
  plan, places, db
):
  response = client.post(
    f"/api/v1/plan/{plan.get("plan").uid}/activities",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    },
    json={
      "name": "산책",
      "description": "야경보면서 산책",
      "date": datetime.now().date().isoformat(),
      "time": "18:00:00",
      "place_id": str(places[0].uid),
      "category": 0
    }
  )

  assert response.status_code == 201
  assert response.json().get("code") == 201
  assert response.json().get("status") == "Created"

  id = response.json().get("id")
  assert id is not None
  uuid = UUID(id)

  db.expire_all()
  activity = (
    db.query(PlanActivityModel)
    .filter(PlanActivityModel.uid == uuid)
    .scalar()
  )
  assert activity is not None
  assert activity.name == "산책"
  assert activity.description == "야경보면서 산책"
  assert activity.place_id == places[0].uid
  assert activity.category.value == ActivityCategory.ACTIVITY.value
  assert activity.plan_id == plan.get("plan").uid
  assert activity.at_date == datetime.now().date()
  assert activity.at_time.strftime("%H:%M:%S") == "18:00:00"

  db.delete(activity)
  db.commit()


def test_create_plan_activity_with_nonexistent_place(
  plan, db
):
  fake_uuid = UUID("123e4567-e89b-12d3-a456-426614174000")

  response = client.post(
    f"/api/v1/plan/{plan.get("plan").uid}/activities",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    },
    json={
      "name": "산책",
      "description": "야경보면서 산책",
      "date": datetime.now().date().isoformat(),
      "time": "18:00:00",
      "place_id": str(fake_uuid),
      "category": 0
    }
  )

  assert response.status_code == 400
  assert response.json()['code'] == 400
  assert response.json()['status'] == "Bad Request"
  assert response.json().get("message") == "Place does not exist"


def test_create_plan_activity_out_of_date_range(
  plan, db
):
  response = client.post(
    f"/api/v1/plan/{plan.get("plan").uid}/activities",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    },
    json={
      "name": "산책",
      "description": "야경보면서 산책",
      "date": (plan.get("plan").date_to + timedelta(days=1)).isoformat(),
      "time": "18:00:00",
      "place_id": None,
      "category": 0
    }
  )

  assert response.status_code == 400
  assert response.json()['code'] == 400
  assert response.json()['status'] == "Bad Request"
  assert response.json().get("message") == "Activity date out of plan"


def test_create_plan_by_observer(
  plan, db
):
  response = client.post(
    f"/api/v1/plan/{plan.get("plan").uid}/activities",
    headers={
      "Authorization": f"Bearer {plan.get("members")[2].get("at")}"
    },
    json={
      "name": "산책",
      "description": "야경보면서 산책",
      "date": datetime.now().date().isoformat(),
      "time": "18:00:00",
      "place_id": None,
      "category": 0
    }
  )

  assert response.status_code == 403
  assert response.json()['code'] == 403
  assert response.json()['status'] == "Forbidden"


def test_create_plan_by_outsider(
  plan, access_token_factory
):
  o, o_at = access_token_factory("outsider")

  response = client.post(
    f"/api/v1/plan/{plan.get("plan").uid}/activities",
    headers={
      "Authorization": f"Bearer {o_at}"
    },
    json={
      "name": "산책",
      "description": "야경보면서 산책",
      "date": datetime.now().date().isoformat(),
      "time": "18:00:00",
      "place_id": None,
      "category": 0
    }
  )

  assert response.status_code == 403
  assert response.json()['code'] == 403
  assert response.json()['status'] == "Forbidden"


def test_get_plan_activities(
  plan, plan_activities, db
):
  response = client.get(
    f"/api/v1/plan/{plan.get("plan").uid}/activities",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    }
  )

  assert response.status_code == 200
  assert response.json().get("code") == 200
  assert response.json().get("status") == "OK"

  assert response.json().get("activities") == [
    PlanActivity(activity).model_dump() for activity in plan_activities
  ]


def test_delete_plan_activities(
  plan, plan_activities, db
):
  to_remove = plan_activities[0].uid

  response = client.delete(
    f"/api/v1/plan/{plan.get("plan").uid}/activities/{to_remove}",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    }
  )

  assert response.status_code == 200
  assert response.json().get("code") == 200
  assert response.json().get("status") == "OK"

  db.expire_all()
  activities: list[type[PlanActivityModel]] = (
    db.query(PlanActivityModel)
    .filter(PlanActivityModel.plan_id == plan.get("plan").uid)
    .all()
  )
  assert len(activities) == 2
  assert all(activity.uid != to_remove for activity in activities)


def test_delete_plan_activity_by_observer(
  plan, plan_activities, db
):
  response = client.delete(
    f"/api/v1/plan/{plan.get("plan").uid}/activities/{plan_activities[1].uid}",
    headers={
      "Authorization": f"Bearer {plan.get("members")[2].get("at")}"
    }
  )

  assert response.status_code == 403
  assert response.json()['code'] == 403
  assert response.json()['status'] == "Forbidden"


def test_delete_plan_activity_by_outsider(
  plan, plan_activities, access_token_factory
):
  o, o_at = access_token_factory("outsider")

  response = client.delete(
    f"/api/v1/plan/{plan.get("plan").uid}/activities/{plan_activities[1].uid}",
    headers={
      "Authorization": f"Bearer {o_at}"
    }
  )

  assert response.status_code == 403
  assert response.json()['code'] == 403
  assert response.json()['status'] == "Forbidden"


def test_delete_nonexistent_plan_activity(
  plan, db
):
  fake_uuid = UUID("123e4567-e89b-12d3-a456-426614174000")

  response = client.delete(
    f"/api/v1/plan/{plan.get("plan").uid}/activities/{fake_uuid}",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    }
  )

  assert response.status_code == 404
  assert response.json()['code'] == 404
  assert response.json()['status'] == "Not Found"


def test_patch_plan_activity(
  plan, places, plan_activities, db
):
  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/activities/{plan_activities[0].uid}",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    },
    json={
      "name": "Updated Activity Name",
      "description": "Updated Description",
      "date": datetime.now().date().isoformat(),
      "time": "20:00:00",
      "place_id": str(places[1].uid),
      "category": ActivityCategory.MEAL.value
    }
  )

  assert response.status_code == 200
  assert response.json().get("code") == 200
  assert response.json().get("status") == "OK"

  db.expire_all()
  activity = (
    db.query(PlanActivityModel)
    .filter(PlanActivityModel.uid == plan_activities[0].uid)
    .scalar()
  )
  assert activity is not None
  assert activity.name == "Updated Activity Name"
  assert activity.description == "Updated Description"
  assert activity.place_id == places[1].uid
  assert activity.category.value == ActivityCategory.MEAL.value
  assert activity.at_date == datetime.now().date()
  assert activity.at_time.strftime("%H:%M:%S") == "20:00:00"
  assert activity.category == ActivityCategory.MEAL

  db.delete(activity)
  db.commit()


def test_patch_plan_activity_by_observer(
  plan, plan_activities, db
):
  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/activities/{plan_activities[1].uid}",
    headers={
      "Authorization": f"Bearer {plan.get("members")[2].get("at")}"
    },
    json={
      "name": "Updated Activity Name by Observer"
    }
  )

  assert response.status_code == 403
  assert response.json()['code'] == 403
  assert response.json()['status'] == "Forbidden"


def test_patch_plan_activity_by_outsider(
  plan, plan_activities, access_token_factory
):
  o, o_at = access_token_factory("outsider")

  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/activities/{plan_activities[1].uid}",
    headers={
      "Authorization": f"Bearer {o_at}"
    },
    json={
      "name": "Updated Activity Name by Outsider"
    }
  )

  assert response.status_code == 403
  assert response.json()['code'] == 403
  assert response.json()['status'] == "Forbidden"


def test_patch_nonexistent_plan_activity(
  plan, db
):
  fake_uuid = UUID("123e4567-e89b-12d3-a456-426614174000")

  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/activities/{fake_uuid}",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    },
    json={
      "name": "Updated Activity Name"
    }
  )

  assert response.status_code == 404
  assert response.json()['code'] == 404
  assert response.json()['status'] == "Not Found"


def test_patch_plan_activity_out_of_date_range(
  plan, plan_activities, db
):
  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/activities/{plan_activities[0].uid}",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    },
    json={
      "date": (plan.get("plan").date_to + timedelta(days=1)).isoformat()
    }
  )

  assert response.status_code == 400
  assert response.json()['code'] == 400
  assert response.json()['status'] == "Bad Request"
  assert response.json().get("message") == "Activity date out of plan"


def test_patch_plan_activity_with_nonexistent_place(
  plan, plan_activities, db
):
  fake_uuid = UUID("123e4567-e89b-12d3-a456-426614174000")

  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/activities/{plan_activities[0].uid}",
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    },
    json={
      "place_id": str(fake_uuid)
    }
  )

  assert response.status_code == 400
  assert response.json()['code'] == 400
  assert response.json()['status'] == "Bad Request"
  assert response.json().get("message") == "Place does not exist"
