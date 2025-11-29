"""
Message/Chat API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_user
import schemas
import crud
import models

router = APIRouter(prefix="/api/messages", tags=["Messages"])


@router.post("/", response_model=schemas.MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    message_data: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Send a message to another user
    """
    # Verify receiver exists
    receiver = crud.get_user_by_id(db, message_data.receiver_id)
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    # Create message
    message = crud.create_message(
        db=db,
        sender_id=current_user.id,
        receiver_id=message_data.receiver_id,
        message=message_data.message
    )
    return message


@router.get("/conversations", response_model=List[schemas.ConversationSummary])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get all conversations for the current user
    Returns a list of users they've chatted with, along with last message and unread count
    """
    conversations = crud.get_conversations(db, current_user.id)
    return conversations


@router.get("/with/{user_id}", response_model=List[schemas.MessageResponse])
def get_messages_with_user(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get all messages between current user and specified user
    Automatically marks messages from the other user as read
    """
    # Verify other user exists
    other_user = crud.get_user_by_id(db, user_id)
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get messages
    messages = crud.get_messages(
        db=db,
        user1_id=current_user.id,
        user2_id=user_id,
        skip=skip,
        limit=limit
    )

    # Mark messages from other user as read
    crud.mark_messages_as_read(db, current_user.id, user_id)

    return messages


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get total unread message count for current user
    """
    count = crud.get_unread_count(db, current_user.id)
    return {"unread_count": count}


@router.post("/mark-read/{user_id}")
def mark_conversation_read(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Mark all messages from a specific user as read
    """
    updated = crud.mark_messages_as_read(db, current_user.id, user_id)
    return {"marked_read": updated}
