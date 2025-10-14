from fastapi import APIRouter
from fastapi.params import Security, Depends
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.core.auth.core_authorization import authorization_header, authorize_jwt
from app.core.database.database import create_connection
from app.core.user import core_user

router = APIRouter(
  prefix="/api/v1/user",
  tags=["user"]
)


@router.get(
  path=""
)
def get_user(
  jwt: str = Security(authorization_header),
  db: Session = Depends(create_connection)
):
  token: dict[str, any] = authorize_jwt(jwt)

  identity = core_user.get_identity(token, db)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "user": identity.model_dump()
    }
  )
