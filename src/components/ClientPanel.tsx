// ============================================
// ClientPanel Component
// Left panel - User information and call controls
// ============================================

import type { CallState, TranscriptEntry, CrisisAlert, EmergencyAction } from '../types';
import type { UserInfo } from './UserInfoForm';
import UserInfoForm from './UserInfoForm';
import CallStatus from './CallStatus';
import CallControls from './CallControls';
import Transcript from './Transcript';
import EmergencyAlert from './EmergencyAlert';
import './ClientPanel.css';

interface ClientPanelProps {
  callState: CallState;
  transcript: TranscriptEntry[];
  crisisAlert: CrisisAlert;
  audioLevel: number;
  callDuration: number;
  userInfo: UserInfo | null;
  onUserInfoSubmit: (info: UserInfo) => void;
  onStartCall: () => void;
  onEndCall: () => void;
  onEmergencyAction: (action: EmergencyAction) => void;
  onDismissAlert: () => void;
}

export default function ClientPanel({
  callState,
  transcript,
  crisisAlert,
  audioLevel,
  callDuration,
  userInfo,
  onUserInfoSubmit,
  onStartCall,
  onEndCall,
  onEmergencyAction,
  onDismissAlert
}: ClientPanelProps) {
  const isActive = ['connected', 'speaking', 'listening'].includes(callState);
  const showInfoForm = !userInfo && callState === 'idle';

  return (
    <div className="client-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="header-content">
          <h2>Session</h2>
          <p className="header-subtitle">Confidential Support Line</p>
        </div>
      </div>

      <div className="panel-body">
        {/* User Info Form - Before call */}
        {showInfoForm && (
          <UserInfoForm
            onSubmit={onUserInfoSubmit}
            isLoading={callState !== 'idle'}
          />
        )}

        {/* Call Interface - After info submitted */}
        {userInfo && (
          <>
            {/* Call Status */}
            <CallStatus
              callState={callState}
              callDuration={callDuration}
              audioLevel={audioLevel}
            />

            {/* Emergency Alert */}
            <EmergencyAlert
              alert={crisisAlert}
              onAction={onEmergencyAction}
              onDismiss={onDismissAlert}
            />

            {/* Transcript */}
            <div className="transcript-section">
              <h3 className="section-label">Conversation</h3>
              <Transcript
                entries={transcript}
                isActive={isActive}
              />
            </div>

            {/* Call Controls */}
            <CallControls
              callState={callState}
              onStartCall={onStartCall}
              onEndCall={onEndCall}
            />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="panel-footer">
        <p>
          In case of immediate danger, please call emergency services: <strong>1122</strong>
        </p>
      </div>
    </div>
  );
}