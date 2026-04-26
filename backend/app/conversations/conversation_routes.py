from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.conversation_model import Conversation
from app.models.message_model import Message
from app.models.service_model import Service
from app.models.user_model import User
from app.schemas.message_schema import (
    ConversationDetailOut,
    ConversationStart,
    ConversationSummaryOut,
    MessageCreate,
    MessageOut,
)
from app.utils.helping_fun import get_current_user


router = APIRouter(prefix="/conversations", tags=["conversations"])


def _preview(text: str, max_len: int = 120) -> str:
    t = text.strip().replace("\n", " ")
    if len(t) <= max_len:
        return t
    return t[: max_len - 1] + "…"


def _load_conversation(db: Session, conv_id: int) -> Conversation | None:
    return (
        db.query(Conversation)
        .options(
            joinedload(Conversation.service).joinedload(Service.owner),
            joinedload(Conversation.seeker),
        )
        .filter(Conversation.id == conv_id)
        .first()
    )


def _assert_participant(conv: Conversation, user: User) -> None:
    service = conv.service
    if not service:
        raise HTTPException(status_code=404, detail="Listing not found")
    if conv.seeker_id != user.id and service.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not part of this conversation")


def _last_message_row(db: Session, conversation_id: int) -> Message | None:
    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc(), Message.id.desc())
        .first()
    )

def _summary_for_user(
    db: Session,
    conv: Conversation,
    user: User,
) -> ConversationSummaryOut:
    service = conv.service
    seeker = conv.seeker
    owner = service.owner if service else None
    seeker_name = seeker.name if seeker else "Unknown"
    provider_name = owner.name if owner else "Unknown"
    provider_id = service.owner_id if service else 0

    if user.id == conv.seeker_id:
        other_party_name = provider_name
    else:
        other_party_name = seeker_name

    last = _last_message_row(db, conv.id)
    if last:
        last_preview = _preview(last.body)
        last_at = last.created_at
    else:
        last_preview = ""
        last_at = conv.updated_at or conv.created_at

    return ConversationSummaryOut(
        id=conv.id,
        service_id=conv.service_id,
        service_title=service.title if service else "Listing",
        seeker_id=conv.seeker_id,
        seeker_name=seeker_name,
        provider_id=provider_id,
        provider_name=provider_name,
        other_party_name=other_party_name,
        last_message_preview=last_preview,
        last_message_at=last_at,
    )


@router.post("/start", response_model=ConversationDetailOut)
def start_conversation(
    payload: ConversationStart,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = (
        db.query(Service)
        .options(joinedload(Service.owner))
        .filter(Service.id == payload.service_id)
        .first()
    )
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    if service.owner_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot message yourself about your own listing",
        )

    conv = (
        db.query(Conversation)
        .filter(
            Conversation.service_id == payload.service_id,
            Conversation.seeker_id == current_user.id,
        )
        .first()
    )
    now = datetime.now(timezone.utc)
    if not conv:
        conv = Conversation(
            service_id=payload.service_id,
            seeker_id=current_user.id,
            updated_at=now,
        )
        db.add(conv)
        db.flush()

    msg = Message(
        conversation_id=conv.id,
        sender_id=current_user.id,
        body=payload.body.strip(),
    )
    db.add(msg)
    conv.updated_at = now
    db.commit()
    db.refresh(conv)

    conv = _load_conversation(db, conv.id)
    if not conv:
        raise HTTPException(status_code=500, detail="Could not load conversation")

    owner = conv.service.owner if conv.service else None
    seeker = conv.seeker
    return ConversationDetailOut(
        id=conv.id,
        service_id=conv.service_id,
        service_title=conv.service.title if conv.service else "",
        seeker_id=conv.seeker_id,
        seeker_name=seeker.name if seeker else "",
        provider_id=conv.service.owner_id if conv.service else 0,
        provider_name=owner.name if owner else "",
    )


@router.get("/", response_model=list[ConversationSummaryOut])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(Conversation)
        .join(Service, Conversation.service_id == Service.id)
        .options(
            joinedload(Conversation.service).joinedload(Service.owner),
            joinedload(Conversation.seeker),
        )
        .filter(
            or_(
                Conversation.seeker_id == current_user.id,
                Service.owner_id == current_user.id,
            )
        )
        .order_by(Conversation.updated_at.desc(), Conversation.id.desc())
        .all()
    )
    return [_summary_for_user(db, c, current_user) for c in rows]


@router.get("/{conversation_id}", response_model=ConversationDetailOut)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = _load_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    _assert_participant(conv, current_user)

    owner = conv.service.owner if conv.service else None
    seeker = conv.seeker
    return ConversationDetailOut(
        id=conv.id,
        service_id=conv.service_id,
        service_title=conv.service.title if conv.service else "",
        seeker_id=conv.seeker_id,
        seeker_name=seeker.name if seeker else "",
        provider_id=conv.service.owner_id if conv.service else 0,
        provider_name=owner.name if owner else "",
    )


@router.get("/{conversation_id}/messages", response_model=list[MessageOut])
def list_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = _load_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    _assert_participant(conv, current_user)

    rows = (
        db.query(Message)
        .options(joinedload(Message.sender))
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc(), Message.id.asc())
        .all()
    )
    out: list[MessageOut] = []
    for m in rows:
        sender = m.sender
        out.append(
            MessageOut(
                id=m.id,
                conversation_id=m.conversation_id,
                sender_id=m.sender_id,
                sender_name=sender.name if sender else "Unknown",
                body=m.body,
                created_at=m.created_at,
            )
        )
    return out


@router.post("/{conversation_id}/messages", response_model=MessageOut)
def send_message(
    conversation_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = _load_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    _assert_participant(conv, current_user)

    now = datetime.now(timezone.utc)
    msg = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        body=payload.body.strip(),
    )
    db.add(msg)
    conv.updated_at = now
    db.commit()
    db.refresh(msg)

    sender = db.query(User).filter(User.id == current_user.id).first()
    return MessageOut(
        id=msg.id,
        conversation_id=msg.conversation_id,
        sender_id=msg.sender_id,
        sender_name=sender.name if sender else current_user.name,
        body=msg.body,
        created_at=msg.created_at,
    )
