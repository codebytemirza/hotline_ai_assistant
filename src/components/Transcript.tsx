// ============================================
// Transcript Component
// Displays conversation history with user/AI messages
// ============================================

import { useEffect, useRef } from 'react';
import type { TranscriptEntry } from '../types';
import './Transcript.css';

interface TranscriptProps {
    entries: TranscriptEntry[];
    isActive: boolean;
}

/**
 * Formats timestamp to readable time
 */
function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

export default function Transcript({ entries, isActive }: TranscriptProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new entries arrive
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [entries]);

    if (!isActive && entries.length === 0) {
        return (
            <div className="transcript transcript-empty">
                <div className="empty-state">
                    <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <p className="empty-text">Your conversation will appear here</p>
                    <p className="empty-subtext">Start a call to begin talking with Mehak</p>
                </div>
            </div>
        );
    }

    return (
        <div className="transcript" ref={containerRef}>
            <div className="transcript-inner">
                {entries.map((entry) => (
                    <div
                        key={entry.id}
                        className={`transcript-entry ${entry.role} ${!entry.isFinal ? 'pending' : ''}`}
                    >
                        <div className="entry-header">
                            <span className="entry-role">
                                {entry.role === 'user' ? 'You' : 'Mehak'}
                            </span>
                            <span className="entry-time">{formatTime(entry.timestamp)}</span>
                        </div>
                        <div className="entry-content">
                            {entry.content}
                            {!entry.isFinal && <span className="typing-indicator">...</span>}
                        </div>
                    </div>
                ))}

                {isActive && entries.length > 0 && (
                    <div className="listening-indicator">
                        <span className="pulse-dot" />
                        <span>Listening...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
