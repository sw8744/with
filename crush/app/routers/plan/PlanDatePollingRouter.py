import logging
from uuid import UUID

from fastapi import APIRouter, Security
from fastapi.params import Depends
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.database.database import create_connection
from app.core.plan import core_plan_polling
from app.core.user.core_jwt import require_role, Role, get_sub
from app.schemas.plan.PlanDatePollingRequests import PollBeginRequest, PollVoteRequest

log = logging.getLogger(__name__)

router = APIRouter(
  prefix="/api/v1/plan/{plan_uuid}/poll",
  tags=["plan"]
)


@router.patch(
  path="/open"
)
def open_poll(
  request: PollBeginRequest,
  plan_uuid: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  log.info("Open date poll of plan %r in [%s-%s] ends in %s", plan_uuid, request.date_from.isoformat(),
           request.date_to.isoformat(), request.end_in.isoformat())
  core_plan_polling.open_polling(request, plan_uuid, get_sub(token), db)
  log.info("Opening of polling in plan %r was committed", plan_uuid)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )


@router.patch(
  path="/close"
)
def close_poll(
  plan_uuid: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  log.info("Close date poll of plan %r", plan_uuid)
  core_plan_polling.close_polling(plan_uuid, get_sub(token), db)
  log.info("Closing of polling in plan %r was committed", plan_uuid)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )


@router.post(
  path="/vote"
)
def vote(
  plan_uuid: UUID,
  voting: PollVoteRequest,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  sub = get_sub(token)
  log.info("Vote in date poll of plan %r by %r", plan_uuid, sub)
  core_plan_polling.vote(plan_uuid, sub, voting, db)
  log.info("Vote of %r in plan %r was committed", sub, plan_uuid)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )


@router.get(
  path="/vote"
)
def get_my_vote(
  plan_uuid: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  sub = get_sub(token)
  log.info("Searching vote of %r in poll of plan %r", sub, plan_uuid)
  vote = core_plan_polling.find_my_vote(plan_uuid, sub, db)
  log.info("Found vote of %r in plan %r", sub, plan_uuid)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "vote": [date.isoformat() for date in vote]
    }
  )


@router.get(
  path="/status"
)
def get_poll_status(
  plan_uuid: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  require_role(token, Role.CORE_USER)

  sub = get_sub(token)
  log.info("Getting poll status of plan %r", plan_uuid)
  status = core_plan_polling.get_poll_status(plan_uuid, sub, db)
  log.info("Got poll status of plan %r", plan_uuid)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "poll": status
    }
  )
