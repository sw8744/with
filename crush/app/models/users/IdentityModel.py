import enum
from datetime import datetime
from uuid import UUID as PyUUID

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import UUID, VARCHAR, BOOLEAN, DATE, ARRAY
from sqlalchemy.orm import Mapped

from app.core.database.database import BaseTable, EnumAsValue


class SEX(enum.Enum):
  MALE = 0
  FEMALE = 1
  OTHER = 2


class IdentityModel(BaseTable):
  __tablename__ = "identities"
  __table_args__ = {
    "schema": "users"
  }

  uid: Mapped[PyUUID] = Column(UUID(as_uuid=True), primary_key=True, unique=True, nullable=False,
                               server_default="gen_random_uuid()")
  name: Mapped[str] = Column(VARCHAR(64), nullable=False)
  email: Mapped[str] = Column(VARCHAR(64), nullable=False)
  email_verified: Mapped[bool] = Column(BOOLEAN, nullable=False, server_default="FALSE")
  sex: Mapped[SEX] = Column(EnumAsValue(SEX), nullable=False, server_default="2")
  birthday: Mapped[datetime] = Column("dob", DATE, nullable=False)
  role: Mapped[list[str]] = Column(ARRAY(VARCHAR(16)), nullable=False, default=[])
