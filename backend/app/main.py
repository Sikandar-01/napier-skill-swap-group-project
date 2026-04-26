from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.auth_routes import router as auth_router
from app.database import engine, Base
from app.auth.users_routes import router as user_routes
from app.services.service_routes import router as service_router
from app.conversations.conversation_routes import router as conversation_router

# Register ORM models so Base.metadata.create_all creates all tables
import app.models.conversation_model  # noqa: F401
import app.models.message_model  # noqa: F401


app = FastAPI(title="Napier SkillSwap API")

# CORS configuration for the Next.js frontend (dev)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure tables are created on startup
Base.metadata.create_all(bind=engine)

# Register routers
app.include_router(auth_router)
app.include_router(user_routes)
app.include_router(service_router)
app.include_router(conversation_router)