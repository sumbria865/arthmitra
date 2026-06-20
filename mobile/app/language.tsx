/**
 * ArthMitra — Language Selection
 * Figma Screen 1 — Panel 1
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Languages } from '../constants/tokens';
import { useAppStore } from '../store/appStore';

export default function LanguageScreen() {
  const router = useRouter();
  const { setLanguage, selectedLanguage } = useAppStore();
  const [selected, setSelected] = useState(selectedLanguage ?? 'hi');

  const handleContinue = () => {
    setLanguage(selected);
    router.push('/onboarding');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.step}>Step 1 of 3</Text>
        <Text style={styles.title}>Choose Your Language</Text>
        <Text style={styles.sub}>आपकी भाषा • ನಿಮ್ಮ ಭಾಷೆ • உங்கள் மொழி</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {Languages.map(lang => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.langRow, selected === lang.code && styles.langRowActive]}
            onPress={() => setSelected(lang.code)}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.langNative}>{lang.name}</Text>
              <Text style={styles.langLabel}>{lang.label}</Text>
            </View>
            <View style={[styles.radio, selected === lang.code && styles.radioActive]}>
              {selected === lang.code && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleContinue}>
          <Text style={styles.btnText}>Continue • आगे बढ़ें →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.xl, paddingBottom: Spacing.md },
  step: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '600', marginBottom: 4 },
  title: {
    fontSize: Typography.xxl, fontWeight: '700',
    color: Colors.textPrimary,
  },
  sub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 6 },
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  langRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  langRowActive: { borderColor: Colors.primary, backgroundColor: Colors.pillBlue },
  langNative: { fontSize: Typography.lg, fontWeight: '600', color: Colors.textPrimary },
  langLabel: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  footer: { padding: Spacing.base },
  btn: {
    backgroundColor: Colors.primary, borderRadius: Radius.button,
    paddingVertical: 16, alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: Typography.md, fontWeight: '700' },
});