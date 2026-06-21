/**
 * ArthMitra — Root Layout with Auth Guard
 * Checks token on launch → routes to splash or home
 */

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

// Suppress noisy web deprecation warnings
if (Platform.OS === 'web') {
  const orig = console.warn;
  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('pointerEvents')) return;
    orig(...args);
  };
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 5 * 60 * 1000 } },
});

export default function RootLayout() {
  useEffect(() => { SplashScreen.hideAsync(); }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            {/* Entry */}
            <Stack.Screen name="index" />
            {/* Root screens */}
            <Stack.Screen name="language" />
            <Stack.Screen name="onboarding" />
            {/* Auth folder */}
            <Stack.Screen name="auth/splash" />
            <Stack.Screen name="auth/language" />
            <Stack.Screen name="auth/onboarding" />
            <Stack.Screen name="auth/otp" />
            {/* Main app */}
            <Stack.Screen name="(tabs)" />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}