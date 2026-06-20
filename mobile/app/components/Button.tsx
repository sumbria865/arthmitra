import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function Button({ children, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={{ padding: 8, backgroundColor: '#0ea5a3', borderRadius: 8 }}>
      <Text style={{ color: 'white' }}>{children}</Text>
    </TouchableOpacity>
  );
}
