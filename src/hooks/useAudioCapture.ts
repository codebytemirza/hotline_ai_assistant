// ============================================
// useAudioCapture Hook
// Handles microphone access and audio level metering
// ============================================

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseAudioCaptureReturn {
    isCapturing: boolean;
    audioLevel: number;
    error: string | null;
    stream: MediaStream | null;
    startCapture: () => Promise<MediaStream | null>;
    stopCapture: () => void;
}

/**
 * Hook for capturing audio from the microphone
 * 
 * @returns Audio capture state and controls
 */
export function useAudioCapture(): UseAudioCaptureReturn {
    const [isCapturing, setIsCapturing] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    /**
     * Analyzes audio levels for visualization
     */
    const analyzeAudio = useCallback(() => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average level
        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1

        setAudioLevel(normalizedLevel);

        // Continue analyzing
        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }, []);

    /**
     * Starts microphone capture
     */
    const startCapture = useCallback(async (): Promise<MediaStream | null> => {
        try {
            setError(null);

            // Request microphone access
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 24000 // OpenAI Realtime API uses 24kHz
                }
            });

            streamRef.current = mediaStream;
            setStream(mediaStream);
            setIsCapturing(true);

            // Set up audio analysis
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
            const source = audioContextRef.current.createMediaStreamSource(mediaStream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            source.connect(analyserRef.current);

            // Start analyzing audio levels
            analyzeAudio();

            return mediaStream;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone';
            setError(errorMessage);
            console.error('Microphone access error:', err);
            return null;
        }
    }, [analyzeAudio]);

    /**
     * Stops microphone capture and cleans up
     */
    const stopCapture = useCallback(() => {
        // Stop animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        // Stop all tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        setStream(null);
        setIsCapturing(false);
        setAudioLevel(0);
        analyserRef.current = null;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCapture();
        };
    }, [stopCapture]);

    return {
        isCapturing,
        audioLevel,
        error,
        stream,
        startCapture,
        stopCapture
    };
}

export default useAudioCapture;
