from typing import Optional, List
from uuid import UUID, uuid4

from beanie import Document, Indexed
from pydantic import Field
from pymongo import IndexModel


class Team(Document):
    uuid: UUID = Field(default_factory=uuid4)
    team_name: str = None

    members: Optional[List[UUID]] = []

    class Settings:
        indexes = [
            IndexModel("uuid", unique=True),
        ]
