from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import items, classify, search

app = FastAPI(
    title="Agenda Personale API",
    description="API per agenda intelligente personale",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items.router, prefix="/api/items", tags=["items"])
app.include_router(classify.router, prefix="/api/classify", tags=["classify"])
app.include_router(search.router, prefix="/api/search", tags=["search"])

@app.get("/")
async def root():
    return {"message": "Agenda Personale API", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
