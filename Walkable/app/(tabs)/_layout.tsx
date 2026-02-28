import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Link, Stack } from 'expo-router'; // Changed from Tabs to Stack
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerTintColor: Colors[colorScheme].tint,
        headerStyle: {
          backgroundColor: Colors[colorScheme].background,
        },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Walkable',
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable style={{ marginRight: 15 }}>
                {({ pressed }) => (
                  <SymbolView
                    name={{ ios: 'info.circle', android: 'info', web: 'info' }}
                    size={25}
                    tintColor={Colors[colorScheme].text}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      {/* This ensures the modal opens as a popup on iOS/Android */}
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Info' }} />
    </Stack>
  );
}