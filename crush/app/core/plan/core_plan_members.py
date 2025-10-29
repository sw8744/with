import logging
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.plan.PlanMemberModel import PlanMemberModel, PlanRole
from app.models.plan.PlanModel import PlanModel
from app.models.users.RelationshipModel import RelationshipModel, RelationshipState
from app.schemas.plan.plan_member_reqs import PatchPlanMemberReqs

log = logging.getLogger(__name__)


def patch_members(
  plan_uuid: UUID,
  req: PatchPlanMemberReqs,
  sub: UUID,
  db: Session
):
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
  if not plan_member or plan_member.role.value > PlanRole.COHOST.value:
    log.warning("User %r is not authorized to change members in plan %r", sub, plan_uuid)
    raise HTTPException(status_code=403, detail="Forbidden")

  # 요청자는 members에게 친구 관계여야 함
  relationship_check = (
    db.query(RelationshipModel)
    .filter(
      RelationshipModel.user_id == sub,
      RelationshipModel.friend_id.in_(req.members),
      RelationshipModel.state >= RelationshipState.FRIEND
    )
    .count()
  )

  if relationship_check != len(req.members):
    log.warning("Invalid member patch request: requested %d members, only %d are friends", len(req.members),
                relationship_check)
    raise HTTPException(status_code=400, detail="All plan members must be friends with the you")

  current_members: list[PlanMemberModel] = plan.members
  existing_uuids = [m.user_id for m in current_members]

  for member in req.members:
    if member not in existing_uuids:
      new_member = PlanMemberModel(
        plan_id=plan.uid,
        user_id=member,
        role=PlanRole.MEMBER
      )
      db.add(new_member)

  for member in current_members:
    if member.user_id not in req.members and member.role != PlanRole.HOST:
      db.delete(member)

  db.commit()
