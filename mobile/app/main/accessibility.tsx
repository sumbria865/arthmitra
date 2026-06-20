/**
 * ArthMitra — Accessibility Screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/tokens';

const SETTINGS = [
  { id: 'voice', label: 'Voice Output', labelHi: 'आवाज़ आउटपुट', desc: 'All responses read aloud (XTTS-v2)', icon: 'volume-high' },
  { id: 'large_font', label: 'Large Text', labelHi: 'बड़ा टेक्स्ट', desc: 'Increase text size for easier reading', icon: 'text' },
  { id: 'high_contrast', label: 'High Contrast', labelHi: 'उच्च कंट्रास्ट', desc: 'Better visibility for low vision', icon: 'contrast' },
  { id: 'screen_reader', label: 'Screen Reader', labelHi: 'स्क्रीन रीडर', desc: 'WCAG 2.2 AA compatible mode', icon: 'eye' },
  { id: 'offline', label: 'Offline Mode', labelHi: 'ऑफलाइन मोड', desc: 'Download top 5 schemes for offline use', icon: 'cloud-offline' },
  { id: 'slow_anim', label: 'Reduce Motion', labelHi: 'कम एनिमेशन', desc: 'Reduce animations and transitions', icon: 'speedometer' },
];

export default function AccessibilityScreen() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    voice: false, large_font: false, high_contrast: false,
    screen_reader: false, offline: false, slow_anim: false,
  });

  return (
    <SafeAreaView style={aStyles.safe}>
      <View style={aStyles.header}>
        <Ionicons name="settings" size={18} color={Colors.textSecondary} />
        <View style={{ marginLeft: 8 }}>
          <Text style={aStyles.title}>Accessibility</Text>
          <Text style={aStyles.sub}>सुलभता सेटिंग्स • WCAG 2.2 AA</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={aStyles.scroll} showsVerticalScrollIndicator={false}>
        {SETTINGS.map(s => (
          <View key={s.id} style={[aStyles.row, Shadows.card]}>
            <View style={[aStyles.iconBg, { backgroundColor: Colors.surfaceGray }]}>
              <Ionicons name={s.icon as any} size={18} color={Colors.textSecondary} />
            </View>
            <View style={aStyles.rowText}>
              <Text style={aStyles.rowLabel}>{s.label}</Text>
              <Text style={aStyles.rowHi}>{s.labelHi}</Text>
              <Text style={aStyles.rowDesc}>{s.desc}</Text>
            </View>
            <Switch
              value={settings[s.id]}
              onValueChange={v => setSettings(p => ({ ...p, [s.id]: v }))}
              trackColor={{ false: Colors.surfaceGray, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
        ))}

        <View style={aStyles.emergencyCard}>
          <Ionicons name="call" size={18} color={Colors.danger} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={aStyles.emergTitle}>Emergency Contacts</Text>
            <Text style={aStyles.emergLine}>RBI Helpline: 14440</Text>
            <Text style={aStyles.emergLine}>Cyber Crime: 1930</Text>
            <Text style={aStyles.emergLine}>Women Helpline: 181</Text>
          </View>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const aStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, backgroundColor: Colors.surfaceWhite, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary },
  sub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  scroll: { padding: Spacing.base },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  iconBg: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowLabel: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary },
  rowHi: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 1 },
  rowDesc: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  emergencyCard: { flexDirection: 'row', backgroundColor: Colors.pillRed, borderRadius: Radius.card, padding: Spacing.md, marginTop: Spacing.sm },
  emergTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.danger, marginBottom: 4 },
  emergLine: { fontSize: Typography.xs, color: Colors.textPrimary, marginTop: 2 },
});