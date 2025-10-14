from uuid import UUID

from pydantic import Field, BaseModel


class RecommendByUsersParam(BaseModel):
  users: list[UUID] = Field()
