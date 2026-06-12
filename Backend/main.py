from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import (
    auth,
    battles,
    children,
    leaderboard,
    packs,
    uploads,
)

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = "/api"
app.include_router(auth.router, prefix=api)
app.include_router(children.router, prefix=api)
app.include_router(packs.router, prefix=api)
app.include_router(uploads.router, prefix=api)
app.include_router(battles.router, prefix=api)
app.include_router(leaderboard.router, prefix=api)


@app.get("/")
async def root():
    return {"message": "Welcome to NaniGO API", "docs": "/docs"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "ai": bool(settings.GEMINI_API_KEY)}
