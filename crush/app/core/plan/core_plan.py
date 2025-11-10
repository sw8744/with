import logging
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.locations.RegionModel import RegionModel
from app.models.plan.PlanMemberModel import PlanMemberModel, PlanRole
from app.models.plan.PlanModel import PlanModel
from app.models.users.RelationshipModel import RelationshipModel, RelationshipState
from app.schemas.plan.Plan import Plan
from app.schemas.plan.plan_reqs import AddPlanRequest, FixDateRequest, ChangePlanNameRequest

log = logging.getLogger(__name__)


def get_plan_with_role(
  plan_id: UUID,
  user_id: UUID,
  db: Session,
  *accepted_roles: PlanRole
) -> PlanModel:
  plan_model: PlanModel = (
    db.query(PlanModel)
    .filter(PlanModel.uid == plan_id)
    .scalar()
  )

  if plan_model is None:
    log.warning("Plan uid=%r with uid=%r and roles=%r was not found", plan_id, user_id, accepted_roles)
    raise HTTPException(status_code=404, detail="Plan not found")

  member: PlanMemberModel = (
    db.query(PlanMemberModel)
    .filter(
      PlanMemberModel.plan_id == plan_model.uid,
      PlanMemberModel.user_id == user_id
    )
    .scalar()
  )

  if member is None or member.role not in accepted_roles:
    log.warning("User %r does not have required role in plan %r. required_roles=%r, actual_role=%r",
                user_id, plan_id, accepted_roles, member.role if member else None)
    raise HTTPException(status_code=403, detail="Forbidden")

  return plan_model


def create_plan(
  host_id: UUID,
  new_plan: AddPlanRequest,
  db: Session
) -> Plan:
  # host_id가 members에 포함되어 있으면 안됨
  if host_id in new_plan.members:
    log.warning("Invalid Plan addition request: Host ID %r is in members list %r", host_id, new_plan.members)
    raise HTTPException(status_code=400, detail="Host cannot be a member")

  # members가 중복되면 안됨
  if len(new_plan.members) != len(set(new_plan.members)):
    log.warning("Invalid Plan addition request: Members list %r contains duplicates", new_plan.members)
    raise HTTPException(status_code=400, detail="Members contain duplicated user IDs")

  # host는 members에게 친구 관계여야 함
  relationship_check = (
    db.query(RelationshipModel)
    .filter(
      RelationshipModel.user_id == host_id,
      RelationshipModel.friend_id.in_(new_plan.members),
      RelationshipModel.state >= RelationshipState.FRIEND
    )
    .count()
  )

  if relationship_check != len(new_plan.members):
    log.warning("Invalid Plan addition request: requested %d members, only %d are friends", len(new_plan.members),
                relationship_check)
    raise HTTPException(status_code=400, detail="Host must be friend with all members")

  # regions가 실제 있는 region인지 검증
  regions_check = (
    db.query(RegionModel)
    .filter(
      RegionModel.uid.in_(new_plan.regions)
    )
    .count()
  )
  if regions_check != len(new_plan.regions):
    log.warning("Invalid Plan addition request: requested %d regions. only %d are in database", len(new_plan.regions),
                regions_check)
    raise HTTPException(status_code=400, detail=f"Region was does not found")

  new_plan_model = PlanModel(
    name=new_plan.name,
    host_id=host_id,
    date_from=new_plan.date_from,
    date_to=new_plan.date_to,
    regions=new_plan.regions
  )
  db.add(new_plan_model)
  db.flush()

  for member in new_plan.members:
    new_member = PlanMemberModel(
      plan_id=new_plan_model.uid,
      user_id=member,
      role=PlanRole.MEMBER
    )
    db.add(new_member)

  host_member = PlanMemberModel(
    plan_id=new_plan_model.uid,
    user_id=host_id,
    role=PlanRole.HOST
  )
  db.add(host_member)

  db.commit()

  return Plan(new_plan_model)


def get_plan(
  plan_id: UUID,
  identity_uuid: UUID,
  db: Session
) -> dict[str, object]:
  plan_model = (
    db.query(PlanModel)
    .join(PlanMemberModel, PlanModel.uid == PlanMemberModel.plan_id)
    .filter(
      PlanModel.uid == plan_id,
      PlanMemberModel.user_id == identity_uuid
    )
    .scalar()
  )

  if plan_model is None:
    log.warning("Plan uid=%r with uid=%r is a member was not found", plan_id, identity_uuid)
    raise HTTPException(status_code=404, detail="Plan not found")

  members: list[type[PlanMemberModel]] = (
    db.query(PlanMemberModel)
    .filter(PlanMemberModel.plan_id == plan_model.uid)
    .all()
  )

  return {
    "uid": str(plan_model.uid),
    "name": plan_model.name,
    "date": {
      "polling": plan_model.polling_date.isoformat() if plan_model.polling_date else None,
      "from": plan_model.date_from.isoformat() if plan_model.date_from else None,
      "to": plan_model.date_to.isoformat() if plan_model.date_to else None
    },
    "members": [
      {
        "uid": str(member.user_id),
        "name": member.user.name,
        "role": member.role.value
      }
      for member in members
    ]
  }


def fix_plan_date(
  request: FixDateRequest,
  plan_id: UUID,
  requester_id: UUID,
  db: Session
):
  plan = get_plan_with_role(plan_id, requester_id, db, PlanRole.HOST, PlanRole.COHOST)

  if request.date_from > request.date_to:
    log.warning("Cannot fix to reversed date range in plan %r. requested_by=%r", plan_id, requester_id)
    raise HTTPException(status_code=400, detail="Reversed date")

  plan.date_from = request.date_from
  plan.date_to = request.date_to
  plan.polling_date = None
  db.commit()


def change_plan_name(
  request: ChangePlanNameRequest,
  plan_id: UUID,
  sub: UUID,
  db: Session
):
  plan = get_plan_with_role(plan_id, sub, db, PlanRole.HOST, PlanRole.COHOST, PlanRole.MEMBER)

  plan.name = request.name
  db.commit()


def list_plans(
  sub: UUID,
  db: Session
) -> list[Plan]:
  plans: list[type[PlanModel]] = (
    db.query(PlanModel)
    .join(PlanMemberModel, PlanModel.uid == PlanMemberModel.plan_id)
    .filter(PlanMemberModel.user_id == sub)
    .order_by(PlanModel.created_at.desc())
    .all()
  )

  return [Plan(plan) for plan in plans]
