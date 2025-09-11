from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Cookie, HTTPException
from fastapi.params import Depends
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.config_store import config
from app.core.user import core_user
from app.core.user.core_login import login
from app.database import create_connection
from app.schemas.user.register_reqs import RegisterIdentityReq

router = APIRouter(
  prefix="/api/v1/user/register",
  tags=["register", "user"]
)


@router.post(
  path=""
)
def register_user(
  application: RegisterIdentityReq,
  db: Session = Depends(create_connection),
  session: Annotated[UUID | None, Cookie()] = None
):
  if session is not None:
    identity = core_user.register_using_session(application, session, db)
  else:
    raise HTTPException(status_code=400, detail="invalid register request")

  access_token, refresh_token = login(identity)

  response = JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "jwt": access_token
    }
  )

  response.delete_cookie('session')
  response.set_cookie(
    'WAUTHREF',
    refresh_token,
    max_age=2592000,
    httponly=True,
    samesite='strict',
    secure=config['cookie']['secure'],
    path='/api/v1'
  )
  return response
