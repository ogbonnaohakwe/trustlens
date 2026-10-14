import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TrustLensProvider, useTrustLens } from '../context/TrustLensContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BrandColors } from '../constants/theme';

function NavigationStack() {
  const { isDarkMode } = useTrustLens();

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: isDarkMode ? BrandColors.dark.background : BrandColors.light.background,
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="access-system" />
        <Stack.Screen name="setup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ask-ai" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TrustLensProvider>
        <NavigationStack />
      </TrustLensProvider>
    </SafeAreaProvider>
  );
}
