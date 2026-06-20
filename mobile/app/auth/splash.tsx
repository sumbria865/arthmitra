import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../../constants/tokens';
export default function SplashScreen() {
  console.log("AUTH SPLASH LOADED");

  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={s.container}>

        <View style={s.logoWrap}>
          <View style={s.logoCircle}>
            <Text style={s.logoRupee}>₹</Text>
          </View>
          <Text style={s.brand}>ArthMitra</Text>
          <Text style={s.tagEn}>Your Financial Co-Pilot</Text>
          <Text style={s.tagHi}>आपका वित्तीय सह-पायलट</Text>
        </View>

        <View style={s.pillRow}>
          {['UPI', 'Bank', 'Secure', 'Voice'].map(p => (
            <View key={p} style={s.pill}>
              <Text style={s.pillText}>{p}</Text>
            </View>
          ))}
        </View>

        <View style={s.bottom}>
          <Text style={s.trust}>🔒 RBI Aware • DPDP 2023 Compliant</Text>
          <TouchableOpacity style={s.cta} onPress={() => router.push('/auth/language')}>
            <Text style={s.ctaText}>Get Started • शुरू करें</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.loginLink} onPress={() => router.push('/auth/otp')}>
            <Text style={s.loginLinkText}>Already have an account? Login →</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: { flex: 1, paddingHorizontal: Spacing.xl, justifyContent: 'space-between', paddingVertical: Spacing.section },
  logoWrap: { alignItems: 'center', marginTop: Spacing.section },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  logoRupee: { fontSize: 46, color: '#fff' },
  brand: { fontSize: 44, fontWeight: '700', color: '#fff', letterSpacing: -1 },
  tagEn: { fontSize: Typography.md, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  tagHi: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  pillRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm },
  pill: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.pill },
  pillText: { color: '#fff', fontSize: Typography.xs, fontWeight: '600' },
  bottom: { gap: Spacing.sm },
  trust: { color: 'rgba(255,255,255,0.55)', fontSize: Typography.xs, textAlign: 'center' },
  cta: { backgroundColor: '#fff', borderRadius: Radius.button, paddingVertical: 16, alignItems: 'center' },
  ctaText: { color: Colors.primary, fontSize: Typography.md, fontWeight: '700' },
  loginLink: { alignItems: 'center', paddingVertical: Spacing.sm },
  loginLinkText: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.sm },
});
