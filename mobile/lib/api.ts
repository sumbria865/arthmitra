/**
 * ArthMitra — API Client (Axios)
 */

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Chat ──────────────────────────────────────
export const chatApi = {
  sendMessage: (message: string, sessionId?: string, isVoice = false) =>
    api.post('/chat/message', { message, session_id: sessionId, is_voice: isVoice }),

  getHistory: (sessionId: string) =>
    api.get(`/chat/history/${sessionId}`),
};

// ── Scam ──────────────────────────────────────
export const scamApi = {
  scan: (content: string, type: 'url' | 'upi' | 'message' | 'qr') =>
    api.post('/scam/scan', { content, scan_type: type, user_language: 'hi' }),

  getStats: () => api.get('/scam/stats'),
};

// ── Benefits ──────────────────────────────────
export const benefitsApi = {
  getMatches: (incomeType: string, state: string) =>
    api.get('/benefits/match', { params: { income_type: incomeType, state } }),

  apply: (schemeId: string) =>
    api.post(`/benefits/apply/${schemeId}`),
};

// ── Auth ──────────────────────────────────────
export const authApi = {
  sendOtp: (phone: string) => api.post('/auth/otp/send', { phone }),
  verifyOtp: (phone: string, otp: string) => api.post('/auth/otp/verify', { phone, otp }),
  logout: () => api.post('/auth/logout'),
};

// ── Users ──────────────────────────────────────
export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: object) => api.patch('/users/me', data),
  completeOnboarding: (data: object) => api.post('/users/onboarding', data),
  deleteAllData: () => api.delete('/users/me/data'),
};

// ── Voice ──────────────────────────────────────
export const voiceApi = {
  transcribe: (audioBlob: Blob) => {
    const fd = new FormData();
    fd.append('file', audioBlob, 'audio.wav');
    return api.post('/voice/transcribe', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  synthesize: (text: string, language = 'hi') =>
    api.post('/voice/synthesize', null, { params: { text, language } }),
};