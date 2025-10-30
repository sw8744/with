import logging
from uuid import UUID

from fastapi import APIRouter, Security
from fastapi.params import Depends
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.database.database import create_connection
from app.core.plan import core_plan_activities
from app.core.user.core_jwt import require_role, Role, get_sub
from app.schemas.plan.plan_activity_reqs import CreatePlanActivityRequest, PatchPlanActivityRequest

log = logging.getLogger(__name__)

router = APIRouter(
  prefix="/api/v1/plan/{plan_id}/activities",
  tags=["plan"],
)


@router.get("")
def get_plan_activities(
  plan_id: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  log.info("Searching plan activities. plan_id=[%s]", plan_id)
  activities = core_plan_activities.get_plan_activities(plan_id, get_sub(token), db)
  log.info("Found %d activities for plan uid=%r", len(activities), plan_id)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "activities": [activity for activity in activities]
    }
  )


@router.post("")
def create_plan_activity(
  request: CreatePlanActivityRequest,
  plan_id: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  log.info("Creating plan activity. plan_id=[%s], request=[%s]", plan_id, request)
  aid = core_plan_activities.create_activity(plan_id, get_sub(token), request, db)
  log.info("Creation of activity for plan uid=%r was committed", plan_id)

  return JSONResponse(
    status_code=201,
    content={
      "code": 201,
      "status": "Created",
      "id": str(aid)
    }
  )


@router.patch("/{activity_id}")
def update_plan_activity(
  request: PatchPlanActivityRequest,
  plan_id: UUID,
  activity_id: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  log.info("Updating plan activity. plan_id=[%s], activity_id=[%s], request=[%s]", plan_id, activity_id, request)
  core_plan_activities.update_activity(plan_id, activity_id, get_sub(token), request, db)
  log.info("Update of activity %r from plan uid=%r was committed", activity_id, plan_id)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )


@router.delete("/{activity_id}")
def delete_plan_activity(
  plan_id: UUID,
  activity_id: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  log.info("Deleting plan activity. plan_id=[%s], activity_id=[%s]", plan_id, activity_id)
  core_plan_activities.delete_activity(plan_id, activity_id, get_sub(token), db)
  log.info("Deletion of activity %r from plan uid=%r was committed", activity_id)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )
