from uuid import UUID

from fastapi import APIRouter
from fastapi.params import Security, Depends
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.relationship import core_follower
from app.core.user import core_user
from app.database import create_connection
from app.schemas.relationship.following_reqs import FollowPatchRequest

router = APIRouter(
  prefix="/api/v1/user/follower"
)


@router.get(
  path='/{follower_id}'
)
def query_relationship(
  follower_id: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token: dict[str, str] = authorize_jwt(jwt)
  identity = core_user.get_identity(token, db)
  relation = core_follower.query_follower(identity, follower_id, db)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "relationship": relation.value if relation is not None else -1
    }
  )


@router.delete(
  path='/{follower_id}'
)
def unfollow(
  follower_id: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token: dict[str, str] = authorize_jwt(jwt)
  identity = core_user.get_identity(token, db)
  core_follower.unfollow(identity, follower_id, db)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )


@router.patch(
  path='/{follower_id}'
)
def patch_relationship(
  follower_id: UUID,
  body: FollowPatchRequest,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token: dict[str, str] = authorize_jwt(jwt)
  identity = core_user.get_identity(token, db)

  core_follower.patch_relationship(identity, follower_id, body, db)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )
