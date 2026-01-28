// ============================================
// CallControls Component
// Start/Stop call buttons with visual states
// ============================================

import type { CallState } from '../types';
import { UI_TEXT } from '../constants';
import './CallControls.css';

interface CallControlsProps {
    callState: CallState;
    onStartCall: () => void;
    onEndCall: () => void;
}

export default function CallControls({ callState, onStartCall, onEndCall }: CallControlsProps) {
    const isConnecting = callState === 'connecting';
    const isActive = ['connected', 'speaking', 'listening'].includes(callState);
    const canStart = callState === 'idle' || callState === 'ended' || callState === 'error';

    return (
        <div className="call-controls">
            {canStart ? (
                <button
                    className="btn btn-primary btn-lg call-btn start-btn"
                    onClick={onStartCall}
                    disabled={isConnecting}
                >
                    <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{UI_TEXT.START_CALL}</span>
                </button>
            ) : isConnecting ? (
                <button
                    className="btn btn-secondary btn-lg call-btn connecting-btn"
                    disabled
                >
                    <span className="spinner" />
                    <span>{UI_TEXT.CONNECTING}</span>
                </button>
            ) : isActive ? (
                <button
                    className="btn btn-danger btn-lg call-btn end-btn"
                    onClick={onEndCall}
                >
                    <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.68 13.31a16 16 0 0 1-3.29-3.29l1.3-1.3a2 2 0 0 0 .45-2.11 12.84 12.84 0 0 1-.7-2.81A2 2 0 0 0 6.44 2H3.41A2 2 0 0 0 1.24 4.18a19.79 19.79 0 0 0 3.07 8.67 19.5 19.5 0 0 0 6 6 19.79 19.79 0 0 0 8.67 3.07A2 2 0 0 0 21.17 19.76v-3a2 2 0 0 0-1.72-2 12.84 12.84 0 0 1-2.81-.7 2 2 0 0 0-2.11.45l-1.3 1.3z" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                    <span>{UI_TEXT.END_CALL}</span>
                </button>
            ) : null}
        </div>
    );
}
