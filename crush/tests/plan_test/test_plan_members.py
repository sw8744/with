from unittest import TestCase

from starlette.testclient import TestClient

from app.main import app
from app.models.plan.PlanMemberModel import PlanMemberModel
from app.models.users.RelationshipModel import RelationshipState

client = TestClient(app)


def test_plan_member_patch(
  plan,
  identity, relation_factory,
  db
):
  new_members = [
    str(plan.get("members")[0].get("user").uid),
    str(plan.get("members")[2].get("user").uid),
    str(identity.uid)
  ]
  relation_factory(plan.get("host").get("user"), identity, RelationshipState.FRIEND)

  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/members",
    json={
      "members": new_members
    },
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    }
  )

  assert response.status_code == 200
  assert response.json()['code'] == 200
  assert response.json()['status'] == "OK"

  new_plan_members: list[type[PlanMemberModel]] = (
    db.query(PlanMemberModel)
    .filter(PlanMemberModel.plan_id == plan.get("plan").uid)
    .all()
  )

  case = TestCase()
  new_uuids = [str(m.user_id) for m in new_plan_members]
  case.assertCountEqual(
    new_uuids,
    new_members + [str(plan.get("host").get("user").uid)]
  )


def test_plan_member_patch_by_member(
  plan,
  identity, relation_factory
):
  new_members = [
    str(plan.get("members")[0].get("user").uid),
    str(plan.get("members")[2].get("user").uid),
    str(identity.uid)
  ]
  relation_factory(plan.get("host").get("user"), identity, RelationshipState.FRIEND)

  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/members",
    json={
      "members": new_members
    },
    headers={
      "Authorization": f"Bearer {plan.get("members")[1].get("at")}"
    }
  )

  assert response.status_code == 403
  assert response.json()['code'] == 403
  assert response.json()['status'] == "Forbidden"


def test_plan_member_patch_by_outsider(
  plan,
  access_token_factory, relation_factory
):
  o, o_at = access_token_factory("outsider")
  relation_factory(plan.get("host").get("user"), o, RelationshipState.FRIEND)

  new_members = [
    str(plan.get("members")[0].get("user").uid),
    str(plan.get("members")[2].get("user").uid),
    str(o.uid)
  ]

  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/members",
    json={
      "members": new_members
    },
    headers={
      "Authorization": f"Bearer {o_at}"
    }
  )

  assert response.status_code == 403
  assert response.json()['code'] == 403
  assert response.json()['status'] == "Forbidden"


def test_plan_member_patch_too_many_members(
  plan, identity_factory, relation_factory
):
  uuids: list[str] = []
  for i in range(101):
    u = identity_factory(f"user{i}")
    relation_factory(plan.get("host").get("user"), u, RelationshipState.FRIEND)
    uuids.append(str(u.uid))

  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/members",
    json={
      "members": uuids
    },
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    }
  )

  assert response.status_code == 400
  assert response.json()['code'] == 400
  assert response.json()['status'] == "Bad Request"


def test_plan_member_patch_not_friend(
  plan,
  identity,
  db
):
  new_members = [
    str(plan.get("members")[0].get("user").uid),
    str(plan.get("members")[2].get("user").uid),
    str(identity.uid)
  ]

  response = client.patch(
    f"/api/v1/plan/{plan.get("plan").uid}/members",
    json={
      "members": new_members
    },
    headers={
      "Authorization": f"Bearer {plan.get("host").get("at")}"
    }
  )

  assert response.status_code == 400
  assert response.json()['code'] == 400
  assert response.json()['status'] == "Bad Request"
  assert response.json()['message'] == "All plan members must be friends with the you"
