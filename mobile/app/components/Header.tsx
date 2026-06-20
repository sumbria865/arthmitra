import React from 'react';
import { View, Text } from 'react-native';

export default function Header({ title }: any) {
  return (
    <View style={{ padding: 12, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>{title}</Text>
    </View>
  );
}
