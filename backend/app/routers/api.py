from fastapi import APIRouter

from . import login, users, teams, events, team_scores, scores

api_router = APIRouter()
api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(team_scores.router, prefix="/team_scores", tags=["team_scores"])
api_router.include_router(scores.router, prefix="/scores", tags=["scores"])


@api_router.get("/")
async def root():
    return {"message": "Backend API for FARM-docker operational !"}
