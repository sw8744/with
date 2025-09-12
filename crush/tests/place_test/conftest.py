import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config_store import config
from app.models.places.places import PlaceModel
from app.models.places.regions import RegionModel

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
def place():
  db = session()

  region = RegionModel(
    name="홍대, 연남",
    description="연트럴파크"
  )
  db.add(region)

  place = PlaceModel(
    name="4233마음센터 연남점",
    description="하트시그널",
    address="서울 마포구 월드컵북로4길 43 지하1층",
    region_uid=region.uid,
    place_meta={
      "parking": False,
      "reservation": True,
    }
  )
  db.add(place)
  db.commit()
  db.refresh(place)

  yield place

  db.delete(region)
  db.delete(place)
  db.commit()


@pytest.fixture
def db():
  db = session()

  try:
    yield db
  finally:
    db.close()
