import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await fetch('https://modal.com/apps/lakshyaa-k-nathan/main/ap-ZRDUbc8z1FZLTXerD9p8E9', {
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