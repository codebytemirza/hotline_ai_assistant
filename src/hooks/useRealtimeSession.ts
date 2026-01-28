// ============================================
// useRealtimeSession Hook
// Manages OpenAI Realtime API WebRTC connection
// ============================================

import { useState, useCallback, useRef, useEffect } from 'react';
import type { CallState, TranscriptEntry, SessionConfig } from '../types';
import { DEFAULT_SESSION_CONFIG, API_CONFIG, RESCUE_SERVICE_TOOL } from '../constants';

interface UseRealtimeSessionProps {
    onRescueTriggered?: (reason: string) => void;
    config?: Partial<SessionConfig>;
}

interface UseRealtimeSessionReturn {
    callState: CallState;
    transcript: TranscriptEntry[];
    currentResponse: string;
    aiAudioLevel: number;
    isSpeaking: boolean;
    callDuration: number;
    error: string | null;
    startSession: (audioStream: MediaStream) => Promise<void>;
    endSession: () => void;
}

/**
 * Generates a unique ID for transcript entries
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Hook for managing OpenAI Realtime API WebRTC sessions
 * 
 * @param config - Optional session configuration override
 * @returns Session state and controls
 */
export function useRealtimeSession({
    onRescueTriggered,
    config = {}
}: UseRealtimeSessionProps = {}): UseRealtimeSessionReturn {
    const [callState, setCallState] = useState<CallState>('idle');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [currentResponse, setCurrentResponse] = useState('');
    const [aiAudioLevel, setAiAudioLevel] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Refs for WebRTC
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const callStartTimeRef = useRef<number | null>(null);
    const durationIntervalRef = useRef<number | null>(null);

    // Merge config with defaults
    const sessionConfig: SessionConfig = {
        ...DEFAULT_SESSION_CONFIG,
        ...config
    };

    /**
     * Fetches an ephemeral token from the backend
     */
    const getEphemeralToken = async (): Promise<string> => {
        try {
            const response = await fetch(API_CONFIG.TOKEN_ENDPOINT);

            if (!response.ok) {
                throw new Error(`Failed to get session token: ${response.statusText}`);
            }

            const data = await response.json();
            return data.client_secret.value;
        } catch (err) {
            console.error('Token fetch error:', err);
            throw new Error('Failed to authenticate with voice service');
        }
    };

    /**
     * Handles incoming data channel messages
     */
    const handleDataChannelMessage = useCallback((event: MessageEvent) => {
        try {
            const message = JSON.parse(event.data);
            console.log('Realtime event:', message.type);

            switch (message.type) {
                case 'session.created':
                case 'session.updated':
                    console.log('Session ready:', message);
                    setCallState('connected');
                    break;

                case 'input_audio_buffer.speech_started':
                    setCallState('speaking');
                    break;

                case 'input_audio_buffer.speech_stopped':
                    setCallState('listening');
                    break;

                case 'conversation.item.created':
                    if (message.item?.role === 'user' && message.item?.content) {
                        const content = message.item.content[0];
                        if (content?.transcript) {
                            setTranscript(prev => [
                                ...prev,
                                {
                                    id: generateId(),
                                    role: 'user',
                                    content: content.transcript,
                                    timestamp: new Date(),
                                    isFinal: true
                                }
                            ]);
                        }
                    }
                    break;

                case 'response.audio_transcript.delta':
                    setCurrentResponse(prev => prev + (message.delta || ''));
                    setIsSpeaking(true);
                    break;

                case 'response.audio_transcript.done':
                    // Finalize the response
                    if (message.transcript) {
                        setTranscript(prev => [
                            ...prev,
                            {
                                id: generateId(),
                                role: 'assistant',
                                content: message.transcript,
                                timestamp: new Date(),
                                isFinal: true
                            }
                        ]);
                    }
                    setCurrentResponse('');
                    setIsSpeaking(false);
                    setCallState('connected');
                    break;

                case 'response.function_call_arguments.done':
                    if (message.name === 'notify_rescue_team') {
                        try {
                            const args = JSON.parse(message.arguments);
                            console.log('AI Triggered Rescue:', args);
                            if (onRescueTriggered) {
                                onRescueTriggered(args.reason);
                            }

                            // Send function output back to model
                            if (dataChannelRef.current?.readyState === 'open') {
                                dataChannelRef.current.send(JSON.stringify({
                                    type: 'conversation.item.create',
                                    item: {
                                        type: 'function_call_output',
                                        call_id: message.call_id,
                                        output: JSON.stringify({ status: 'success', message: 'Rescue team notified and dispatched.' })
                                    }
                                }));
                                dataChannelRef.current.send(JSON.stringify({ type: 'response.create' }));
                            }
                        } catch (e) {
                            console.error('Failed to parse function arguments:', e);
                        }
                    }
                    break;

                case 'error':
                    console.error('Realtime API error:', message.error);
                    setError(message.error?.message || 'Unknown error');
                    break;
            }
        } catch (err) {
            console.error('Failed to parse data channel message:', err);
        }
    }, [onRescueTriggered]);

    /**
     * Starts a new realtime session with WebRTC
     */
    const startSession = useCallback(async (audioStream: MediaStream) => {
        try {
            setError(null);
            setCallState('connecting');
            setTranscript([]);
            setCurrentResponse('');

            // Get ephemeral token
            const ephemeralToken = await getEphemeralToken();

            // Create peer connection
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            peerConnectionRef.current = pc;

            // Set up audio element for playback
            const audioEl = document.createElement('audio');
            audioEl.autoplay = true;
            audioElementRef.current = audioEl;

            // Handle incoming audio track
            pc.ontrack = (event) => {
                console.log('Received audio track');
                audioEl.srcObject = event.streams[0];

                // Monitor AI audio levels
                const audioContext = new AudioContext();
                const source = audioContext.createMediaStreamSource(event.streams[0]);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);

                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                const checkLevel = () => {
                    if (peerConnectionRef.current) {
                        analyser.getByteFrequencyData(dataArray);
                        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                        setAiAudioLevel(Math.min(avg / 128, 1));
                        requestAnimationFrame(checkLevel);
                    }
                };
                checkLevel();
            };

            // Add audio track from microphone
            audioStream.getTracks().forEach(track => {
                pc.addTrack(track, audioStream);
            });

            // Create data channel for events
            const dc = pc.createDataChannel('oai-events');
            dataChannelRef.current = dc;

            dc.onopen = () => {
                console.log('Data channel opened');
                // Send session update with our config
                dc.send(JSON.stringify({
                    type: 'session.update',
                    session: {
                        modalities: ['text', 'audio'],
                        instructions: sessionConfig.instructions,
                        voice: sessionConfig.voice,
                        input_audio_format: 'pcm16',
                        output_audio_format: 'pcm16',
                        input_audio_transcription: sessionConfig.inputAudioTranscription,
                        turn_detection: sessionConfig.turnDetection,
                        tools: [RESCUE_SERVICE_TOOL],
                        tool_choice: 'auto'
                    }
                }));
            };

            dc.onmessage = handleDataChannelMessage;

            dc.onerror = (err) => {
                console.error('Data channel error:', err);
                setError('Connection error');
            };

            // Create and set local description
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Connect to OpenAI Realtime API
            const baseUrl = 'https://api.openai.com/v1/realtime';
            const model = sessionConfig.model;

            const response = await fetch(`${baseUrl}?model=${model}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ephemeralToken}`,
                    'Content-Type': 'application/sdp'
                },
                body: offer.sdp
            });

            if (!response.ok) {
                throw new Error(`Failed to connect: ${response.statusText}`);
            }

            // Set remote description
            const answerSdp = await response.text();
            await pc.setRemoteDescription({
                type: 'answer',
                sdp: answerSdp
            });

            // Start call duration timer
            callStartTimeRef.current = Date.now();
            durationIntervalRef.current = window.setInterval(() => {
                if (callStartTimeRef.current) {
                    setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
                }
            }, 1000);

            console.log('WebRTC connection established');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
            console.error('Session start error:', err);
            setError(errorMessage);
            setCallState('error');
        }
    }, [sessionConfig, handleDataChannelMessage]);

    /**
     * Ends the current session and cleans up resources
     */
    const endSession = useCallback(() => {
        console.log('Ending session...');

        // Stop duration timer
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }
        callStartTimeRef.current = null;

        // Close data channel
        if (dataChannelRef.current) {
            dataChannelRef.current.close();
            dataChannelRef.current = null;
        }

        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Clean up audio element
        if (audioElementRef.current) {
            audioElementRef.current.srcObject = null;
            audioElementRef.current = null;
        }

        setCallState('ended');
        setIsSpeaking(false);
        setAiAudioLevel(0);
        setCurrentResponse('');
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            endSession();
        };
    }, [endSession]);

    return {
        callState,
        transcript,
        currentResponse,
        aiAudioLevel,
        isSpeaking,
        callDuration,
        error,
        startSession,
        endSession
    };
}

export default useRealtimeSession;
