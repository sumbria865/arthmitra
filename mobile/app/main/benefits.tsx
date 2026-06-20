import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function MainBenefitsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(tabs)/benefits');
  }, []);
  return <View style={{ flex: 1 }} />;
}
