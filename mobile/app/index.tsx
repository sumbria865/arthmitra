/**
 * ArthMitra — App Entry Point
 * Redirects: no token → /splash | has token → /(tabs)/home
 */

import React, { useEffect } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../constants/tokens';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const token =
        Platform.OS === 'web'
          ? window.localStorage.getItem('access_token')
          : await SecureStore.getItemAsync('access_token');
      if (token) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/splash');
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary }}>
      <ActivityIndicator color="#fff" size="large" />
    </View>
  );
}