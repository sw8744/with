from datetime import datetime, date

from pydantic import BaseModel, Field


class PollBeginRequest(BaseModel):
  date_from: date = Field(alias="dateFrom")
  date_to: date = Field(alias="dateTo")
  end_in: datetime = Field(alias="endIn")


class PollVoteRequest(BaseModel):
  dates: list[date] = Field()
