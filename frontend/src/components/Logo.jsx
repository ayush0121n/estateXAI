import { useState } from 'react';

export default function Logo({ size = 'medium', dark = false }) {
    const [isHovered, setIsHovered] = useState(false);

    const dims = {
        small: { icon: 28, text: 18 },
        medium: { icon: 36, text: 24 },
        large: { icon: 48, text: 32 }
    }[size];

    return (
        <div 
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: size === 'small' ? 8 : 12,
                cursor: 'pointer'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Geometric EX Icon */}
            <div style={{
                position: 'relative',
                width: dims.icon,
                height: dims.icon,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <svg width={dims.icon} height={dims.icon} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Background Plate */}
                    <rect width="100" height="100" rx="24" fill={dark ? '#0A0A0B' : '#1A1C29'} />
                    
                    {/* The "E" Part */}
                    <path d="M28 35H55V45H28V35Z" fill="white" />
                    <path d="M28 55H45V65H28V55Z" fill="white" />
                    <path d="M28 35V65H38V35H28Z" fill="white" />

                    {/* The "X" Part / Roof */}
                    <path d="M48 65L65 35H78L61 65H48Z" fill="var(--primary)" 
                          style={{
                              filter: isHovered ? 'drop-shadow(0 0 8px rgba(201,163,94,0.6))' : 'none',
                              transition: 'filter 0.3s ease'
                          }} />
                    <path d="M78 65L61 35H48L65 65H78Z" fill="url(#x-gradient)" />
                    
                    {/* Tiny Windows */}
                    <rect x="52" y="70" width="6" height="6" fill="white" />
                    <rect x="62" y="70" width="6" height="6" fill="white" />
                    <rect x="52" y="80" width="6" height="6" fill="white" />
                    <rect x="62" y="80" width="6" height="6" fill="white" />

                    <defs>
                        <linearGradient id="x-gradient" x1="48" y1="35" x2="78" y2="65" gradientUnits="userSpaceOnUse">
                            <stop stopColor="var(--primary)" stopOpacity="0.2" />
                            <stop offset="1" stopColor="var(--primary)" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Typography */}
            <div style={{ 
                fontFamily: 'Inter, sans-serif', 
                display: 'flex', 
                alignItems: 'baseline',
                letterSpacing: '-0.02em'
            }}>
                <span style={{ 
                    fontWeight: 600, 
                    fontSize: dims.text, 
                    color: dark ? '#111' : 'white',
                    transition: 'color 0.3s ease'
                }}>
                    Estate
                </span>
                <span style={{ 
                    fontWeight: 800, 
                    fontSize: dims.text, 
                    color: 'var(--primary)',
                    position: 'relative'
                }}>
                    XAi
                    {/* Shine animation overlay */}
                    <span style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                        backgroundSize: '200% 100%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        opacity: isHovered ? 1 : 0,
                        animation: isHovered ? 'shine 1.5s infinite linear' : 'none',
                        transition: 'opacity 0.3s'
                    }} />
                </span>
            </div>
            <style>{`
                @keyframes shine {
                    0% { background-position: -100% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
}
