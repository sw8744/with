import logging
from uuid import UUID

from fastapi import APIRouter
from fastapi.params import Security, Depends
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.database.database import create_connection
from app.core.plan import core_plan
from app.core.user.core_jwt import require_role, Role, get_sub
from app.schemas.plan.plan_reqs import AddPlanRequest, FixDateRequest, ChangePlanNameRequest

log = logging.getLogger(__name__)

router = APIRouter(
  prefix="/api/v1/plan",
  tags=["plan"]
)


@router.post(
  path=""
)
def add_plan(
  req: AddPlanRequest,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  log.info("Adding plan. new_plan=[%s]", req)
  new_plan = core_plan.create_plan(get_sub(token), req, db)
  log.info("New plan uid=%r, name=%r was committed", new_plan.uid, new_plan.name)

  return JSONResponse(
    status_code=201,
    content={
      "code": 201,
      "status": "CREATED",
      "plan": new_plan.model_dump()
    }
  )


@router.get(
  path=""
)
def list_plans(
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  sub = get_sub(token)
  log.info("Listing plans of user %r", sub)
  plans = core_plan.list_plans(sub, db)
  log.info("Found %d plans for %r", len(plans), sub)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "plans": [plan.model_dump() for plan in plans]
    }
  )

@router.get(
  path="/{plan_id}"
)
def get_plan(
  plan_id: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  log.info("Searching plan. plan_id=[%s]", plan_id)
  plan = core_plan.get_plan(plan_id, get_sub(token), db)
  log.info("Found plan uid=%r, name=%r", plan.get("uid"), plan.get("name"))

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "plan": plan
    }
  )


@router.patch(
  path="/{plan_id}/date"
)
def fix_date(
  plan_id: UUID,
  request: FixDateRequest,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  log.info("Fixing plan date. plan_id=[%s]", plan_id)
  core_plan.fix_plan_date(request, plan_id, get_sub(token), db)
  log.info("Fix of plan uid=%r was committed", plan_id)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )


@router.patch(
  path="/{plan_id}/name"
)
def change_name(
  request: ChangePlanNameRequest,
  plan_id: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  log.info("Changing name of plan %r", plan_id)
  core_plan.change_plan_name(request, plan_id, get_sub(token), db)
  log.info("Change of name in plan uid=%r was committed", plan_id)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )
