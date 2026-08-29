import ezdxf

def create_mock_blueprint(filename="sample_standard.dxf"):
    # Create a new DXF document
    doc = ezdxf.new('R2010')
    msp = doc.modelspace()

    # 1. Create the required layers
    doc.layers.add("ROOMS", color=3)   # Green color for rooms
    doc.layers.add("STAIRS", color=1)  # Red color for stairs

    # 2. Draw a Room (e.g., a 10m x 5m office space)
    # We draw a closed rectangular Polyline on the 'ROOMS' layer
    msp.add_lwpolyline([
        (0, 0),    # Bottom-left
        (10, 0),   # Bottom-right
        (10, 5),   # Top-right
        (0, 5),    # Top-left
        (0, 0)     # Close the loop
    ], dxfattribs={'layer': 'ROOMS'})

    # 3. Draw a Staircase (e.g., 1.2m wide x 4m long)
    # Width is intentionally 1.2m to trigger the "Commercial > 15m" deficiency rule
    msp.add_lwpolyline([
        (11, 0),   # Bottom-left
        (12.2, 0), # Bottom-right (Width = 1.2m)
        (12.2, 4), # Top-right
        (11, 4),   # Top-left
        (11, 0)    # Close the loop
    ], dxfattribs={'layer': 'STAIRS'})

    # Save the file to your hard drive
    doc.saveas(filename)
    print(f"✅ Successfully created '{filename}'.")
    print("You can now upload this file into your Streamlit dashboard.")

if __name__ == "__main__":
    create_mock_blueprint()