import geopandas as gpd
import pandas as pd
import os
import numpy as np  # Added for the hazard randomization

# 1. Path to your file
file_path = "chicagosidewalks/chicagosidewalks.shp"

if not os.path.exists(file_path):
    print("❌ Folder or .shp file not found!")
else:
    print("🗺️ Reading Chicago Shapefile geometry...")
    gdf = gpd.read_file(file_path, rows=5000)

    # 2. Convert to GPS coordinates (Lat/Lng)
    print("📍 Projecting to GPS...")
    gdf = gdf.to_crs(epsg=4326)

    # 3. Extract the Center Point of each sidewalk line
    # (The warning you saw earlier is okay for a hackathon demo)
    gdf['lat'] = gdf.geometry.centroid.y
    gdf['lng'] = gdf.geometry.centroid.x

    # 4. Create Categorized Demo Hazards 
    # Instead of just SurfaceProblem, we assign a variety of issues
    hazard_types = ['SurfaceProblem', 'MissingCurbRamp', 'Obstruction', 'MissingTactileStrip']
    
    # We take every 10th row and randomly assign it one of the types above
    hazards = gdf.iloc[::10].copy()
    hazards['label_type'] = np.random.choice(hazard_types, size=len(hazards))

    # 5. Save the Map Data
    output_cols = ['lat', 'lng', 'ST_NAME', 'ADDRESS', 'label_type']
    hazards[output_cols].to_csv("chicago_hazard_map.csv", index=False)
    
    print(f"🚀 SUCCESS! Created 'chicago_hazard_map.csv' with {len(hazards)} diverse hazards.")
    print("Now run your map_gen.py to see them in color!")