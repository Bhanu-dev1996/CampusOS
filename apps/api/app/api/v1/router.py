from fastapi import APIRouter

from app.modules.auth.routes import router as auth_router
from app.modules.dashboard.routes import router as dashboard_router
from app.modules.health.routes import router as health_router
from app.modules.platform.routes import router as platform_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(platform_router)
api_router.include_router(dashboard_router)