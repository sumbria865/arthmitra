import { View, Text } from 'react-native';
import { Colors } from '../../constants/tokens';

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceGray, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#000', fontSize: 24, fontWeight: '700' }}>Profile</Text>
    </View>
  );
}
