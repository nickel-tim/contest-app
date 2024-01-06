from typing import List, Optional, Any
from uuid import UUID
import random


from fastapi import APIRouter, HTTPException, Body, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import errors
from beanie.exceptions import RevisionIdWasChanged

from ..auth.auth import (
    get_current_active_superuser,
)
from .. import schemas, models

router = APIRouter()


@router.post("", response_model=schemas.Team)
async def register_team(
    team_name: str = Body(...),
    color: str = Body(...),

):
    """
    Register a new team.
    """
    if color == None:
        color = '#' + hex(random.randrange(0, 2**24))[2:].zfill(6)

    team = models.Team(
        team_name = team_name,
        color = color,
    )

    try:
        await team.create()
        return team
    except errors.DuplicateKeyError:
        raise HTTPException(
            status_code=400, detail="Team with that name already exists."
        )


@router.get("", response_model=List[schemas.Team])
async def get_teams(
    limit: Optional[int] = 10,
    offset: Optional[int] = 0,
    # admin_user: models.Team = Depends(get_current_active_superuser),
):
    teams = await models.Team.find_all().skip(offset).limit(limit).to_list()
    return teams



@router.patch("/{teamid}", response_model=schemas.Team)
async def update_team(
    teamid: UUID,
    update: schemas.TeamUpdate,
    # admin_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Update a team.

    ** Restricted to superuser **

    Parameters
    ----------
    userid : UUID
        the team's UUID
    update : schemas.TeamUpdate
        the update data
    current_user : models.User, optional
        the current superuser, by default Depends(get_current_active_superuser)
    """
    print('UPDATE', update)
    print('teamid', teamid)
    team = await models.Team.find_one({"uuid": teamid})

    print('TEAM', team)
    team = team.model_copy(update=update.model_dump(exclude_unset=True))
    try:
        await team.save()
        return team
    except errors.DuplicateKeyError:
        raise HTTPException(
            status_code=400, detail="Team with that name already exists."
        )


@router.get("/{teamid}", response_model=schemas.Team)
async def get_team(
    teamid: UUID,
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    """
    Get Team Info

    ** Restricted to superuser **

    Parameters
    ----------
    teamid : UUID
        the team's UUID

    Returns
    -------
    schemas.Team
        Team info
    """
    team = await models.Team.find_one({"uuid": teamid})
    if team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return team


@router.delete("/{teamid}", response_model=schemas.Team)
async def delete_team(
    teamid: UUID,
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    team = await models.Team.find_one({"uuid": teamid})
    await team.delete()
    return team




@router.get("/search/{team_name}", response_model=List[schemas.Team])
async def search_teams(team_name: str):
    teams_data = await get_teams()
    filtered_teams = [team for team in teams_data if team_name.lower() in team.team_name.lower()]
    return filtered_teams