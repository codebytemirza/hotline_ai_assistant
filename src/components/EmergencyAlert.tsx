// ============================================
// EmergencyAlert Component
// Crisis detection alert with rescue notification
// ============================================

import { useState, useEffect } from 'react';
import type { CrisisAlert, EmergencyAction } from '../types';
import { EMERGENCY_RESOURCES } from '../constants';
import './EmergencyAlert.css';

interface EmergencyAlertProps {
    alert: CrisisAlert;
    onAction: (action: EmergencyAction) => void;
    onDismiss: () => void;
}

export default function EmergencyAlert({ alert, onAction, onDismiss }: EmergencyAlertProps) {
    const [rescueStatus, setRescueStatus] = useState<'pending' | 'notifying' | 'notified'>('pending');
    const [showResources, setShowResources] = useState(false);

    // Auto-notify rescue when critical
    useEffect(() => {
        if (alert.level === 'critical' && rescueStatus === 'pending') {
            setRescueStatus('notifying');
            // Simulate notification delay
            const timer = setTimeout(() => {
                setRescueStatus('notified');
                onAction('contact_rescue');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [alert.level, rescueStatus, onAction]);

    if (alert.level === 'none' || alert.isAcknowledged) {
        return null;
    }

    const isCritical = alert.level === 'critical';

    return (
        <div className={`emergency-alert ${alert.level}`}>
            {/* Header */}
            <div className="alert-header">
                <div className="alert-indicator">
                    <span className={`indicator-dot ${isCritical ? 'critical' : 'warning'}`} />
                </div>
                <div className="alert-title-group">
                    <h3 className="alert-title">
                        {isCritical ? 'Crisis Detected' : 'Safety Concern Noted'}
                    </h3>
                    <p className="alert-timestamp">
                        {alert.triggeredAt?.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
                {!isCritical && (
                    <button className="alert-dismiss" onClick={onDismiss} aria-label="Dismiss">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Rescue Status - Critical only */}
            {isCritical && (
                <div className={`rescue-notification ${rescueStatus}`}>
                    <div className="rescue-content">
                        {rescueStatus === 'notifying' && (
                            <>
                                <span className="spinner-small" />
                                <span>Notifying rescue team...</span>
                            </>
                        )}
                        {rescueStatus === 'notified' && (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <div className="rescue-details">
                                    <span className="rescue-status-text">Rescue Team Notified</span>
                                    <span className="rescue-substatus">Location and contact shared</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Message */}
            <div className="alert-message">
                <p>
                    You mentioned something that concerns us.
                    Please know that you are not alone and help is available.
                </p>
            </div>

            {/* Actions */}
            <div className="alert-actions">
                {!isCritical && (
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onAction('contact_rescue')}
                    >
                        Contact Emergency Services
                    </button>
                )}

                <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowResources(!showResources)}
                >
                    {showResources ? 'Hide Resources' : 'View Helplines'}
                </button>
            </div>

            {/* Resources */}
            {showResources && (
                <div className="resources-list">
                    {EMERGENCY_RESOURCES.map((resource, index) => (
                        <div key={index} className="resource-item">
                            <span className="resource-name">{resource.name}</span>
                            <a href={`tel:${resource.phone}`} className="resource-phone">
                                {resource.phone}
                            </a>
                            <span className="resource-desc">{resource.description}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
