from datetime import datetime

from pydantic import BaseModel, Field


class ConversationStart(BaseModel):
    service_id: int
    body: str = Field(..., min_length=1, max_length=8000)


class MessageCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=8000)


class MessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    sender_name: str
    body: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationSummaryOut(BaseModel):
    id: int
    service_id: int
    service_title: str
    seeker_id: int
    seeker_name: str
    provider_id: int
    provider_name: str
    other_party_name: str
    last_message_preview: str
    last_message_at: datetime


class ConversationDetailOut(BaseModel):
    id: int
    service_id: int
    service_title: str
    seeker_id: int
    seeker_name: str
    provider_id: int
    provider_name: str
