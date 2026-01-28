// ============================================
// UserInfoForm Component
// Collects user information before starting call
// ============================================

import { useState, useCallback } from 'react';
import './UserInfoForm.css';

export interface UserInfo {
    phoneNumber: string;
    location: {
        latitude: number;
        longitude: number;
        address?: string;
    } | null;
    contactName?: string;
    contactPhone?: string;
}

interface UserInfoFormProps {
    onSubmit: (info: UserInfo) => void;
    isLoading?: boolean;
}

export default function UserInfoForm({ onSubmit, isLoading = false }: UserInfoFormProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [location, setLocation] = useState<UserInfo['location']>(null);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [locationError, setLocationError] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState<string | null>(null);

    /**
     * Request user's location
     */
    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            setLocationStatus('error');
            return;
        }

        setLocationStatus('loading');
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const loc = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    address: undefined as string | undefined
                };

                // Try to get address via reverse geocoding (optional)
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${loc.latitude}&lon=${loc.longitude}&format=json`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        loc.address = data.display_name;
                    }
                } catch {
                    // Address is optional, continue without it
                }

                setLocation(loc);
                setLocationStatus('success');
            },
            (error) => {
                let message = 'Unable to retrieve location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location permission denied. Please allow access.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out';
                        break;
                }
                setLocationError(message);
                setLocationStatus('error');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, []);

    /**
     * Validate and submit form
     */
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        // Validate phone number
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            setPhoneError('Please enter a valid phone number');
            return;
        }
        setPhoneError(null);

        // Location is required
        if (!location) {
            setLocationError('Location is required for emergency services');
            return;
        }

        onSubmit({
            phoneNumber: cleanPhone,
            location,
            contactName: contactName.trim() || undefined,
            contactPhone: contactPhone.replace(/\D/g, '') || undefined
        });
    }, [phoneNumber, location, contactName, contactPhone, onSubmit]);

    const canSubmit = phoneNumber.length >= 10 && location && !isLoading;

    return (
        <form className="user-info-form" onSubmit={handleSubmit}>
            <div className="form-header">
                <h3>Before We Begin</h3>
                <p>Please provide your information for safety purposes</p>
            </div>

            {/* Phone Number - Required */}
            <div className="form-group">
                <label className="form-label" htmlFor="phone">
                    Phone Number <span className="required">*</span>
                </label>
                <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className={phoneError ? 'error' : ''}
                    required
                />
                {phoneError && <span className="form-error">{phoneError}</span>}
                <span className="form-helper">Required for emergency contact</span>
            </div>

            {/* Location - Required */}
            <div className="form-group">
                <label className="form-label">
                    Location <span className="required">*</span>
                </label>

                {location ? (
                    <div className="location-success">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <div className="location-details">
                            <span className="location-label">Location acquired</span>
                            {location.address && (
                                <span className="location-address">{location.address}</span>
                            )}
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        className={`location-btn ${locationStatus}`}
                        onClick={requestLocation}
                        disabled={locationStatus === 'loading'}
                    >
                        {locationStatus === 'loading' ? (
                            <>
                                <span className="spinner-small" />
                                Acquiring location...
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                Allow Location Access
                            </>
                        )}
                    </button>
                )}

                {locationError && <span className="form-error">{locationError}</span>}
                <span className="form-helper">Required for emergency services to locate you</span>
            </div>

            <div className="form-divider">
                <span>Emergency Contact (Optional)</span>
            </div>

            {/* Emergency Contact - Optional */}
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label" htmlFor="contact-name">
                        Contact Name
                    </label>
                    <input
                        id="contact-name"
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Family member or friend"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="contact-phone">
                        Contact Phone
                    </label>
                    <input
                        id="contact-phone"
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="03XX-XXXXXXX"
                    />
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                className="btn btn-primary btn-lg submit-btn"
                disabled={!canSubmit}
            >
                {isLoading ? (
                    <>
                        <span className="spinner-small" />
                        Connecting...
                    </>
                ) : (
                    <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Begin Session
                    </>
                )}
            </button>

            <p className="form-disclaimer">
                Your information is kept confidential and used only for emergency purposes.
            </p>
        </form>
    );
}
