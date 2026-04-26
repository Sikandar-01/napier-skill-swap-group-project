from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.service_model import Service
from app.schemas.service_schema import ServiceCreate, ServiceOut, service_to_out
from app.utils.helping_fun import get_current_user, user_can_moderate


router = APIRouter(
    prefix="/services",
    tags=["services"],
)


@router.post("/", response_model=ServiceOut)
def create_service(
    service: ServiceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    new_service = Service(
        **service.model_dump(),
        owner_id=current_user.id
    )

    db.add(new_service)
    db.commit()
    db.refresh(new_service)

    loaded = (
        db.query(Service)
        .options(joinedload(Service.owner))
        .filter(Service.id == new_service.id)
        .first()
    )
    if not loaded:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not load created service",
        )
    return service_to_out(loaded)


@router.get("/", response_model=list[ServiceOut])
def get_all_services(db: Session = Depends(get_db)):
    rows = (
        db.query(Service)
        .options(joinedload(Service.owner))
        .order_by(Service.created_at.desc())
        .all()
    )
    return [service_to_out(s) for s in rows]


@router.get("/me", response_model=list[ServiceOut])
def get_my_services(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    rows = (
        db.query(Service)
        .options(joinedload(Service.owner))
        .filter(Service.owner_id == current_user.id)
        .order_by(Service.created_at.desc())
        .all()
    )
    return [service_to_out(s) for s in rows]


@router.delete("/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = db.query(Service).filter(Service.id == service_id).first()

    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    if service.owner_id != current_user.id and not user_can_moderate(current_user):
        raise HTTPException(status_code=403, detail="Not allowed")

    db.delete(service)
    db.commit()

    return {"message": "Service deleted"}

@router.get("/{service_id}", response_model=ServiceOut)
def get_service_by_id(
    service_id: int,
    db: Session = Depends(get_db)
):
    service = (
        db.query(Service)
        .options(joinedload(Service.owner))
        .filter(Service.id == service_id)
        .first()
    )

    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    return service_to_out(service)

@router.put("/{service_id}", response_model=ServiceOut)
def update_service(
    service_id: int,
    service_update: ServiceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = db.query(Service).filter(Service.id == service_id).first()

    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    if service.owner_id != current_user.id and not user_can_moderate(current_user):
        raise HTTPException(status_code=403, detail="Not allowed")

    for key, value in service_update.model_dump().items():
        setattr(service, key, value)

    db.commit()
    updated = (
        db.query(Service)
        .options(joinedload(Service.owner))
        .filter(Service.id == service_id)
        .first()
    )
    return service_to_out(updated)