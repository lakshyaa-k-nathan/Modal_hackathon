import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Text } from '@/components/Themed';

const HAZARDS_ENDPOINT = 'https://ashika-anand--modal-hackathon-get-hazards.modal.run';

const HAZARD_COLORS: Record<string, string> = {
  'SurfaceProblem': '#ff0000',
  'MissingCurbRamp': '#ff8800',
  'Obstruction': '#8800ff',
  'MissingTactileStrip': '#0088ff',
};

interface Hazard {
  lat: number;
  lng: number;
  street: string;
  address: string;
  hazard_type: string;
}

export default function HazardMap() {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHazards();
  }, []);

  const fetchHazards = async () => {
    try {
      const response = await fetch(HAZARDS_ENDPOINT);
      const data = await response.json();
      
      if (data.ok && data.hazards) {
        setHazards(data.hazards);
      } else {
        setError(data.error || 'Failed to load hazards');
      }
    } catch (err) {
      setError('Network error loading hazards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateMapHTML = () => {
    const markers = hazards.map(h => {
      const color = HAZARD_COLORS[h.hazard_type] || '#888888';
      return `
        L.circleMarker([${h.lat}, ${h.lng}], {
          radius: 6,
          color: '${color}',
          fillColor: '${color}',
          fillOpacity: 0.7
        }).bindPopup('<b>Hazard:</b> ${h.hazard_type}<br><b>Address:</b> ${h.address}')
         .addTo(map);
      `;
    }).join('\n');

    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      body { margin: 0; padding: 0; }
      #map { width: 100%; height: 100vh; }
      .legend {
        position: absolute;
        bottom: 30px;
        left: 10px;
        background: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        z-index: 1000;
        font-family: Arial, sans-serif;
        font-size: 14px;
      }
      .legend-item {
        display: flex;
        align-items: center;
        margin: 5px 0;
      }
      .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        margin-right: 8px;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div class="legend">
      <b>Hazard Types</b>
      <div class="legend-item">
        <div class="legend-color" style="background: #ff0000;"></div>
        Surface Problem
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: #ff8800;"></div>
        Missing Curb Ramp
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: #8800ff;"></div>
        Obstruction
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: #0088ff;"></div>
        Missing Tactile Strip
      </div>
    </div>
    <script>
      var map = L.map('map').setView([41.8781, -87.6298], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      ${markers}
    </script>
  </body>
</html>
    `;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading hazard map...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <iframe
        srcDoc={generateMapHTML()}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Hazard Map"
      />
    );
  }

  // For native, would need react-native-webview
  return (
    <View style={styles.centered}>
      <Text>Map view requires web platform. Found {hazards.length} hazards.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
