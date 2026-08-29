import ezdxf
from ezdxf import bbox
import tempfile
import os
from typing import Any


def parse_cad_dxf(file_bytes: bytes) -> dict[str, Any]:
    """
    Parses a DXF file from raw bytes and extracts:
    - Room dimensions (from ROOMS layer)
    - Staircase widths (from STAIRS layer)
    - Raw vertex coordinates for each entity (for frontend canvas rendering)

    Enhanced from the Streamlit MVP to return geometry data for the
    Next.js BlueprintViewer component.
    """
    tmp_path = None
    try:
        # Write to temp file — ezdxf.readfile() is more reliable than
        # ezdxf.read(StringIO) for preserving custom layers and entities
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".dxf")
        os.write(tmp_fd, file_bytes)
        os.close(tmp_fd)
        doc = ezdxf.readfile(tmp_path)
    except Exception as e:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
        return {
            "error": f"Failed to parse DXF file format: {str(e)}",
            "rooms": [],
            "staircases": [],
            "staircase_widths_m": [],
            "building_height_m": None,
        }

    msp = doc.modelspace()
    cache = bbox.Cache()

    # --- Extract Room Dimensions (Layer: 'ROOMS') ---
    rooms = []
    room_entities = msp.query('LWPOLYLINE[layer=="ROOMS"]')
    for idx, room in enumerate(room_entities):
        room_box = bbox.extents([room], cache=cache)
        if room_box.has_data:
            width = room_box.extmax.x - room_box.extmin.x
            length = room_box.extmax.y - room_box.extmin.y
            area = width * length

            # Extract raw vertices for frontend rendering
            vertices = [[round(pt[0], 2), round(pt[1], 2)] for pt in room.get_points(format="xy")]

            rooms.append({
                "id": idx + 1,
                "width_m": round(width, 2),
                "length_m": round(length, 2),
                "area_sqm": round(area, 2),
                "vertices": vertices,
            })

    # --- Extract Staircase Widths (Layer: 'STAIRS') ---
    staircases = []
    staircase_widths_m = []
    stair_entities = msp.query('*[layer=="STAIRS"]')
    for idx, stair in enumerate(stair_entities):
        stair_box = bbox.extents([stair], cache=cache)
        if stair_box.has_data:
            dim_x = stair_box.extmax.x - stair_box.extmin.x
            dim_y = stair_box.extmax.y - stair_box.extmin.y
            stair_width = round(min(dim_x, dim_y), 2)
            staircase_widths_m.append(stair_width)

            # Extract raw vertices for frontend rendering
            vertices = []
            if hasattr(stair, "get_points"):
                vertices = [[round(pt[0], 2), round(pt[1], 2)] for pt in stair.get_points(format="xy")]
            elif hasattr(stair.dxf, "insert"):
                # For INSERT (block reference) entities, use bounding box corners
                vertices = [
                    [round(stair_box.extmin.x, 2), round(stair_box.extmin.y, 2)],
                    [round(stair_box.extmax.x, 2), round(stair_box.extmin.y, 2)],
                    [round(stair_box.extmax.x, 2), round(stair_box.extmax.y, 2)],
                    [round(stair_box.extmin.x, 2), round(stair_box.extmax.y, 2)],
                    [round(stair_box.extmin.x, 2), round(stair_box.extmin.y, 2)],
                ]

            staircases.append({
                "id": idx + 1,
                "width_m": stair_width,
                "length_m": round(max(dim_x, dim_y), 2),
                "vertices": vertices,
            })

    # Clean up temp file
    if tmp_path and os.path.exists(tmp_path):
        os.unlink(tmp_path)

    return {
        "error": None,
        "rooms": rooms,
        "staircases": staircases,
        "staircase_widths_m": staircase_widths_m,
        "building_height_m": None,  # Set by user input, not from DXF
    }
