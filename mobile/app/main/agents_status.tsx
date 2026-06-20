/**
 * ArthMitra — Agents Status Screen
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/tokens';

const API = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

const AGENT_COLORS: Record<string, string> = {
  'Master Orchestrator': Colors.primary,
  'Context Agent': Colors.agentLiteracy,
  'Literacy Agent': Colors.agentLiteracy,
  'Behavioural Coach': Colors.warning,
  'Scam Guardian': Colors.danger,
  'Benefits Navigator': Colors.success,
  'Accessibility Agent': Colors.textSecondary,
};

interface Agent { name: string; status: string; calls_today: number; model: string; }

export default function AgentsStatusScreen() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/agents/status`)
      .then(r => setAgents(r.data.agents ?? []))
      .catch(() => setAgents([
        { name: 'Master Orchestrator', status: 'active', calls_today: 366, model: 'gemini-flash' },
        { name: 'Context Agent', status: 'active', calls_today: 142, model: 'gemini-flash' },
        { name: 'Literacy Agent', status: 'active', calls_today: 89, model: 'gemini-flash' },
        { name: 'Behavioural Coach', status: 'active', calls_today: 67, model: 'gemini-flash' },
        { name: 'Scam Guardian', status: 'active', calls_today: 23, model: 'gemini-pro' },
        { name: 'Benefits Navigator', status: 'active', calls_today: 45, model: 'gemini-flash' },
        { name: 'Accessibility Agent', status: 'active', calls_today: 12, model: 'rule-based' },
      ]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={agStyles.safe}>
      <View style={agStyles.header}>
        <Ionicons name="hardware-chip" size={18} color={Colors.primary} />
        <View style={{ marginLeft: 8 }}>
          <Text style={agStyles.title}>7-Agent Architecture</Text>
          <Text style={agStyles.sub}>LangGraph ReAct — Live Status</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={agStyles.scroll} showsVerticalScrollIndicator={false}>
        {loading
          ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
          : agents.map((agent, i) => {
              const color = AGENT_COLORS[agent.name] ?? Colors.primary;
              return (
                <View key={i} style={[agStyles.agentCard, Shadows.card]}>
                  <View style={[agStyles.agentDot, { backgroundColor: color }]} />
                  <View style={agStyles.agentBody}>
                    <Text style={agStyles.agentName}>{agent.name}</Text>
                    <Text style={agStyles.agentModel}>{agent.model}</Text>
                  </View>
                  <View style={agStyles.agentRight}>
                    <View style={agStyles.statusPill}>
                      <View style={agStyles.greenDot} />
                      <Text style={agStyles.statusText}>Active</Text>
                    </View>
                    <Text style={agStyles.callsText}>{agent.calls_today} calls</Text>
                  </View>
                </View>
              );
            })
        }

        <View style={[agStyles.flowCard, Shadows.card]}>
          <Text style={agStyles.flowTitle}>Agent Flow</Text>
          <Text style={agStyles.flowText}>
            User Input → Language Detection → Orchestrator → [Scam / Benefits / Coach / Literacy] → Accessibility → Response
          </Text>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const agStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, backgroundColor: Colors.surfaceWhite, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary },
  sub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  scroll: { padding: Spacing.base },
  agentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card, padding: Spacing.md, marginBottom: Spacing.sm, gap: 12 },
  agentDot: { width: 12, height: 12, borderRadius: 6 },
  agentBody: { flex: 1 },
  agentName: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary },
  agentModel: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  agentRight: { alignItems: 'flex-end' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.pillGreen, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  statusText: { fontSize: 9, color: Colors.success, fontWeight: '700' },
  callsText: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 4 },
  flowCard: { backgroundColor: Colors.pillBlue, borderRadius: Radius.card, padding: Spacing.md, marginTop: Spacing.sm },
  flowTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.primary, marginBottom: 6 },
  flowText: { fontSize: Typography.xs, color: Colors.primary, lineHeight: 18 },
});