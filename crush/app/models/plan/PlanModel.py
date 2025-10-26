from datetime import datetime
from uuid import UUID as PyUUID

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import UUID, VARCHAR, DATE, ARRAY, TIMESTAMP
from sqlalchemy.orm import Mapped

from app.core.database.database import BaseTable


class PlanModel(BaseTable):
  __tablename__ = "plans"
  __table_args__ = {
    "schema": "plans"
  }

  uid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, unique=True, nullable=False,
                               server_default="gen_random_uuid()")
  name: Mapped[str] = Column(VARCHAR(256), nullable=False)
  host_id: Mapped[PyUUID] = Column(UUID(as_uuid=True), nullable=False)
  date_from: Mapped[datetime] = Column(DATE, nullable=False)
  date_to: Mapped[datetime] = Column(DATE, nullable=False)
  regions: Mapped[list[PyUUID]] = Column(ARRAY(UUID), nullable=False)
  created_at: Mapped[datetime] = Column(TIMESTAMP, nullable=False, server_default="CURRENT_TIMESTAMP")
  updated_at: Mapped[datetime] = Column(TIMESTAMP, nullable=False, server_default="CURRENT_TIMESTAMP")
