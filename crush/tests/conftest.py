from datetime import datetime
from typing import Callable, Tuple

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing_extensions import Generator

from app.core.config_store import config
from app.core.user import core_jwt
from app.models.interacrions.LikeModel import LikesModel
from app.models.locations.PlaceModel import PlaceModel
from app.models.locations.RegionModel import RegionModel
from app.models.users.IdentityModel import IdentityModel, SEX
from app.models.users.RelationshipModel import RelationshipModel, RelationshipState

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
def db() -> Generator[Session]:
  db = session()

  try:
    yield db
  finally:
    db.rollback()
    db.close()


@pytest.fixture
def identity(
  db: Session
) -> Generator[IdentityModel]:
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
def identity_factory(
  db: Session
) -> Generator[Callable[[str], IdentityModel]]:
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
def access_token(
  identity: IdentityModel
) -> str:
  access_token = core_jwt.create_access_token(identity.uid, identity.role)

  return access_token


@pytest.fixture
def access_token_factory(
  identity_factory
) -> Callable[[str], Tuple[IdentityModel, str]]:
  def create_access_token(name: str = "test") -> Tuple[IdentityModel, str]:
    identity = identity_factory(name)
    access_token = core_jwt.create_access_token(identity.uid, identity.role)
    return identity, access_token

  return create_access_token


@pytest.fixture
def regions(
  db: Session
) -> Generator[list[RegionModel]]:
  regions: list[RegionModel] = []

  for i in range(3):
    region = RegionModel(
      name=f"이름-지역{i}",
      description=f"설명-지역{i}",
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
        name=f"이름-지역{i}장소{j}",
        description=f"설명-지역{i}장소{j}",
        address=f"주소-지역{i}장소{j}",
        coordinate=[37.558147, 126.921673],
        region_uid=regions[i].uid,
        place_meta={
          "operation": {
            "parking": i == 0,
          },
          "reservation": {
            "required": j == 0
          }
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


@pytest.fixture
def like_factory(
  db: Session
) -> Generator[Callable[[IdentityModel, PlaceModel], LikesModel]]:
  likes: list[LikesModel] = []

  def create_like(identity: IdentityModel, place: PlaceModel) -> LikesModel:
    like = LikesModel(
      user_id=identity.uid,
      place_id=place.uid
    )
    db.add(like)
    db.commit()
    db.refresh(like)
    likes.append(like)
    return like

  yield create_like

  for like in likes:
    db.delete(like)
  db.commit()


@pytest.fixture
def relation_factory(
  db: Session,
  access_token_factory: Callable[[str], Tuple[IdentityModel, str]]
):
  relations: list[RelationshipModel] = []

  def create_relation(
    user: IdentityModel,
    friend: IdentityModel,
    relationship: RelationshipState = RelationshipState.FOLLOWING
  ):
    relation = RelationshipModel(
      user_id=user.uid,
      friend_id=friend.uid,
      state=relationship
    )

    db.add(relation)
    db.commit()
    db.refresh(relation)
    relations.append(relation)

    return relation

  yield create_relation

  for relation in relations:
    db.delete(relation)
  db.commit()
