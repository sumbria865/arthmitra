import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, OnboardingQ1Options, OnboardingQ2Options, OnboardingQ3Options } from '../../constants/tokens';
import { useAppStore } from '../../store/appStore';


const STEPS = [
  { key: 'income_type',    questionEn: 'How do you earn money?',      questionHi: 'आप पैसे कैसे कमाते हैं?',       options: OnboardingQ1Options },
  { key: 'biggest_worry', questionEn: 'Biggest financial concern?',  questionHi: 'आपकी सबसे बड़ी वित्तीय चिंता?', options: OnboardingQ2Options },
  { key: 'preferred_comm',questionEn: 'Preferred communication?',    questionHi: 'पसंदीदा संवाद?',                 options: OnboardingQ3Options },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboardingAnswer, onboardingAnswers, selectedLanguage } = useAppStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];
  const selected = onboardingAnswers[current.key];
const handleNext = async () => {
  if (!selected) return;

  if (step < STEPS.length - 1) {
    setStep(s => s + 1);
    return;
  }

  console.log("FINAL ONBOARDING STEP — going to OTP to verify phone");

  // Onboarding answers are already saved in the Zustand store
  // (onboardingAnswers). We still need to verify the user's phone
  // via OTP before we have a real account / JWT to save them against.
  router.push('/auth/otp');
};
    // Last step — submit to backend (saves to DB)
    
  

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={s.progressBg}>
        <View style={[s.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
      </View>

      <View style={s.header}>
        <Text style={s.stepLabel}>Question {step + 1} of {STEPS.length}</Text>
        <Text style={s.questionEn}>{current.questionEn}</Text>
        <Text style={s.questionHi}>{current.questionHi}</Text>
      </View>

      <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        {current.options.map(opt => (
          <TouchableOpacity
            key={opt.id}
            style={[s.card, selected === opt.id && s.cardActive]}
            onPress={() => setOnboardingAnswer(current.key, opt.id)}
            activeOpacity={0.75}
          >
            <Text style={s.icon}>{opt.icon}</Text>
            <View style={s.textWrap}>
              <Text style={[s.optLabel, selected === opt.id && s.optLabelActive]}>{opt.label}</Text>
              <Text style={s.optHi}>{opt.labelHi}</Text>
            </View>
            {selected === opt.id && (
              <View style={s.check}><Text style={s.checkMark}>✓</Text></View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.backBtn} onPress={() => step > 0 ? setStep(s => s - 1) : router.back()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.nextBtn, !selected && s.nextBtnOff]}
          onPress={handleNext}
          disabled={!selected || loading}
        >
          <Text style={s.nextText}>
            {loading ? 'Saving...' : step === STEPS.length - 1 ? 'Create My Profile →' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  progressBg: { height: 4, backgroundColor: Colors.surfaceGray },
  progressFill: { height: 4, backgroundColor: Colors.primary },
  header: { padding: Spacing.xl, paddingBottom: Spacing.md },
  stepLabel: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '600', marginBottom: 8 },
  questionEn: { fontSize: Typography.xl, fontWeight: '700', color: Colors.textPrimary },
  questionHi: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 4 },
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1.5, borderColor: Colors.border, gap: Spacing.sm },
  cardActive: { borderColor: Colors.primary, backgroundColor: Colors.pillBlue },
  icon: { fontSize: 24, width: 32, textAlign: 'center' },
  textWrap: { flex: 1 },
  optLabel: { fontSize: Typography.md, fontWeight: '600', color: Colors.textPrimary },
  optLabelActive: { color: Colors.primary },
  optHi: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  check: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  footer: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.base, paddingBottom: Spacing.lg },
  backBtn: { flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.button, paddingVertical: 14, alignItems: 'center' },
  backText: { color: Colors.textSecondary, fontSize: Typography.md, fontWeight: '600' },
  nextBtn: { flex: 2, backgroundColor: Colors.primary, borderRadius: Radius.button, paddingVertical: 14, alignItems: 'center' },
  nextBtnOff: { backgroundColor: Colors.textMuted },
  nextText: { color: '#fff', fontSize: Typography.md, fontWeight: '700' },
});