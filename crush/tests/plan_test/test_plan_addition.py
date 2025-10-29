import json
from datetime import datetime, timedelta

from starlette.testclient import TestClient

from app.main import app
from app.models.plan.PlanModel import PlanModel
from app.models.users.RelationshipModel import RelationshipState

client = TestClient(app)


def test_plan_addition(
  access_token_factory,
  relation_factory,
  regions,
  places,
  db
):
  h, h_at = access_token_factory("host")
  m1, m1_at = access_token_factory("member1")
  m2, m2_at = access_token_factory("member2")
  relation_factory(h, m1, RelationshipState.FRIEND)
  relation_factory(h, m2, RelationshipState.FRIEND)

  date_from = datetime.now().isoformat()
  date_to = (datetime.now() + timedelta(days=5)).isoformat()

  response = client.post(
    "/api/v1/plan",
    headers={
      "Authorization": f"Bearer {h_at}"
    },
    content=json.dumps({
      "name": "TestPlan",
      "members": [
        str(m1.uid),
        str(m2.uid)
      ],
      "regions": [
        str(regions[0].uid),
        str(regions[1].uid)
      ],
      "places": [
        str(places[0].uid),
        str(places[1].uid),
        str(places[4].uid),
        str(places[5].uid)
      ],
      "themes": [],
      "dateFrom": date_from,
      "dateTo": date_to
    })
  )

  assert response.status_code == 201
  assert response.json()["code"] == 201
  assert response.json()["status"] == "CREATED"
  assert response.json()["plan"]["uid"] is not None
  assert response.json()["plan"]["name"] == "TestPlan"
  assert response.json()["plan"]["host_id"] == str(h.uid)
  assert response.json()["plan"]["date_from"] == date_from[:11] + "00:00:00"
  assert response.json()["plan"]["date_to"] == date_to[:11] + "00:00:00"

  new_plan = db.query(PlanModel).filter(PlanModel.uid == response.json()["plan"]["uid"]).scalar()
  assert new_plan is not None

  db.delete(new_plan)
  db.commit()


def test_plan_addition_host_duplicated(
  access_token_factory,
  relation_factory,
  regions,
  places,
  db
):
  h, h_at = access_token_factory("host")
  m1, m1_at = access_token_factory("member1")
  m2, m2_at = access_token_factory("member2")
  relation_factory(h, m1, RelationshipState.FRIEND)
  relation_factory(h, m2, RelationshipState.FRIEND)

  date_from = datetime.now().isoformat()
  date_to = (datetime.now() + timedelta(days=5)).isoformat()

  response = client.post(
    "/api/v1/plan",
    headers={
      "Authorization": f"Bearer {h_at}"
    },
    content=json.dumps({
      "name": "TestPlan",
      "members": [
        str(h.uid),
        str(m1.uid),
        str(m2.uid)
      ],
      "regions": [
        str(regions[0].uid),
        str(regions[1].uid)
      ],
      "places": [
        str(places[0].uid),
        str(places[1].uid),
        str(places[4].uid),
        str(places[5].uid)
      ],
      "themes": [],
      "dateFrom": date_from,
      "dateTo": date_to
    })
  )

  assert response.status_code == 400
  assert response.json()["code"] == 400
  assert response.json()["status"] == "Bad Request"
  assert response.json()["message"] == "Host cannot be a member"


def test_plan_addition_imaginary_region(
  access_token_factory,
  relation_factory,
  db
):
  h, h_at = access_token_factory("host")
  m1, m1_at = access_token_factory("member1")
  m2, m2_at = access_token_factory("member2")
  relation_factory(h, m1, RelationshipState.FRIEND)
  relation_factory(h, m2, RelationshipState.FRIEND)

  date_from = datetime.now().isoformat()
  date_to = (datetime.now() + timedelta(days=5)).isoformat()

  response = client.post(
    "/api/v1/plan",
    headers={
      "Authorization": f"Bearer {h_at}"
    },
    content=json.dumps({
      "name": "TestPlan",
      "members": [
        str(m1.uid),
        str(m2.uid)
      ],
      "regions": [
        "52427ab6-8354-4089-8082-1e14e5a5113a",
        "a7b1f4d2-3c4b-4f5e-9d6a-2b3c4d5e6f70"
      ],
      "places": [],
      "themes": [],
      "dateFrom": date_from,
      "dateTo": date_to
    })
  )

  assert response.status_code == 400
  assert response.json()["code"] == 400
  assert response.json()["status"] == "Bad Request"
  assert response.json()["message"] == "Region was does not found"


def test_plan_addition_too_many_members(
  access_token_factory,
  identity_factory,
  relation_factory,
  regions,
  places,
  db
):
  h, h_at = access_token_factory("host")
  members: list[str] = []
  for i in range(101):
    member_identity = identity_factory(f"member{i}")
    relation_factory(h, member_identity, RelationshipState.FRIEND)
    members.append(str(member_identity.uid))

  date_from = datetime.now().isoformat()
  date_to = (datetime.now() + timedelta(days=5)).isoformat()

  response = client.post(
    "/api/v1/plan",
    headers={
      "Authorization": f"Bearer {h_at}"
    },
    content=json.dumps({
      "name": "TestPlan",
      "members": members,
      "regions": [
        str(regions[0].uid),
        str(regions[1].uid)
      ],
      "places": [
        str(places[0].uid),
        str(places[1].uid),
        str(places[4].uid),
        str(places[5].uid)
      ],
      "themes": [],
      "dateFrom": date_from,
      "dateTo": date_to
    })
  )

  assert response.status_code == 400
  assert response.json()["code"] == 400
  assert response.json()["status"] == "Bad Request"
