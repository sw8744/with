from datetime import datetime, timedelta, date
from typing import Callable
from uuid import UUID

import pytest
from typing_extensions import Generator

from app.models.plan.PlanMemberModel import PlanMemberModel, PlanRole
from app.models.plan.PlanModel import PlanModel
from app.models.plan.PlanPollModel import PlanPollingModel


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


@pytest.fixture
def date_vote_factory(
  db
) -> Generator[Callable[[UUID, UUID, list[date]], PlanPollingModel]]:
  votes: list[tuple[UUID, UUID]] = []

  def _factory(
    plan_uuid: UUID,
    user_uuid: UUID,
    dates: list[date]
  ) -> PlanPollingModel:
    vote = PlanPollingModel(
      plan_id=plan_uuid,
      user_id=user_uuid,
      dates=dates
    )
    db.add(vote)
    db.commit()
    db.refresh(vote)
    votes.append((plan_uuid, user_uuid))

    return vote

  yield _factory

  for v in votes:
    (
      db.query(PlanPollingModel)
      .filter(
        PlanPollingModel.plan_id == v[0],
        PlanPollingModel.user_id == v[1]
      )
      .delete()
    )
  db.commit()
