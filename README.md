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

System architecture
-------------------
The project follows a layered architecture designed for deterministic rule-based review rather than opaque AI scoring. In presentation terms, it maps to the Digital Fire Compliance Lifecycle System: a Phase A pre-occupancy gatekeeper followed by Phase B post-issuance monitoring and escalation.

```text
+---------------------------------------------------------------------+
| Phase A: Pre-Occupancy Gatekeeper                                     |
| - CAD/DXF ingestion                                                  |
| - Vector validation / layer segregation                              |
| - Symbol and plan extraction                                         |
| - NBC / CGDCR rule evaluation                                        |
| - Form B issuance and immutable audit hash                           |
+-------------------------------------+-------------------------------+
                                      |
                                      v
+-------------------------------------+-------------------------------+
| Frontend / User Interface                                             |
| - Next.js app                                                         |
| - Upload blueprint and occupancy inputs                               |
| - Render geometry and highlight deficiencies                          |
| - Display compliance decision and seal output                         |
+-------------------------------------+-------------------------------+
                                      |
                                      v
+-------------------------------------+-------------------------------+
| API Layer (FastAPI)                                                   |
| POST /api/v1/extract                                                  |
| POST /api/v1/evaluate                                                 |
| POST /api/v1/seal                                                     |
+-------------------------------------+-------------------------------+
                                      |
                                      v
+-------------------------------------+-------------------------------+
| Processing Core                                                       |
| 1. CAD parser (ezdxf)                                                 |
|    - reads .dxf/geometry                                              |
|    - extracts rooms, staircases, vertices, dimensions                 |
| 2. Rule engine                                                        |
|    - applies NBC / local code checks                                  |
|    - computes decision + deficiencies + recommendations               |
| 3. Crypto seal                                                        |
|    - canonical JSON serialization                                     |
|    - SHA-256 fingerprint                                              |
+-------------------------------------+-------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------+
| Phase B: Continuous Monitoring Grid                                  |
| - 2-year NOC lifecycle validity tracking                              |
| - Pre-expiry reminders, escalation ladder, municipal interlocks      |
| - Dynamic risk prioritization and audit continuity                   |
+---------------------------------------------------------------------+
```

Architecture in business terms
------------------------------
This project is designed around a single end-to-end compliance lifecycle:

1. CAD ingestion and vector validation
   - Accept only vector plans and reject raster-based or ambiguous inputs.
   - Segregate building layers such as rooms, stairs, exits, and fire equipment.
2. AI-assisted plan review
   - Extract plan metadata and geometric features from the blueprint.
   - Evaluate egress, staircase width, refuge area, fire access, and occupancy factors.
3. Legal rule engine
   - Map extracted values into a deterministic legal ontology tied to NBC 2016, Gujarat Fire Act, and municipal rules.
   - Produce a pass/fail decision with measurable deficiencies.
4. Immutable audit trail
   - Create a SHA-256 seal for the submitted file and compliance result.
   - Protect the document against tampering and provide court-ready evidence.
5. Lifecycle governance
   - Extend beyond the approval stage into post-issuance monitoring, expiry notices, worklist prioritization and renewal enforcement.

This aligns with the deck's core message: a unified AI-powered pre-occupancy scrutiny and continuous post-issuance fire NOC lifecycle management framework.

Key concepts
------------
- DXF parsing: Uses ezdxf to extract entities from explicit DXF layers such as `ROOMS` and `STAIRS`. The parser returns rooms, staircases, vertices and widths for frontend rendering.
- Deterministic rule engine: Encodes selectable checks (e.g., minimum stair width by occupancy, room area thresholds, high-rise refuge requirements) and returns decision, deficiencies and recommendations.
- Cryptographic sealing: Serializes filename + metrics + evaluation into a canonical JSON string and computes SHA-256 to produce a tamper-evident fingerprint with an ISO-8601 timestamp.

Typical usage workflow
----------------------
1. User uploads a CAD blueprint (.dxf) from the frontend or via API.
2. The backend `/extract` endpoint parses the file and returns geometric metrics.
3. The user supplies occupancy type and building height.
4. The backend `/evaluate` endpoint checks metric thresholds against the rule engine.
5. The result includes:
   - `decision` — APPROVED or REJECTED
   - `deficiencies` — code gaps or fail conditions
   - `recommendations` — mitigation actions
   - `deficiency_entity_ids` — entities to highlight on the blueprint
6. The backend `/seal` endpoint creates the WORM hash for audit integrity.
7. The frontend visuals the blueprint, highlights non-compliant objects, and displays the compliance report.

End-user workflow (recommended)
--------------------------------
- Open the frontend at `http://localhost:3000`
- Upload a sample DXF or project plan
- Select occupancy type (Commercial, Residential, Institutional, Industrial)
- Enter or adjust building height
- Review the extracted rooms and staircase widths
- Inspect highlighted deficiencies
- Download or record the cryptographic seal for audit purposes

Developer workflow
------------------
- Start the backend service
- Run the API smoke test
- Inspect `/docs` for request/response schemas
- Extend rule checks in `backend/core/rule_engine.py`
- Add new parsing logic in `backend/core/cad_parser.py`
- Connect new UI interactions in the Next.js frontend

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