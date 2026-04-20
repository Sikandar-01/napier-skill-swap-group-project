from fastapi import APIRouter, Depends, HTTPException, status , Response , Cookie
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_model import User
from app.schemas.user_schemas import UserCreate, UserOut , UserLogin
from app.utils.security import hash_password , verify_password


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Basic validation before hitting the database
    if not user.email.endswith("@live.napier.ac.uk"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please register with your Napier university email address.",
        )

    if len(user.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long.",
        )

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered.",
        )

    # Hash password using existing security function
    print("Simple Pass:", user.password)
    hashed_password = hash_password(user.password)
    # print("Hashed Pass:", hashed_password)

    # Create user instance
    new_user = User(
        name=user.name,
        email=user.email,
        # password_hash=hashed_password,
        password_hash = hashed_password,
        is_active=True,
    )

    # Save to DB
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Register successful",
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "is_active": new_user.is_active,
        "is_admin": new_user.is_admin
    }


@router.post("/login", response_model=UserOut)
def login_user(response: Response, user: UserLogin, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )
    
    
    #Set cookie for session management (for demonstration, use user ID as value)
    # Lax works for same-site localhost (different ports) and avoids
    # SameSite=None without Secure, which browsers reject on http://.
    response.set_cookie(
        key="user_id",
        value=str(db_user.id),
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 24,  # 1 day
    )
    return {
        "message": "Login successful",
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "is_active": db_user.is_active,
        "is_admin": db_user.is_admin
}

@router.post("/logout")
def logout_user(response: Response):
    response.delete_cookie(key="user_id")
    return {"message": "Logout successful"}

