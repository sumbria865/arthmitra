/**
 * ArthMitra — Analytics Screen (personal financial analytics)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/tokens';

const MONTHLY_DATA = [
  { month: 'Jan', saved: 2400, spent: 8200 },
  { month: 'Feb', saved: 2800, spent: 7900 },
  { month: 'Mar', saved: 3100, spent: 8100 },
  { month: 'Apr', saved: 2600, spent: 8800 },
  { month: 'May', saved: 3400, spent: 7600 },
  { month: 'Jun', saved: 3200, spent: 8000 },
];

const MAX_SAVE = Math.max(...MONTHLY_DATA.map(d => d.saved));

export default function AnalyticsScreen() {
  const totalSaved = MONTHLY_DATA.reduce((s, d) => s + d.saved, 0);
  const avgSaved = Math.round(totalSaved / MONTHLY_DATA.length);

  return (
    <SafeAreaView style={anStyles.safe}>
      <View style={anStyles.header}>
        <Ionicons name="bar-chart" size={18} color={Colors.primaryLight} />
        <View style={{ marginLeft: 8 }}>
          <Text style={anStyles.title}>Analytics</Text>
          <Text style={anStyles.sub}>आपका वित्तीय विश्लेषण</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={anStyles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary pills */}
        <View style={anStyles.pillRow}>
          {[
            { label: 'Total Saved', value: `₹${totalSaved.toLocaleString()}`, color: Colors.success, bg: Colors.pillGreen },
            { label: 'Avg/Month', value: `₹${avgSaved.toLocaleString()}`, color: Colors.primary, bg: Colors.pillBlue },
            { label: 'Scams Blocked', value: '7', color: Colors.danger, bg: Colors.pillRed },
          ].map(p => (
            <View key={p.label} style={[anStyles.pill, { backgroundColor: p.bg }]}>
              <Text style={[anStyles.pillVal, { color: p.color }]}>{p.value}</Text>
              <Text style={anStyles.pillLabel}>{p.label}</Text>
            </View>
          ))}
        </View>

        {/* Savings bar chart */}
        <View style={[anStyles.chartCard, Shadows.card]}>
          <Text style={anStyles.chartTitle}>Monthly Savings (₹)</Text>
          <View style={anStyles.bars}>
            {MONTHLY_DATA.map((d, i) => (
              <View key={i} style={anStyles.barWrap}>
                <Text style={anStyles.barVal}>{(d.saved / 1000).toFixed(1)}k</Text>
                <View style={anStyles.barBg}>
                  <View style={[anStyles.barFill, { height: `${(d.saved / MAX_SAVE) * 100}%` }]} />
                </View>
                <Text style={anStyles.barLabel}>{d.month}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Insights */}
        <View style={[anStyles.insightCard, Shadows.card]}>
          <Text style={anStyles.insightTitle}>💡 Insights</Text>
          <Text style={anStyles.insightItem}>• March & May were your best savings months</Text>
          <Text style={anStyles.insightItem}>• April had highest spending — identify what caused it</Text>
          <Text style={anStyles.insightItem}>• Savings rate: ~30% — above national average of 18%! 🎉</Text>
          <Text style={anStyles.insightItem}>• At this pace: ₹{(avgSaved * 12).toLocaleString()} saved in 1 year</Text>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const anStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, backgroundColor: Colors.surfaceWhite, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary },
  sub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  scroll: { padding: Spacing.base },
  pillRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  pill: { flex: 1, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  pillVal: { fontSize: Typography.md, fontWeight: '700' },
  pillLabel: { fontSize: 9, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  chartCard: { backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card, padding: Spacing.md, marginBottom: Spacing.md },
  chartTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140 },
  barWrap: { alignItems: 'center', flex: 1 },
  barVal: { fontSize: 9, color: Colors.textMuted, marginBottom: 4 },
  barBg: { width: 20, height: 100, backgroundColor: Colors.surfaceGray, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  barLabel: { fontSize: 9, color: Colors.textSecondary, marginTop: 6 },
  insightCard: { backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card, padding: Spacing.md },
  insightTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  insightItem: { fontSize: Typography.xs, color: Colors.textSecondary, lineHeight: 20, marginBottom: 4 },
});