from fastapi import APIRouter
from pydantic import BaseModel, Field
from core.rule_engine import evaluate_compliance

router = APIRouter()


class EvaluateRequest(BaseModel):
    """Request body matching the output of /api/v1/extract + user parameters."""

    rooms: list[dict] = Field(default_factory=list)
    staircases: list[dict] = Field(default_factory=list)
    staircase_widths_m: list[float] = Field(default_factory=list)
    building_height_m: float = Field(..., gt=0, description="Building height in meters")
    occupancy_type: str = Field(..., description="Commercial, Residential, Institutional, or Industrial")


@router.post("/evaluate")
async def evaluate_metrics(request: EvaluateRequest):
    """
    POST /api/v1/evaluate

    Runs the extracted metrics against the deterministic NBC 2016 Part 4
    rule engine. Returns pass/fail decision, deficiency list, and recommendations.

    Accepts: JSON output from /api/v1/extract + user parameters.
    """
    # Build the extracted data dict expected by the rule engine
    extracted_data = {
        "rooms": request.rooms,
        "staircases": request.staircases,
        "staircase_widths_m": request.staircase_widths_m,
    }

    result = evaluate_compliance(
        extracted_data=extracted_data,
        occupancy=request.occupancy_type,
        height_m=request.building_height_m,
    )

    return {
        "status": "success",
        "decision": result["decision"],
        "deficiencies": result["deficiencies"],
        "recommendations": result["recommendations"],
        "deficiency_entity_ids": result["deficiency_entity_ids"],
    }
