from typing import List, Optional, Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, Body, Depends
from pymongo import errors
from beanie.exceptions import RevisionIdWasChanged
from beanie.operators import In


from ..auth.auth import (
    get_current_active_superuser,
)
from .. import schemas, models

router = APIRouter()


@router.post("", response_model=schemas.TeamScore)
async def register_team_score(
    teamId: str = Body(None),
    eventId: str = Body(None),
    userId: str = Body(None),
    score: Optional[int] = 0,
):
    """
    Register a new team score.
    """     


    # Check if a team score with the same teamId and eventId already exists
    existing_team_score = await models.TeamScore.find({ "eventId": eventId , "teamId": teamId}).to_list()
    if existing_team_score:
        raise HTTPException(status_code=400, detail="TeamScore with that teamId and eventId already exists.")



    teamScore = models.TeamScore(
        teamId=teamId,
        eventId=eventId,
        userId=userId,
        score=score
    )
    try:
        await teamScore.create()
        return teamScore
    except errors.DuplicateKeyError:
        raise HTTPException(
            status_code=400, detail="TeamScore with that name already exists."
        )


@router.get("", response_model=List[schemas.TeamScore])
async def get_team_scores(
    limit: Optional[int] = 10,
    offset: Optional[int] = 0,
    # admin_user: models.TeamScore = Depends(get_current_active_superuser),
):
    team_scores = await models.TeamScore.find_all().skip(offset).limit(limit).to_list()
    return team_scores


@router.patch("/{teamScoreId}", response_model=schemas.TeamScore)
async def update_team_score(
    teamScoreId: UUID,
    update: schemas.TeamScoreUpdate,
    # admin_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Update a team.

    ** Restricted to superuser **

    Parameters
    ----------
    userid : UUID
        the team's UUID
    update : schemas.TeamScoreUpdate
        the update data
    current_user : models.User, optional
        the current superuser, by default Depends(get_current_active_superuser)
    """
    teamScore = await models.TeamScore.find_one({"uuid": teamScoreId})
    
    teamScore = teamScore.model_copy(update=update.model_dump(exclude_unset=True))
    try:
        await teamScore.save()
        return teamScore
    except errors.DuplicateKeyError:
        raise HTTPException(
            status_code=400, detail="TeamScore with that name already exists."
        )


@router.get("/team/{teamId}", response_model=List[schemas.TeamScore])
async def get_team_score_for_team(
    teamId: str,
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    """
    Get TeamScore Info

    ** Restricted to superuser **

    Parameters
    ----------
    teamId : UUID
        the team's UUID

    Returns
    -------
    schemas.TeamScore
        TeamScore info
    """
    teamScores = await models.TeamScore.find({ "teamId": teamId }).to_list()
    if teamScores is None:
        raise HTTPException(status_code=404, detail="TeamScore not found")
    return teamScores



@router.get("/user/{userId}", response_model=List[schemas.TeamScore])
async def get_team_score_for_user(
    userId: str,
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    """
    Get TeamScore Info

    ** Restricted to superuser **

    Parameters
    ----------
    teamId : UUID
        the team's UUID

    Returns
    -------
    schemas.TeamScore
        TeamScore info
    """
    teamScores = await models.TeamScore.find({ "userId": userId }).to_list()
    if teamScores is None:
        raise HTTPException(status_code=404, detail="TeamScore not found")
    return teamScores

@router.get("/event/{eventId}", response_model=List[schemas.TeamScore])
async def get_team_score_for_event(
    eventId: str,
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    """
    Get TeamScore Info

    ** Restricted to superuser **

    Parameters
    ----------
    eventId : UUID
        the event's UUID

    Returns
    -------
    schemas.TeamScore
        TeamScore info
    """
    team_scores = await models.TeamScore.find({ "eventId": eventId }).to_list()
    if team_scores is None:
        raise HTTPException(status_code=404, detail="TeamScore not found")
    return team_scores


@router.get("/{teamScoreId}", response_model=schemas.TeamScore)
async def get_team_score(
    teamScoreId: str,
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    """
    Get TeamScore Info

    ** Restricted to superuser **

    Parameters
    ----------
    teamScoreId : UUID
        the teamScoreId's UUID

    Returns
    -------
    schemas.TeamScore
        TeamScore info
    """
    teamScore = await models.TeamScore.find_one({"uuid": teamScoreId})
    if teamScore is None:
        raise HTTPException(status_code=404, detail="TeamScore not found")
    return teamScore



@router.delete("/{teamScoreId}", response_model=schemas.TeamScore)
async def delete_team_score(
    teamScoreId: UUID,
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    teamScore = await models.TeamScore.find_one({"uuid": teamScoreId})
    await teamScore.delete()
    return teamScore


@router.delete("/team/{teamId}", response_model=List[schemas.TeamScore])
async def delete_team_score_for_team(
    teamId: str,
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    try:
        team_scores = await models.TeamScore.find({"teamId": teamId}).to_list()
        for team_score in team_scores:
            await team_score.delete()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    if team_scores == 0:
        raise HTTPException(status_code=404, detail="TeamScore not found")
    return team_scores


@router.delete("/user/{userId}", response_model=List[schemas.TeamScore])
async def delete_team_score_for_user(
    userId: str,
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    try:
        team_scores = await models.TeamScore.find({"userId": userId}).to_list()
        for team_score in team_scores:
            await team_score.delete()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    if team_scores == 0:
        raise HTTPException(status_code=404, detail="TeamScore not found")
    return team_scores

@router.delete("/event/{eventId}", response_model=List[schemas.TeamScore])
async def delete_team_score_for_event(
    eventId: str,
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    try:
        team_scores = await models.TeamScore.find({"eventId": eventId}).to_list()

        for team_score in team_scores:
            await team_score.delete()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    if team_scores == 0:
        raise HTTPException(status_code=404, detail="TeamScore not found")
    return team_scores
