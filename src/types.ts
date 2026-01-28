// ============================================
// MEHAK - Mental Health Companion
// TypeScript Type Definitions
// ============================================

/**
 * Represents a single entry in the conversation transcript
 */
export interface TranscriptEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isFinal: boolean; // Whether transcription is complete
}

/**
 * Current state of the voice call
 */
export type CallState =
  | 'idle'        // Not connected
  | 'connecting'  // Establishing WebRTC connection
  | 'connected'   // Active call
  | 'speaking'    // User is speaking
  | 'listening'   // AI is responding
  | 'error'       // Connection error
  | 'ended';      // Call ended

/**
 * Crisis alert severity levels
 */
export type CrisisLevel = 'none' | 'warning' | 'critical';

/**
 * Crisis detection result
 */
export interface CrisisAlert {
  level: CrisisLevel;
  triggeredAt: Date | null;
  triggerPhrase: string | null;
  isAcknowledged: boolean;
}

/**
 * Emergency action types
 */
export type EmergencyAction =
  | 'contact_rescue'
  | 'assign_support'
  | 'show_resources';

/**
 * Configuration for the Realtime session
 */
export interface SessionConfig {
  model: string;
  voice: VoiceType;
  instructions: string;
  inputAudioTranscription: {
    model: string;
  };
  turnDetection: {
    type: string;
    threshold: number;
    prefix_padding_ms: number;
    silence_duration_ms: number;
  };
}

/**
 * Available voice types from OpenAI
 */
export type VoiceType = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse';

/**
 * WebRTC connection state
 */
export interface RTCConnectionState {
  status: 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';
  iceConnectionState: RTCIceConnectionState;
  signalingState: RTCSignalingState;
}

/**
 * Audio level data for visualizations
 */
export interface AudioLevelData {
  level: number;      // 0-1 normalized
  timestamp: number;  // Performance.now() timestamp
  isActive: boolean;  // Whether audio is being transmitted
}

/**
 * Server events from OpenAI Realtime API
 */
export type RealtimeServerEvent =
  | { type: 'session.created'; session: object }
  | { type: 'session.updated'; session: object }
  | { type: 'input_audio_buffer.speech_started' }
  | { type: 'input_audio_buffer.speech_stopped' }
  | { type: 'conversation.item.created'; item: ConversationItem }
  | { type: 'response.audio_transcript.delta'; delta: string }
  | { type: 'response.audio_transcript.done'; transcript: string }
  | { type: 'response.done'; response: object }
  | { type: 'response.function_call_arguments.done'; name: string; arguments: string; call_id: string }
  | { type: 'error'; error: { message: string; code: string } };

/**
 * Conversation item from the API
 */
export interface ConversationItem {
  id: string;
  type: 'message' | 'function_call' | 'function_call_output';
  role: 'user' | 'assistant' | 'system';
  content?: Array<{
    type: 'input_text' | 'input_audio' | 'text' | 'audio';
    text?: string;
    transcript?: string;
  }>;
}

/**
 * Props for the ClientPanel component
 */
export interface ClientPanelProps {
  callState: CallState;
  transcript: TranscriptEntry[];
  crisisAlert: CrisisAlert;
  audioLevel: number;
  callDuration: number;
  onStartCall: () => void;
  onEndCall: () => void;
  onEmergencyAction: (action: EmergencyAction) => void;
  onDismissAlert: () => void;
}

/**
 * Props for the MehakPanel component
 */
export interface MehakPanelProps {
  callState: CallState;
  audioLevel: number;
  currentResponse: string;
  isSpeaking: boolean;
}

/**
 * Ephemeral token response from the server
 */
export interface EphemeralTokenResponse {
  client_secret: {
    value: string;
    expires_at: number;
  };
}
