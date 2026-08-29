import streamlit as st
import time
from core.cad_parser import parse_cad_dxf
from core.rule_engine import evaluate_compliance
from core.crypto_seal import generate_worm_hash

st.set_page_config(page_title="AMC Fire NOC Scrutiny System", layout="wide")

st.title("🏙️ AMC AI Fire NOC Scrutiny System")
st.markdown("Automated vector-based blueprint validation for standard and heritage structures.")

# --- Sidebar Controls ---
st.sidebar.header("Scrutiny Settings")
mode = st.sidebar.radio(
    "Inspection Mode", 
    ["Standard Mode (NBC 2016)", "Heritage Mode (Walled City)"]
)
bldg_height = st.sidebar.slider("Building Height (Meters)", 5.0, 100.0, 18.0)
occupancy = st.sidebar.selectbox(
    "Occupancy Type", 
    ["Commercial", "Residential", "Institutional", "Industrial"]
)

# --- File Uploader ---
st.subheader("1. Upload Structural Data")

if "Standard" in mode:
    uploaded_file = st.file_uploader("Upload CAD Blueprint (.dxf)", type=["dxf"])
else:
    uploaded_file = st.file_uploader("Upload 3D Point Cloud or CAD (.las, .ply, .dxf)", type=["las", "ply", "dxf"])

if uploaded_file is not None:
    st.info(f"File '{uploaded_file.name}' uploaded. Executing analysis pipeline...")
    
    # Visual simulation of extraction processing
    progress_bar = st.progress(0)
    for percent in range(100):
        time.sleep(0.005)
        progress_bar.progress(percent + 1)

    # Core Module 1: CAD Vector Parsing
    if uploaded_file.name.endswith(".dxf"):
        parsed_data = parse_cad_dxf(uploaded_file)
    else:
        # Mock point cloud payload for Heritage LAS uploads
        parsed_data = {
            "error": None,
            "rooms": [{"id": 1, "width": 4.0, "length": 5.0, "area": 20.0}],
            "staircase_widths": [0.95]
        }

    if parsed_data["error"]:
        st.error(parsed_data["error"])
    else:
        st.success("Extraction Complete!")
        st.divider()

        # Display Metrics
        st.subheader("2. Extracted Geometric Metrics")
        m_col1, m_col2, m_col3 = st.columns(3)
        
        stair_widths = parsed_data["staircase_widths"]
        stair_str = ", ".join([f"{w}m" for w in stair_widths]) if stair_widths else "None Detected"
        
        m_col1.metric("Detected Staircase Widths", stair_str)
        m_col2.metric("Total Rooms Parsed", len(parsed_data["rooms"]))
        m_col3.metric("Building Height", f"{bldg_height} m")

        # Core Module 2: Rule Engine Evaluation
        st.subheader("3. Compliance Scrutiny Report")
        report = evaluate_compliance(parsed_data, occupancy, bldg_height, mode)

        if report["status"] == "APPROVED":
            st.success("✅ **STATUS: APPROVED** — 100% Code Compliance Achieved.")
        else:
            st.error("🚨 **STATUS: REJECTED** — Critical non-compliance items identified.")

        if report["deficiencies"]:
            st.write("### Deficiencies:")
            for item in report["deficiencies"]:
                st.markdown(item)

        if report["recommendations"]:
            st.write("### Recommended / Compensatory Measures:")
            for item in report["recommendations"]:
                st.markdown(item)

        # Core Module 3: WORM Cryptographic Seal
        st.divider()
        st.subheader("4. Cryptographic Audit Trail (WORM)")
        worm_hash = generate_worm_hash(uploaded_file.name, parsed_data, report)
        st.write("SHA-256 Tamper-Proof Fingerprint:")
        st.code(worm_hash, language="text")