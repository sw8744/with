from typing import Annotated

from fastapi import APIRouter
from fastapi.params import Security, Query, Depends
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.database.database import create_connection
from app.core.recommendation import core_recommendation
from app.core.user import core_user
from app.schemas.recommendation.recommendation_reqs import RecommendByUsersParam

router = APIRouter(
  prefix="/api/v1/recommendation",
  tags=['recommendation']
)


@router.get(
  path='/region'
)
def recommend_region_from_users(
  users: Annotated[RecommendByUsersParam, Query()],
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token = authorize_jwt(jwt)
  identity = core_user.get_identity(token, db)

  recommendation = core_recommendation.recommend_region_from_users(identity, users, db)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "recommendation": recommendation
    }
  )
