/**
 * ArthMitra — Farmer Screen
 * PM-KISAN, crop insurance, MUDRA, seasonal finance for farmers
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/tokens';

const FARMER_SCHEMES = [
  {
    id: 'pmkisan',
    name: 'PM-KISAN',
    nameHi: 'पीएम किसान',
    benefit: '₹6,000/year (3 instalments)',
    eligibility: 'सभी किसान जिनके पास ज़मीन है',
    match: 92,
    url: 'https://pmkisan.gov.in',
    offline: true,
    color: Colors.success,
    bg: Colors.pillGreen,
  },
  {
    id: 'fasal-bima',
    name: 'PM Fasal Bima Yojana',
    nameHi: 'पीएम फसल बीमा योजना',
    benefit: 'Full crop value insurance',
    eligibility: 'Kharif & Rabi season farmers',
    match: 85,
    url: 'https://pmfby.gov.in',
    offline: true,
    color: Colors.primary,
    bg: Colors.pillBlue,
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card',
    nameHi: 'किसान क्रेडिट कार्ड',
    benefit: 'Up to ₹3 Lakh @ 7% interest',
    eligibility: 'Land-owning farmers',
    match: 80,
    url: 'https://www.nabard.org/content.aspx?id=580',
    offline: false,
    color: Colors.warning,
    bg: Colors.pillOrange,
  },
  {
    id: 'enam',
    name: 'e-NAM Market',
    nameHi: 'राष्ट्रीय कृषि बाज़ार',
    benefit: 'Sell crops at best price online',
    eligibility: 'All farmers',
    match: 100,
    url: 'https://enam.gov.in',
    offline: false,
    color: Colors.agentLiteracy,
    bg: Colors.pillPurple,
  },
];

const SEASON_TIPS = [
  { season: 'Kharif (June–Oct)', tip: 'Sowing season — apply for KCC now', icon: '🌱' },
  { season: 'Rabi (Nov–Mar)', tip: 'Crop insurance deadline — register before sowing', icon: '🌾' },
  { season: 'Harvest', tip: 'Save 20% of proceeds for off-season', icon: '🚜' },
];

export default function FarmerScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.agentBadge}>
          <Ionicons name="leaf" size={18} color={Colors.success} />
          <Text style={styles.title}>Farmer Corner</Text>
        </View>
        <Text style={styles.sub}>किसान कोना • Kisan Ki Baat</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Seasonal tips */}
        <Text style={styles.sectionTitle}>Seasonal Finance • मौसमी वित्त</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonScroll}>
          {SEASON_TIPS.map((s, i) => (
            <View key={i} style={[styles.seasonCard, Shadows.card]}>
              <Text style={styles.seasonIcon}>{s.icon}</Text>
              <Text style={styles.seasonName}>{s.season}</Text>
              <Text style={styles.seasonTip}>{s.tip}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Schemes */}
        <Text style={styles.sectionTitle}>Farmer Schemes • किसान योजनाएं</Text>
        {FARMER_SCHEMES.map(s => (
          <View key={s.id} style={[styles.schemeCard, Shadows.card]}>
            <View style={styles.schemeHeader}>
              <View style={[styles.schemeIcon, { backgroundColor: s.bg }]}>
                <Ionicons name="leaf" size={18} color={s.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.schemeName}>{s.name}</Text>
                  {s.offline && (
                    <View style={styles.offlineBadge}>
                      <Text style={styles.offlineText}>📶 Offline</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.schemeHi}>{s.nameHi}</Text>
              </View>
            </View>
            <Text style={styles.schemeBenefit}>{s.benefit}</Text>
            <Text style={styles.schemeElig}>✓ {s.eligibility}</Text>
            <View style={styles.matchRow}>
              <Text style={styles.matchLabel}>Match</Text>
              <Text style={[styles.matchVal, { color: s.color }]}>{s.match}%</Text>
            </View>
            <View style={styles.matchBarBg}>
              <View style={[styles.matchBarFill, { width: `${s.match}%`, backgroundColor: s.color }]} />
            </View>
            <TouchableOpacity
              style={[styles.applyBtn, { borderColor: s.color }]}
              onPress={() => Linking.openURL(s.url)}
            >
              <Text style={[styles.applyBtnText, { color: s.color }]}>Apply Now →</Text>
            </TouchableOpacity>
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
  sectionTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.xs },
  seasonScroll: { marginBottom: Spacing.md },
  seasonCard: {
    width: 160, backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card,
    padding: Spacing.md, marginRight: Spacing.sm,
  },
  seasonIcon: { fontSize: 28, marginBottom: 6 },
  seasonName: { fontSize: Typography.xs, fontWeight: '700', color: Colors.success, marginBottom: 4 },
  seasonTip: { fontSize: Typography.xs, color: Colors.textSecondary, lineHeight: 16 },
  schemeCard: {
    backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  schemeHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: Spacing.sm },
  schemeIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  schemeName: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary },
  schemeHi: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  offlineBadge: { backgroundColor: Colors.pillBlue, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  offlineText: { fontSize: 9, color: Colors.primary },
  schemeBenefit: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: 4 },
  schemeElig: { fontSize: Typography.xs, color: Colors.success, marginBottom: Spacing.sm },
  matchRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  matchLabel: { fontSize: Typography.xs, color: Colors.textSecondary },
  matchVal: { fontSize: Typography.xs, fontWeight: '700' },
  matchBarBg: { height: 6, backgroundColor: Colors.surfaceGray, borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.sm },
  matchBarFill: { height: 6, borderRadius: 3 },
  applyBtn: { borderWidth: 1.5, borderRadius: Radius.button, paddingVertical: 10, alignItems: 'center' },
  applyBtnText: { fontSize: Typography.sm, fontWeight: '700' },
});