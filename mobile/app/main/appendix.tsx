/**
 * ArthMitra — Appendix Screen (Quick Reference)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/tokens';

const SECTIONS = [
  {
    title: 'Emergency Helplines', icon: '🆘',
    items: [
      { label: 'Cyber Crime', value: '1930', url: null },
      { label: 'RBI Helpline', value: '14440', url: null },
      { label: 'Women Helpline', value: '181', url: null },
      { label: 'PM-KISAN Helpline', value: '155261', url: null },
      { label: 'Bank Fraud (RBI)', value: '14448', url: null },
    ],
  },
  {
    title: 'Official Portals', icon: '🌐',
    items: [
      { label: 'PM-KISAN', value: 'pmkisan.gov.in', url: 'https://pmkisan.gov.in' },
      { label: 'MUDRA Loan', value: 'mudra.org.in', url: 'https://mudra.org.in' },
      { label: 'Jan Dhan Yojana', value: 'pmjdy.gov.in', url: 'https://pmjdy.gov.in' },
      { label: 'Fasal Bima', value: 'pmfby.gov.in', url: 'https://pmfby.gov.in' },
      { label: 'Cyber Crime Report', value: 'cybercrime.gov.in', url: 'https://cybercrime.gov.in' },
    ],
  },
  {
    title: 'Regulatory Bodies', icon: '⚖️',
    items: [
      { label: 'RBI (Banking)', value: 'rbi.org.in', url: 'https://www.rbi.org.in' },
      { label: 'SEBI (Securities)', value: 'sebi.gov.in', url: 'https://www.sebi.gov.in' },
      { label: 'IRDAI (Insurance)', value: 'irdai.gov.in', url: 'https://irdai.gov.in' },
      { label: 'NPCI (UPI)', value: 'npci.org.in', url: 'https://www.npci.org.in' },
    ],
  },
  {
    title: 'Financial Terms', icon: '📚',
    items: [
      { label: 'APR', value: 'Annual Percentage Rate — total cost of loan per year', url: null },
      { label: 'EMI', value: 'Equated Monthly Instalment — monthly loan payment', url: null },
      { label: 'KYC', value: 'Know Your Customer — ID verification required by banks', url: null },
      { label: 'CIBIL Score', value: '300-900 — higher is better for loan approval', url: null },
      { label: 'SIP', value: 'Systematic Investment Plan — invest fixed amount monthly', url: null },
    ],
  },
];

export default function AppendixScreen() {
  const [expanded, setExpanded] = useState<string | null>('Emergency Helplines');

  return (
    <SafeAreaView style={apStyles.safe}>
      <View style={apStyles.header}>
        <Ionicons name="document-text" size={18} color={Colors.textSecondary} />
        <View style={{ marginLeft: 8 }}>
          <Text style={apStyles.title}>Appendix</Text>
          <Text style={apStyles.sub}>Quick Reference Guide • त्वरित संदर्भ</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={apStyles.scroll} showsVerticalScrollIndicator={false}>
        {SECTIONS.map(section => (
          <View key={section.title} style={[apStyles.section, Shadows.card]}>
            <TouchableOpacity
              style={apStyles.sectionHeader}
              onPress={() => setExpanded(expanded === section.title ? null : section.title)}
            >
              <Text style={apStyles.sectionIcon}>{section.icon}</Text>
              <Text style={apStyles.sectionTitle}>{section.title}</Text>
              <Ionicons
                name={expanded === section.title ? 'chevron-up' : 'chevron-down'}
                size={16} color={Colors.textMuted}
              />
            </TouchableOpacity>

            {expanded === section.title && (
              <View style={apStyles.sectionBody}>
                {section.items.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={apStyles.item}
                    onPress={() => item.url && Linking.openURL(item.url)}
                    disabled={!item.url}
                  >
                    <Text style={apStyles.itemLabel}>{item.label}</Text>
                    <Text style={[apStyles.itemValue, item.url && apStyles.itemLink]}>
                      {item.value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={apStyles.complianceCard}>
          <Text style={apStyles.complianceTitle}>Compliance</Text>
          <Text style={apStyles.complianceLine}>✓ SEBI IA Regulations 2021 — Financial education, not advice</Text>
          <Text style={apStyles.complianceLine}>✓ DPDP Act 2023 — Your data deleted on request</Text>
          <Text style={apStyles.complianceLine}>✓ RBI Digital Lending 2022 — No loan intermediation</Text>
          <Text style={apStyles.complianceLine}>✓ WCAG 2.2 AA — Accessibility first</Text>
        </View>
        <Text style={apStyles.version}>ArthMitra v1.0.0 • Nomura KakushIN 2026 • SPIT Mumbai</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const apStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, backgroundColor: Colors.surfaceWhite, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary },
  sub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  scroll: { padding: Spacing.base },
  section: { backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card, marginBottom: Spacing.sm, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 8 },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { flex: 1, fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary },
  sectionBody: { borderTopWidth: 1, borderTopColor: Colors.border },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemLabel: { fontSize: Typography.xs, fontWeight: '600', color: Colors.textSecondary, flex: 1 },
  itemValue: { fontSize: Typography.xs, color: Colors.textPrimary, flex: 2, textAlign: 'right' },
  itemLink: { color: Colors.primary, textDecorationLine: 'underline' },
  complianceCard: { backgroundColor: Colors.pillGreen, borderRadius: Radius.card, padding: Spacing.md, marginTop: Spacing.sm, marginBottom: Spacing.sm },
  complianceTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.success, marginBottom: 8 },
  complianceLine: { fontSize: Typography.xs, color: Colors.textPrimary, lineHeight: 20, marginBottom: 2 },
  version: { textAlign: 'center', fontSize: Typography.xs, color: Colors.textMuted },
});