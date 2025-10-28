import logging
from datetime import date, datetime
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.plan.PlanMemberModel import PlanMemberModel, PlanRole
from app.models.plan.PlanModel import PlanModel
from app.models.plan.PlanPollModel import PlanPollingModel
from app.schemas.plan.plan_date_poll_reqs import PollBeginRequest, PollVoteRequest

log = logging.getLogger(__name__)


def open_polling(
  request: PollBeginRequest,
  plan_uuid: UUID,
  requester_id: UUID,
  db: Session
):
  plan: PlanModel = (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan_uuid)
    .scalar()
  )
  if not plan:
    log.warning("Plan %r not found when opening polling", plan_uuid)
    raise HTTPException(status_code=404, detail="Plan not found")

  plan_member: PlanMemberModel = (
    db.query(PlanMemberModel)
    .filter(
      PlanMemberModel.plan_id == plan.uid,
      PlanMemberModel.user_id == requester_id
    )
    .scalar()
  )
  if not plan_member or plan_member.role.value > PlanRole.COHOST.value:
    log.warning("User %r is not authorized to open polling in plan %r", requester_id, plan_uuid)
    raise HTTPException(status_code=403, detail="Forbidden")
  if plan.polling_date is not None and datetime.now() <= plan.polling_date:
    log.warning("Polling is already opened in plan %r", plan_uuid)
    raise HTTPException(status_code=400, detail="Polling is already opened")

  for vote in plan.votes:
    db.delete(vote)

  plan.date_from = request.date_from,
  plan.date_to = request.date_to,
  plan.polling_date = request.end_in

  db.commit()


def close_polling(
  plan_uuid: UUID,
  requester_id: UUID,
  db: Session
):
  plan: PlanModel = (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan_uuid)
    .scalar()
  )
  if not plan:
    log.warning("Plan %r not found when closing polling", plan_uuid)
    raise HTTPException(status_code=404, detail="Plan not found")

  plan_member: PlanMemberModel = (
    db.query(PlanMemberModel)
    .filter(
      PlanMemberModel.plan_id == plan.uid,
      PlanMemberModel.user_id == requester_id
    )
    .scalar()
  )
  if not plan_member or plan_member.role.value > PlanRole.COHOST.value:
    log.warning("User %r is not authorized to close polling in plan %r", requester_id, plan_uuid)
    raise HTTPException(status_code=403, detail="Forbidden")
  if plan.polling_date is None or plan.polling_date < datetime.now():
    log.warning("Polling is not opened in plan %r", plan_uuid)
    raise HTTPException(status_code=400, detail="Polling is not opened")

  plan.polling_date = datetime.now()
  db.commit()


def vote(
  plan_uuid: UUID,
  sub: UUID,
  voting: PollVoteRequest,
  db: Session
):
  plan: PlanModel = (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan_uuid)
    .scalar()
  )
  if not plan:
    log.warning("Plan %r not found when voting", plan_uuid)
    raise HTTPException(status_code=404, detail="Plan not found")

  plan_member: PlanMemberModel = (
    db.query(PlanMemberModel)
    .filter(
      PlanMemberModel.plan_id == plan.uid,
      PlanMemberModel.user_id == sub
    )
    .scalar()
  )
  if not plan_member or plan_member.role.value > PlanRole.MEMBER.value:
    log.warning("User %r is not authorized to vote in plan %r", sub, plan_uuid)
    raise HTTPException(status_code=403, detail="Forbidden")
  if not plan.polling_date or plan.polling_date < datetime.now():
    log.warning("Polling is not opened in plan %r", plan_uuid)
    raise HTTPException(status_code=400, detail="Polling is not opened")

  for date in voting.dates:
    if date < plan.date_from or date > plan.date_to:
      log.warning("Voted date %r is out of range in plan %r", date, plan_uuid)
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
  plan_uuid: UUID,
  sub: UUID,
  db: Session
) -> list[date]:
  plan: PlanModel = (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan_uuid)
    .scalar()
  )
  if not plan:
    log.warning("Plan %r not found when finding vote", plan_uuid)
    raise HTTPException(status_code=404, detail="Plan not found")

  plan_member: PlanMemberModel = (
    db.query(PlanMemberModel)
    .filter(
      PlanMemberModel.plan_id == plan.uid,
      PlanMemberModel.user_id == sub
    )
    .scalar()
  )
  if not plan_member:
    log.warning("User %r is not authorized to get vote in plan %r", sub, plan_uuid)
    raise HTTPException(status_code=403, detail="Forbidden")

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
  plan_uuid: UUID,
  sub: UUID,
  db: Session
):
  plan: PlanModel = (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan_uuid)
    .scalar()
  )
  if not plan:
    log.warning("Plan %r not found when aggregating votes", plan_uuid)
    raise HTTPException(status_code=404, detail="Plan not found")

  plan_member: PlanMemberModel = (
    db.query(PlanMemberModel)
    .filter(
      PlanMemberModel.plan_id == plan.uid,
      PlanMemberModel.user_id == sub
    )
    .scalar()
  )
  if not plan_member:
    log.warning("User %r is not authorized to get polling state in plan %r", sub, plan_uuid)
    raise HTTPException(status_code=403, detail="Forbidden")

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
