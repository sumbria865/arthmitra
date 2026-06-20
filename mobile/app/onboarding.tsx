/**
 * ArthMitra — 3-Question Onboarding
 * Figma Screen 1 — Panels 2, 3, 4
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Colors, Typography, Spacing, Radius,
  OnboardingQ1Options, OnboardingQ2Options, OnboardingQ3Options,
} from '../constants/tokens';
import { useAppStore } from '../store/appStore';
import { userApi } from '../lib/api';

const STEPS = [
  {
    key: 'income_type',
    questionEn: 'How do you earn money?',
    questionHi: 'आप पैसे कैसे कमाते हैं?',
    options: OnboardingQ1Options,
  },
  {
    key: 'biggest_worry',
    questionEn: 'Biggest financial concern?',
    questionHi: 'आपकी सबसे बड़ी वित्तीय चिंता?',
    options: OnboardingQ2Options,
  },
  {
    key: 'preferred_comm',
    questionEn: 'Preferred communication?',
    questionHi: 'पसंदीदा संवाद?',
    options: OnboardingQ3Options,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboardingAnswer, onboardingAnswers } = useAppStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];
  const selected = onboardingAnswers[current.key];

  const handleSelect = (id: string) => setOnboardingAnswer(current.key, id);

  const handleNext = async () => {
    if (!selected) return;
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
      return;
    }
    setLoading(true);
    try {
      await userApi.completeOnboarding(onboardingAnswers);
    } catch (_) {
      // proceed even on network error
    } finally {
      setLoading(false);
      router.replace('/(tabs)/home');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
      </View>

      <View style={styles.header}>
        <Text style={styles.stepLabel}>Question {step + 1} of {STEPS.length}</Text>
        <Text style={styles.questionEn}>{current.questionEn}</Text>
        <Text style={styles.questionHi}>{current.questionHi}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.optionsList} showsVerticalScrollIndicator={false}>
        {current.options.map(opt => (
          <TouchableOpacity
            key={opt.id}
            style={[styles.optionCard, selected === opt.id && styles.optionCardActive]}
            onPress={() => handleSelect(opt.id)}
            activeOpacity={0.75}
          >
            <Text style={styles.optionIcon}>{opt.icon}</Text>
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, selected === opt.id && styles.optionLabelActive]}>
                {opt.label}
              </Text>
              <Text style={styles.optionHi}>{opt.labelHi}</Text>
            </View>
            {selected === opt.id && (
              <View style={styles.checkBadge}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => step > 0 ? setStep(s => s - 1) : router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!selected || loading}
        >
          <Text style={styles.nextText}>
            {loading ? 'Creating...' : step === STEPS.length - 1 ? 'Create My Profile →' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  progressBg: { height: 4, backgroundColor: Colors.surfaceGray },
  progressFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  header: { padding: Spacing.xl, paddingBottom: Spacing.md },
  stepLabel: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '600', marginBottom: 8 },
  questionEn: { fontSize: Typography.xl, fontWeight: '700', color: Colors.textPrimary },
  questionHi: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 4 },
  optionsList: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1.5, borderColor: Colors.border, gap: Spacing.sm,
  },
  optionCardActive: { borderColor: Colors.primary, backgroundColor: Colors.pillBlue },
  optionIcon: { fontSize: 24, width: 32, textAlign: 'center' },
  optionText: { flex: 1 },
  optionLabel: { fontSize: Typography.md, fontWeight: '600', color: Colors.textPrimary },
  optionLabelActive: { color: Colors.primary },
  optionHi: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  checkBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  footer: {
    flexDirection: 'row', gap: Spacing.sm,
    padding: Spacing.base, paddingBottom: Spacing.lg,
  },
  backBtn: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.button, paddingVertical: 14, alignItems: 'center',
  },
  backText: { color: Colors.textSecondary, fontSize: Typography.md, fontWeight: '600' },
  nextBtn: {
    flex: 2, backgroundColor: Colors.primary,
    borderRadius: Radius.button, paddingVertical: 14, alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: Colors.textMuted },
  nextText: { color: '#fff', fontSize: Typography.md, fontWeight: '700' },
});