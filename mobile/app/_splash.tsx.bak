/**
 * FILE: mobile/app/auth/splash.tsx
 *
 * This is the first screen users see.
 * Two buttons:
 *   "Get Started" → Register (new user → language → onboarding → otp)
 *   "Login"       → Login   (returning user → otp directly)
 */

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../constants/tokens';

const { height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={s.container}>

        {/* ── Brand section ── */}
        <View style={s.brandSection}>
          <View style={s.logoCircle}>
            <Text style={s.logoRupee}>₹</Text>
          </View>
          <Text style={s.brand}>ArthMitra</Text>
          <Text style={s.tagEn}>India's Agentic Financial Co-Pilot</Text>
          <Text style={s.tagHi}>आपका वित्तीय सह-पायलट</Text>
        </View>

        {/* ── Feature pills ── */}
        <View style={s.pillRow}>
          {['🛡️ Scam Guard', '🎁 Govt Schemes', '💰 Savings Coach', '🎙️ Voice'].map(f => (
            <View key={f} style={s.pill}>
              <Text style={s.pillText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* ── Stats ── */}
        <View style={s.statsRow}>
          <View style={s.stat}>
            <Text style={s.statNum}>900M</Text>
            <Text style={s.statLabel}>Indians served</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.stat}>
            <Text style={s.statNum}>7</Text>
            <Text style={s.statLabel}>AI Agents</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.stat}>
            <Text style={s.statNum}>99%</Text>
            <Text style={s.statLabel}>Scam accuracy</Text>
          </View>
        </View>

        {/* ── Buttons ── */}
        <View style={s.btnSection}>
          {/* REGISTER — new user */}
          <TouchableOpacity
            style={s.btnPrimary}
            onPress={() => router.push('/auth/language')}
            activeOpacity={0.85}
          >
            <Text style={s.btnPrimaryText}>Get Started — नया खाता बनाएं</Text>
            <Text style={s.btnPrimarySub}>New user • पहली बार</Text>
          </TouchableOpacity>

          {/* LOGIN — returning user */}
          <TouchableOpacity
            style={s.btnSecondary}
            onPress={() => router.push('/auth/phone')}
            activeOpacity={0.85}
          >
            <Text style={s.btnSecondaryText}>Login — वापस आएं</Text>
            <Text style={s.btnSecondarySub}>Already registered • पहले से खाता है</Text>
          </TouchableOpacity>

          <Text style={s.trust}>
            🔒 No password • DPDP Act 2023 • OTP only
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingTop: height * 0.06,
    paddingBottom: Spacing.xl,
  },

  // Brand
  brandSection: { alignItems: 'center' },
  logoCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  logoRupee: { fontSize: 46, color: '#fff' },
  brand: { fontSize: 42, fontWeight: '700', color: '#fff', letterSpacing: -1 },
  tagEn: { fontSize: Typography.md, color: 'rgba(255,255,255,0.85)', marginTop: 6, textAlign: 'center' },
  tagHi: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

  // Pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.xs },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill,
  },
  pillText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  // Stats
  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.card, padding: Spacing.md,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: Typography.xl, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.25)' },

  // Buttons
  btnSection: { gap: Spacing.sm },
  btnPrimary: {
    backgroundColor: '#fff', borderRadius: Radius.button,
    paddingVertical: 16, alignItems: 'center',
  },
  btnPrimaryText: { color: Colors.primary, fontSize: Typography.md, fontWeight: '700' },
  btnPrimarySub: { color: Colors.primaryLight, fontSize: Typography.xs, marginTop: 3 },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.button, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 16, alignItems: 'center',
  },
  btnSecondaryText: { color: '#fff', fontSize: Typography.md, fontWeight: '700' },
  btnSecondarySub: { color: 'rgba(255,255,255,0.65)', fontSize: Typography.xs, marginTop: 3 },
  trust: { color: 'rgba(255,255,255,0.5)', fontSize: 10, textAlign: 'center', marginTop: 4 },
});