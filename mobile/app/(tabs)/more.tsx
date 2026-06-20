import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';

const menuItems = [
  { title: 'Accessibility', route: '/main/accessibility' },
  { title: 'Agent Status', route: '/main/agents_status' },
  { title: 'Analytics', route: '/main/analytics' },
  { title: 'AI Coach', route: '/main/coach' },
  { title: 'Farmer Assistant', route: '/main/farmer' },
  { title: 'Health', route: '/main/health' },
  { title: 'Learning Center', route: '/main/learn' },
  { title: 'Shakti', route: '/main/shakti' },
  { title: 'Voice Assistant', route: '/main/voice' },
];

export default function MoreScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>More Features</Text>

      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.card}
          onPress={() => router.push(item.route as any)}
        >
          <Text style={styles.cardText}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
  },
});