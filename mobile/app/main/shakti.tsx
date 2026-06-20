/**
 * ArthMitra — Shakti Screen (Women's Financial Empowerment)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/tokens';

const SHAKTI_SCHEMES = [
  { name: 'PM Mahila Shakti Kendra', benefit: 'Skill development + awareness', url: 'https://wcd.nic.in', color: Colors.shaktiPink, bg: '#FCE4EC' },
  { name: 'Mahila Samridhi Yojana', benefit: 'Micro-credit for women entrepreneurs', url: 'https://nsfdc.nic.in', color: Colors.shaktiPink, bg: '#FCE4EC' },
  { name: 'Sukanya Samriddhi Yojana', benefit: 'Girl child savings — 8.2% interest', url: 'https://www.indiapost.gov.in/Financial/Pages/Content/SSA.aspx', color: Colors.primary, bg: Colors.pillBlue },
  { name: 'PM Matru Vandana Yojana', benefit: '₹5,000 maternity benefit', url: 'https://pmmvy.wcd.gov.in', color: Colors.success, bg: Colors.pillGreen },
  { name: 'Stand-Up India', benefit: '₹10L-₹1Cr loan for SC/ST/women', url: 'https://www.standupmitra.in', color: Colors.warning, bg: Colors.pillOrange },
];

const SHG_TIPS = [
  { icon: '👥', tip: 'Self Help Group (SHG) बनाएं', desc: '10-20 महिलाएं मिलकर save करें और loan लें' },
  { icon: '💰', tip: 'Monthly saving ₹100 से शुरू', desc: 'SHG में हर महीने थोड़ा-थोड़ा जमा करें' },
  { icon: '🏦', tip: 'Bank linkage scheme', desc: 'NABARD SHG-Bank Linkage — 0% guarantee loan' },
];

export default function ShaktiScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.agentBadge}>
          <Ionicons name="people" size={18} color={Colors.shaktiPink} />
          <Text style={styles.title}>Shakti — Women's Finance</Text>
        </View>
        <Text style={styles.sub}>महिला वित्तीय सशक्तिकरण</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={[styles.heroBanner, Shadows.card]}>
          <Text style={styles.heroEmoji}>💪</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>आर्थिक आज़ादी आपका अधिकार है</Text>
            <Text style={styles.heroSub}>Financial independence is your right</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Women's Schemes • महिला योजनाएं</Text>
        {SHAKTI_SCHEMES.map((s, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.schemeCard, Shadows.card]}
            onPress={() => Linking.openURL(s.url)}
            activeOpacity={0.8}
          >
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.schemeName}>{s.name}</Text>
              <Text style={styles.schemeBenefit}>{s.benefit}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Self Help Groups • स्वयं सहायता समूह</Text>
        {SHG_TIPS.map((t, i) => (
          <View key={i} style={[styles.tipCard, Shadows.card]}>
            <Text style={styles.tipIcon}>{t.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>{t.tip}</Text>
              <Text style={styles.tipDesc}>{t.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.helplineCard}>
          <Ionicons name="call" size={18} color={Colors.shaktiPink} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.helplineTitle}>Women Helpline</Text>
            <Text style={styles.helplineNum}>181 (free, 24×7)</Text>
          </View>
        </View>

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
  heroBanner: {
    backgroundColor: '#FCE4EC', borderRadius: Radius.card,
    padding: Spacing.md, flexDirection: 'row', alignItems: 'center',
    gap: 12, marginBottom: Spacing.md,
  },
  heroEmoji: { fontSize: 36 },
  heroTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.shaktiPink },
  heroSub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.xs },
  schemeCard: {
    backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card,
    padding: Spacing.md, flexDirection: 'row', alignItems: 'center',
    gap: 12, marginBottom: Spacing.sm,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  schemeName: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary },
  schemeBenefit: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  tipCard: {
    backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card,
    padding: Spacing.md, flexDirection: 'row', alignItems: 'flex-start',
    gap: 12, marginBottom: Spacing.sm,
  },
  tipIcon: { fontSize: 24 },
  tipTitle: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary },
  tipDesc: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  helplineCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FCE4EC', borderRadius: Radius.card,
    padding: Spacing.md, marginTop: Spacing.sm,
  },
  helplineTitle: { fontSize: Typography.sm, fontWeight: '600', color: Colors.shaktiPink },
  helplineNum: { fontSize: Typography.xl, fontWeight: '700', color: Colors.shaktiPink },
});