/**
 * ArthMitra — OTP Login Screen
 * Real flow: send OTP → verify → save JWT → go home
 * Backend prints OTP to console (demo) — check your uvicorn terminal
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Colors, Typography, Spacing, Radius } from '../../constants/tokens';
import { authApi, userApi } from '../../lib/api';
import { useAppStore } from '../../store/appStore';

type Stage = 'phone' | 'otp';

const saveToken = async (token: string) => {
  if (Platform.OS === 'web') {
    window.localStorage.setItem('access_token', token);
  } else {
    await SecureStore.setItemAsync('access_token', token);
  }
};

export default function OTPScreen() {
  const router = useRouter();
  const { login, setUser, onboardingAnswers, selectedLanguage, clearOnboardingAnswers } = useAppStore();

  const [stage, setStage] = useState<Stage>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');   // shown in dev mode
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(30);
    const t = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  const handleSendOtp = async () => {
  const cleaned = phone.replace(/\D/g, '');

  console.log("PHONE ENTERED =", phone);
  console.log("CLEANED =", cleaned);

  if (cleaned.length !== 10) {
    Alert.alert('Invalid number', 'Please enter a valid 10-digit mobile number.');
    return;
  }

  setLoading(true);

  try {
    console.log("SENDING OTP TO =", `+91${cleaned}`);

    const { data } = await authApi.sendOtp(`+91${cleaned}`);

    console.log("SEND OTP RESPONSE =", data);

    setStage('otp');
    startCountdown();

    if (data.demo_otp) {
      console.log("DEMO OTP =", data.demo_otp);
      setDemoOtp(data.demo_otp);
      setOtp(data.demo_otp);
    }
  } catch (e: any) {
    console.log("SEND OTP ERROR =", e?.response?.data || e);
    Alert.alert('Error', e?.response?.data?.detail ?? e.message ?? 'Failed to send OTP');
  } finally {
    setLoading(false);
  }
};

  const handleVerifyOtp = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
 console.log("VERIFY BUTTON PRESSED");
  console.log("PHONE =", `+91${cleaned}`);
  console.log("OTP =", otp);
      const { data } = await authApi.verifyOtp(`+91${cleaned}`, otp);

      // Save JWT
      await saveToken(data.access_token);

      // Update store
      login(data.access_token, data.user as any);
      if (data.user) setUser(data.user as any);

      const alreadyOnboarded = data.user?.onboarding_done;
      const hasLocalAnswers =
        onboardingAnswers?.income_type &&
        onboardingAnswers?.biggest_worry &&
        onboardingAnswers?.preferred_comm;

      if (!alreadyOnboarded && hasLocalAnswers) {
        // User just came from the onboarding questions screen —
        // submit those answers now that we have a real account/token.
        try {
          const { data: onboardData } = await userApi.completeOnboarding({
            income_type: onboardingAnswers.income_type,
            biggest_worry: onboardingAnswers.biggest_worry,
            preferred_comm: onboardingAnswers.preferred_comm,
            language: selectedLanguage,
          });
          setUser({ ...(data.user as any), onboarding_done: true, literacy_score: onboardData.literacy_score });
          clearOnboardingAnswers();
        } catch (err) {
          console.log("ONBOARDING SUBMIT ERROR =", err);
          // Don't block login if this fails — user can retry from profile/settings.
        }
        router.replace('/(tabs)/home');
      } else if (!alreadyOnboarded) {
        // Returning/new user with no local answers collected — ask them now.
        router.replace('/auth/language');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (e: any) {
      Alert.alert('Verification Failed', e?.response?.data?.detail ?? 'Incorrect OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.container}>

          {/* Logo */}
          <View style={s.logoWrap}>
            <View style={s.logoCircle}><Text style={s.rupee}>₹</Text></View>
            <Text style={s.brand}>ArthMitra</Text>
            <Text style={s.tagline}>Your Financial Co-Pilot</Text>
          </View>

          {stage === 'phone' ? (
            <>
              <Text style={s.title}>Enter your mobile number</Text>
              <Text style={s.sub}>अपना मोबाइल नंबर दर्ज करें</Text>
              <View style={s.phoneRow}>
                <View style={s.cc}><Text style={s.ccText}>🇮🇳 +91</Text></View>
                <TextInput
                  style={s.phoneInput}
                  placeholder="9876543210"
                  placeholderTextColor={Colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
              <TouchableOpacity
                style={[s.btn, (phone.replace(/\D/g,'').length !== 10 || loading) && s.btnOff]}
                onPress={handleSendOtp}
                disabled={phone.replace(/\D/g,'').length !== 10 || loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Send OTP • OTP भेजें</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={s.title}>Enter OTP</Text>
              <Text style={s.sub}>+91 {phone} पर भेजा गया OTP</Text>

              {/* Demo mode hint */}
              {demoOtp ? (
                <View style={s.demoBox}>
                  <Text style={s.demoText}>🔧 Demo OTP (check backend console): {demoOtp}</Text>
                </View>
              ) : null}

              <TextInput
                style={s.otpInput}
                placeholder="• • • • • •"
                placeholderTextColor={Colors.textMuted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
              />
              <TouchableOpacity
                style={[s.btn, (otp.length !== 6 || loading) && s.btnOff]}
                onPress={handleVerifyOtp}
                disabled={otp.length !== 6 || loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Verify & Login • सत्यापित करें</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={s.resend}
                onPress={countdown === 0 ? handleSendOtp : undefined}
                disabled={countdown > 0}
              >
                <Text style={[s.resendText, countdown > 0 && { color: Colors.textMuted }]}>
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.changePhone} onPress={() => { setStage('phone'); setOtp(''); setDemoOtp(''); }}>
                <Text style={s.changePhoneText}>← Change number</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={s.disclaimer}>🔒 No password needed • DPDP Act 2023 compliant</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: Spacing.xl, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: Spacing.xl },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  rupee: { fontSize: 36, color: '#fff' },
  brand: { fontSize: Typography.xxl, fontWeight: '700', color: Colors.primary },
  tagline: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 4 },
  title: { fontSize: Typography.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  sub: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.xl },
  phoneRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  cc: { backgroundColor: Colors.surfaceGray, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: 14, justifyContent: 'center' },
  ccText: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: '600' },
  phoneInput: { flex: 1, backgroundColor: Colors.surfaceWhite, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, fontSize: Typography.lg, color: Colors.textPrimary, letterSpacing: 2 },
  demoBox: { backgroundColor: Colors.pillOrange, borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  demoText: { fontSize: Typography.xs, color: Colors.warning, fontWeight: '600' },
  otpInput: { backgroundColor: Colors.surfaceWhite, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.primary, paddingVertical: 20, fontSize: Typography.xxl, color: Colors.textPrimary, marginBottom: Spacing.md, letterSpacing: 12 },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.button, paddingVertical: 16, alignItems: 'center', marginBottom: Spacing.sm },
  btnOff: { backgroundColor: Colors.textMuted },
  btnText: { color: '#fff', fontSize: Typography.md, fontWeight: '700' },
  resend: { alignItems: 'center', paddingVertical: Spacing.sm },
  resendText: { color: Colors.primary, fontSize: Typography.sm, fontWeight: '600' },
  changePhone: { alignItems: 'center', paddingVertical: Spacing.xs },
  changePhoneText: { color: Colors.textSecondary, fontSize: Typography.sm },
  disclaimer: { fontSize: Typography.xs, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl, lineHeight: 18 },
});