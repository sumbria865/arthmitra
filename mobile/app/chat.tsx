/**
 * ArthMitra — AI Chat Screen
 * Matches Figma Screen 2 (AI Chat panel):
 *   - ArthMitra AI header with 7 Agents badge
 *   - Message bubbles with confidence badge
 *   - Source citations
 *   - Quick reply chips
 *   - Voice + text input
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { chatApi, voiceApi } from '../lib/api';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/tokens';
import { useAppStore } from '../store/appStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  confidence?: number;
  agentUsed?: string;
  sources?: { doc: string; url: string }[];
  isLoading?: boolean;
  timestamp: number;
}

const QUICK_REPLIES = [
  { text: 'Check my savings', textHi: 'मेरी बचत चेक करें' },
  { text: 'Scan a link', textHi: 'लिंक स्कैन करें' },
  { text: 'Govt schemes', textHi: 'सरकारी योजनाएं' },
  { text: 'How much can I save per month?', textHi: 'मैं PM के लिए eligible हूँ?' },
];
export default function ChatScreen() {
  const { messages, addMessage, sessionId, setSessionId } = useAppStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const flatRef = useRef<FlatList>(null);

  const startRecording = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        addMessage({
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: 'माइक्रोफ़ोन की अनुमति चाहिए। कृपया settings में allow करें।\nMicrophone permission is needed. Please allow it in settings.',
          timestamp: Date.now(),
        });
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (e) {
      console.log('RECORDING START ERROR:', e);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) return;
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      if (!uri) return;

      const audioBlob = await (await fetch(uri)).blob();
      const { data } = await voiceApi.transcribe(audioBlob);
      if (data?.text) {
        setInput(prev => (prev ? `${prev} ${data.text}` : data.text));
      }
    } catch (e) {
      console.log('TRANSCRIBE ERROR:', e);
      addMessage({
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: 'आवाज़ समझ नहीं आई। कृपया टाइप करें।\nCouldn\'t understand the audio. Please try typing instead.',
        timestamp: Date.now(),
      });
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const handleMicPress = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const sendMessage = useCallback(async (text: string) => {

    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    };

    addMessage(userMsg);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await chatApi.sendMessage(text.trim(), sessionId ?? undefined);

      if (!sessionId && data.session_id) setSessionId(data.session_id);

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.response,
        confidence: data.confidence,
        agentUsed: data.agent_used,
        sources: data.sources,
        timestamp: Date.now(),
      };
      addMessage(botMsg);
    } catch (e: any) {
      addMessage({
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: 'माफ़ करें, कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।\nSorry, something went wrong. Please try again.',
        timestamp: Date.now(),
      });
    } finally {
      setIsTyping(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, sessionId]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Ionicons name="sparkles" size={14} color={Colors.surfaceWhite} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.text}</Text>

          {/* Confidence badge */}
          {!isUser && item.confidence != null && (
            <View style={styles.confidenceRow}>
              <View style={[styles.confDot, {
                backgroundColor: item.confidence > 80 ? Colors.success : item.confidence > 60 ? Colors.warning : Colors.danger
              }]} />
              <Text style={styles.confText}>{Math.round(item.confidence)}% confident</Text>
            </View>
          )}

          {/* Sources */}
          {!isUser && item.sources && item.sources.length > 0 && (
            <View style={styles.sourcesRow}>
              <Ionicons name="document-text-outline" size={10} color={Colors.textMuted} />
              <Text style={styles.sourceText}>Source: {item.sources[0].doc}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Agent header */}
      <View style={styles.agentHeader}>
        <View style={styles.agentAvatar}>
          <Ionicons name="sparkles" size={20} color={Colors.surfaceWhite} />
        </View>
        <View>
          <Text style={styles.agentName}>ArthMitra AI</Text>
          <Text style={styles.agentStatus}>🟢 Online • Multilingual • 7 Agents</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatRef}
          data={messages as Message[]}
          keyExtractor={m => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            messages.length === 0 ? (
              <View style={styles.welcomeBox}>
                <Text style={styles.welcomeText}>Namaste! मैं ArthMitra हूँ, आपकी AI financial co-pilot। आज मैं आपकी कैसे मदद कर सकती हूँ?</Text>
                <Text style={[styles.welcomeText, { color: Colors.textMuted, marginTop: 4, fontSize: Typography.xs }]}>• 99% confident</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            isTyping ? (
              <View style={styles.msgRow}>
                <View style={styles.avatar}>
                  <Ionicons name="sparkles" size={14} color={Colors.surfaceWhite} />
                </View>
                <View style={[styles.bubble, styles.bubbleBot]}>
                  <ActivityIndicator size="small" color={Colors.textMuted} />
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick replies */}
        {messages.length === 0 && (
          <View>
            <Text style={styles.qrTitle}>Try asking:</Text>
            <FlatList
              horizontal
              data={QUICK_REPLIES}
              keyExtractor={q => q.text}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.qrChip} onPress={() => sendMessage(item.text)}>
                  <Text style={styles.qrText}>{item.text}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: Spacing.xs }}
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: Spacing.sm }}
            />
          </View>
        )}

        {/* Input row */}
       {/* Input row */}
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={[styles.voiceBtn, isRecording && styles.voiceBtnActive]}
            onPress={handleMicPress}
            disabled={isTranscribing}
          >
            {isTranscribing ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name={isRecording ? 'stop' : 'mic'} size={20} color={isRecording ? Colors.surfaceWhite : Colors.primary} />
            )}
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder={isRecording ? 'Listening...' : 'Type or speak your question...'}
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={18} color={input.trim() ? Colors.surfaceWhite : Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  agentHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, backgroundColor: Colors.surfaceWhite,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  agentAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  agentName: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },
  agentStatus: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  listContent: { padding: Spacing.base, paddingBottom: Spacing.lg },
  welcomeBox: {
    backgroundColor: Colors.pillBlue, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  welcomeText: { fontSize: Typography.sm, color: Colors.primary, lineHeight: 20 },
  msgRow: { flexDirection: 'row', marginBottom: Spacing.sm, gap: 8 },
  msgRowUser: { justifyContent: 'flex-end' },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  bubble: {
    maxWidth: '78%', borderRadius: Radius.md, padding: Spacing.sm,
  },
  bubbleBot: { backgroundColor: Colors.surfaceWhite, ...Shadows.card, borderTopLeftRadius: 4 },
  bubbleUser: { backgroundColor: Colors.primary, borderTopRightRadius: 4 },
  bubbleText: { fontSize: Typography.sm, color: Colors.textPrimary, lineHeight: 20 },
  bubbleTextUser: { color: Colors.surfaceWhite },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  confDot: { width: 6, height: 6, borderRadius: 3 },
  confText: { fontSize: 9, color: Colors.textMuted },
  sourcesRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  sourceText: { fontSize: 9, color: Colors.textMuted },
  qrTitle: { fontSize: Typography.xs, color: Colors.textMuted, paddingHorizontal: Spacing.base, marginBottom: 6 },
  qrChip: {
    backgroundColor: Colors.surfaceWhite, borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  qrText: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.medium },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.xs,
    padding: Spacing.sm, backgroundColor: Colors.surfaceWhite,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
 voiceBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.pillBlue, alignItems: 'center', justifyContent: 'center',
  },
  voiceBtnActive: {
    backgroundColor: Colors.danger,
  },
  textInput: {
    flex: 1, backgroundColor: Colors.surfaceGray, borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm, paddingVertical: 8,
    fontSize: Typography.sm, color: Colors.textPrimary, maxHeight: 120,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.surfaceGray },
});