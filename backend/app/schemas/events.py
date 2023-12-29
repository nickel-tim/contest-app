from typing import Optional, List
from beanie import PydanticObjectId
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID


class EventBase(BaseModel):
    """
    Shared Event properties. Visible by anyone.
    """

    event_name: Optional[str] = None
    participating_teams: Optional[List[str]]


class PrivateEventBase(EventBase):
    """
    Shared Event properties. Visible only by admins and self.
    """

    is_active: Optional[bool] = True
    participating_users: Optional[List[str]]


class EventUpdate(EventBase):
    """
    Event properties to receive via API on update.
    """

    is_active: Optional[bool] = True


class Event(PrivateEventBase):
    """
    User properties returned by API. Contains private
    user information such as email, is_active, auth provider.

    Should only be returned to admins or self.
    """

    id: PydanticObjectId = Field()
    uuid: UUID
