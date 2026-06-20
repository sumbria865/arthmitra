import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function MainScamRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(tabs)/scam');
  }, []);
  return <View style={{ flex: 1 }} />;
}
