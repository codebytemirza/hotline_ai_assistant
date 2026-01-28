// ============================================
// MehakPanel Component
// Right panel - AI assistant with session graph
// ============================================

import type { CallState } from '../types';
import type { SessionStage } from './SessionGraph';
import SessionGraph from './SessionGraph';
import AudioVisualizer from './AudioVisualizer';
import AppLogo from './AppLogo';
import './MehakPanel.css';

interface MehakPanelProps {
  callState: CallState;
  audioLevel: number;
  currentResponse: string;
  isSpeaking: boolean;
  sessionStage: SessionStage;
  crisisDetected: boolean;
  rescueNotified: boolean;
  userInfo?: {
    phoneNumber: string;
    location: { latitude: number; longitude: number } | null;
  };
}

export default function MehakPanel({
  callState,
  audioLevel,
  currentResponse,
  isSpeaking,
  sessionStage,
  crisisDetected,
  rescueNotified,
  userInfo
}: MehakPanelProps) {
  const isActive = ['connected', 'speaking', 'listening'].includes(callState);
  const isListening = callState === 'listening' || isSpeaking;

  return (
    <div className="mehak-panel">
      <div className="panel-content">
        {/* Mehak Identity Section */}
        <div className="mehak-identity">
          <div className={`avatar ${isListening ? 'speaking' : ''}`}>
            <div className="avatar-inner">
              <AppLogo size={32} />
            </div>
            {isListening && <div className="avatar-pulse" />}
          </div>

          <div className="identity-info">
            <h2>Hotline Suicide Help Assistant</h2>
            <p className="role">Professional Support System</p>
          </div>

          {isActive && (
            <div className="connection-status">
              <span className="status-dot active" />
              <span>Connected</span>
            </div>
          )}
        </div>

        {/* Audio Visualizer - Only when active */}
        {isActive && (
          <div className="visualizer-container">
            <AudioVisualizer
              audioLevel={audioLevel}
              isActive={isListening}
              variant="assistant"
            />
            <p className="activity-status">
              {isListening ? 'Speaking...' : 'Listening...'}
            </p>
          </div>
        )}

        {/* Current Response - Only when speaking */}
        {currentResponse && (
          <div className="response-container">
            <p className="response-text">{currentResponse}</p>
          </div>
        )}

        {/* Divider */}
        <div className="section-divider" />

        {/* Session Progress Graph */}
        <SessionGraph
          currentStage={sessionStage}
          crisisDetected={crisisDetected}
          rescueNotified={rescueNotified}
          userInfo={userInfo}
        />

        {/* Footer Note */}
        <div className="panel-note">
          <p>All sessions are confidential and monitored for safety.</p>
          <p className="credit-note">Prototype built by <strong>Sadaqat</strong> & <strong>Abdullah</strong></p>
        </div>
      </div>
    </div>
  );
}
