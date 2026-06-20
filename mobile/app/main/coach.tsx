/**
 * ArthMitra — Coach Screen (Behavioural Savings Coach)
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { chatApi } from '../../lib/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/tokens';

const TIPS = [
  { emoji: '💰', tip: '50-30-20 Rule', desc: '50% जरूरत • 30% चाहत • 20% बचत', color: Colors.pillGreen },
  { emoji: '🏦', tip: 'Pay Yourself First', desc: 'Salary मिलते ही 10% पहले बचाएं', color: Colors.pillBlue },
  { emoji: '🆘', tip: 'Emergency Fund', desc: '3 महीने के खर्च = Emergency Fund Goal', color: Colors.pillOrange },
  { emoji: '📈', tip: 'RD Power', desc: 'Recurring Deposit — guaranteed returns, no risk', color: Colors.pillPurple },
];

const NUDGE_EVENTS = [
  { id: 'salary', label: 'Salary credited', labelHi: 'Salary आई' },
  { id: 'harvest', label: 'Harvest proceeds', labelHi: 'फसल बिकी' },
  { id: 'windfall', label: 'Unexpected income', labelHi: 'अचानक पैसे मिले' },
];

export default function CoachScreen() {
  const [amount, setAmount] = useState('');
  const [event, setEvent] = useState('salary');
  const [nudge, setNudge] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetNudge = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      const evt = NUDGE_EVENTS.find(e => e.id === event);
      const { data } = await chatApi.sendMessage(
        `${evt?.label}: ₹${amount} — give me savings advice`
      );
      setNudge(data.response);
    } catch {
      const save = Math.round(Number(amount) * 0.1);
      setNudge(
        `💰 ${event === 'salary' ? 'Salary' : 'Income'} ₹${amount} मिली!\n\n` +
        `पहले ₹${save} बचाएं (10%) — फिर बाकी खर्च करें।\n\n` +
        `₹${save}/month × 12 = ₹${save * 12}/year Emergency Fund 🎯`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.agentBadge}>
          <Ionicons name="heart" size={18} color={Colors.warning} />
          <Text style={styles.title}>Behavioural Coach</Text>
        </View>
        <Text style={styles.sub}>आपका बचत सलाहकार • Savings Advisor</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Nudge calculator */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>💡 Get a Savings Nudge</Text>
          <Text style={styles.cardSub}>अपनी income डालें — तुरंत सलाह पाएं</Text>

          {/* Event selector */}
          <View style={styles.eventRow}>
            {NUDGE_EVENTS.map(e => (
              <TouchableOpacity
                key={e.id}
                style={[styles.eventBtn, event === e.id && styles.eventBtnActive]}
                onPress={() => setEvent(e.id)}
              >
                <Text style={[styles.eventLabel, event === e.id && styles.eventLabelActive]}>
                  {e.labelHi}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.rupeeSign}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="Enter amount"
              placeholderTextColor={Colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.nudgeBtn, !amount && styles.nudgeBtnDisabled]}
            onPress={handleGetNudge}
            disabled={!amount || loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.nudgeBtnText}>Get Savings Nudge →</Text>
            }
          </TouchableOpacity>

          {nudge && (
            <View style={styles.nudgeResult}>
              <Text style={styles.nudgeText}>{nudge}</Text>
            </View>
          )}
        </View>

        {/* Financial tips */}
        <Text style={styles.sectionTitle}>Smart Money Tips</Text>
        {TIPS.map((tip, i) => (
          <View key={i} style={[styles.tipCard, { backgroundColor: tip.color }, Shadows.card]}>
            <Text style={styles.tipEmoji}>{tip.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>{tip.tip}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: Spacing.base, backgroundColor: Colors.surfaceWhite,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  agentBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary },
  sub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  scroll: { padding: Spacing.base },
  card: {
    backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  cardTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary },
  cardSub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2, marginBottom: Spacing.md },
  eventRow: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm, flexWrap: 'wrap' },
  eventBtn: {
    paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceGray,
  },
  eventBtnActive: { backgroundColor: Colors.warning },
  eventLabel: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: '500' },
  eventLabelActive: { color: '#fff' },
  amountRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm, marginBottom: Spacing.sm,
  },
  rupeeSign: { fontSize: Typography.xl, color: Colors.textPrimary, marginRight: 4 },
  amountInput: { flex: 1, fontSize: Typography.xl, color: Colors.textPrimary, paddingVertical: 12 },
  nudgeBtn: {
    backgroundColor: Colors.warning, borderRadius: Radius.button,
    paddingVertical: 14, alignItems: 'center',
  },
  nudgeBtnDisabled: { backgroundColor: Colors.textMuted },
  nudgeBtnText: { color: '#fff', fontSize: Typography.md, fontWeight: '700' },
  nudgeResult: {
    marginTop: Spacing.sm, backgroundColor: Colors.pillOrange,
    borderRadius: Radius.md, padding: Spacing.sm,
  },
  nudgeText: { fontSize: Typography.sm, color: Colors.textPrimary, lineHeight: 22 },
  sectionTitle: {
    fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary,
    marginBottom: Spacing.sm, marginTop: Spacing.sm,
  },
  tipCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: Radius.card, padding: Spacing.md, marginBottom: Spacing.sm,
  },
  tipEmoji: { fontSize: 28 },
  tipTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary },
  tipDesc: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
});