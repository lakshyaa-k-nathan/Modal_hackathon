import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import * as Location from 'expo-location';

const BACKEND_URL = process.env.EXPO_PUBLIC_MODAL_ENDPOINT;

export default function HomeScreen() {
  const [destination, setDestination] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
  setResponse('Processing coordinates...');

  try {
    let startCoords = null;
    let destCoords = null;

    // 1. Get Start Coordinates
    if (useCurrentLocation) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setResponse('Permission to access location was denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      startCoords = { lat: loc.coords.latitude, lon: loc.coords.longitude };
    } else {
      const result = await Location.geocodeAsync(startLocation);
      if (result.length > 0) {
        startCoords = { lat: result[0].latitude, lon: result[0].longitude };
      }
    }

    // 2. Get Destination Coordinates
    const destResult = await Location.geocodeAsync(destination);
    if (destResult.length > 0) {
      destCoords = { lat: destResult[0].latitude, lon: destResult[0].longitude };
    }

    if (!startCoords || !destCoords) {
      setResponse('Could not find one of those locations. Please be more specific.');
      return;
    }

    

    // 3. Send to Backend
    const res = await fetch(BACKEND_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: startCoords,
        destination: destCoords
      }),
    });

    const data = await res.json();
    setResponse(data.result || 'Route found!');
    
  } catch (err) {
    console.error(err);
    setResponse('Error: Check your connection or address format.');
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Walkable</Text>

      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Map UI Integration Area</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Destination</Text>
        <TextInput
          style={styles.input}
          placeholder="Where to?"
          value={destination}
          onChangeText={setDestination}
        />

        <View style={styles.row}>
          <Text style={styles.label}>Use my current location</Text>
          <Switch
            value={useCurrentLocation}
            onValueChange={setUseCurrentLocation}
            trackColor={{ false: '#767577', true: '#2196F3' }}
          />
        </View>

        {!useCurrentLocation && (
          <>
            <Text style={styles.label}>Starting Point</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter start address..."
              value={startLocation}
              onChangeText={setStartLocation}
            />
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Find Route</Text>
        </TouchableOpacity>
      </View>

      {response ? (
        <View style={styles.responseCard}>
          <Text style={styles.responseTitle}>Route Info:</Text>
          <Text style={styles.response}>{response}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  mapPlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
  },
  mapText: {
    color: '#666',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  responseCard: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  responseTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  response: {
    fontSize: 14,
    color: '#333',
  },
});