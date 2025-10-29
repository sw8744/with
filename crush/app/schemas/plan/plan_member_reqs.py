from uuid import UUID

from pydantic import BaseModel, Field


class PatchPlanMemberReqs(BaseModel):
  members: list[UUID] = Field(
    min_length=0, max_length=100
  )
