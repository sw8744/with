import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

import jwt
from jwt import InvalidTokenError

from app.core.config_store import config

KST = timezone(timedelta(hours=9))


def create_access_token(user_id: UUID, role: list[str]) -> str:
  payload = {
    'aud': role,
    'sub': str(user_id),
    'exp': datetime.now(KST) + timedelta(minutes=10),
    'iat': datetime.now(KST),
    'iss': 'with',
  }

  return jwt.encode(
    payload=payload,
    key=config['security']['jwt_secret'],
    algorithm='HS256',
  )


def create_refresh_token(user_id: UUID) -> str:
  refresh_token_uid = uuid.uuid4()

  payload = {
    'sub': str(user_id),
    'exp': datetime.now(KST) + timedelta(weeks=4),
    'iat': datetime.now(KST),
    'iss': 'with',
    'rti': str(refresh_token_uid)
  }

  return jwt.encode(
    payload=payload,
    key=config['security']['jwt_secret'],
    algorithm='HS256',
  )


def validate_access_token(token: str) -> bool:
  try:
    jwt.decode(
      jwt=token,
      key=config['security']['jwt_secret'],
      algorithms=['HS256'],
      verify_signature=True,
      issuer='with',
      require=['aud', 'exp', 'iat', 'iss', 'sub'],
      audience=['core:user']
    )
  except InvalidTokenError:
    return False
  return True


def decode_access_token(token: str) -> dict:
  return jwt.decode(
    jwt=token,
    key=config['security']['jwt_secret'],
    algorithms=['HS256'],
    verify_signature=True,
    issuer='with',
    require=['aud', 'exp', 'iat', 'iss', 'sub'],
    audience=['core:user'],
  )


def get_sub(token: dict) -> Optional[UUID]:
  sub = token.get('sub')
  if sub is None:
    return None
  if not re.match('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', sub):
    raise ValueError('Invalid sub as UUID')
  return UUID(sub)


def get_aud(token: dict) -> Optional[list[str]]:
  aud = token.get('aud')
  if aud is None:
    return []
  return aud
