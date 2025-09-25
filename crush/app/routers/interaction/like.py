from typing import Annotated

from fastapi import APIRouter
from fastapi.params import Security, Depends
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.interaction import core_like
from app.core.user import core_user
from app.database import create_connection
from app.schemas.interaction.like_reqs import LikeRequest

router = APIRouter(
  prefix='/api/v1/interaction/like',
  tags=['interaction', 'like']
)


@router.post(
  path=''
)
def like_place(
  body: LikeRequest,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)

  identity = core_user.get_identity(token, db)
  core_like.like_place(identity, body, db)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )


@router.delete(
  path=''
)
def unlike_place(
  query: Annotated[LikeRequest, Depends()],
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)

  identity = core_user.get_identity(token, db)
  core_like.dislike_place(identity, query, db)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )
