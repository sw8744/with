import logging
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.plan.core_plan import get_plan_with_role
from app.models.locations.PlaceModel import PlaceModel
from app.models.plan.PlanActivityModel import PlanActivityModel
from app.models.plan.PlanMemberModel import PlanRole
from app.schemas.plan.PlanActivities import PlanActivity
from app.schemas.plan.plan_activity_reqs import CreatePlanActivityRequest, PatchPlanActivityRequest

log = logging.getLogger(__name__)


def get_plan_activities(
  plan_id: UUID,
  sub: UUID,
  db: Session
) -> list[PlanActivity]:
  plan = get_plan_with_role(plan_id, sub, db, PlanRole.HOST, PlanRole.COHOST, PlanRole.MEMBER)

  activities: list[type[PlanActivityModel]] = (
    db.query(PlanActivityModel)
    .filter(PlanActivityModel.plan_id == plan.uid)
    .order_by(PlanActivityModel.at_date.asc(), PlanActivityModel.at_time.asc())
    .all()
  )
  return [PlanActivity(activity).model_dump() for activity in activities]


def create_activity(
  plan_id: UUID,
  sub: UUID,
  request: CreatePlanActivityRequest,
  db: Session
) -> UUID:
  plan = get_plan_with_role(plan_id, sub, db, PlanRole.HOST, PlanRole.COHOST, PlanRole.MEMBER)

  if plan.date_from is None or plan.date_to is None:
    log.error("Plan %r has no planned date", plan.uid, plan.date_from, plan.date_to)
    raise HTTPException(status_code=400, detail="No planned date")
  if not (plan.date_from <= request.date <= plan.date_to):
    log.error("Activity date %r is out of plan date range %r - %r", request.date, plan.date_from, plan.date_to)
    raise HTTPException(status_code=400, detail=f"Activity date out of plan")
  if request.place_id is not None:
    place_not_exists = (
      db.query(PlaceModel)
      .filter(
        PlaceModel.uid == request.place_id
      )
      .scalar() is None
    )
    if place_not_exists:
      log.error("Place %r does not exist in plan %r", request.place_id, plan.uid)
      raise HTTPException(status_code=400, detail="Place does not exist")

  new_activity = PlanActivityModel(
    plan_id=plan.uid,
    name=request.name,
    description=request.description,
    at_date=request.date,
    at_time=request.time,
    place_id=request.place_id,
    category=request.category
  )
  db.add(new_activity)
  db.commit()
  db.refresh(new_activity)

  return new_activity.uid


def delete_activity(
  plan_id: UUID,
  activity_id: UUID,
  requestor_id: UUID,
  db: Session
):
  plan = get_plan_with_role(plan_id, requestor_id, db, PlanRole.HOST, PlanRole.COHOST, PlanRole.MEMBER)

  activity = (
    db.query(PlanActivityModel)
    .filter(PlanActivityModel.uid == activity_id)
    .scalar()
  )

  if activity is None:
    log.error("Activity %r does not exist in plan %r", activity_id, plan.uid)
    raise HTTPException(status_code=404, detail="Activity does not exist")

  db.delete(activity)
  db.commit()


def update_activity(
  plan_id: UUID,
  activity_id: UUID,
  requestor_id: UUID,
  request: PatchPlanActivityRequest,
  db: Session
):
  plan = get_plan_with_role(plan_id, requestor_id, db, PlanRole.HOST, PlanRole.COHOST, PlanRole.MEMBER)

  activity: PlanActivityModel = (
    db.query(PlanActivityModel)
    .filter(PlanActivityModel.uid == activity_id)
    .scalar()
  )

  if activity is None:
    log.error("Activity %r does not exist in plan %r", activity_id, plan.uid)
    raise HTTPException(status_code=404, detail="Activity does not exist")

  if request.name is not None:
    log.debug("Applying change of name in activity %r: %r -> %r", activity.uid, activity.name, request.name)
    activity.name = request.name
  if request.description is not None:
    log.debug("Applying change of description in activity %r: %r -> %r", activity.uid, activity.description,
              request.description)
    activity.description = request.description
  if request.date is not None:
    if plan.date_from <= request.date <= plan.date_to:
      log.debug("Applying change of date in activity %r: %r -> %r", activity.uid, activity.at_date, request.date)
      activity.at_date = request.date
    else:
      log.error("Activity date %r is out of plan date range %r - %r", request.date, plan.date_from, plan.date_to)
      raise HTTPException(status_code=400, detail=f"Activity date out of plan")
  if request.time is not None:
    log.debug("Applying change of time in activity %r: %r -> %r", activity.uid, activity.at_time, request.time)
    activity.at_time = request.time
  if request.place_id is not None:
    place_not_exists = (
      db.query(PlaceModel)
      .filter(
        PlaceModel.uid == request.place_id
      )
      .scalar() is None
    )
    if place_not_exists:
      log.error("Place %r does not exist in plan %r", request.place_id, plan.uid)
      raise HTTPException(status_code=400, detail="Place does not exist")
    log.debug("Applying change of place_id in activity %r: %r -> %r", activity.uid, activity.place_id, request.place_id)
    activity.place_id = request.place_id
  if request.category is not None:
    log.debug("Applying change of category in activity %r: %r -> %r", activity.uid, activity.category, request.category)
    activity.category = request.category

  db.commit()
