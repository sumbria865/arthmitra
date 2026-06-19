/**
 * ArthMitra — Benefits Navigator Screen
 * Matches Figma Screen 4 (Kisan):
 *   - Stats: Eligible count, Total value, Applied count
 *   - Search bar
 *   - Category filter: All | Farmer | Business | Banking
 *   - Scheme cards with eligibility match %, offline badge, apply button
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { benefitsApi } from '../lib/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/tokens';
import { useAppStore } from '../store/appStore';

type Category = 'all' | 'farmer' | 'business' | 'banking' | 'insurance' | 'health';

const CATEGORY_ICONS: Record<string, string> = {
  farmer: 'leaf',
  business: 'briefcase',
  banking: 'card',
  insurance: 'shield',
  health: 'medkit',
};

export default function BenefitsNavigator() {
  const user = useAppStore(s => s.user);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['schemes', user?.incomeType, user?.state],
    queryFn: () =>
      benefitsApi.getMatches(user?.incomeType ?? 'farmer', user?.state ?? 'Maharashtra')
        .then((r: any) => r.data.schemes),
    staleTime: 10 * 60 * 1000,
  });

  const schemes = (data ?? []).filter((s: any) => {
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'all' || s.category === category;
    return matchesSearch && matchesCat;
  });

  const totalValue = (data ?? []).reduce((sum: number, s: any) => sum + (s.benefit_amount || 0), 0);
  const appliedCount = 2; // from DB in production

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'farmer', label: 'Farmer' },
    { id: 'business', label: 'Business' },
    { id: 'banking', label: 'Banking' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Stats pills */}
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { backgroundColor: Colors.pillGreen }]}>
            <Text style={[styles.statNum, { color: Colors.success }]}>{data?.length ?? '–'}</Text>
            <Text style={styles.statLbl}>Eligible</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: Colors.pillBlue }]}>
            <Text style={[styles.statNum, { color: Colors.primary }]}>
              ₹{totalValue > 0 ? `${Math.round(totalValue / 100000)}L` : '18L'}
            </Text>
            <Text style={styles.statLbl}>Total Value</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: Colors.pillOrange }]}>
            <Text style={[styles.statNum, { color: Colors.warning }]}>{appliedCount}</Text>
            <Text style={styles.statLbl}>Applied</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search schemes... योजना खोजें"
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catBtn, category === cat.id && styles.catBtnActive]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={[styles.catLabel, category === cat.id && styles.catLabelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Scheme cards */}
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : schemes.length === 0 ? (
          <Text style={styles.empty}>No schemes found. Try a different filter.</Text>
        ) : (
          schemes.map((scheme: any) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SchemeCard({ scheme }: { scheme: any }) {
  const matchPct = scheme.eligibility_match ?? 80;
  const matchColor = matchPct >= 80 ? Colors.success : matchPct >= 60 ? Colors.warning : Colors.danger;

  return (
    <View style={[styles.schemeCard, Shadows.card]}>
      {/* Header */}
      <View style={styles.schemeHeader}>
        <View style={[styles.schemeIconBg, { backgroundColor: Colors.pillGreen }]}>
          <Ionicons name={(CATEGORY_ICONS[scheme.category] ?? 'document') as any} size={18} color={Colors.success} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={styles.schemeNameRow}>
            <Text style={styles.schemeName}>{scheme.name}</Text>
            {scheme.offline && (
              <View style={styles.offlineBadge}>
                <Text style={styles.offlineBadgeText}>📶 Offline</Text>
              </View>
            )}
          </View>
          {scheme.name_hi && <Text style={styles.schemeNameHi}>{scheme.name_hi}</Text>}
        </View>
      </View>

      {/* Benefit */}
      <Text style={styles.schemeBenefit}>{scheme.benefit}</Text>

      {/* Match bar */}
      <View style={styles.matchRow}>
        <Text style={styles.matchLabel}>Eligibility Match</Text>
        <Text style={[styles.matchPct, { color: matchColor }]}>{matchPct}%</Text>
      </View>
      <View style={styles.matchBarBg}>
        <View style={[styles.matchBarFill, { width: `${matchPct}%`, backgroundColor: matchColor }]} />
      </View>

      {/* Apply button */}
      <TouchableOpacity
        style={[styles.applyBtn, { borderColor: matchColor }]}
        onPress={() => Linking.openURL(scheme.apply_url)}
      >
        <Text style={[styles.applyBtnText, { color: matchColor }]}>Apply Now • अभी आवेदन करें</Text>
        <Ionicons name="arrow-forward" size={14} color={matchColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.base },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statPill: { flex: 1, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  statNum: { fontSize: Typography.xl, fontWeight: Typography.bold, fontFamily: Typography.fontDisplay },
  statLbl: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceWhite, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.sm, marginBottom: Spacing.sm,
  },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, fontSize: Typography.sm, color: Colors.textPrimary, paddingVertical: 10 },
  catScroll: { marginBottom: Spacing.md },
  catBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceGray, marginRight: Spacing.xs,
  },
  catBtnActive: { backgroundColor: Colors.primary },
  catLabel: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  catLabelActive: { color: Colors.surfaceWhite },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
  schemeCard: {
    backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  schemeHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  schemeIconBg: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  schemeNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  schemeName: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.textPrimary },
  schemeNameHi: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  offlineBadge: {
    backgroundColor: Colors.pillBlue, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  offlineBadgeText: { fontSize: 9, color: Colors.primary },
  schemeBenefit: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  matchRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  matchLabel: { fontSize: Typography.xs, color: Colors.textSecondary },
  matchPct: { fontSize: Typography.xs, fontWeight: Typography.bold },
  matchBarBg: { height: 6, backgroundColor: Colors.surfaceGray, borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.sm },
  matchBarFill: { height: 6, borderRadius: 3 },
  applyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderRadius: Radius.button, paddingVertical: 10, gap: 6,
  },
  applyBtnText: { fontSize: Typography.sm, fontWeight: Typography.semibold },
});