// ============================================
// AudioVisualizer Component
// Animated waveform visualization for audio activity
// ============================================

import { useEffect, useState } from 'react';
import './AudioVisualizer.css';

interface AudioVisualizerProps {
    audioLevel: number; // 0-1
    isActive: boolean;
    variant?: 'user' | 'assistant';
}

const BAR_COUNT = 5;

export default function AudioVisualizer({
    audioLevel,
    isActive,
    variant = 'assistant'
}: AudioVisualizerProps) {
    const [bars, setBars] = useState<number[]>(Array(BAR_COUNT).fill(0.2));

    useEffect(() => {
        if (!isActive) {
            setBars(Array(BAR_COUNT).fill(0.2));
            return;
        }

        // Animate bars based on audio level with some randomness
        const interval = setInterval(() => {
            setBars(prev => prev.map((_, i) => {
                const baseHeight = audioLevel * 0.8;
                const randomVariation = Math.random() * 0.4 - 0.2;
                const phaseOffset = Math.sin(Date.now() / 200 + i * 0.5) * 0.2;
                return Math.max(0.15, Math.min(1, baseHeight + randomVariation + phaseOffset));
            }));
        }, 100);

        return () => clearInterval(interval);
    }, [audioLevel, isActive]);

    return (
        <div className={`audio-visualizer ${variant} ${isActive ? 'active' : ''}`}>
            <div className="bars-container">
                {bars.map((height, index) => (
                    <div
                        key={index}
                        className="bar"
                        style={{
                            height: `${height * 100}%`,
                            animationDelay: `${index * 0.1}s`
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
