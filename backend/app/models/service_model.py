from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    price = Column(String, nullable=False)
    description = Column(Text)

    contact_number = Column(String)
    image = Column(String)

    owner_id = Column(Integer, ForeignKey("users.id"))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="services")