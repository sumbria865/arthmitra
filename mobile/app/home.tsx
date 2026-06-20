/**
 * ArthMitra — Home Dashboard Screen
 * Matches Figma Screen 3 (Rajesh dashboard):
 *   - Good morning greeting + name
 *   - Total savings card
 *   - Health score + Literacy score
 *   - Scams blocked + Schemes eligible
 *   - Emergency fund progress
 *   - Quick actions row
 *   - Recent alerts
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/tokens';
import { useAppStore } from '../store/appStore';

const { width } = Dimensions.get('window');

export default function HomeDashboard() {
  const router = useRouter();
  const user = useAppStore(s => s.user);
  const name = user?.name ?? 'Rajesh';
  const [menuOpen, setMenuOpen] = useState(false);

  const navMenu = [
    { id: 'home', icon: 'home-outline', label: 'Home', route: '/(tabs)/home' },
    { id: 'chat', icon: 'chatbubble-ellipses-outline', label: 'Ask AI', route: '/(tabs)/chat' },
    { id: 'scam', icon: 'shield-outline', label: 'Scam', route: '/(tabs)/scam' },
    { id: 'benefits', icon: 'gift-outline', label: 'Benefits', route: '/(tabs)/benefits' },
    { id: 'profile', icon: 'person-circle-outline', label: 'Profile', route: '/(tabs)/profile' },
  ];

  const quickActions = [
    { id: 'scam', icon: 'shield-checkmark', label: 'Scan Link', labelHi: 'लिंक स्कैन', color: Colors.danger, bg: Colors.pillRed, route: '/main/scam' },
    { id: 'chat', icon: 'chatbubble-ellipses', label: 'Ask AI', labelHi: 'AI से पूछें', color: Colors.primary, bg: Colors.pillBlue, route: '/main/chat' },
    { id: 'benefits', icon: 'gift', label: 'Benefits', labelHi: 'लाभ', color: Colors.success, bg: Colors.pillGreen, route: '/main/benefits' },
    { id: 'budget', icon: 'wallet', label: 'Budget', labelHi: 'बजट', color: Colors.warning, bg: Colors.pillOrange, route: '/main/coach' },
    { id: 'voice', icon: 'mic', label: 'Voice', labelHi: 'आवाज़', color: Colors.agentLiteracy, bg: Colors.pillPurple, route: '/main/voice' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surfaceWhite} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Good Morning ☀️</Text>
          <Text style={styles.nameText}>Namaste, {name} 👋</Text>
          <Text style={styles.subText}>यहाँ आपकी वित्तीय जानकारी है</Text>
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setMenuOpen(!menuOpen)}>
            <Ionicons name="menu" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      {menuOpen && (
        <View style={styles.menuOverlay}>
          {navMenu.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                router.push(item.route as any);
                setMenuOpen(false);
              }}
            >
              <Ionicons name={item.icon as any} size={18} color={Colors.textPrimary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Total savings hero card */}
        <View style={[styles.heroCard, Shadows.card]}>
          <Text style={styles.heroLabel}>Total Savings • कुल बचत</Text>
          <Text style={styles.heroAmount}>₹48,230</Text>
          <View style={styles.heroSubRow}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>+₹3,240 this month</Text>
            </View>
          </View>
        </View>

        {/* Score row */}
        <View style={styles.scoreRow}>
          <TouchableOpacity style={[styles.scoreCard, Shadows.card]} onPress={() => router.push('/main/scam')}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreLabel}>Health Score</Text>
              <Ionicons name="heart" size={14} color={Colors.danger} />
            </View>
            <Text style={styles.scoreValue}>72<Text style={styles.scoreMax}>/100</Text></Text>
            <Text style={styles.scoreTag}>Good • अच्छा</Text>
            <Text style={styles.scoreTap}>Tap to check health actions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.scoreCard, Shadows.card]} onPress={() => router.push('/main/benefits')}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreLabel}>Literacy Score</Text>
              <Ionicons name="book" size={14} color={Colors.agentLiteracy} />
            </View>
            <Text style={styles.scoreValue}>65<Text style={styles.scoreMax}>/100</Text></Text>
            <Text style={styles.scoreTag}>Growing • बढ़ रहा</Text>
            <Text style={styles.scoreTap}>Tap to explore schemes</Text>
          </TouchableOpacity>
        </View>

        {/* Scam blocked + Schemes row */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: Colors.pillRed }]} onPress={() => router.push('/main/scam')}>
            <Ionicons name="shield" size={20} color={Colors.danger} />
            <Text style={[styles.statCount, { color: Colors.danger }]}>7</Text>
            <Text style={styles.statLabel}>Scams Blocked</Text>
            <Text style={styles.statSaved}>Saved ₹32,000</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: Colors.pillGreen }]} onPress={() => router.push('/main/benefits')}>
            <Ionicons name="gift" size={20} color={Colors.success} />
            <Text style={[styles.statCount, { color: Colors.success }]}>5</Text>
            <Text style={styles.statLabel}>Schemes Eligible</Text>
            <TouchableOpacity><Text style={[styles.statSaved, { color: Colors.success }]}>Apply Now →</Text></TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Emergency fund progress */}
        <View style={[styles.progressCard, Shadows.card]}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Emergency Fund • इमरजेंसी फंड</Text>
            <Text style={styles.progressPct}>58%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '58%' }]} />
          </View>
          <View style={styles.progressFooter}>
            <Text style={styles.progressSaved}>₹26,400 saved</Text>
            <Text style={styles.progressGoal}>Goal ₹50,000</Text>
          </View>
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.qaScroll}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={[styles.qaBtn, { backgroundColor: action.bg }]}
              onPress={() => router.push(action.route as any)}
            >
              <Ionicons name={action.icon as any} size={22} color={action.color} />
              <Text style={[styles.qaLabel, { color: action.color }]}>{action.id === 'scam' ? 'Scan Link' : action.label}</Text>
              <Text style={styles.qaLabelHi}>{action.labelHi}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent alerts */}
        <View style={styles.alertsHeader}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.alertCard, Shadows.card]} onPress={() => router.push('/main/scam')}>
          <View style={styles.alertIcon}>
            <Ionicons name="warning" size={18} color={Colors.danger} />
          </View>
          <View style={styles.alertBody}>
            <Text style={styles.alertTitle}>Suspicious UPI request detected</Text>
            <Text style={styles.alertTime}>2 min ago</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Quick navigation</Text>
          <View style={styles.footerNavRow}>
            {navMenu.slice(0, 4).map(item => (
              <TouchableOpacity key={item.id} style={styles.footerNavItem} onPress={() => router.push(item.route as any)}>
                <Ionicons name={item.icon as any} size={18} color={Colors.primary} />
                <Text style={styles.footerNavLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceWhite, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  greeting: { fontSize: Typography.sm, color: Colors.textSecondary, fontFamily: Typography.fontBody },
  nameText: { fontSize: Typography.xl, fontFamily: Typography.fontDisplay, color: Colors.textPrimary, fontWeight: Typography.bold, marginTop: 2 },
  subText: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  notifBtn: { padding: Spacing.sm, position: 'relative' },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  scroll: { padding: Spacing.base },
  heroCard: {
    backgroundColor: Colors.primary, borderRadius: Radius.xl,
    padding: Spacing.lg, marginBottom: Spacing.md,
  },
  heroLabel: { color: 'rgba(255,255,255,0.75)', fontSize: Typography.sm, fontFamily: Typography.fontBody },
  heroAmount: { color: '#FFFFFF', fontSize: Typography.hero, fontFamily: Typography.fontDisplay, fontWeight: Typography.bold, marginTop: 4 },
  heroSubRow: { marginTop: Spacing.sm, flexDirection: 'row' },
  heroPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  heroPillText: { color: '#FFFFFF', fontSize: Typography.xs, fontWeight: Typography.medium },
  scoreRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  scoreCard: {
    flex: 1, backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.card, padding: Spacing.md,
  },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  scoreLabel: { fontSize: Typography.xs, color: Colors.textSecondary, fontFamily: Typography.fontBody },
  scoreValue: { fontSize: Typography.xxl, fontFamily: Typography.fontDisplay, color: Colors.textPrimary, fontWeight: Typography.bold },
  scoreMax: { fontSize: Typography.sm, color: Colors.textMuted, fontWeight: Typography.regular },
  scoreTag: { fontSize: Typography.xs, color: Colors.success, fontWeight: Typography.medium, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: {
    flex: 1, borderRadius: Radius.card,
    padding: Spacing.md, alignItems: 'flex-start',
  },
  statCount: { fontSize: Typography.xxl, fontFamily: Typography.fontDisplay, fontWeight: Typography.bold, marginTop: 6 },
  statLabel: { fontSize: Typography.xs, color: Colors.textPrimary, fontWeight: Typography.medium, marginTop: 2 },
  statSaved: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 4 },
  progressCard: {
    backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  progressTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  progressPct: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.warning },
  progressBarBg: { height: 8, backgroundColor: Colors.surfaceGray, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: 8, backgroundColor: Colors.warning, borderRadius: 4 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  progressSaved: { fontSize: Typography.xs, color: Colors.textSecondary },
  progressGoal: { fontSize: Typography.xs, color: Colors.textSecondary },
  scoreTap: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 8 },
  sectionTitle: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.textPrimary, fontFamily: Typography.fontDisplay, marginBottom: Spacing.sm },
  qaScroll: { marginBottom: Spacing.md },
  qaBtn: {
    alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.md, marginRight: Spacing.sm, minWidth: 72,
  },
  qaLabel: { fontSize: Typography.xs, fontWeight: Typography.semibold, marginTop: 4, textAlign: 'center' },
  qaLabelHi: { fontSize: 9, color: Colors.textMuted, textAlign: 'center', marginTop: 1 },
  footerCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.card,
    padding: Spacing.md,
    marginTop: Spacing.md,
    ...Shadows.card,
  },
  footerTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  footerNavRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  footerNavItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: Radius.sm, backgroundColor: Colors.surfaceGray },
  footerNavLabel: { fontSize: Typography.xs, color: Colors.textPrimary, marginTop: 4 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconButton: { padding: Spacing.sm, borderRadius: Radius.sm, backgroundColor: Colors.surfaceGray },
  menuOverlay: {
    position: 'absolute', top: 76, right: 16,
    backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card,
    padding: Spacing.sm, width: 200, zIndex: 10,
    ...Shadows.card,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: Spacing.sm,
  },
  menuLabel: { fontSize: Typography.sm, color: Colors.textPrimary },
  alertsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  seeAll: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.medium },
  alertCard: {
    backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card,
    padding: Spacing.md, flexDirection: 'row', alignItems: 'center',
  },
  alertIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.pillRed,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm,
  },
  alertBody: { flex: 1 },
  alertTitle: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.medium },
  alertTime: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
});