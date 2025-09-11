from fastapi import APIRouter, Security
from starlette.responses import JSONResponse

from app.core.auth.core_authorization import authorization_header, authorize_jwt

router = APIRouter(
  prefix='/api/v1/auth',
  tags=['auth']
)


@router.get(
  path='/authorize',
)
def authorize_access_token(
  at: str = Security(authorization_header)
):
  authorize_jwt(at)

  return JSONResponse(
    status_code=200,
    content={
      "code": 200,
      "status": "OK",
      "auth": True
    }
  )
