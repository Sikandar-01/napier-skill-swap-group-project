from pydantic import BaseModel
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.service_model import Service


class ServiceCreate(BaseModel):
    title: str
    category: str
    price: str
    description: Optional[str] = None
    contact_number: Optional[str] = None
    image: Optional[str] = None


class ServiceOut(BaseModel):
    id: int
    title: str
    category: str
    price: str
    description: Optional[str]
    contact_number: Optional[str]
    image: Optional[str]
    owner_id: int
    created_at: datetime
    owner_name: Optional[str] = None
    owner_email: Optional[str] = None

    class Config:
        from_attributes = True


def service_to_out(service: "Service") -> ServiceOut:
    owner = getattr(service, "owner", None)
    return ServiceOut(
        id=service.id,
        title=service.title,
        category=service.category,
        price=service.price,
        description=service.description,
        contact_number=service.contact_number,
        image=service.image,
        owner_id=service.owner_id,
        created_at=service.created_at,
        owner_name=owner.name if owner else None,
        owner_email=owner.email if owner else None,
    )