from datetime import datetime
from typing import Callable, Tuple

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing_extensions import Generator

from app.core.config_store import config
from app.core.user import core_jwt
from app.models.locations.PlaceModel import PlaceModel
from app.models.locations.RegionModel import RegionModel
from app.models.users.IdentityModel import IdentityModel, SEX

SQLALCHEMY_DATABASE_URL = "postgresql://{user}:{password}@{host}:{port}/{dbname}".format(
  host=config["database"]["relational"]["host"],
  port=config["database"]["relational"]["port"],
  password=config["database"]["relational"]["password"],
  user=config["database"]["relational"]["user"],
  dbname=config["database"]["relational"]["name"]
)

db_engine = create_engine(SQLALCHEMY_DATABASE_URL)
session = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)


@pytest.fixture
def db():
  db = session()

  try:
    yield db
  finally:
    db.close()


@pytest.fixture
def identity(db: Session) -> Generator[IdentityModel]:
  iden = IdentityModel(
    name="test",
    email="test@test.com",
    email_verified=True,
    sex=SEX.MALE,
    birthday=datetime.today(),
    role=["core:user"]
  )
  db.add(iden)

  db.commit()
  db.refresh(iden)

  yield iden

  db.delete(iden)
  db.commit()


@pytest.fixture
def identity_factory(db: Session) -> Generator[Callable[[str], IdentityModel]]:
  test_users: list[IdentityModel] = []

  def create_user(name: str = "test") -> IdentityModel:
    iden = IdentityModel(
      name=name,
      email="test@test.com",
      email_verified=True,
      sex=SEX.MALE,
      birthday=datetime.today(),
      role=["core:user"]
    )
    db.add(iden)
    db.commit()
    db.refresh(iden)
    test_users.append(iden)
    return iden

  yield create_user

  for iden in test_users:
    db.delete(iden)
  db.commit()


@pytest.fixture
def access_token(identity: IdentityModel) -> str:
  access_token = core_jwt.create_access_token(identity.uid, identity.role)

  return access_token


@pytest.fixture
def access_token_factory(
  identity_factory
) -> Callable[[str], Tuple[IdentityModel, str]]:
  def create_access_token(name: str = "test") -> (IdentityModel, str):
    identity = identity_factory(name)
    access_token = core_jwt.create_access_token(identity.uid, identity.role)
    return identity, access_token

  return create_access_token


@pytest.fixture
def regions(db: Session) -> Generator[list[RegionModel]]:
  regions: list[RegionModel] = []

  for i in range(3):
    region = RegionModel(
      name=f"n{i}",
      description=f"d{i}",
      thumbnail="thumbnail"
    )

    db.add(region)
    regions.append(region)

  db.commit()

  for region in regions:
    db.refresh(region)

  yield regions

  for region in regions:
    db.delete(region)
  db.commit()


@pytest.fixture
def places(
  regions: list[RegionModel],
  db: Session
) -> Generator[list[PlaceModel]]:
  places: list[PlaceModel] = []
  for i in range(3):
    for j in range(3):
      place = PlaceModel(
        name=f"nr{i}p{j}",
        description=f"dr{i}p{j}",
        address=f"ar{i}p{j}",
        coordinate=[37.558147, 126.921673],
        region_uid=regions[i].uid,
        place_meta={
          "parking": i == 0,
          "reservation": j == 0,
        },
        thumbnail="thumbnail"
      )
      db.add(place)
      places.append(place)

  db.commit()
  for place in places:
    db.refresh(place)

  yield places

  for place in places:
    db.delete(place)
  db.commit()
