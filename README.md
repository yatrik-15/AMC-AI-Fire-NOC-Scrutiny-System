# AMC AI Fire NOC Scrutiny System (Prototype)

A modular prototype for automated CAD blueprint verification, deterministic compliance checking, and WORM cryptographic audit trailing for Ahmedabad Municipal Corporation (AMC).

## Directory Structure
```text
amc-fire-noc-prototype/
│
├── app.py                  # Streamlit Dashboard UI
├── requirements.txt        # Dependencies
├── README.md               # Instructions
│
└── core/                   # Processing Core
    ├── __init__.py
    ├── cad_parser.py       # ezdxf Vector Extractor
    ├── rule_engine.py      # NBC 2016 & Heritage Logic
    └── crypto_seal.py      # SHA-256 WORM Hashing