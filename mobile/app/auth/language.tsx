import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Languages } from '../../constants/tokens';
import { useAppStore } from '../../store/appStore';

export default function LanguageScreen() {
  const router = useRouter();
  const { setLanguage, selectedLanguage } = useAppStore();
  const [selected, setSelected] = useState(selectedLanguage ?? 'hi');

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <Text style={s.step}>Step 1 of 3</Text>
        <Text style={s.title}>Choose Your Language</Text>
        <Text style={s.sub}>आपकी भाषा • ನಿಮ್ಮ ಭಾಷೆ • உங்கள் மொழி</Text>
      </View>

      <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        {Languages.map(lang => (
          <TouchableOpacity
            key={lang.code}
            style={[s.row, selected === lang.code && s.rowActive]}
            onPress={() => setSelected(lang.code)}
            activeOpacity={0.7}
          >
            <View>
              <Text style={s.native}>{lang.name}</Text>
              <Text style={s.label}>{lang.label}</Text>
            </View>
            <View style={[s.radio, selected === lang.code && s.radioActive]}>
              {selected === lang.code && <View style={s.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity
          style={s.btn}
          onPress={() => {
  console.log("LANGUAGE CONTINUE PRESSED");
  setLanguage(selected);
  router.push('/auth/onboarding');
}}
        >
          <Text style={s.btnText}>Continue • आगे बढ़ें →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.xl, paddingBottom: Spacing.md },
  step: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '600', marginBottom: 4 },
  title: { fontSize: Typography.xxl, fontWeight: '700', color: Colors.textPrimary },
  sub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 6 },
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surfaceWhite, borderRadius: Radius.card, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1.5, borderColor: Colors.border },
  rowActive: { borderColor: Colors.primary, backgroundColor: Colors.pillBlue },
  native: { fontSize: Typography.lg, fontWeight: '600', color: Colors.textPrimary },
  label: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  footer: { padding: Spacing.base },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.button, paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: Typography.md, fontWeight: '700' },
});