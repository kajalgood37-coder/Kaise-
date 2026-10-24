import React from 'react';
import { AvatarLookStyle } from '../types';

interface PriyaPortraitProps {
  className?: string;
  isSpeaking?: boolean;
  isListening?: boolean;
  audioLevel?: number; // 0 to 1
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showDecorations?: boolean;
  styleMode?: AvatarLookStyle;
}

/**
 * High-detail vector portrait of Priya ji with dynamic animated expressions:
 * - Natural eye blinking
 * - Dynamic mouth talking animation synchronized to live audio level
 * - Soft breathing and subtle motion
 * - Rich jewelry (jhumkas), expressive eyes, warm glowing skin tone
 * - 4 Selectable gorgeous looks: Royal Gold, Desi Glam, Cyber Jarvis, and Bollywood Chic!
 */
export const PriyaPortrait: React.FC<PriyaPortraitProps> = ({
  className = '',
  isSpeaking = false,
  isListening = false,
  audioLevel = 0,
  size = 'md',
  showDecorations = true,
  styleMode = 'royal-gold',
}) => {
  // Compute mouth open height based on audio level when speaking
  const mouthOpen = isSpeaking ? Math.min(22, 6 + audioLevel * 28) : 4;
  const eyeSquint = isSpeaking && audioLevel > 0.4;

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
    full: 'w-full h-full',
  }[size];

  return (
    <div
      className={`relative rounded-full overflow-hidden flex items-center justify-center select-none ${sizeClasses} ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full transform transition-transform duration-300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Ambient Background Gradient (Golden White Aura) */}
          <radialGradient id="bgGlow" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#d97706" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#451a03" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0b0803" stopOpacity="1" />
          </radialGradient>

          {/* Skin Tone Gradient */}
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="60%" stopColor="#fba67d" />
            <stop offset="100%" stopColor="#ea8c61" />
          </linearGradient>

          {/* Skin Shadow Gradient */}
          <linearGradient id="skinShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#df7a52" />
            <stop offset="100%" stopColor="#b65731" />
          </linearGradient>

          {/* Hair Gradient */}
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1026" />
            <stop offset="45%" stopColor="#120817" />
            <stop offset="85%" stopColor="#08030c" />
            <stop offset="100%" stopColor="#2c1438" />
          </linearGradient>

          {/* Hair Highlight (Golden Shimmer) */}
          <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0" />
            <stop offset="50%" stopColor="#fde047" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </linearGradient>

          {/* Lip Color Gradient */}
          <linearGradient id="lipGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>

          {/* 24K Royal Gold Jewelry Gradient */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Pearl White Gradient */}
          <linearGradient id="pearlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#fef9c3" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>

          {/* Cyberpunk Neon Glow Filter */}
          <filter id="neonPriyaGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Backdrop */}
        <rect width="200" height="200" fill="url(#bgGlow)" />

        {/* Ambient room bokeh lights (Golden & Pearl White) */}
        <circle cx="35" cy="40" r="18" fill="#fef08a" opacity="0.4" filter="blur(8px)" />
        <circle cx="165" cy="50" r="22" fill="#ffffff" opacity="0.35" filter="blur(10px)" />
        <circle cx="175" cy="150" r="15" fill="#f59e0b" opacity="0.3" filter="blur(6px)" />

        {/* 2. Back Hair Volume */}
        <path
          d="M 45 75 Q 30 110 32 165 Q 40 190 70 195 Q 100 200 130 195 Q 160 190 168 165 Q 170 110 155 75 Z"
          fill="url(#hairGrad)"
        />

        {/* 3. Shoulders & Outfit based on styleMode */}
        <path
          d="M 40 190 C 45 165 70 150 100 150 C 130 150 155 165 160 190 L 165 200 L 35 200 Z"
          fill={
            styleMode === 'desi-glam'
              ? '#4a052c'
              : styleMode === 'cyber-jarvis'
              ? '#090d16'
              : styleMode === 'bollywood-chic'
              ? '#1f1326'
              : '#1c1308'
          }
        />
        {/* Royal Gold / Velvet Embroidery Border */}
        <path
          d="M 75 165 Q 100 180 125 165 L 120 185 Q 100 195 80 185 Z"
          fill={styleMode === 'desi-glam' ? '#f43f5e' : 'url(#goldGrad)'}
          opacity="0.95"
        />

        {/* 4. Neck */}
        <path d="M 85 125 L 85 155 Q 100 162 115 155 L 115 125 Z" fill="url(#skinShadow)" />
        <path d="M 88 125 L 88 152 Q 100 158 112 152 L 112 125 Z" fill="url(#skinGrad)" />

        {/* Modern Chic 24K Gold & Pearl Choker Necklace */}
        <path
          d="M 88 142 Q 100 148 112 142"
          stroke="url(#goldGrad)"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Pearl White Pendant */}
        <circle cx="100" cy="147" r="3" fill="#ffffff" stroke="#f59e0b" strokeWidth="0.8" />

        {/* 5. Face Base */}
        <path
          d="M 64 80 C 62 115 76 142 100 142 C 124 142 138 115 136 80 C 136 50 64 50 64 80 Z"
          fill="url(#skinGrad)"
        />

        {/* Cheek Blush */}
        <ellipse cx="78" cy="104" rx="10" ry="6" fill="#f43f5e" opacity="0.32" filter="blur(3px)" />
        <ellipse cx="122" cy="104" rx="10" ry="6" fill="#f43f5e" opacity="0.32" filter="blur(3px)" />

        {/* 6. Ears & Jhumkas / Earrings */}
        <ellipse cx="63" cy="95" rx="5" ry="9" fill="url(#skinGrad)" />
        <ellipse cx="137" cy="95" rx="5" ry="9" fill="url(#skinGrad)" />

        {/* Royal Gold & Pearl Jhumkas / Dangles */}
        <g id="earring-left">
          <circle cx="62" cy="102" r="2.2" fill="url(#goldGrad)" />
          <path d="M 60 105 Q 62 112 64 105 Z" fill="url(#goldGrad)" />
          <circle cx="62" cy="113" r="1.6" fill="#ffffff" stroke="#f59e0b" strokeWidth="0.6" />
        </g>
        <g id="earring-right">
          <circle cx="138" cy="102" r="2.2" fill="url(#goldGrad)" />
          <path d="M 136 105 Q 138 112 140 105 Z" fill="url(#goldGrad)" />
          <circle cx="138" cy="113" r="1.6" fill="#ffffff" stroke="#f59e0b" strokeWidth="0.6" />
        </g>

        {/* 7. Expressive Eyebrows */}
        <path
          d="M 72 74 Q 82 70 91 74"
          stroke="#1f0a1c"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 109 74 Q 118 70 128 74"
          stroke="#1f0a1c"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Royal Golden Bindi with sparkling diamond/pearl center */}
        <circle cx="100" cy="74" r="2.2" fill="#d97706" />
        <circle cx="100" cy="74" r="1.1" fill="#ffffff" />

        {/* 8. Eyes */}
        {/* Left Eye */}
        <g id="left-eye">
          {eyeSquint ? (
            <path
              d="M 73 86 Q 81 81 89 86"
              stroke="#1a0515"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <>
              {/* White sclera */}
              <ellipse cx="81" cy="85" rx="8" ry="5.5" fill="#ffffff" />
              {/* Deep Brown Iris */}
              <circle cx="81.5" cy="85" r="4.2" fill="#3b1d11" />
              {/* Pupil */}
              <circle cx="81.5" cy="85" r="2.2" fill="#0d0407" />
              {/* Light Catch Sparkle */}
              <circle cx="80" cy="83.5" r="1.3" fill="#ffffff" />
              <circle cx="83" cy="86" r="0.7" fill="#ffffff" />
              {/* Upper Eyelash / Liner */}
              <path
                d="M 72 85 Q 81 80 90 84"
                stroke="#12040b"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
              />
            </>
          )}
        </g>

        {/* Right Eye */}
        <g id="right-eye">
          {eyeSquint ? (
            <path
              d="M 111 86 Q 119 81 127 86"
              stroke="#1a0515"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <>
              {/* White sclera */}
              <ellipse cx="119" cy="85" rx="8" ry="5.5" fill="#ffffff" />
              {/* Deep Brown Iris */}
              <circle cx="118.5" cy="85" r="4.2" fill="#3b1d11" />
              {/* Pupil */}
              <circle cx="118.5" cy="85" r="2.2" fill="#0d0407" />
              {/* Light Catch Sparkle */}
              <circle cx="117" cy="83.5" r="1.3" fill="#ffffff" />
              <circle cx="120" cy="86" r="0.7" fill="#ffffff" />
              {/* Upper Eyelash / Liner */}
              <path
                d="M 110 84 Q 119 80 128 85"
                stroke="#12040b"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
              />
            </>
          )}
        </g>

        {/* 9. Cute Nose */}
        <path
          d="M 100 85 L 98 100 Q 100 102 103 100"
          stroke="#ca6b42"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Subtle nostril shadow */}
        <ellipse cx="97" cy="101" rx="1.5" ry="1" fill="#b4532c" opacity="0.6" />
        <ellipse cx="103" cy="101" rx="1.5" ry="1" fill="#b4532c" opacity="0.6" />
        {/* Cute Tiny Nose Stud */}
        <circle cx="96" cy="99" r="1" fill="url(#goldGrad)" />

        {/* 10. Lips & Animated Mouth */}
        <g id="mouth">
          {isSpeaking ? (
            /* Open Talking Mouth with dynamic audio height */
            <g>
              <ellipse
                cx="100"
                cy={117 + mouthOpen * 0.15}
                rx={11 + mouthOpen * 0.25}
                ry={mouthOpen}
                fill="#4c0519"
              />
              {/* Upper teeth row */}
              <path
                d={`M 92 116 Q 100 118 108 116 Q 100 ${118 + mouthOpen * 0.2} 92 116`}
                fill="#ffffff"
                opacity="0.95"
              />
              {/* Lips outline */}
              <path
                d="M 88 116 Q 94 113 100 114 Q 106 113 112 116 Q 100 119 88 116 Z"
                fill="url(#lipGrad)"
              />
              <path
                d={`M 88 116 Q 100 ${120 + mouthOpen * 0.8} 112 116 Q 100 ${
                  117 + mouthOpen * 0.5
                } 88 116 Z`}
                fill="url(#lipGrad)"
              />
            </g>
          ) : (
            /* Charming Resting Smile */
            <g>
              {/* Upper Lip */}
              <path
                d="M 89 116 Q 95 113 100 114 Q 105 113 111 116 Q 100 118 89 116 Z"
                fill="url(#lipGrad)"
              />
              {/* Smile Separation Line */}
              <path
                d="M 88 116 Q 100 119 112 116"
                stroke="#881337"
                strokeWidth="1.2"
                fill="none"
              />
              {/* Lower Lip (Plump & Glossy) */}
              <path
                d="M 90 116 Q 100 123 110 116 Q 100 118 90 116 Z"
                fill="url(#lipGrad)"
              />
              {/* Lip Gloss Highlight */}
              <ellipse cx="100" cy="119.5" rx="4" ry="1.2" fill="#fda4af" opacity="0.7" />
            </g>
          )}
        </g>

        {/* 11. Front Hair Strands & Flowing Bangs */}
        {/* Left Side Hair Waves */}
        <path
          d="M 64 68 C 60 88 56 112 60 145 C 65 130 70 95 76 80 C 82 68 70 65 64 68 Z"
          fill="url(#hairGrad)"
        />
        <path
          d="M 70 62 C 80 50 110 48 130 62 C 115 54 90 54 70 62 Z"
          fill="url(#hairHighlight)"
        />

        {/* Flowing Bangs / Forehead Strands */}
        <path
          d="M 68 64 Q 85 58 100 70 Q 115 58 132 64 Q 100 52 68 64 Z"
          fill="url(#hairGrad)"
        />
        <path
          d="M 126 68 C 135 90 142 120 138 150 C 132 135 128 100 122 80 Z"
          fill="url(#hairGrad)"
        />

        {/* Subtle Strand Highlights */}
        <path
          d="M 63 90 Q 60 115 63 135"
          stroke="#ff70a6"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
          fill="none"
        />
        <path
          d="M 137 90 Q 140 115 137 135"
          stroke="#ff70a6"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
          fill="none"
        />

        {/* Active Speech / Listening Ring Indicator (Golden White Jarvis) */}
        {isSpeaking && (
          <circle
            cx="100"
            cy="100"
            r="96"
            fill="none"
            stroke="#f5d061"
            strokeWidth="3.5"
            strokeDasharray="8 6"
            className="animate-spin"
            style={{ animationDuration: '6s' }}
          />
        )}

        {isListening && !isSpeaking && (
          <circle
            cx="100"
            cy="100"
            r="96"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
};
