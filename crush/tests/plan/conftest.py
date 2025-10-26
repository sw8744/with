from datetime import datetime, timedelta

import pytest

from app.models.plan.PlanMemberModel import PlanMemberModel, PlanRole
from app.models.plan.PlanModel import PlanModel


@pytest.fixture
def plan(
  access_token_factory,
  db
):
  host, host_at = access_token_factory("host_user")
  member1, m1_at = access_token_factory("member_user1")
  member2, m2_at = access_token_factory("member_user2")
  member3, m3_at = access_token_factory("member_user2")

  date_from = datetime.now()
  date_to = datetime.now() + timedelta(days=5)

  plan = PlanModel(
    name="TestPlan",
    host_id=host.uid,
    date_from=date_from,
    date_to=date_to,
    regions=[]
  )
  db.add(plan)
  db.flush()

  mhost = PlanMemberModel(
    plan_id=plan.uid,
    user_id=host.uid,
    role=PlanRole.HOST
  )
  m1 = PlanMemberModel(
    plan_id=plan.uid,
    user_id=member1.uid,
    role=PlanRole.COHOST
  )
  m2 = PlanMemberModel(
    plan_id=plan.uid,
    user_id=member2.uid,
    role=PlanRole.MEMBER
  )
  m3 = PlanMemberModel(
    plan_id=plan.uid,
    user_id=member3.uid,
    role=PlanRole.OBSERVER
  )
  db.add_all([mhost, m1, m2, m3])
  db.commit()

  yield {
    "plan": plan,
    "host": {
      "user": host,
      "at": host_at
    },
    "members": [
      {
        "user": member1,
        "at": m1_at
      },
      {
        "user": member2,
        "at": m2_at
      },
      {
        "user": member3,
        "at": m3_at
      }
    ]
  }

  db.delete(plan)
  db.commit()
