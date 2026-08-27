from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.session import get_db

# Re-export standard database session dependency
DatabaseSession = Depends(get_db)
