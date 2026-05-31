from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="MatriGluco API",
    description="Backend API for MatriGluco, an AI-powered maternal diabetes prediction platform.",
    version="1.0.0"
)

# Configure CORS — reads allowed origins from env so it works in both dev and prod
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
extra_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    *extra_origins,          # e.g. https://matrigluco.vercel.app
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router.api_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Welcome to MatriGluco API"}
