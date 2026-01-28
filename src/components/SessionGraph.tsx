// ============================================
// SessionGraph Component
// Visual flow chart showing session progress
// ============================================

import './SessionGraph.css';

export type SessionStage =
    | 'intake'
    | 'counseling'
    | 'crisis_detected'
    | 'rescue_notified'
    | 'completed';

interface SessionGraphProps {
    currentStage: SessionStage;
    crisisDetected: boolean;
    rescueNotified: boolean;
    userInfo?: {
        phoneNumber: string;
        location: { latitude: number; longitude: number } | null;
    };
}

interface StageInfo {
    id: SessionStage;
    label: string;
    description: string;
    icon: string;
}

const stages: StageInfo[] = [
    {
        id: 'intake',
        label: 'Information',
        description: 'Collecting user details',
        icon: '📋'
    },
    {
        id: 'counseling',
        label: 'Counseling',
        description: 'Active session in progress',
        icon: '💬'
    },
    {
        id: 'crisis_detected',
        label: 'Crisis Detected',
        description: 'Monitoring safety signals',
        icon: '⚠️'
    },
    {
        id: 'rescue_notified',
        label: 'Rescue Notified',
        description: 'Emergency team alerted',
        icon: '🚨'
    }
];

function getStageStatus(
    stage: SessionStage,
    currentStage: SessionStage,
    crisisDetected: boolean,
    rescueNotified: boolean
): 'completed' | 'active' | 'pending' | 'alert' {
    const stageOrder = ['intake', 'counseling', 'crisis_detected', 'rescue_notified'];
    const currentIndex = stageOrder.indexOf(currentStage);
    const stageIndex = stageOrder.indexOf(stage);

    if (stage === 'crisis_detected' && crisisDetected) {
        return rescueNotified ? 'completed' : 'alert';
    }

    if (stage === 'rescue_notified' && rescueNotified) {
        return 'alert';
    }

    if (stageIndex < currentIndex) {
        return 'completed';
    } else if (stageIndex === currentIndex) {
        return 'active';
    }
    return 'pending';
}

export default function SessionGraph({
    currentStage,
    crisisDetected,
    rescueNotified,
    userInfo
}: SessionGraphProps) {
    return (
        <div className="session-graph">
            <div className="graph-header">
                <h4>Session Progress</h4>
            </div>

            <div className="graph-flow">
                {stages.map((stage, index) => {
                    const status = getStageStatus(stage.id, currentStage, crisisDetected, rescueNotified);
                    const showStage = stage.id !== 'crisis_detected' && stage.id !== 'rescue_notified'
                        || (stage.id === 'crisis_detected' && crisisDetected)
                        || (stage.id === 'rescue_notified' && rescueNotified);

                    if (!showStage) return null;

                    return (
                        <div key={stage.id} className={`graph-node ${status}`}>
                            {/* Connector line */}
                            {index > 0 && stages.slice(0, index).some(s =>
                                s.id !== 'crisis_detected' && s.id !== 'rescue_notified' || crisisDetected
                            ) && (
                                    <div className={`connector ${status === 'pending' ? 'pending' : 'active'}`} />
                                )}

                            {/* Node */}
                            <div className="node-circle">
                                <span className="node-icon">{stage.icon}</span>
                            </div>

                            {/* Label */}
                            <div className="node-content">
                                <span className="node-label">{stage.label}</span>
                                <span className="node-description">{stage.description}</span>
                            </div>

                            {/* Status indicator */}
                            {status === 'active' && (
                                <div className="status-badge active">In Progress</div>
                            )}
                            {status === 'alert' && (
                                <div className="status-badge alert">Active</div>
                            )}
                            {status === 'completed' && (
                                <div className="status-badge completed">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* User Info Summary */}
            {userInfo && (
                <div className="user-summary">
                    <div className="summary-item">
                        <span className="summary-label">Phone</span>
                        <span className="summary-value">{userInfo.phoneNumber}</span>
                    </div>
                    {userInfo.location && (
                        <div className="summary-item">
                            <span className="summary-label">Location</span>
                            <span className="summary-value location">
                                <span className="status-dot active" />
                                Acquired
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Rescue Alert Card */}
            {rescueNotified && (
                <div className="rescue-card animate-shake">
                    <div className="rescue-header">
                        <span className="rescue-icon">🚨</span>
                        <div className="rescue-titles">
                            <span className="rescue-title">RESCUE TASK ASSIGNED</span>
                            <span className="rescue-id">Task ID: #R-{Math.floor(Date.now() / 100000) % 10000}</span>
                        </div>
                    </div>
                    <div className="rescue-body">
                        <p className="rescue-instruction">DISPATCHING EMERGENCY SERVICES TO:</p>
                        <div className="dispatch-info">
                            <div className="dispatch-item">
                                <span className="item-label">PHONE:</span>
                                <span className="item-value">{userInfo?.phoneNumber}</span>
                            </div>
                            {userInfo?.location && (
                                <div className="dispatch-item">
                                    <span className="item-label">COORD:</span>
                                    <span className="item-value">
                                        {userInfo.location.latitude.toFixed(6)},
                                        {userInfo.location.longitude.toFixed(6)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="rescue-footer">
                            <span className="status-dot danger" />
                            <span>Connecting to Dispatcher...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
