/**
 * ArthMitra — Splash Screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../constants/tokens';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>₹</Text>
          </View>
          <Text style={styles.brand}>ArthMitra</Text>
          <Text style={styles.tagline}>Your Financial Co-Pilot</Text>
          <Text style={styles.taglineHi}>आपका वित्तीय सह-पायलट</Text>
        </View>

        {/* Feature pills */}
        <View style={styles.pillRow}>
          {['UPI', 'Bank', 'Secure', 'Voice'].map(p => (
            <View key={p} style={styles.pill}>
              <Text style={styles.pillText}>{p}</Text>
            </View>
          ))}
        </View>

        {/* Trust */}
        <View style={styles.trustRow}>
          <Text style={styles.trustText}>🔒 RBI Regulated • DPDP Compliant • ISO 27001</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.cta} onPress={() => router.push('/language')}>
          <Text style={styles.ctaText}>Get Started • शुरू करें</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.section,
  },
  logoWrap: { alignItems: 'center', marginTop: Spacing.section },
  logoCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  logoEmoji: { fontSize: 44, color: '#fff' },
  brand: {
    fontSize: 42, fontWeight: '700', color: '#fff',
    letterSpacing: -1,
  },
  tagline: { fontSize: Typography.md, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  taglineHi: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  pillRow: { flexDirection: 'row', gap: Spacing.sm },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  pillText: { color: '#fff', fontSize: Typography.xs, fontWeight: '600' },
  trustRow: { paddingHorizontal: Spacing.base },
  trustText: { color: 'rgba(255,255,255,0.6)', fontSize: Typography.xs, textAlign: 'center' },
  cta: {
    width: '100%', backgroundColor: '#fff',
    borderRadius: Radius.button, paddingVertical: 16, alignItems: 'center',
  },
  ctaText: { color: Colors.primary, fontSize: Typography.md, fontWeight: '700' },
});