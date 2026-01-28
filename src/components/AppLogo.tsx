// ============================================
// AppLogo Component
// Custom SVG logo for Hotline Suicide Help Assistant
// ============================================

interface AppLogoProps {
    className?: string;
    size?: number;
}

export default function AppLogo({ className, size = 32 }: AppLogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Outer balanced circle - Symbol of stability */}
            <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2.5" />

            {/* Stylized "H" combined with a lifeline - Symbol of hope and medical help */}
            <path
                d="M12 12V28M28 12V28M12 20H28M18 20L20 16L22 24L24 20"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Small dot - symbol of the individual */}
            <circle cx="20" cy="12" r="2" fill="currentColor" />
        </svg>
    );
}
