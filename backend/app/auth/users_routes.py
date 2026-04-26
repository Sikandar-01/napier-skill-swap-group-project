from fastapi import APIRouter, Depends, HTTPException, status, Cookie
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_model import User
from app.schemas.user_schemas import UserOut

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.get("/me", response_model=UserOut)
def get_current_user(user_id: int = Cookie(None), db: Session = Depends(get_db)):
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="You are not logged in")

    db_user = db.query(User).filter(User.id == int(user_id)).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return {
        "message": "User fetched successfully",
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "is_active": db_user.is_active,
        "is_admin": db_user.is_admin
    }
