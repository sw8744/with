import logging
from uuid import UUID

from fastapi import APIRouter
from fastapi.params import Security, Depends
from sqlalchemy.orm.session import Session
from starlette.responses import JSONResponse

from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.database.database import create_connection
from app.core.plan import core_plan_members
from app.core.user.core_jwt import require_role, get_sub, Role
from app.schemas.plan.PlanMemberRequests import PatchPlanMemberReqs

log = logging.getLogger(__name__)

router = APIRouter(
  prefix="/api/v1/plan/{plan_id}/members",
  tags=["plan"]
)


@router.patch(
  path=""
)
def patch_plan_members(
  req: PatchPlanMemberReqs,
  plan_id: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  sub = get_sub(token)
  log.info("Patching members of plan %r to %r", plan_id, req.members)
  core_plan_members.patch_members(plan_id, req, sub, db)
  log.info("Patching members of plan %r was committed", plan_id)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )
