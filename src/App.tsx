// ============================================
// MEHAK - Mental Health Companion
// Main Application Component
// ============================================

import { useCallback, useState, useEffect } from 'react';
import ClientPanel from './components/ClientPanel';
import MehakPanel from './components/MehakPanel';
import AppLogo from './components/AppLogo';
import type { UserInfo } from './components/UserInfoForm';
import type { SessionStage } from './components/SessionGraph';
import { useAudioCapture } from './hooks/useAudioCapture';
import { useRealtimeSession } from './hooks/useRealtimeSession';
import { useCrisisDetection } from './hooks/useCrisisDetection';
import type { EmergencyAction } from './types';
import './App.css';

function App() {
  // User information state
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [sessionStage, setSessionStage] = useState<SessionStage>('intake');
  const [rescueNotified, setRescueNotified] = useState(false);

  // Audio capture from microphone
  const {
    audioLevel: userAudioLevel,
    startCapture,
    stopCapture
  } = useAudioCapture();

  // OpenAI Realtime session management
  const {
    callState,
    transcript,
    currentResponse,
    aiAudioLevel,
    isSpeaking,
    callDuration,
    error,
    startSession,
    endSession
  } = useRealtimeSession({
    onRescueTriggered: (reason) => {
      console.log('AI triggered a rescue due to:', reason);
      handleEmergencyAction('contact_rescue');
    }
  });

  // Crisis detection based on transcript (local backup)
  const {
    crisisAlert,
    acknowledgeAlert,
    resetAlert
  } = useCrisisDetection(transcript);

  // Update session stage based on state
  useEffect(() => {
    if (crisisAlert.level === 'critical') {
      setSessionStage('crisis_detected');
    } else if (callState === 'connected' || callState === 'speaking' || callState === 'listening') {
      setSessionStage('counseling');
    } else if (userInfo) {
      setSessionStage('intake');
    }
  }, [callState, userInfo, crisisAlert.level]);

  /**
   * Handles user info form submission
   */
  const handleUserInfoSubmit = useCallback((info: UserInfo) => {
    setUserInfo(info);
    setSessionStage('intake');
    console.log('User info collected:', info);
  }, []);

  /**
   * Handles starting a new call
   */
  const handleStartCall = useCallback(async () => {
    if (!userInfo) return;

    const stream = await startCapture();
    if (stream) {
      await startSession(stream);
    }
  }, [userInfo, startCapture, startSession]);

  /**
   * Handles ending the current call
   */
  const handleEndCall = useCallback(() => {
    endSession();
    stopCapture();
    setSessionStage('completed');
  }, [endSession, stopCapture]);

  /**
   * Handles emergency action button clicks
   */
  const handleEmergencyAction = useCallback((action: EmergencyAction) => {
    switch (action) {
      case 'contact_rescue':
        console.log('EMERGENCY: Contacting rescue team...');
        console.log('User location:', userInfo?.location);
        console.log('User phone:', userInfo?.phoneNumber);
        setRescueNotified(true);
        setSessionStage('rescue_notified');
        break;

      case 'assign_support':
        console.log('Assigning immediate support...');
        break;

      case 'show_resources':
        // Handled in EmergencyAlert component
        break;
    }
  }, [userInfo]);

  /**
   * Dismisses the emergency alert
   */
  const handleDismissAlert = useCallback(() => {
    acknowledgeAlert();
  }, [acknowledgeAlert]);

  /**
   * Resets session for a new call
   */
  const handleNewSession = useCallback(() => {
    setUserInfo(null);
    setSessionStage('intake');
    setRescueNotified(false);
    resetAlert();
  }, [resetAlert]);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <AppLogo className="logo-icon" size={36} />
            <span className="logo-text">Hotline Suicide Help Assistant</span>
          </div>
          <p className="tagline">Providing Immediate Support & Hope</p>
        </div>
        {userInfo && callState === 'ended' && (
          <button className="btn btn-secondary btn-sm" onClick={handleNewSession}>
            New Session
          </button>
        )}
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button className="error-dismiss" onClick={handleEndCall}>
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content - Split Screen */}
      <main className="app-main">
        {/* Left Panel - Client/User */}
        <section className="panel panel-left">
          <ClientPanel
            callState={callState}
            transcript={transcript}
            crisisAlert={crisisAlert}
            audioLevel={userAudioLevel}
            callDuration={callDuration}
            userInfo={userInfo}
            onUserInfoSubmit={handleUserInfoSubmit}
            onStartCall={handleStartCall}
            onEndCall={handleEndCall}
            onEmergencyAction={handleEmergencyAction}
            onDismissAlert={handleDismissAlert}
          />
        </section>

        {/* Right Panel - Mehak AI */}
        <section className="panel panel-right">
          <MehakPanel
            callState={callState}
            audioLevel={aiAudioLevel}
            currentResponse={currentResponse}
            isSpeaking={isSpeaking}
            sessionStage={sessionStage}
            crisisDetected={crisisAlert.level !== 'none'}
            rescueNotified={rescueNotified}
            userInfo={userInfo ? {
              phoneNumber: userInfo.phoneNumber,
              location: userInfo.location
            } : undefined}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
