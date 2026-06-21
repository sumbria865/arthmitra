/**
 * ArthMitra — Phone OTP Login
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Colors, Typography, Spacing, Radius } from '../constants/tokens';
import { authApi } from '../lib/api';
import { useAppStore } from '../store/appStore';

type Stage = 'phone' | 'otp';

export default function OTPScreen() {
  const router = useRouter();
  const { login } = useAppStore();

  const [stage, setStage] = useState<Stage>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(30);
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      Alert.alert('Invalid number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      await authApi.sendOtp(`+91${cleaned}`);
      setStage('otp');
      startCountdown();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp(`+91${phone.replace(/\D/g, '')}`, otp);
      await SecureStore.setItemAsync('access_token', data.access_token);
      login(data.access_token, data.user);
      if (data.user?.is_new) router.replace('/language');
      else router.replace('/(tabs)/home');
    } catch {
      Alert.alert('Verification failed', 'Incorrect OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>

          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>₹</Text>
            </View>
            <Text style={styles.brand}>ArthMitra</Text>
          </View>

          {stage === 'phone' ? (
            <>
              <Text style={styles.title}>Enter your mobile number</Text>
              <Text style={styles.sub}>अपना मोबाइल नंबर दर्ज करें</Text>

              <View style={styles.phoneRow}>
                <View style={styles.ccBox}>
                  <Text style={styles.ccText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="9876543210"
                  placeholderTextColor={Colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>

              <TouchableOpacity
                style={[styles.btn, (phone.replace(/\D/g,'').length !== 10 || loading) && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={phone.replace(/\D/g,'').length !== 10 || loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Send OTP • OTP भेजें</Text>
                }
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Enter OTP</Text>
              <Text style={styles.sub}>+91 {phone} पर भेजा गया OTP दर्ज करें</Text>

              <TextInput
                style={styles.otpInput}
                placeholder="• • • • • •"
                placeholderTextColor={Colors.textMuted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
              />

              <TouchableOpacity
                style={[styles.btn, (otp.length !== 6 || loading) && styles.btnDisabled]}
                onPress={handleVerifyOtp}
                disabled={otp.length !== 6 || loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Verify OTP • सत्यापित करें</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendRow}
                onPress={countdown === 0 ? handleSendOtp : undefined}
                disabled={countdown > 0}
              >
                <Text style={[styles.resendText, countdown > 0 && { color: Colors.textMuted }]}>
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.disclaimer}>
            🔒 No password needed • DPDP Act 2023 compliant
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: Spacing.xl, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: Spacing.xl },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm,
  },
  logoEmoji: { fontSize: 36, color: '#fff' },
  brand: { fontSize: Typography.xxl, fontWeight: '700', color: Colors.primary },
  title: { fontSize: Typography.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  sub: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.xl },
  phoneRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  ccBox: {
    backgroundColor: Colors.surfaceGray, borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm, paddingVertical: 14, justifyContent: 'center',
  },
  ccText: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: '600' },
  phoneInput: {
    flex: 1, backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, fontSize: Typography.lg,
    color: Colors.textPrimary, letterSpacing: 2,
  },
  otpInput: {
    backgroundColor: Colors.surfaceWhite, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.primary,
    paddingVertical: 20, fontSize: Typography.xxl,
    color: Colors.textPrimary, marginBottom: Spacing.md,
    letterSpacing: 12,
  },
  btn: {
    backgroundColor: Colors.primary, borderRadius: Radius.button,
    paddingVertical: 16, alignItems: 'center', marginBottom: Spacing.sm,
  },
  btnDisabled: { backgroundColor: Colors.textMuted },
  btnText: { color: '#fff', fontSize: Typography.md, fontWeight: '700' },
  resendRow: { alignItems: 'center', paddingVertical: Spacing.sm },
  resendText: { color: Colors.primary, fontSize: Typography.sm, fontWeight: '600' },
  disclaimer: {
    fontSize: Typography.xs, color: Colors.textMuted,
    textAlign: 'center', marginTop: Spacing.xl, lineHeight: 18,
  },
});