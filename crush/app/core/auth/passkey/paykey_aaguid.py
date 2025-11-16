import json
import logging
from typing import Optional
from uuid import UUID

from pydantic.dataclasses import dataclass

from app.core.database.database import redis_aaguid_db2

log = logging.getLogger(__name__)


def load_aaguid():
  redis_aaguid_db2.flushall()
  log.info("AAGUID cache was reset")

  with open("resources/combined_aaguid.json", "r") as f:
    aaguid_json: dict = json.load(f)

  keys = aaguid_json.keys()

  for key in keys:
    redis_aaguid_db2.set(key, json.dumps(aaguid_json[key]))
  log.info("AAGUID cache was loaded with %d entries", len(keys))


@dataclass
class Authenticator:
  name: str
  icon_light: str
  icon_dark: str


def get_authenticator(aaguid: UUID) -> Optional[Authenticator]:
  aaguid_json = redis_aaguid_db2.get(str(aaguid))
  if aaguid_json is None:
    log.info("Authenticator AAGUID cache miss: %r", aaguid)
    return None

  aaguid_dict = json.loads(aaguid_json)
  log.info("Authenticator AAGUID cache hit: %r", aaguid)
  return Authenticator(
    name=aaguid_dict['name'],
    icon_light=aaguid_dict['icon_light'],
    icon_dark=aaguid_dict['icon_dark'],
  )
