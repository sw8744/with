from pydantic import BaseModel, Field
from uuid import UUID


class PatchPlanMemberReqs(BaseModel):
  members: list[UUID] = Field(
    min_length=0, max_length=100
  )
