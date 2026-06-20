/**
 * ArthMitra — Root Layout (Expo Router)
 */

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Slot } from 'expo-router';

// Suppress noisy web-only deprecation warnings coming from dependencies
if (Platform.OS === 'web') {
  const __origWarn = console.warn;
  // drop pointerEvents deprecation warnings which originate from react-native-web internals
  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('props.pointerEvents is deprecated')) {
      return;
    }
    return __origWarn(...args);
  };
}
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 5 * 60 * 1000 },
  },
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Slot />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}