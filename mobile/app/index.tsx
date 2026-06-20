import React, { useEffect } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../constants/tokens';
import { useAppStore } from '../store/appStore';
import { userApi } from '../lib/api';

export default function Index() {
  const router = useRouter();
  const { login, setUser } = useAppStore();

  useEffect(() => {
    (async () => {
      try {
        const token = Platform.OS === 'web'
          ? window.localStorage.getItem('access_token')
          : await SecureStore.getItemAsync('access_token');
console.log("TOKEN =", token);

if (!token) {
  console.log("REDIRECTING TO SPLASH");
  router.replace('/auth/splash');
  return;
}
        // Validate token by fetching profile
        try {
          const { data } = await userApi.getProfile();
          login(token, data);
          setUser(data);
          if (!data.onboarding_done) {
            router.replace('/auth/language');
          } else {
            router.replace('/(tabs)/home');
          }
        } catch {
          // Token invalid/expired — clear and go to splash
          if (Platform.OS === 'web') window.localStorage.removeItem('access_token');
          else await SecureStore.deleteItemAsync('access_token');
          router.replace('/auth/splash');
        }
      } catch {
        router.replace('/auth/splash');
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary }}>
      <ActivityIndicator color="#fff" size="large" />
    </View>
  );
}