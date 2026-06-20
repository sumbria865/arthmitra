import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function MainChatRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(tabs)/chat');
  }, []);
  return <View style={{ flex: 1 }} />;
}
