from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from core.cad_parser import parse_cad_dxf

router = APIRouter()


@router.post("/extract")
async def extract_metrics(
    file: UploadFile = File(...),
    mode: str = Form("standard"),
):
    """
    POST /api/v1/extract

    Parses the uploaded DXF file and extracts raw geometric measurements
    including room areas, staircase widths, and vertex coordinates for rendering.

    Accepts: multipart/form-data with 'file' (.dxf) and 'mode' fields.
    """
    # Validate file extension
    if not file.filename or not file.filename.lower().endswith(".dxf"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only .dxf files are accepted in Standard Mode.",
        )

    # Read file bytes
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Parse via the enhanced CAD parser
    parsed = parse_cad_dxf(file_bytes)

    if parsed["error"]:
        raise HTTPException(status_code=422, detail=parsed["error"])

    return {
        "status": "success",
        "data": {
            "rooms": parsed["rooms"],
            "staircases": parsed["staircases"],
            "staircase_widths_m": parsed["staircase_widths_m"],
            "building_height_m": parsed["building_height_m"],
        },
    }
