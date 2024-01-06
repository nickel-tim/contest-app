from typing import List, Optional, Any, Dict
from uuid import UUID
from collections import defaultdict
from fastapi import APIRouter, HTTPException, Body, Depends, Query
from pymongo import errors
from beanie.exceptions import RevisionIdWasChanged

from ..auth.auth import (
    get_current_active_superuser,
)
from ..scripts.qr_code_generator import qr_code_generator
from .. import schemas, models

router = APIRouter()


@router.get("/create_code/", response_model=schemas.ScoreResponse)
async def register_code(
    eventId: str = None,
    points: int = 0,
):
    """
    Register a new Score.
    """
    score = models.Score(
        eventId=eventId,
        points=points,
        userId=''
    )
    try:
        await score.create()

        img_base64 = qr_code_generator(score)


        return {"score": score, "qr_code_base64": img_base64}
    except errors.DuplicateKeyError:
        raise HTTPException(
            status_code=400, detail="Score with that ID already exists."
        )


@router.get("", response_model=List[schemas.Score])
async def get_scores(
    limit: Optional[int] = 10,
    offset: Optional[int] = 0,
    # admin_user: models.Score = Depends(get_current_active_superuser),
):
    scores = await models.Score.find_all().skip(offset).limit(limit).to_list()
    if scores is None:
        raise HTTPException(status_code=404, detail="Score not found")
    return scores

@router.get("/valid", response_model=List[schemas.Score])
async def get_valid_scores(
    limit: Optional[int] = 10,
    offset: Optional[int] = 0,
    # admin_user: models.Score = Depends(get_current_active_superuser),
):
    scores = await models.Score.find({"is_active": True}).skip(offset).limit(limit).to_list()
    return scores


@router.get("/get_one/{scoreId}", response_model=schemas.Score)
async def get_score(
    scoreId: UUID,
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    score = await models.Score.find_one({"uuid": scoreId})
    if score is None:
        raise HTTPException(status_code=404, detail="Score not found")
    return score


@router.get("/event/{eventId}", response_model=List[schemas.Score])
async def get_score_for_event(
    eventId: str,
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    scores = await models.Score.find({ "eventId": eventId }).to_list()
    if scores is None:
        raise HTTPException(status_code=404, detail="Score not found")
    return scores

@router.get("/event_users", response_model=List[schemas.Score])
async def get_user_scores_for_event(
    eventId: str = Query(...),
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    scores = await models.Score.find({ "eventId": eventId, "is_active": False}).to_list()

    user_points = defaultdict(int)

    for score in scores:
        user_id = score.userId
        points = score.points
        user_points[user_id] += points

    scores_list = [models.Score(userId=user_id, points=points) for user_id, points in user_points.items()]

    if not scores:
        raise HTTPException(status_code=404, detail="Score not found")
    return scores_list

@router.get("/user/{userId}", response_model=List[schemas.Score])
async def get_score_for_user(
    userId: str,
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    scores = await models.Score.find({ "userId": userId }).to_list()
    if scores is None:
        raise HTTPException(status_code=404, detail="Score not found")
    return scores


@router.get("/event_user", response_model=List[schemas.Score])
async def get_score_for_event_user(
    eventId: str = Body(None),
    userId: str = Body(None)
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    scores = await models.Score.find({ "userId": userId, "eventId": eventId }).to_list()
    if scores is None:
        raise HTTPException(status_code=404, detail="Score not found")
    return scores


@router.get("/valid/event/{eventId}", response_model=List[schemas.Score])
async def get_valid_score_for_event(
    eventId: str,
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    scores = await models.Score.find({ "eventId": eventId , "is_active": True}).to_list()
    if scores is None:
        raise HTTPException(status_code=404, detail="Score not found")
    return scores


@router.get("/use_code/", response_model=schemas.Score)
async def use_code(
    scoreId: UUID,
    teamId: UUID,
    userId: str
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    scores = await models.Score.find_one({ "uuid": scoreId })
    if not scores.is_active:
        return scores
    scores.is_active = False
    scores.userId = userId
    team_score = await models.TeamScore.find_one({ "eventId": str(scores.eventId) , "teamId": str(teamId)})
    team_score.score += scores.points
    try:
        await scores.save()
        await team_score.save()
        return scores
    except errors.DuplicateKeyError:
        raise HTTPException(
            status_code=400, detail="Scores with that name already exists."
        )
