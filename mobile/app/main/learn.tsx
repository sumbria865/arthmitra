/**
 * ArthMitra — Learn Screen (Financial Literacy)
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { chatApi } from '../../lib/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/tokens';

const TOPICS = [
  { id: 'interest', label: 'Interest Rate', labelHi: 'ब्याज दर क्या है?', icon: '📊', level: 'Basic' },
  { id: 'inflation', label: 'Inflation', labelHi: 'महंगाई क्या है?', icon: '📈', level: 'Basic' },
  { id: 'insurance', label: 'Insurance', labelHi: 'बीमा क्यों जरूरी है?', icon: '🛡️', level: 'Basic' },
  { id: 'fd', label: 'Fixed Deposit', labelHi: 'FD क्या होती है?', icon: '🏦', level: 'Basic' },
  { id: 'credit_score', label: 'Credit Score', labelHi: 'क्रेडिट स्कोर?', icon: '⭐', level: 'Medium' },
  { id: 'sip', label: 'SIP / Mutual Fund', labelHi: 'SIP क्या होती है?', icon: '💹', level: 'Medium' },
  { id: 'tax', label: 'Income Tax', labelHi: 'टैक्स कैसे बचाएं?', icon: '📝', level: 'Medium' },
  { id: 'emi', label: 'Loan EMI', labelHi: 'EMI कैसे काम करती है?', icon: '🏠', level: 'Basic' },
];

const LEVEL_COLOR: Record<string, string> = {
  Basic: Colors.success,
  Medium: Colors.warning,
  Advanced: Colors.danger,
};

export default function LearnScreen() {
  const [answer, setAnswer] = useState<{ topic: string; text: string } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleLearn = async (topic: typeof TOPICS[0]) => {
    setLoading(topic.id);
    try {
      const { data } = await chatApi.sendMessage(`${topic.labelHi} — सरल हिंदी में समझाओ`);
      setAnswer({ topic: topic.label, text: data.response });
    } catch {
      setAnswer({
        topic: topic.label,
        text: `📚 **${topic.label}** (${topic.labelHi})\n\n` +
          `यह एक महत्वपूर्ण वित्तीय अवधारणा है।\n\n` +
          `अधिक जानकारी के लिए Chat tab में जाएं और पूछें: "${topic.labelHi}"`,
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.agentBadge}>
          <Ionicons name="book" size={18} color={Colors.agentLiteracy} />
          <Text style={styles.title}>Financial Literacy</Text>
        </View>
        <Text style={styles.sub}>सीखें • Learn • ಕಲಿಯಿರಿ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {answer && (
          <View style={[styles.answerCard, Shadows.card]}>
            <View style={styles.answerHeader}>
              <Ionicons name="sparkles" size={16} color={Colors.agentLiteracy} />
              <Text style={styles.answerTopic}>{answer.topic}</Text>
              <TouchableOpacity onPress={() => setAnswer(null)}>
                <Ionicons name="close" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.answerText}>{answer.text}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Topics • विषय</Text>
        <View style={styles.grid}>
          {TOPICS.map(topic => (
            <TouchableOpacity
              key={topic.id}
              style={[styles.topicCard, Shadows.card]}
              onPress={() => handleLearn(topic)}
              disabled={loading === topic.id}
              activeOpacity={0.75}
            >
              {loading === topic.id
                ? <ActivityIndicator color={Colors.agentLiteracy} />
                : <Text style={styles.topicIcon}>{topic.icon}</Text>
              }
              <Text style={styles.topicLabel}>{topic.label}</Text>
              <Text style={styles.topicHi}>{topic.labelHi}</Text>
              <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLOR[topic.level] + '20' }]}>
                <Text style={[styles.levelText, { color: LEVEL_COLOR[topic.level] }]}>
                  {topic.level}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
  answerCard: {
    backgroundColor: Colors.pillPurple, borderRadius: Radius.card,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderLeftWidth: 3, borderLeftColor: Colors.agentLiteracy,
  },
  answerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  answerTopic: { flex: 1, fontSize: Typography.sm, fontWeight: '700', color: Colors.agentLiteracy },
  answerText: { fontSize: Typography.sm, color: Colors.textPrimary, lineHeight: 22 },
  sectionTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  topicCard: {
    width: '47%', backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card,
    padding: Spacing.md, alignItems: 'flex-start', minHeight: 110,
  },
  topicIcon: { fontSize: 28, marginBottom: 6 },
  topicLabel: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary },
  topicHi: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2, marginBottom: 8 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.pill, marginTop: 'auto' },
  levelText: { fontSize: 9, fontWeight: '700' },
});