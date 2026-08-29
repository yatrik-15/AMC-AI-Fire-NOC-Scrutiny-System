from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.extract import router as extract_router
from api.evaluate import router as evaluate_router
from api.seal import router as seal_router

app = FastAPI(
    title="AMC Fire NOC Scrutiny API",
    description=(
        "Deterministic architectural blueprint validation engine for "
        "Ahmedabad Municipal Corporation. Validates 2D CAD blueprints "
        "against NBC 2016 Part 4 and Gujarat Fire Act 2013."
    ),
    version="2.0.0-prototype",
)

# CORS — allow Next.js dev server
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

# Mount API v1 routes
app.include_router(extract_router, prefix="/api/v1", tags=["Extract"])
app.include_router(evaluate_router, prefix="/api/v1", tags=["Evaluate"])
app.include_router(seal_router, prefix="/api/v1", tags=["Seal"])


@app.get("/")
async def health_check():
    return {
        "service": "AMC Fire NOC Scrutiny API",
        "version": "2.0.0-prototype",
        "status": "operational",
    }
