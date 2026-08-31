# AMC AI Fire NOC Scrutiny System (Prototype)

Automated CAD blueprint verification and deterministic compliance checking for Ahmedabad Municipal Corporation (AMC). This repository contains a modular prototype that: 

- Extracts geometric metrics from 2D CAD (.dxf) blueprints
- Evaluates those metrics against deterministic rules derived from NBC 2016 Part 4 and local regulations
- Produces a WORM (Write Once Read Many) SHA-256 cryptographic seal for audit trails
- Provides both a programmatic FastAPI backend and a Next.js frontend prototype

This README is written by an AI assistant using the Copilot CLI runtime in VS Code after scanning the project.

Status
------
Prototype — functional core modules and example UI. Not production hardened. Use for evaluation and further development.

Project layout
--------------
- [backend](</D:/Hackathon-Project Nirma/fire noc/AMC-AI-Fire-NOC-Scrutiny-System/backend/>) — FastAPI service implementing the core API endpoints and the processing core
  - [backend/main.py](</D:/Hackathon-Project Nirma/fire noc/AMC-AI-Fire-NOC-Scrutiny-System/backend/main.py>) — FastAPI app and router registration
  - [backend/api/extract.py](</D:/Hackathon-Project Nirma/fire noc/AMC-AI-Fire-NOC-Scrutiny-System/backend/api/extract.py>) — DXF upload and extraction endpoint
  - [backend/api/evaluate.py](</D:/Hackathon-Project Nirma/fire noc/AMC-AI-Fire-NOC-Scrutiny-System/backend/api/evaluate.py>) — Compliance evaluation endpoint
  - [backend/api/seal.py](</D:/Hackathon-Project Nirma/fire noc/AMC-AI-Fire-NOC-Scrutiny-System/backend/api/seal.py>) — WORM cryptographic seal endpoint
  - [backend/core/](</D:/Hackathon-Project Nirma/fire noc/AMC-AI-Fire-NOC-Scrutiny-System/backend/core/>) — core modules (`cad_parser.py`, `rule_engine.py`, `crypto_seal.py`)
  - [backend/requirements.txt](</D:/Hackathon-Project Nirma/fire noc/AMC-AI-Fire-NOC-Scrutiny-System/backend/requirements.txt>) — backend dependencies
- [frontend](</D:/Hackathon-Project Nirma/fire noc/AMC-AI-Fire-NOC-Scrutiny-System/frontend/>) — Next.js prototype (Blueprint viewer, upload UI)
  - [frontend/package.json](</D:/Hackathon-Project Nirma/fire noc/AMC-AI-Fire-NOC-Scrutiny-System/frontend/package.json>)
  - [frontend/README.md](</D:/Hackathon-Project Nirma/fire noc/AMC-AI-Fire-NOC-Scrutiny-System/frontend/README.md>)
- [data](</D:/Hackathon-Project Nirma/fire noc/AMC-AI-Fire-NOC-Scrutiny-System/data/>) — sample DXF / LAS files and data generators
- [app.py](</D:/Hackathon-Project Nirma/fire noc/AMC-AI-Fire-NOC-Scrutiny-System/app.py>) — Streamlit dashboard (legacy MVP)

Key concepts
------------
- DXF parsing: Uses ezdxf to extract entities from explicit DXF layers such as `ROOMS` and `STAIRS`. The parser returns rooms, staircases, vertices and widths for frontend rendering.
- Deterministic rule engine: Encodes selectable checks (e.g., minimum stair width by occupancy, room area thresholds, high-rise refuge requirements) and returns decision, deficiencies and recommendations.
- Cryptographic sealing: Serializes filename + metrics + evaluation into a canonical JSON string and computes SHA-256 to produce a tamper-evident fingerprint with an ISO-8601 timestamp.

Quickstart — Backend (FastAPI)
-----------------------------
1. Create and activate a Python environment (recommended):

   Windows (PowerShell):
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

2. Install backend dependencies:

   ```powershell
   cd backend
   pip install -r requirements.txt
   ```

   If you want to run the Streamlit demo (app.py) as well, also install streamlit:
   ```powershell
   pip install streamlit
   ```

