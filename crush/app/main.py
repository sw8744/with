import logging
import os
from datetime import datetime

from fastapi import FastAPI

from app.core.config_store import mode
from app.routers.ErrorHandlingRouter import add_error_handler
from app.routers.auth import GoogleOAuthRouter, GeneralAuthRouter
from app.routers.interaction import LikeRouter
from app.routers.location import PlaceRouter, RegionRouter
from app.routers.plan import PlanRouter, PlanDatePollingRouter, PlanMembersRouter, PlanActivitiesRouter
from app.routers.recommendation import RecommendationRouter, ThemeRouter
from app.routers.relationship import FollowingRouter, FollowerRouter
from app.routers.resources import ImageResourcesRouter
from app.routers.user import IdentityRegisterRouter, IdentityRouter

log = logging.getLogger(__name__)

log.info("Environment: %s | Commit#: %s", mode, os.environ["commit"])

app = FastAPI()

app.include_router(RegionRouter.router)
app.include_router(PlaceRouter.router)
app.include_router(GoogleOAuthRouter.router)
app.include_router(IdentityRegisterRouter.router)
app.include_router(GeneralAuthRouter.router)
app.include_router(IdentityRouter.router)
app.include_router(LikeRouter.router)
app.include_router(FollowingRouter.router)
app.include_router(FollowerRouter.router)
app.include_router(RecommendationRouter.router)
app.include_router(ThemeRouter.router)
app.include_router(PlanRouter.router)
app.include_router(PlanDatePollingRouter.router)
app.include_router(PlanMembersRouter.router)
app.include_router(PlanActivitiesRouter.router)
app.include_router(ImageResourcesRouter.router)
add_error_handler(app)

log.info("Application started on %s", datetime.now().isoformat())
