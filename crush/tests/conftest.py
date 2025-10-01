from datetime import datetime

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config_store import config
from app.core.user import core_jwt
from app.models.locations.PlaceModel import PlaceModel
from app.models.locations.RegionModel import RegionModel
from app.models.users.IdentityModel import IdentityModel, SEX

SQLALCHEMY_DATABASE_URL = "postgresql://{user}:{password}@{host}:{port}/{dbname}".format(
  host=config['database']['relational']['host'],
  port=config['database']['relational']['port'],
  password=config['database']['relational']['password'],
  user=config['database']['relational']['user'],
  dbname=config['database']['relational']['name']
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
def identity(db: Session):
  iden = IdentityModel(
    name="test",
    email="test@test.com",
    email_verified=True,
    sex=SEX.MALE,
    birthday=datetime.today(),
    role=['core:user']
  )
  db.add(iden)

  db.commit()
  db.refresh(iden)

  yield iden

  db.delete(iden)
  db.commit()


@pytest.fixture
def identity_factory(db: Session):
  test_users: list[IdentityModel] = []

  def create_user(name: str = "test") -> IdentityModel:
    iden = IdentityModel(
      name=name,
      email="test@test.com",
      email_verified=True,
      sex=SEX.MALE,
      birthday=datetime.today(),
      role=['core:user']
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
def access_token(identity: IdentityModel):
  access_token = core_jwt.create_access_token(identity.uid, identity.role)

  return access_token


@pytest.fixture
def access_token_factory(
  identity_factory
):
  def create_access_token(name: str = "test") -> (IdentityModel, str):
    identity = identity_factory(name)
    access_token = core_jwt.create_access_token(identity.uid, identity.role)
    return identity, access_token

  return create_access_token


@pytest.fixture
def region(db: Session):
  region = RegionModel(
    name="홍대/연남",
    description="홍대와 연남",
    thumbnail="thumbnail"
  )

  db.add(region)
  db.commit()
  db.refresh(region)

  yield region

  db.delete(region)
  db.commit()


@pytest.fixture
def place(
  region: RegionModel,
  db: Session
):
  place = PlaceModel(
    name="4233마음센터 연남점",
    description="설명",
    address="서울 마포구 월드컵북로4길 43 지하1층",
    coordinate=[37.558147, 126.921673],
    region_uid=region.uid,
    place_meta={
      "parking": False,
      "reservation": True,
    },
    thumbnail="thumbnail"
  )
  db.add(place)
  db.commit()
  db.refresh(place)

  yield place

  db.delete(place)
  db.commit()


@pytest.fixture
def place_factory(
  db: Session
):
  places: list[PlaceModel] = []

  def create_place(
    name: str = "4233마음센터 연남점",
    description: str = "설명",
    address: str = "서울 마포구 월드컵북로4길 43 지하1층"
  ) -> PlaceModel:
    nonlocal place

    place = PlaceModel(
      name=name,
      description=description,
      address=address,
    )
    db.add(place)
    db.commit()
    db.refresh(place)
    places.append(place)
    return place

  yield create_place

  for place in places:
    db.delete(place)
  db.commit()
