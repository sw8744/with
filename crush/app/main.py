from fastapi import FastAPI
from sqlalchemy.orm import relationship

from app.core.logger import logger
from app.routers.auth import GoogleOAuthRouter, AuthRouter
from app.routers.error_handler import add_error_handler
from app.routers.interaction import like
from app.routers.location import places, regions
from app.routers.relationship import following, follower
from app.routers.user import register, user

app = FastAPI()

app.include_router(regions.router)
app.include_router(places.router)
app.include_router(GoogleOAuthRouter.router)
app.include_router(register.router)
app.include_router(AuthRouter.router)
app.include_router(user.router)
app.include_router(like.router)
app.include_router(following.router)
app.include_router(follower.router)
add_error_handler(app)

logger.info('Application started')
