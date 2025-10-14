from uuid import UUID

from pydantic import Field, BaseModel


class RecommendByUsersParam(BaseModel):
  users: str = Field()

  def get_user_uuids(self) -> list[UUID]:
    uuid_strs = self.users.split('.')
    uuids = []
    for uuid_str in uuid_strs:
      try:
        uuids.append(UUID(uuid_str))
      except ValueError:
        raise ValueError("invalid as uuid")

    return uuids


class RecommendByUserFromRegionParam(BaseModel):
  users: str = Field()
  regions: str = Field()

  def get_user_uuids(self) -> list[UUID]:
    uuid_strs = self.users.split('.')
    uuids = []
    for uuid_str in uuid_strs:
      try:
        uuids.append(UUID(uuid_str))
      except ValueError:
        raise ValueError("invalid as uuid")

    return uuids

  def get_regions_uuid(self) -> list[UUID]:
    uuid_strs = self.regions.split('.')
    uuids = []
    for uuid_str in uuid_strs:
      try:
        uuids.append(UUID(uuid_str))
      except ValueError:
        raise ValueError("invalid as uuid")

    return uuids
