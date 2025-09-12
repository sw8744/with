import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config_store import config
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
def region():
  db = session()

  region = RegionModel(
    name="홍대, 연남",
    description="연트럴파크"
  )

  db.add(region)
  db.commit()
  db.refresh(region)

  yield region

  db.delete(region)
  db.commit()


@pytest.fixture
def db():
  db = session()

  try:
    yield db
  finally:
    db.close()
