from typing import Optional, List
from uuid import UUID, uuid4

from beanie import Document, Indexed
from pydantic import Field
from pymongo import IndexModel


class TeamScore(Document):
    uuid: UUID = Field(default_factory=uuid4)
    teamId: str = None
    eventId: str = None
    score: int = 0
    

    class Settings:
        indexes = [
            IndexModel("uuid", unique=True),
        ]
