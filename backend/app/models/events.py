from typing import Optional, List
from uuid import UUID, uuid4

from beanie import Document, Indexed
from pydantic import EmailStr, Field
from pymongo import IndexModel



# Modified Events class
class Event(Document):
    uuid: UUID = Field(default_factory=uuid4)
    event_name: Optional[str] = None
    picture: Optional[str] = None
    is_active: bool = False
    participating_teams: Optional[List[UUID]] = []
    participating_users: Optional[List[UUID]] = []

    class Settings:
        indexes = [
            IndexModel("uuid", unique=True),
        ]