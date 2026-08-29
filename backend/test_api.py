"""Quick API smoke test — tests all 3 endpoints in sequence."""
import urllib.request
import urllib.parse
import json
import os
import io

API_BASE = "http://localhost:8000"

# --- Test 1: Health check ---
print("=" * 50)
print("TEST 1: Health Check")
resp = urllib.request.urlopen(f"{API_BASE}/")
data = json.loads(resp.read())
print(f"  Status: {data['status']}")
assert data["status"] == "operational", "Health check failed!"
print("  [PASS]\n")

# --- Test 2: Extract ---
print("=" * 50)
print("TEST 2: POST /api/v1/extract")

dxf_path = os.path.join(os.path.dirname(__file__), "..", "data", "sample_standard.dxf")
with open(dxf_path, "rb") as f:
    dxf_bytes = f.read()

# Build multipart form data manually
boundary = "----TestBoundary123456"
body = b""
# File part
body += f"--{boundary}\r\n".encode()
body += b'Content-Disposition: form-data; name="file"; filename="sample_standard.dxf"\r\n'
body += b"Content-Type: application/octet-stream\r\n\r\n"
body += dxf_bytes
body += b"\r\n"
# Mode part
body += f"--{boundary}\r\n".encode()
body += b'Content-Disposition: form-data; name="mode"\r\n\r\n'
body += b"standard\r\n"
body += f"--{boundary}--\r\n".encode()

req = urllib.request.Request(
    f"{API_BASE}/api/v1/extract",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    method="POST",
)
resp = urllib.request.urlopen(req)
extract_data = json.loads(resp.read())
print(f"  Status: {extract_data['status']}")
print(f"  Rooms: {len(extract_data['data']['rooms'])}")
print(f"  Staircases: {len(extract_data['data']['staircases'])}")
print(f"  Staircase widths: {extract_data['data']['staircase_widths_m']}")
assert extract_data["status"] == "success"
assert len(extract_data["data"]["rooms"]) > 0
assert len(extract_data["data"]["staircase_widths_m"]) > 0
print("  [PASS]\n")

# --- Test 3: Evaluate ---
print("=" * 50)
print("TEST 3: POST /api/v1/evaluate")

eval_payload = {
    "rooms": extract_data["data"]["rooms"],
    "staircases": extract_data["data"]["staircases"],
    "staircase_widths_m": extract_data["data"]["staircase_widths_m"],
    "building_height_m": 18.0,
    "occupancy_type": "Commercial",
}

req = urllib.request.Request(
    f"{API_BASE}/api/v1/evaluate",
    data=json.dumps(eval_payload).encode(),
    headers={"Content-Type": "application/json"},
    method="POST",
)
resp = urllib.request.urlopen(req)
eval_data = json.loads(resp.read())
print(f"  Decision: {eval_data['decision']}")
print(f"  Deficiencies: {len(eval_data['deficiencies'])}")
for d in eval_data["deficiencies"]:
    print(f"    - {d}")
print(f"  Recommendations: {len(eval_data['recommendations'])}")
for r in eval_data["recommendations"]:
    print(f"    - {r}")
assert eval_data["decision"] == "REJECTED"  # 1.2m stair < 1.5m commercial minimum
print("  [PASS]\n")

# --- Test 4: Seal ---
print("=" * 50)
print("TEST 4: POST /api/v1/seal")

seal_payload = {
    "filename": "sample_standard.dxf",
    "metrics": extract_data["data"],
    "evaluation": eval_data,
}

req = urllib.request.Request(
    f"{API_BASE}/api/v1/seal",
    data=json.dumps(seal_payload).encode(),
    headers={"Content-Type": "application/json"},
    method="POST",
)
resp = urllib.request.urlopen(req)
seal_data = json.loads(resp.read())
print(f"  SHA-256: {seal_data['sha256_hash']}")
print(f"  Timestamp: {seal_data['timestamp']}")
assert len(seal_data["sha256_hash"]) == 64
print("  [PASS]\n")

print("=" * 50)
print("ALL 4 TESTS PASSED")
