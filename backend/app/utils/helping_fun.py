from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_model import User

# Matches frontend Navbar / AuthContext moderator list for API-side checks.
MODERATOR_EMAILS = frozenset(
    e.lower()
    for e in (
        "40770471@live.napier.ac.uk",
        "40770470@live.napier.ac.uk",
        "40735762@live.napier.ac.uk",
        "40736676@live.napier.ac.uk",
        "40730587@live.napier.ac.uk",
    )
)


def user_can_moderate(user: User) -> bool:
    if getattr(user, "is_admin", False):
        return True
    email = (getattr(user, "email", None) or "").lower().strip()
    return email in MODERATOR_EMAILS


def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = request.cookies.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    user = db.query(User).filter(User.id == int(user_id)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user