import logging
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.locations.RegionModel import RegionModel
from app.models.plan.PlanMemberModel import PlanMemberModel, PlanRole
from app.models.plan.PlanModel import PlanModel
from app.models.users.RelationshipModel import RelationshipModel, RelationshipState
from app.schemas.plan.Plan import Plan
from app.schemas.plan.plan_reqs import AddPlanRequest

log = logging.getLogger(__name__)


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
