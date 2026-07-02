import React from 'react';

interface EraLogoProps {
  className?: string;
}

export const EraLogo: React.FC<EraLogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 500 500" 
      className={`${className} select-none drop-shadow-md`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9D42" />
          <stop offset="100%" stopColor="#E85D04" />
        </linearGradient>
        
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        
        <radialGradient id="innerWhite" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </radialGradient>

        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Circular path for 'TRUNG TÂM NGOẠI NGỮ' (top arch, clockwise) */}
        <path 
          id="topTextPath" 
          d="M 62,210 A 195,195 0 0,1 438,210" 
          fill="none" 
        />
        {/* Circular path for 'KỶ NGUYÊN ERA' (bottom arch, clockwise but drawn right-to-left) */}
        <path 
          id="bottomTextPath" 
          d="M 438,290 A 195,195 0 0,1 62,290" 
          fill="none" 
        />
        
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0F172A" floodOpacity="0.2" />
        </filter>
        <filter id="textShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Outer grey background circle */}
      <circle cx="250" cy="250" r="242" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="4" />

      {/* Main Orange Ring */}
      <circle cx="250" cy="250" r="230" fill="url(#orangeGradient)" />
      
      {/* Outer thin dark outline on orange circle */}
      <circle cx="250" cy="250" r="226" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.3" />
      
      {/* Inner thin dark outline on orange circle */}
      <circle cx="250" cy="250" r="172" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.5" />

      {/* Inner White Circle */}
      <circle cx="250" cy="250" r="168" fill="url(#innerWhite)" stroke="#E2E8F0" strokeWidth="2" />

      {/* Curved Text: TRUNG TÂM NGOẠI NGỮ */}
      <text fill="#FFFFFF" filter="url(#textShadow)" fontSize="28" fontWeight="800" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" letterSpacing="5">
        <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
          TRUNG TÂM NGOẠI NGỮ
        </textPath>
      </text>

      {/* Curved Text: KỶ NGUYÊN ERA */}
      <text fill="#FFFFFF" filter="url(#textShadow)" fontSize="30" fontWeight="900" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" letterSpacing="4">
        <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
          KỶ NGUYÊN ERA
        </textPath>
      </text>

      {/* --- Central Graphics (Cap & Scroll) --- */}
      <g filter="url(#logoShadow)">
        {/* Cap Skull Base */}
        <path 
          d="M 165,215 Q 250,270 335,215 L 335,250 C 335,275 290,295 250,295 C 210,295 165,275 165,250 Z" 
          fill="url(#blueGradient)" 
        />

        {/* Rolled Diploma Scroll */}
        <g transform="translate(132, 245) rotate(-6)">
          <rect x="10" y="10" width="216" height="36" rx="6" fill="#FDE68A" />
          <rect x="10" y="10" width="216" height="36" rx="6" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          <ellipse cx="226" cy="28" rx="8" ry="18" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
          <path d="M 226,10 A 5,9 0 0,0 226,46" fill="none" stroke="#B45309" strokeWidth="2" />
        </g>

        {/* Dark Blue Ribbon tied around scroll in the middle */}
        <g transform="translate(242, 243)">
          <path d="M -10,12 C -24,2 -26,24 -4,20" fill="#EF4444" />
          <path d="M 18,12 C 32,2 34,24 12,20" fill="#EF4444" />
          <path d="M -4,15 C -15,22 -18,48 -10,50 C -4,42 -2,22 -4,15 Z" fill="#DC2626" />
          <path d="M 12,15 C 23,22 26,48 18,50 C 12,42 10,22 12,15 Z" fill="#DC2626" />
          <rect x="-4" y="4" width="16" height="36" rx="3" fill="#B91C1C" />
        </g>
        
        {/* Diamond Mortarboard Top */}
        <polygon 
          points="250,135 385,175 250,215 115,175" 
          fill="url(#blueGradient)" 
          stroke="#1E3A8A" 
          strokeWidth="2" 
        />
        {/* Inner highlights of the cap diamond */}
        <polygon 
          points="250,140 375,175 250,210 125,175" 
          fill="#3B82F6" 
          opacity="0.8"
        />

        {/* Golden Tassel Button on top center */}
        <ellipse cx="250" cy="175" rx="8" ry="5" fill="url(#goldGradient)" stroke="#B45309" strokeWidth="1" />

        {/* Golden Tassel Cord */}
        <path d="M 250,175 Q 320,172 355,215" fill="none" stroke="url(#goldGradient)" strokeWidth="4" strokeLinecap="round" />
        {/* Golden Tassel Fringe/Pendant */}
        <polygon points="355,215 342,245 368,248 355,215" fill="url(#goldGradient)" />
      </g>

      {/* 'ERA ENGLISH' Text in serif capital letters */}
      <text 
        x="250" 
        y="345" 
        textAnchor="middle" 
        fill="#1E3A8A" 
        fontSize="36" 
        fontWeight="900" 
        fontFamily="Georgia, Cambria, 'Times New Roman', Times, serif"
        letterSpacing="3"
      >
        ERA ENGLISH
      </text>
      <text 
        x="250" 
        y="375" 
        textAnchor="middle" 
        fill="#EF4444" 
        fontSize="16" 
        fontWeight="800" 
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="6"
      >
        EST. 2026
      </text>
    </svg>
  );
};

