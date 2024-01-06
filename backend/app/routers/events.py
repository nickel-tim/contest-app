from typing import List, Optional, Any
from uuid import UUID
import random 

from fastapi import APIRouter, HTTPException, Body, Depends
from pymongo import errors
from beanie.exceptions import RevisionIdWasChanged

from ..auth.auth import (
    get_current_active_superuser,
)
from .. import schemas, models

router = APIRouter()


@router.post("/{event_name}", response_model=schemas.Event)
async def register_event(
    event_name: str,
    color: str = Body(None)
):
    print('REGISTER EVENT', event_name)
    """
    Register a new user.
    """
    if color == None:
        color = '#' + hex(random.randrange(0, 2**24))[2:].zfill(6)

    event = models.Event(
        event_name=event_name,
        color = color,

    )
    try:
        await event.create()
        return event
    except errors.DuplicateKeyError:
        raise HTTPException(
            status_code=400, detail="Event with that name already exists."
        )


@router.get("", response_model=List[schemas.Event])
async def get_events(
    limit: Optional[int] = 10,
    offset: Optional[int] = 0,
    # admin_user: models.Event = Depends(get_current_active_superuser),
):
    events = await models.Event.find_all().skip(offset).limit(limit).to_list()
    return events



@router.patch("/{eventid}", response_model=schemas.Event)
async def update_event(
    eventid: UUID,
    update: schemas.EventUpdate,
    # admin_user: models.User = Depends(get_current_active_superuser),
) -> Any:
    """
    Update a event.

    ** Restricted to superuser **

    Parameters
    ----------
    userid : UUID
        the event's UUID
    update : schemas.EventUpdate
        the update data
    current_user : models.User, optional
        the current superuser, by default Depends(get_current_active_superuser)
    """
    event = await models.Event.find_one({"uuid": eventid})
    
    event = event.model_copy(update=update.model_dump(exclude_unset=True))
    try:
        await event.save()
        return event
    except errors.DuplicateKeyError:
        raise HTTPException(
            status_code=400, detail="Event with that name already exists."
        )


@router.get("/{eventid}", response_model=schemas.Event)
async def get_event(
    eventid: UUID,
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    """
    Get Event Info

    ** Restricted to superuser **

    Parameters
    ----------
    eventid : UUID
        the event's UUID

    Returns
    -------
    schemas.Event
        Event info
    """
    event = await models.Event.find_one({"uuid": eventid})
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.delete("/{eventid}", response_model=schemas.Event)
async def delete_event(
    eventid: UUID,
    # admin_user: models.User = Depends(get_current_active_superuser)
):
    event = await models.Event.find_one({"uuid": eventid})
    await event.delete()
    return event
