import logging
import os
from datetime import datetime

from fastapi import FastAPI

from app.core.config_store import mode
from app.routers.auth import GoogleOAuthRouter, AuthRouter
from app.routers.error_handler import add_error_handler
from app.routers.interaction import like
from app.routers.location import places, regions
from app.routers.plan import plan, plan_date_poll, plan_members, plan_activities
from app.routers.recommendation import recommendation, theme
from app.routers.relationship import following, follower
from app.routers.user import register, user

log = logging.getLogger(__name__)

log.info("Environment: %s | Commit#: %s", mode, os.environ["commit"])

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
app.include_router(recommendation.router)
app.include_router(theme.router)
app.include_router(plan.router)
app.include_router(plan_date_poll.router)
app.include_router(plan_members.router)
app.include_router(plan_activities.router)
add_error_handler(app)

log.info("Application started on %s", datetime.now().isoformat())
