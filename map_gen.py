import pandas as pd
import folium
import numpy as np

print("📂 Loading the hazard map data...")
# Read the CSV created by fetch_sidewalks.py
try:
    df = pd.read_csv("chicago_hazard_map.csv")
except FileNotFoundError:
    print("❌ Error: 'chicago_hazard_map.csv' not found. Run fetch_sidewalks.py first!")
    exit()

# 1. Define colors for each hazard type
hazard_colors = {
    'SurfaceProblem': 'red',
    'MissingCurbRamp': 'orange',
    'Obstruction': 'purple',
    'MissingTactileStrip': 'blue'
}

# 2. Create the folium map centered on Chicago
print("🗺️ Generating the interactive map...")
m = folium.Map(location=[41.8781, -87.6298], zoom_start=12, tiles="cartodbpositron")

# 3. Add the categorized hazards to the map
for _, row in df.iterrows():
    marker_color = hazard_colors.get(row['label_type'], 'gray')
    
    folium.CircleMarker(
        location=[row['lat'], row['lng']],
        radius=6,
        color=marker_color,
        fill=True,
        fill_color=marker_color,
        fill_opacity=0.7,
        popup=f"<b>Hazard:</b> {row['label_type']}<br><b>Address:</b> {row['ADDRESS']}"
    ).add_to(m)

# 4. Add a Legend (HTML/CSS)
legend_html = '''
     <div style="position: fixed; bottom: 50px; left: 50px; width: 200px; height: 130px; 
     border: 2px solid grey; z-index:9999; font-size:14px; background-color: white; 
     opacity: 0.9; padding: 10px; border-radius: 5px;">
     <b>Hazard Categories</b> <br>
     <i class="fa fa-circle" style="color:red"></i> Surface Problem <br>
     <i class="fa fa-circle" style="color:orange"></i> Missing Curb Ramp <br>
     <i class="fa fa-circle" style="color:purple"></i> Obstruction <br>
     <i class="fa fa-circle" style="color:blue"></i> Missing Tactile Strip
     </div>
     '''
m.get_root().html.add_child(folium.Element(legend_html))

# 5. Save and finish
m.save("categorized_hazard_map.html")
print("🚀 SUCCESS! Open 'categorized_hazard_map.html' in your browser.")