import hashlib
import json
from datetime import datetime, timezone
from typing import Any


def generate_worm_hash(
    filename: str,
    metrics: dict[str, Any],
    evaluation: dict[str, Any],
) -> dict[str, str]:
    """
    Generates a deterministic SHA-256 cryptographic fingerprint
    combining input metadata, extracted geometry, and compliance results.

    Returns both the hash and an ISO-8601 timestamp.
    Migrated from Streamlit MVP with added timestamp support.
    """
    payload = {
        "file_name": filename,
        "metrics": metrics,
        "compliance": evaluation,
    }

    serialized_payload = json.dumps(payload, sort_keys=True)
    digital_fingerprint = hashlib.sha256(serialized_payload.encode("utf-8")).hexdigest()

    return {
        "sha256_hash": digital_fingerprint,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
