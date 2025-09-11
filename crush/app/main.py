from fastapi import FastAPI

from app.core.logger import logger
from app.routers import regions, places
from app.routers.auth import GoogleOAuthRouter, AuthRouter
from app.routers.user import register, user

app = FastAPI()

app.include_router(regions.router)
app.include_router(places.router)
app.include_router(GoogleOAuthRouter.router)
app.include_router(register.router)
app.include_router(AuthRouter.router)
app.include_router(user.router)

logger.info('Application started')
