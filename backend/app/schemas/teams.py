from typing import Optional, List
from beanie import PydanticObjectId
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID


class TeamBase(BaseModel):
    """
    Shared Team properties. Visible by anyone.
    """

    team_name: Optional[str]
    color: Optional[str]


class PrivateTeamBase(TeamBase):
    """
    Shared Team properties. Visible only by admins and self.
    """

    is_active: Optional[bool] = True
    members: Optional[List[str]]


class TeamUpdate(TeamBase):
    """
    Team properties to receive via API on update.
    """

    is_active: Optional[bool] = True


class Team(PrivateTeamBase):
    """
    User properties returned by API. Contains private
    user information such as email, is_active, auth provider.

    Should only be returned to admins or self.
    """

    uuid: UUID
