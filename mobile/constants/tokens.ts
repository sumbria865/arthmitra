/**
 * ArthMitra — Design Tokens
 * Extracted from Figma: https://www.figma.com/design/kyFua4J4TF4vtmVwL8z2R9/Fintech-Mobile-App-Design
 * + ArthMitra brand layer from executive summary screens
 */

export const Colors = {
  // Primary brand
  primary: '#0F4C81',       // Deep navy blue — main brand
  primaryDark: '#0D1B2A',   // Near-black navy — headers
  primaryLight: '#1565C0',  // Agent accent

  // Accent
  success: '#2BB673',       // Green — safe/verified
  warning: '#FF9800',       // Orange — coach / warning
  danger: '#E53935',        // Red — fraud/danger
  dangerLight: '#FFEBEE',   // Light red — fraud background

  // Scheme colours
  schemeGreen: '#E8F5E9',
  schemeBlueBg: '#E3F2FD',

  // Neutrals
  background: '#F8FAFC',
  surfaceWhite: '#FFFFFF',
  surfaceGray: '#EEF2F7',
  border: '#EEF2F7',

  // Text
  textPrimary: '#0D1B2A',
  textSecondary: '#6B7A8D',
  textMuted: '#B0BEC5',

  // Pill backgrounds
  pillBlue: '#E3F2FD',
  pillGreen: '#E8F5E9',
  pillOrange: '#FFF3E0',
  pillRed: '#FFEBEE',
  pillPurple: '#F3E5F5',

  // Agent-specific
  agentContext: '#0F4C81',
  agentLiteracy: '#7C4DFF',
  agentCoach: '#FF9800',
  agentScam: '#E53935',
  agentBenefits: '#2BB673',
  agentAccessibility: '#546E7A',
  agentOrchestrator: '#1565C0',

  // Mode specific
  farmerGreen: '#2BB673',
  shaktiPink: '#E91E63',
};

export const Typography = {
  fontDisplay: 'Poppins',   // headings, brand name
  fontBody: 'Inter',        // body text, UI labels
  fontMono: 'JetBrainsMono',// code, IDs, scan results

  // Scale
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 36,

  // Weights (React Native)
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  section: 40,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 50,
  card: 16,
  button: 12,
};

import { Platform } from 'react-native';

const webCardBox = '0px 2px 8px rgba(13,27,42,0.08)';
const webModalBox = '0px -4px 16px rgba(13,27,42,0.15)';

export const Shadows = {
  card: Platform.OS === 'web'
    ? { boxShadow: webCardBox }
    : {
        shadowColor: '#0D1B2A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      },
  modal: Platform.OS === 'web'
    ? { boxShadow: webModalBox }
    : {
        shadowColor: '#0D1B2A',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
      },
};

// Bottom tab configuration — from App.tsx
export const BottomTabs = [
  { id: 'home', label: 'Home', labelHi: 'होम' },
  { id: 'chat', label: 'AI Chat', labelHi: 'AI चैट' },
  { id: 'scam', label: 'Guard', labelHi: 'गार्ड', badge: true },
  { id: 'benefits', label: 'Benefits', labelHi: 'लाभ' },
  { id: 'more', label: 'More', labelHi: 'और' },
];

// Language options — from Figma Screen 1
export const Languages = [
  { code: 'hi', name: 'हिंदी', label: 'Hindi', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', label: 'Marathi', flag: '🟠' },
  { code: 'kn', name: 'ಕನ್ನಡ', label: 'Kannada', flag: '🟡' },
  { code: 'ta', name: 'தமிழ்', label: 'Tamil', flag: '🟤' },
  { code: 'te', name: 'తెలుగు', label: 'Telugu', flag: '🔵' },
  { code: 'bn', name: 'বাংলা', label: 'Bengali', flag: '🟢' },
  { code: 'en', name: 'English', label: 'English', flag: '🇬🇧' },
];

// Onboarding options — from Figma Screen 1 (3 questions)
export const OnboardingQ1Options = [
  { id: 'salary', label: 'Salary', labelHi: 'वेतन', icon: '💼' },
  { id: 'daily_wage', label: 'Daily Wage', labelHi: 'दिहाड़ी मजदूरी', icon: '🔨' },
  { id: 'farmer', label: 'Farmer', labelHi: 'किसान', icon: '🌾' },
  { id: 'business', label: 'Business', labelHi: 'व्यापार', icon: '🏪' },
  { id: 'freelancer', label: 'Freelancer', labelHi: 'फ्रीलांसर', icon: '💻' },
  { id: 'gig_worker', label: 'Emergency Fund', labelHi: 'इमरजेंसी फंड', icon: '🆘' },
];

export const OnboardingQ2Options = [
  { id: 'debt', label: 'Debt', labelHi: 'कर्ज', icon: '📉' },
  { id: 'savings', label: 'Savings', labelHi: 'बचत', icon: '🏦' },
  { id: 'child_edu', label: 'Child Education', labelHi: 'बच्चों की शिक्षा', icon: '📚' },
  { id: 'retirement', label: 'Retirement', labelHi: 'रिटायरमेंट', icon: '👴' },
  { id: 'fraud', label: 'Fraud Protection', labelHi: 'धोखाधड़ी से बचाव', icon: '🛡️' },
];

export const OnboardingQ3Options = [
  { id: 'voice', label: 'Voice Only', labelHi: 'सिर्फ आवाज़', icon: '🎙️' },
  { id: 'text', label: 'Text', labelHi: 'पाठ', icon: '💬' },
  { id: 'both', label: 'Both', labelHi: 'दोनों', icon: '✅' },
];