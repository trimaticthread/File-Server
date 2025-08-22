import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import Base, engine
from .routers import files

app = FastAPI(title="File Server API")

# CORS - Frontend URL'lerini environment variable'dan al
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]

# Development için default CORS ayarları
if not origins:
    origins = [
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:8080",
        "http://localhost:8081",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
        "http://10.21.203.31:8080", 
        "http://10.21.203.31:8081",
        "http://172.31.16.1:8080",
        "http://172.31.16.1:8081"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development için tüm origin'leri kabul et
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    os.makedirs(os.getenv("STORAGE_DIR", "/storage"), exist_ok=True)

# Files router'ı API prefix ile ekle
app.include_router(files.router, prefix="/api/files", tags=["files"])
