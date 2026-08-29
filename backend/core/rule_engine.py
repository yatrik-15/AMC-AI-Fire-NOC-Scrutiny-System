from typing import Any


def evaluate_compliance(
    extracted_data: dict[str, Any],
    occupancy: str,
    height_m: float,
) -> dict[str, Any]:
    """
    Evaluates extracted geometric metrics against deterministic NBC 2016 Part 4
    building code rules for Standard Mode.

    Returns:
        - decision: "APPROVED" or "REJECTED"
        - deficiencies: list of plain-text deficiency descriptions
        - recommendations: list of recommended interventions
        - deficiency_entity_ids: list of entity IDs that failed (for red highlighting)

    Migrated from Streamlit MVP — stripped emoji formatting, added entity ID tracking.
    """
    deficiencies: list[str] = []
    recommendations: list[str] = []
    deficiency_entity_ids: list[dict[str, Any]] = []

    staircase_widths = extracted_data.get("staircase_widths_m", [])
    staircases = extracted_data.get("staircases", [])

    # --- Rule 1: Minimum Staircase Width (NBC 2016 Part 4, Clause 4.4.3) ---
    min_stair_width = 1.5 if occupancy in ["Commercial", "Institutional"] else 1.2

    if not staircase_widths:
        deficiencies.append(
            "No staircase entities detected on the 'STAIRS' layer. "
            "At least one compliant staircase is required."
        )
    else:
        for idx, width in enumerate(staircase_widths):
            if width < min_stair_width:
                deficiencies.append(
                    f"Staircase {idx + 1} width ({width}m) is below the "
                    f"{min_stair_width}m minimum required for {occupancy} occupancy."
                )
                # Map to the staircase entity ID for frontend highlighting
                if idx < len(staircases):
                    deficiency_entity_ids.append({
                        "type": "staircase",
                        "id": staircases[idx]["id"],
                        "rule": "min_staircase_width",
                        "actual": width,
                        "required": min_stair_width,
                    })

    # --- Rule 2: Refuge Area for High-Rise (NBC 2016, Clause 4.4.1) ---
    if height_m > 24.0:
        deficiencies.append(
            f"Building height ({height_m}m) exceeds 24m. "
            "A dedicated refuge area on every 5th floor is required."
        )

    # --- Rule 3: Wet Riser / Sprinkler for Commercial > 15m ---
    if height_m > 15.0 and occupancy == "Commercial":
        recommendations.append(
            "Automatic sprinkler and wet riser system is mandated for "
            f"commercial buildings exceeding 15m (current: {height_m}m)."
        )

    # --- Rule 4: Minimum room area check (NBC 2016, Clause 8.2) ---
    rooms = extracted_data.get("rooms", [])
    for room in rooms:
        area = room.get("area_sqm", 0)
        if area < 9.5 and occupancy == "Residential":
            deficiencies.append(
                f"Room {room['id']} area ({area} sq.m) is below the "
                "9.5 sq.m minimum habitable room area for Residential occupancy."
            )
            deficiency_entity_ids.append({
                "type": "room",
                "id": room["id"],
                "rule": "min_room_area",
                "actual": area,
                "required": 9.5,
            })

    decision = "REJECTED" if deficiencies else "APPROVED"

    return {
        "decision": decision,
        "deficiencies": deficiencies,
        "recommendations": recommendations,
        "deficiency_entity_ids": deficiency_entity_ids,
    }
