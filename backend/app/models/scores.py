from typing import Optional, List
from uuid import UUID, uuid4

from beanie import Document, Indexed
from pydantic import Field
from pymongo import IndexModel


class Score(Document):
    uuid: UUID = Field(default_factory=uuid4)
    is_active: bool = True
    eventId: str = None
    points: int = 0

    class Settings:
        # Set unique index on uuid here instead of using Indexed
        # because of https://github.com/roman-right/beanie/issues/701
        indexes = [
            IndexModel("uuid", unique=True),
        ]
