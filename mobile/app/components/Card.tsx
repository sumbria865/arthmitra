import React from 'react';
import { View, Platform } from 'react-native';
import { Shadows } from '../../constants/tokens';

export default function Card({ children }: any) {
  const style = [
    { padding: 12, borderRadius: 8, backgroundColor: '#fff' },
    Platform.OS === 'web' ? { boxShadow: Shadows.card.boxShadow } : Shadows.card,
  ];

  return <View style={style}>{children}</View>;
}
