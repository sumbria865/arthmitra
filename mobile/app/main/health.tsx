/**
 * ArthMitra — Health Score Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/tokens';
import { useAppStore } from '../../store/appStore';

const HEALTH_DIMENSIONS = [
  { label: 'Emergency Fund', score: 58, icon: '🆘', tip: 'Need ₹50,000 — saved ₹29,000' },
  { label: 'Debt Level', score: 72, icon: '📉', tip: 'Debt-to-income ratio: 28% (safe < 40%)' },
  { label: 'Savings Rate', score: 65, icon: '💰', tip: 'Saving 10% of income — target 20%' },
  { label: 'Insurance Cover', score: 40, icon: '🛡️', tip: 'No health insurance — apply PM-JAY' },
  { label: 'Scam Protection', score: 90, icon: '🔒', tip: 'Excellent! 7 scams blocked this month' },
  { label: 'Financial Literacy', score: 42, icon: '📚', tip: 'Score improving — 65/100 last week' },
];

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <View style={hStyles.barBg}>
      <View style={[hStyles.barFill, { width: `${score}%`, backgroundColor: color }]} />
    </View>
  );
}

export default function HealthScreen() {
  const user = useAppStore(s => s.user);
  const overallScore = Math.round(
    HEALTH_DIMENSIONS.reduce((s, d) => s + d.score, 0) / HEALTH_DIMENSIONS.length
  );
  const scoreColor = overallScore >= 70 ? Colors.success : overallScore >= 50 ? Colors.warning : Colors.danger;

  return (
    <SafeAreaView style={hStyles.safe}>
      <View style={hStyles.header}>
        <View style={hStyles.agentBadge}>
          <Ionicons name="bar-chart" size={18} color={Colors.primary} />
          <Text style={hStyles.title}>Financial Health Score</Text>
        </View>
        <Text style={hStyles.sub}>वित्तीय स्वास्थ्य स्कोर</Text>
      </View>

      <ScrollView contentContainerStyle={hStyles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[hStyles.scoreCard, Shadows.card]}>
          <Text style={[hStyles.bigScore, { color: scoreColor }]}>{overallScore}</Text>
          <Text style={hStyles.scoreLabel}>Overall Health Score /100</Text>
          <Text style={[hStyles.scoreTag, { color: scoreColor }]}>
            {overallScore >= 70 ? '✅ Good' : overallScore >= 50 ? '⚠️ Fair' : '❌ Needs Work'}
          </Text>
        </View>

        <Text style={hStyles.sectionTitle}>Score Breakdown</Text>
        {HEALTH_DIMENSIONS.map((d, i) => {
          const c = d.score >= 70 ? Colors.success : d.score >= 50 ? Colors.warning : Colors.danger;
          return (
            <View key={i} style={[hStyles.dimCard, Shadows.card]}>
              <View style={hStyles.dimHeader}>
                <Text style={hStyles.dimIcon}>{d.icon}</Text>
                <Text style={hStyles.dimLabel}>{d.label}</Text>
                <Text style={[hStyles.dimScore, { color: c }]}>{d.score}/100</Text>
              </View>
              <ScoreBar score={d.score} color={c} />
              <Text style={hStyles.dimTip}>{d.tip}</Text>
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const hStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.base, backgroundColor: Colors.surfaceWhite, borderBottomWidth: 1, borderBottomColor: Colors.border },
  agentBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary },
  sub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  scroll: { padding: Spacing.base },
  scoreCard: { backgroundColor: Colors.surfaceWhite, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.md },
  bigScore: { fontSize: 72, fontWeight: '700' },
  scoreLabel: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 4 },
  scoreTag: { fontSize: Typography.md, fontWeight: '600', marginTop: 6 },
  sectionTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  dimCard: { backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card, padding: Spacing.md, marginBottom: Spacing.sm },
  dimHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  dimIcon: { fontSize: 20, marginRight: 8 },
  dimLabel: { flex: 1, fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary },
  dimScore: { fontSize: Typography.sm, fontWeight: '700' },
  barBg: { height: 6, backgroundColor: Colors.surfaceGray, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  barFill: { height: 6, borderRadius: 3 },
  dimTip: { fontSize: Typography.xs, color: Colors.textSecondary },
});