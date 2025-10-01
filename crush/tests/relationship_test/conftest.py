from typing import Tuple, Callable

import pytest
from sqlalchemy.orm import Session

from app.models.users.IdentityModel import IdentityModel
from app.models.users.RelationshipModel import RelationshipModel, RelationshipState


@pytest.fixture
def relation_factory(
  db: Session,
  access_token_factory: Callable[[str], Tuple[IdentityModel, str]]
):
  relation: RelationshipModel

  def create_relation(
    user: IdentityModel,
    friend: IdentityModel,
    relationship: RelationshipState = RelationshipState.FOLLOWING
  ):
    nonlocal relation
    relation = RelationshipModel(
      user_id=user.uid,
      friend_id=friend.uid,
      state=relationship
    )

    db.add(relation)
    db.commit()
    db.refresh(relation)

    return relation

  yield create_relation

  db.delete(relation)
  db.commit()
