import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_MODAL_ENDPOINT;

export default function HomeScreen() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
    if (!BACKEND_URL) {
      setResponse('Missing EXPO_PUBLIC_MODAL_ENDPOINT in frontend env');
      return;
    }

    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      setResponse(data.result || JSON.stringify(data));
    } catch (err) {
      console.error(err);
      setResponse('Error calling backend');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Walkable App</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter something..."
        value={input}
        onChangeText={setInput}
      />
      <Button title="Submit" onPress={handleSubmit} />
      <Text style={styles.responseTitle}>Response:</Text>
      <Text style={styles.response}>{response}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  responseTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '600',
  },
  response: {
    marginTop: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    padding: 10,
    width: '100%',
    borderRadius: 8,
  },
});