3. Start the FastAPI server locally (development):

   ```powershell
   # from repository root
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. Open the health check in a browser or curl:

   http://localhost:8000/

5. API interactive docs (when server is running):

   http://localhost:8000/docs

API Endpoints (HTTP)
--------------------
1. POST /api/v1/extract
   - Purpose: Upload a .dxf and extract geometric metrics.
   - Content: multipart/form-data with `file` (DXF) and optional `mode` (defaults to "standard").
   - Returns: JSON with rooms, staircases, staircase_widths_m, and building_height_m (user-supplied later).

   Example curl:
   ```bash
   curl -X POST "http://localhost:8000/api/v1/extract" \
     -F "file=@data/sample_standard.dxf" \
     -F "mode=standard"
   ```

2. POST /api/v1/evaluate
   - Purpose: Evaluate extracted metrics against rules.
   - Content-Type: application/json
   - Body: JSON matching the EvaluateRequest model (rooms, staircases, staircase_widths_m, building_height_m, occupancy_type)
   - Returns: decision (APPROVED/REJECTED), deficiencies, recommendations, deficiency_entity_ids

   Example curl (after extract):
   ```bash
   curl -X POST "http://localhost:8000/api/v1/evaluate" \
     -H "Content-Type: application/json" \
     -d '{"rooms": [...], "staircases": [...], "staircase_widths_m": [1.2], "building_height_m": 18.0, "occupancy_type": "Commercial"}'
   ```

3. POST /api/v1/seal
   - Purpose: Generate a deterministic SHA-256 fingerprint for audit storage (WORM). 
   - Content-Type: application/json
   - Body: filename, metrics, evaluation
   - Returns: sha256_hash, timestamp

   Example curl:
   ```bash
   curl -X POST "http://localhost:8000/api/v1/seal" \
     -H "Content-Type: application/json" \
     -d '{"filename":"sample_standard.dxf","metrics":{...},"evaluation":{...}}'
   ```

Frontend (Next.js)
------------------
The frontend is a prototype UI using Next.js (app dir). To run locally:

```bash
cd frontend
npm install
npm run dev
# open http://localhost:3000
```

Notes
-----
- DXF expectations: The CAD parser expects entities annotated on explicit layers named `ROOMS` and `STAIRS`. The parser uses bounding boxes and LWPOLYLINE geometry to compute widths and areas.
- Units: The parser assumes DXF model units such that coordinates map directly to meters; if your CAD uses mm/ft, normalize before upload or extend the parser.
- Security: No authentication is implemented — do not expose the prototype to untrusted networks without adding auth, rate-limiting and input validation hardening.
- Productionization: The prototype is not ready for production. Recommended improvements include: robust DXF validation, better error handling, schema versioning for sealed payloads, signed timestamps, persistent audit store, and automated tests.

Testing
-------
A simple smoke-test script is provided: [backend/test_api.py](</D:/Hackathon-Project Nirma/fire noc/AMC-AI-Fire-NOC-Scrutiny-System/backend/test_api.py>)

- Start the backend (uvicorn) and then run the script from repository root (requires the server running at http://localhost:8000):

```powershell
python backend/test_api.py
```

Sample data
-----------
The `data/` folder contains example DXF and LAS files useful for manual testing and demos:
- [data/sample_standard.dxf](</D:/Hackathon-Project Nirma/fire noc/AMC-AI-Fire-NOC-Scrutiny-System/data/sample_standard.dxf>)
- [data/sample_multi_staircase.dxf](</D:/Hackathon-Project Nirma/fire noc/AMC-AI-Fire-NOC-Scrutiny-System/data/sample_multi_staircase.dxf>)

Developer notes & next steps
---------------------------
- Consider adding OpenAPI schema extensions and example payloads for each endpoint.
- Add CI tests that run the smoke test against a started uvicorn instance in CI.
- Add a minimal Dockerfile for both backend and frontend for consistent development environments.
- Replace the Streamlit MVP (`app.py`) with an integrated frontend that calls the FastAPI endpoints.

Contributing
------------
Contributions welcome. Open an issue to propose changes or submit pull requests.

License
-------
No license is included in this prototype. Add a LICENSE file to specify terms (e.g., MIT, Apache-2.0).

Contact
-------
For questions about this repository, inspect the code or open an issue in the GitHub repository.


---