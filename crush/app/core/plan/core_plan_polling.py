import logging
from datetime import date, datetime
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.plan.core_plan import get_plan_with_role
from app.models.plan.PlanMemberModel import PlanRole
from app.models.plan.PlanPollModel import PlanPollingModel
from app.schemas.plan.PlanDatePollingRequests import PollBeginRequest, PollVoteRequest

log = logging.getLogger(__name__)


def open_polling(
  request: PollBeginRequest,
  plan_id: UUID,
  sub: UUID,
  db: Session
):
  plan = get_plan_with_role(plan_id, sub, db, PlanRole.HOST, PlanRole.COHOST)

  if plan.polling_date is not None and datetime.now() <= plan.polling_date:
    log.warning("Polling is already opened in plan %r", plan_id)
    raise HTTPException(status_code=400, detail="Polling is already opened")

  for vote in plan.votes:
    db.delete(vote)

  plan.date_from = request.date_from,
  plan.date_to = request.date_to,
  plan.polling_date = request.end_in

  db.commit()


def close_polling(
  plan_id: UUID,
  sub: UUID,
  db: Session
):
  plan = get_plan_with_role(plan_id, sub, db, PlanRole.HOST, PlanRole.COHOST)

  if plan.polling_date is None or plan.polling_date < datetime.now():
    log.warning("Polling is not opened in plan %r", plan_id)
    raise HTTPException(status_code=400, detail="Polling is not opened")

  plan.polling_date = datetime.now()
  db.commit()


def vote(
  plan_id: UUID,
  sub: UUID,
  voting: PollVoteRequest,
  db: Session
):
  plan = get_plan_with_role(plan_id, sub, db, PlanRole.HOST, PlanRole.COHOST, PlanRole.MEMBER)

  if not plan.polling_date or plan.polling_date < datetime.now():
    log.warning("Polling is not opened in plan %r", plan_id)
    raise HTTPException(status_code=400, detail="Polling is not opened")

  for date in voting.dates:
    if date < plan.date_from or date > plan.date_to:
      log.warning("Voted date %r is out of range in plan %r", date, plan_id)
      raise HTTPException(status_code=400, detail="Date out of range")

  existing: Optional[PlanPollingModel] = (
    db.query(PlanPollingModel)
    .filter(
      PlanPollingModel.plan_id == plan.uid,
      PlanPollingModel.user_id == sub
    )
    .scalar()
  )
  if existing:
    existing.dates = voting.dates
  else:
    vote_paper = PlanPollingModel(
      plan_id=plan.uid,
      user_id=sub,
      dates=voting.dates
    )
    db.add(vote_paper)
  db.commit()


def find_my_vote(
  plan_id: UUID,
  sub: UUID,
  db: Session
) -> list[date]:
  plan = get_plan_with_role(plan_id, sub, db, PlanRole.HOST, PlanRole.COHOST, PlanRole.MEMBER, PlanRole.OBSERVER)

  existing: Optional[PlanPollingModel] = (
    db.query(PlanPollingModel)
    .filter(
      PlanPollingModel.plan_id == plan.uid,
      PlanPollingModel.user_id == sub
    )
    .scalar()
  )

  if existing:
    return existing.dates
  else:
    return []


def get_poll_status(
  plan_id: UUID,
  sub: UUID,
  db: Session
):
  plan = get_plan_with_role(plan_id, sub, db, PlanRole.HOST, PlanRole.COHOST, PlanRole.MEMBER, PlanRole.OBSERVER)

  votes: list[PlanPollingModel] = plan.votes
  date_counts: dict[date, int] = {}
  for vote in votes:
    for voted_date in vote.dates:
      if voted_date in date_counts:
        date_counts[voted_date] += 1
      else:
        date_counts[voted_date] = 1

  return {
    "pollingOpen": plan.polling_date.isoformat() if plan.polling_date else None,
    "dateFrom": plan.date_from.isoformat() if plan.date_from else None,
    "dateTo": plan.date_to.isoformat() if plan.date_to else None,
    "voted": len(votes),
    "votes": {
      date.isoformat(): count for date, count in date_counts.items()
    }
  }
