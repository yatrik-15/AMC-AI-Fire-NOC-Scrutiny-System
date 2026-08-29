import ezdxf

def generate_complex_blueprint(filename="sample_complex_commercial.dxf"):
    """
    Generates a complex multi-room, multi-staircase commercial floor plan DXF.
    Designed for AMC AI Fire NOC Scrutiny demonstration with judges.
    """
    doc = ezdxf.new('R2010')
    msp = doc.modelspace()

    # Define standard layers with distinct colors
    doc.layers.add("ROOMS", color=3)       # Green (Rooms)
    doc.layers.add("STAIRS", color=1)      # Red/Orange (Staircases)
    doc.layers.add("WALLS", color=7)       # White/Grey (Structural Walls)
    doc.layers.add("CORRIDORS", color=4)   # Cyan (Corridors & Passages)

    # -------------------------------------------------------------
    # 1. ROOMS LAYER (Polylines representing rooms)
    # -------------------------------------------------------------
    rooms = [
        # (name, points)
        ("Grand Entrance Lobby", [(0, 0), (12, 0), (12, 10), (0, 10), (0, 0)]),
        ("East Office Suite", [(14, 0), (24, 0), (24, 8), (14, 8), (14, 0)]),
        ("West Conference Hall", [(-12, 0), (-2, 0), (-2, 10), (-12, 10), (-12, 0)]),
        ("Executive Boardroom", [(0, 12), (12, 12), (12, 20), (0, 20), (0, 12)]),
        ("IT & Server Hub", [(14, 10), (20, 10), (20, 15), (14, 15), (14, 10)]),
        ("North-West Workstation Wing", [(-12, 12), (-4, 12), (-4, 20), (-12, 20), (-12, 12)]),
    ]

    for name, pts in rooms:
        msp.add_lwpolyline(pts, dxfattribs={'layer': 'ROOMS'})

    # -------------------------------------------------------------
    # 2. STAIRCASE LAYER (Egress routes)
    # -------------------------------------------------------------
    # Staircase 1: Main West Staircase (Width = 1.8m -> PASSES Commercial 1.5m rule)
    msp.add_lwpolyline([
        (-15, 2), (-13.2, 2), (-13.2, 8), (-15, 8), (-15, 2)
    ], dxfattribs={'layer': 'STAIRS'})

    # Staircase 2: East Emergency Escape (Width = 1.2m -> FAILS Commercial 1.5m rule)
    msp.add_lwpolyline([
        (25, 2), (26.2, 2), (26.2, 7), (25, 7), (25, 2)
    ], dxfattribs={'layer': 'STAIRS'})

    # Staircase 3: North Central Core Staircase (Width = 1.6m -> PASSES Commercial 1.5m rule)
    msp.add_lwpolyline([
        (4, 21), (5.6, 21), (5.6, 27), (4, 27), (4, 21)
    ], dxfattribs={'layer': 'STAIRS'})

    # -------------------------------------------------------------
    # 3. WALLS & CORRIDORS (Visual detailing for blueprint viewer)
    # -------------------------------------------------------------
    # Main Connecting Corridor Polyline
    msp.add_lwpolyline([
        (-15, -2), (27, -2), (27, 28), (-15, 28), (-15, -2)
    ], dxfattribs={'layer': 'WALLS'})

    # Save to data directory
    doc.saveas(filename)
    print(f" Successfully generated complex blueprint: '{filename}'")

if __name__ == "__main__":
    generate_complex_blueprint()
