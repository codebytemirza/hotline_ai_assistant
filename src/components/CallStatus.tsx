// ============================================
// CallStatus Component
// Shows connection status, call duration, and audio levels
// ============================================

import { useEffect, useState } from 'react';
import type { CallState } from '../types';
import './CallStatus.css';

interface CallStatusProps {
    callState: CallState;
    callDuration: number; // in seconds
    audioLevel: number;   // 0-1
}

/**
 * Formats seconds into MM:SS display
 */
function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Gets the appropriate status dot class based on call state
 */
function getStatusClass(state: CallState): string {
    switch (state) {
        case 'connected':
        case 'speaking':
        case 'listening':
            return 'online';
        case 'connecting':
            return 'connecting';
        case 'error':
            return 'error';
        default:
            return 'offline';
    }
}

/**
 * Gets human-readable status text
 */
function getStatusText(state: CallState): string {
    switch (state) {
        case 'idle':
            return 'Ready to connect';
        case 'connecting':
            return 'Connecting...';
        case 'connected':
            return 'Connected';
        case 'speaking':
            return 'You are speaking...';
        case 'listening':
            return 'Mehak is responding...';
        case 'error':
            return 'Connection error';
        case 'ended':
            return 'Call ended';
        default:
            return 'Unknown';
    }
}

export default function CallStatus({ callState, callDuration, audioLevel }: CallStatusProps) {
    const [displayDuration, setDisplayDuration] = useState(callDuration);

    // Update duration every second when connected
    useEffect(() => {
        if (callState === 'connected' || callState === 'speaking' || callState === 'listening') {
            const interval = setInterval(() => {
                setDisplayDuration(prev => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [callState]);

    // Reset duration when call ends or starts
    useEffect(() => {
        if (callState === 'idle' || callState === 'connecting') {
            setDisplayDuration(0);
        }
    }, [callState]);

    const isActive = ['connected', 'speaking', 'listening'].includes(callState);

    return (
        <div className="call-status">
            <div className="status-indicator">
                <span className={`status-dot ${getStatusClass(callState)}`} />
                <span className="status-text">{getStatusText(callState)}</span>
            </div>

            {isActive && (
                <>
                    <div className="call-duration">
                        <svg className="duration-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12,6 12,12 16,14" />
                        </svg>
                        <span>{formatDuration(displayDuration)}</span>
                    </div>

                    <div className="audio-meter">
                        <div
                            className="audio-level"
                            style={{
                                width: `${Math.min(audioLevel * 100, 100)}%`,
                                opacity: audioLevel > 0.1 ? 1 : 0.3
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
