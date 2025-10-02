from typing import Annotated
from uuid import UUID

from fastapi import APIRouter
from fastapi.params import Security, Depends, Query
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.relationship import core_following
from app.core.user import core_user
from app.database import create_connection
from app.schemas.relationship.follow_reqs import FollowRequest, FollowPatchRequest, ListingRelationshipRequest

router = APIRouter(
  prefix="/api/v1/user/following",
  tags=["user", "relationship", "following"]
)


@router.get(
  path=""
)
def list_followings(
  query: Annotated[ListingRelationshipRequest, Query()],
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  identity = core_user.get_identity(token, db)
  followings = core_following.list_followings(identity, query, db)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "followers": [following.model_dump() for following in followings]
    }
  )


@router.get(
  path="/count"
)
def count_following(
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token: dict[str, str] = authorize_jwt(jwt)
  identity = core_user.get_identity(token, db)
  cnt = core_following.count_following(identity, db)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "count": cnt
    }
  )


@router.get(
  path="/{friend_id}"
)
def query_relationship(
  friend_id: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token: dict[str, str] = authorize_jwt(jwt)
  identity = core_user.get_identity(token, db)
  relation = core_following.query_following(identity, friend_id, db)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "relationship": relation.value if relation is not None else -1
    }
  )




@router.post(
  path=""
)
def follow(
  body: FollowRequest,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token: dict[str, str] = authorize_jwt(jwt)
  identity = core_user.get_identity(token, db)

  core_following.follow(identity, body, db)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )


@router.delete(
  path="/{friend_id}"
)
def unfollow(
  friend_id: UUID,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token: dict[str, str] = authorize_jwt(jwt)
  identity = core_user.get_identity(token, db)
  core_following.unfollow(identity, friend_id, db)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )


@router.patch(
  path="/{friend_id}"
)
def patch_relationship(
  friend_id: UUID,
  body: FollowPatchRequest,
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token: dict[str, str] = authorize_jwt(jwt)
  identity = core_user.get_identity(token, db)

  core_following.patch_relationship(identity, friend_id, body, db)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK"
    }
  )
