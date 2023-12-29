from typing import Optional, List
from beanie import PydanticObjectId
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID


class TeamScoreBase(BaseModel):
    """
    Shared TeamScore properties. Visible by anyone.
    """

    teamId: str = None
    eventId: str = None
    score: int = 0



class PrivateTeamScoreBase(TeamScoreBase):
    """
    Shared TeamScore properties. Visible only by admins and self.
    """



class TeamScoreUpdate(TeamScoreBase):
    """
    TeamScore properties to receive via API on update.
    """



class TeamScore(PrivateTeamScoreBase):
    """
    User properties returned by API. Contains private
    user information such as email, is_active, auth provider.

    Should only be returned to admins or self.
    """

    uuid: UUID
