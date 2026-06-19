/**
 * ArthMitra — Scam Guardian Screen
 * Matches Figma Screen 2:
 *   - Stats row: Blocked today, Saved, DB Size
 *   - Scan type selector: URL/Link | UPI ID | QR Code | Screenshot
 *   - Input field + Scan Now button
 *   - Result card: Risk Score / Trust Score / Analysis Details / Red Flags
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scamApi } from '../lib/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/tokens';

type ScanType = 'url' | 'upi' | 'message' | 'qr';
type Verdict = 'safe' | 'suspicious' | 'fraud';

interface ScanResult {
  verdict: Verdict;
  riskScore: number;
  trustScore: number;
  rbiRegistered: boolean;
  domainAgeDays?: number;
  redFlags: string[];
  recommendation: string;
  legitimateAlternative?: string;
}

const VERDICT_CONFIG: Record<Verdict, { color: string; bg: string; icon: string; label: string; labelHi: string }> = {
  safe: { color: Colors.success, bg: '#E8F5E9', icon: 'checkmark-circle', label: 'SAFE', labelHi: 'सुरक्षित' },
  suspicious: { color: Colors.warning, bg: '#FFF3E0', icon: 'warning', label: 'SUSPICIOUS', labelHi: 'संदिग्ध' },
  fraud: { color: Colors.danger, bg: Colors.pillRed, icon: 'close-circle', label: 'UNSAFE — FRAUD', labelHi: 'असुरक्षित — धोखाधड़ी' },
};

export default function ScamGuardian() {
  const [scanType, setScanType] = useState<ScanType>('url');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const scanTypes: { id: ScanType; label: string; icon: string }[] = [
    { id: 'url', label: 'URL/Link', icon: 'link' },
    { id: 'upi', label: 'UPI ID', icon: 'qr-code' },
    { id: 'message', label: 'Message', icon: 'chatbubble' },
    { id: 'qr', label: 'QR Code', icon: 'camera' },
  ];

  const handleScan = async () => {
    if (!input.trim()) {
      Alert.alert('Input required', 'Please enter a URL, UPI ID, or message to scan.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await scamApi.scan(input.trim(), scanType);
      setResult({
        verdict: data.verdict,
        riskScore: data.risk_score,
        trustScore: data.trust_score,
        rbiRegistered: data.rbi_registered,
        domainAgeDays: data.domain_age_days,
        redFlags: data.red_flags ?? [],
        recommendation: data.recommendation,
        legitimateAlternative: data.legitimate_alternative,
      });
    } catch (e: any) {
      Alert.alert('Scan failed', e.message ?? 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const vc = result ? VERDICT_CONFIG[result.verdict] : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.agentBadge}>
            <Ionicons name="shield" size={18} color={Colors.danger} />
            <Text style={styles.agentName}>Scam Guardian</Text>
          </View>
          <Text style={styles.agentSub}>सेवा सुरक्षा • 99.2% Accuracy</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Blocked Today', value: '7', icon: 'shield-checkmark', color: Colors.danger },
            { label: 'Saved', value: '₹12k', icon: 'cash', color: Colors.success },
            { label: 'DB Size', value: '2.4M', icon: 'server', color: Colors.primary },
          ].map(stat => (
            <View key={stat.label} style={styles.statChip}>
              <Ionicons name={stat.icon as any} size={16} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Scan type selector */}
        <View style={styles.typeRow}>
          {scanTypes.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.typeBtn, scanType === t.id && styles.typeBtnActive]}
              onPress={() => { setScanType(t.id); setResult(null); }}
            >
              <Ionicons name={t.icon as any} size={15} color={scanType === t.id ? Colors.surfaceWhite : Colors.textSecondary} />
              <Text style={[styles.typeLabel, scanType === t.id && styles.typeLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input */}
        <TextInput
          style={styles.input}
          placeholder={scanType === 'url' ? 'https://suspicious-site.com...' : scanType === 'upi' ? 'example@bank' : 'Paste suspicious message...'}
          placeholderTextColor={Colors.textMuted}
          value={input}
          onChangeText={setInput}
          autoCapitalize="none"
          autoCorrect={false}
          multiline={scanType === 'message'}
          numberOfLines={scanType === 'message' ? 3 : 1}
        />

        {/* Scan button */}
        <TouchableOpacity
          style={[styles.scanBtn, loading && styles.scanBtnLoading]}
          onPress={handleScan}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="scan" size={18} color="#fff" />
              <Text style={styles.scanBtnText}>Scan Now • अभी स्कैन करें</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Result card */}
        {result && vc && (
          <View style={[styles.resultCard, { borderLeftColor: vc.color, borderLeftWidth: 4 }, Shadows.card]}>

            {/* Verdict banner */}
            <View style={[styles.verdictBanner, { backgroundColor: vc.bg }]}>
              <Ionicons name={vc.icon as any} size={24} color={vc.color} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.verdictLabel, { color: vc.color }]}>{vc.label}</Text>
                <Text style={[styles.verdictHi, { color: vc.color }]}>{vc.labelHi}</Text>
              </View>
            </View>

            {/* Score row */}
            <View style={styles.scoreRow}>
              <View style={styles.scorePill}>
                <Text style={styles.scorePillLabel}>Risk Score</Text>
                <Text style={[styles.scorePillValue, { color: Colors.danger }]}>{result.riskScore}<Text style={styles.scorePillMax}>/100</Text></Text>
              </View>
              <View style={styles.scorePill}>
                <Text style={styles.scorePillLabel}>Trust Score</Text>
                <Text style={[styles.scorePillValue, { color: Colors.success }]}>{result.trustScore}<Text style={styles.scorePillMax}>/100</Text></Text>
              </View>
            </View>

            {/* Analysis details */}
            <Text style={styles.analysisTitle}>Analysis Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Domain Age</Text>
              <Text style={styles.detailValue}>{result.domainAgeDays != null ? `${result.domainAgeDays} days` : 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Fraud Probability</Text>
              <Text style={[styles.detailValue, { color: Colors.danger }]}>{result.riskScore}%</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>RBI Verified</Text>
              <Text style={[styles.detailValue, { color: result.rbiRegistered ? Colors.success : Colors.danger }]}>
                {result.rbiRegistered ? '✓ Listed' : '✗ Not Listed'}
              </Text>
            </View>

            {/* Red flags */}
            {result.redFlags.length > 0 && (
              <>
                <Text style={[styles.analysisTitle, { marginTop: 12 }]}>🚩 Red Flags</Text>
                {result.redFlags.map((flag, i) => (
                  <View key={i} style={styles.redFlagRow}>
                    <View style={styles.redFlagDot} />
                    <Text style={styles.redFlagText}>{flag}</Text>
                  </View>
                ))}
              </>
            )}

            {/* Recommendation */}
            <View style={[styles.recBox, { backgroundColor: vc.bg }]}>
              <Text style={[styles.recText, { color: vc.color }]}>{result.recommendation}</Text>
            </View>

            {result.legitimateAlternative && (
              <View style={[styles.recBox, { backgroundColor: Colors.pillGreen, marginTop: 8 }]}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text style={[styles.recText, { color: Colors.success, marginLeft: 6 }]}>{result.legitimateAlternative}</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.base },
  header: { marginBottom: Spacing.md },
  agentBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  agentName: { fontSize: Typography.lg, fontWeight: Typography.bold, fontFamily: Typography.fontDisplay, color: Colors.textPrimary },
  agentSub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statChip: {
    flex: 1, backgroundColor: Colors.surfaceWhite, borderRadius: Radius.md,
    padding: Spacing.sm, alignItems: 'center', ...Shadows.card,
  },
  statValue: { fontSize: Typography.md, fontWeight: Typography.bold, marginTop: 4 },
  statLabel: { fontSize: 9, color: Colors.textMuted, textAlign: 'center', marginTop: 2 },
  typeRow: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.md },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceGray, gap: 4,
  },
  typeBtnActive: { backgroundColor: Colors.primary },
  typeLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: Typography.medium },
  typeLabelActive: { color: Colors.surfaceWhite },
  input: {
    backgroundColor: Colors.surfaceWhite, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    fontSize: Typography.sm, color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  scanBtn: {
    backgroundColor: Colors.danger, borderRadius: Radius.button,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, gap: 8, marginBottom: Spacing.lg,
  },
  scanBtnLoading: { opacity: 0.7 },
  scanBtnText: { color: '#fff', fontSize: Typography.md, fontWeight: Typography.bold },
  resultCard: {
    backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card,
    padding: Spacing.md, ...Shadows.card,
  },
  verdictBanner: {
    flexDirection: 'row', alignItems: 'center', borderRadius: Radius.sm,
    padding: Spacing.sm, marginBottom: Spacing.md,
  },
  verdictLabel: { fontSize: Typography.md, fontWeight: Typography.bold, fontFamily: Typography.fontDisplay },
  verdictHi: { fontSize: Typography.xs, marginTop: 2 },
  scoreRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  scorePill: {
    flex: 1, backgroundColor: Colors.surfaceGray, borderRadius: Radius.sm,
    padding: Spacing.sm, alignItems: 'center',
  },
  scorePillLabel: { fontSize: Typography.xs, color: Colors.textSecondary },
  scorePillValue: { fontSize: Typography.xxl, fontWeight: Typography.bold, marginTop: 2 },
  scorePillMax: { fontSize: Typography.sm, fontWeight: Typography.regular, color: Colors.textMuted },
  analysisTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  detailKey: { fontSize: Typography.sm, color: Colors.textSecondary },
  detailValue: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textPrimary },
  redFlagRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  redFlagDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.danger, marginTop: 5, marginRight: 8 },
  redFlagText: { flex: 1, fontSize: Typography.xs, color: Colors.textPrimary },
  recBox: { borderRadius: Radius.sm, padding: Spacing.sm, flexDirection: 'row', alignItems: 'flex-start', marginTop: 12 },
  recText: { flex: 1, fontSize: Typography.xs, lineHeight: 18 },
});