/**
 * ArthMitra — Zustand Global Store
 */

import { create } from 'zustand';

interface UserProfile {
  id: string;
  phone: string;
  name: string;
  language: string;
  incomeType: string;
  literacyScore: number;
  biggestWorry: string;
  state: string;
  isPwd: boolean;
  onboardingDone: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  agentUsed?: string;
  confidence?: number;
  sources?: { doc: string; url: string }[];
  timestamp: number;
  isVoice?: boolean;
}

interface ScamScan {
  id: string;
  verdict: 'safe' | 'suspicious' | 'fraud';
  riskScore: number;
  redFlags: string[];
  timestamp: number;
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  accessToken: string | null;

  // User
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;

  // Auth actions
  login: (token: string, user: UserProfile) => void;
  logout: () => void;

  // Chat
  messages: ChatMessage[];
  sessionId: string | null;
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
  setSessionId: (id: string) => void;

  // Scam history
  scamHistory: ScamScan[];
  addScamScan: (scan: ScamScan) => void;

  // UI
  selectedLanguage: string;
  setLanguage: (lang: string) => void;
  isVoiceMode: boolean;
  toggleVoiceMode: () => void;

  // Onboarding
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  onboardingAnswers: Record<string, string>;
  setOnboardingAnswer: (key: string, value: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  isAuthenticated: false,
  accessToken: null,

  // User
  user: null,
  setUser: (user) => set({ user }),

  login: (token, user) => set({
    isAuthenticated: true,
    accessToken: token,
    user,
  }),
  logout: () => set({
    isAuthenticated: false,
    accessToken: null,
    user: null,
    messages: [],
    sessionId: null,
  }),

  // Chat
  messages: [],
  sessionId: null,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  clearMessages: () => set({ messages: [], sessionId: null }),
  setSessionId: (id) => set({ sessionId: id }),

  // Scam
  scamHistory: [],
  addScamScan: (scan) => set((s) => ({ scamHistory: [scan, ...s.scamHistory] })),

  // UI
  selectedLanguage: 'hi',
  setLanguage: (lang) => set({ selectedLanguage: lang }),
  isVoiceMode: false,
  toggleVoiceMode: () => set((s) => ({ isVoiceMode: !s.isVoiceMode })),

  // Onboarding
  onboardingStep: 0,
  setOnboardingStep: (step) => set({ onboardingStep: step }),
  onboardingAnswers: {},
  setOnboardingAnswer: (key, value) => set((s) => ({
    onboardingAnswers: { ...s.onboardingAnswers, [key]: value }
  })),
}));