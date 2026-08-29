from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Any
from core.crypto_seal import generate_worm_hash

router = APIRouter()


class SealRequest(BaseModel):
    """Request body for generating the WORM cryptographic seal."""

    filename: str = Field(..., description="Original uploaded filename")
    metrics: dict[str, Any] = Field(..., description="Extracted geometric metrics")
    evaluation: dict[str, Any] = Field(..., description="Compliance evaluation results")


@router.post("/seal")
async def seal_report(request: SealRequest):
    """
    POST /api/v1/seal

    Generates an unalterable SHA-256 cryptographic fingerprint combining
    the filename, extracted metrics, and compliance evaluation results
    for the WORM audit database.
    """
    result = generate_worm_hash(
        filename=request.filename,
        metrics=request.metrics,
        evaluation=request.evaluation,
    )

    return {
        "status": "success",
        "sha256_hash": result["sha256_hash"],
        "timestamp": result["timestamp"],
    }
