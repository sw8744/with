from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config_store import config

SQLALCHEMY_DATABASE_URL = "postgresql://{user}:{password}@{host}:{port}/{dbname}".format(
  host=config['database']['relational']['host'],
  port=config['database']['relational']['port'],
  password=config['database']['relational']['password'],
  user=config['database']['relational']['user'],
  dbname=config['database']['relational']['name']
)

engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

BaseTable = declarative_base()


def create_connection():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()


'''
redis_db = redis.Redis(
  host=config['database']["redis"]["host"],
  port=config['database']["redis"]["port"],
  password=config['database']["redis"]["password"],
  db=0,
  decode_responses=True
)
'''
