// ============================================
// useCrisisDetection Hook
// Monitors transcript for crisis/self-harm indicators
// ============================================

import { useState, useCallback, useEffect, useRef } from 'react';
import type { CrisisAlert, CrisisLevel, TranscriptEntry } from '../types';
import { CRISIS_KEYWORDS } from '../constants';

/**
 * Normalizes text for keyword matching
 */
function normalizeText(text: string): string {
    return text.toLowerCase().trim();
}

/**
 * Checks if text contains any crisis keywords
 */
function detectCrisisLevel(text: string): { level: CrisisLevel; phrase: string | null } {
    const normalized = normalizeText(text);

    // Check critical keywords first (most severe)
    for (const keyword of CRISIS_KEYWORDS.critical) {
        if (normalized.includes(keyword.toLowerCase())) {
            return { level: 'critical', phrase: keyword };
        }
    }

    // Check warning keywords
    for (const keyword of CRISIS_KEYWORDS.warning) {
        if (normalized.includes(keyword.toLowerCase())) {
            return { level: 'warning', phrase: keyword };
        }
    }

    return { level: 'none', phrase: null };
}

interface UseCrisisDetectionReturn {
    crisisAlert: CrisisAlert;
    checkMessage: (message: string) => void;
    acknowledgeAlert: () => void;
    resetAlert: () => void;
}

/**
 * Hook for monitoring conversation for crisis indicators
 * 
 * @param transcript - Array of transcript entries to monitor
 * @returns Crisis alert state and control functions
 */
export function useCrisisDetection(transcript: TranscriptEntry[]): UseCrisisDetectionReturn {
    const [crisisAlert, setCrisisAlert] = useState<CrisisAlert>({
        level: 'none',
        triggeredAt: null,
        triggerPhrase: null,
        isAcknowledged: false
    });

    const lastCheckedIndex = useRef(0);

    /**
     * Check a specific message for crisis indicators
     */
    const checkMessage = useCallback((message: string) => {
        const { level, phrase } = detectCrisisLevel(message);

        if (level !== 'none') {
            setCrisisAlert(prev => {
                // Only escalate, never de-escalate during a session
                if (level === 'critical' || prev.level === 'none') {
                    return {
                        level,
                        triggeredAt: new Date(),
                        triggerPhrase: phrase,
                        isAcknowledged: false
                    };
                }
                return prev;
            });
        }
    }, []);

    /**
     * Monitor transcript for new messages
     */
    useEffect(() => {
        // Check only new entries
        if (transcript.length > lastCheckedIndex.current) {
            const newEntries = transcript.slice(lastCheckedIndex.current);

            for (const entry of newEntries) {
                // Only check user messages for crisis indicators
                if (entry.role === 'user' && entry.isFinal) {
                    checkMessage(entry.content);
                }
            }

            lastCheckedIndex.current = transcript.length;
        }
    }, [transcript, checkMessage]);

    /**
     * Mark the alert as acknowledged (user saw it but didn't dismiss)
     */
    const acknowledgeAlert = useCallback(() => {
        setCrisisAlert(prev => ({
            ...prev,
            isAcknowledged: true
        }));
    }, []);

    /**
     * Reset the alert state (user dismissed it)
     */
    const resetAlert = useCallback(() => {
        setCrisisAlert({
            level: 'none',
            triggeredAt: null,
            triggerPhrase: null,
            isAcknowledged: false
        });
        lastCheckedIndex.current = 0;
    }, []);

    return {
        crisisAlert,
        checkMessage,
        acknowledgeAlert,
        resetAlert
    };
}

export default useCrisisDetection;
