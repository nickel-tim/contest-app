from typing import Optional, List
from beanie import PydanticObjectId
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID


class ScoreBase(BaseModel):
    """
    Shared Score properties. Visible by anyone.
    """
    points: Optional[int] = 0


class PrivateScoreBase(ScoreBase):
    """
    Shared Score properties. Visible only by admins and self.
    """
    eventId: Optional[str] = None
    is_active: Optional[bool] = True


class ScoreUpdate(ScoreBase):
    """
    Score properties to receive via API on update.
    """

    is_active: Optional[bool] = True


class Score(PrivateScoreBase):
    """
    User properties returned by API. Contains private
    user information such as email, is_active, auth provider.

    Should only be returned to admins or self.
    """
    uuid: UUID


class ScoreResponse(BaseModel):
    score: Score
    qr_code_base64: str