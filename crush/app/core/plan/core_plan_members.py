import logging
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.plan.core_plan import get_plan_with_role
from app.models.plan.PlanMemberModel import PlanMemberModel, PlanRole
from app.models.users.RelationshipModel import RelationshipModel, RelationshipState
from app.schemas.plan.PlanMemberRequests import PatchPlanMemberReqs

log = logging.getLogger(__name__)


def patch_members(
  plan_id: UUID,
  req: PatchPlanMemberReqs,
  sub: UUID,
  db: Session
):
  plan = get_plan_with_role(plan_id, sub, db, PlanRole.HOST, PlanRole.COHOST)

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
