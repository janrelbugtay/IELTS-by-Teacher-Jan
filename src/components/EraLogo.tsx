import React from 'react';

interface EraLogoProps {
  className?: string;
}

export const EraLogo: React.FC<EraLogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 500 500" 
      className={`${className} select-none`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Circular path for 'TRUNG TÂM NGOẠI NGỮ' (top arch, clockwise) */}
        {/* We use a path that starts at 80deg and goes to 100deg, sweep-flag=1 */}
        {/* Center: 250, 250. Radius: 195 */}
        <path 
          id="topTextPath" 
          d="M 62,210 A 195,195 0 0,1 438,210" 
          fill="none" 
        />
        {/* Circular path for 'KỶ NGUYÊN ERA' (bottom arch, clockwise but drawn right-to-left to keep text upright and legible) */}
        {/* Radius: 195 */}
        <path 
          id="bottomTextPath" 
          d="M 438,290 A 195,195 0 0,1 62,290" 
          fill="none" 
        />
        
        {/* Subtle drop shadow for the inner elements to give depth */}
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Outer grey background circle */}
      <circle cx="250" cy="250" r="242" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2.5" />

      {/* Main Orange Ring */}
      <circle cx="250" cy="250" r="230" fill="#FF7F0B" />
      
      {/* Outer thin dark outline on orange circle */}
      <circle cx="250" cy="250" r="228" fill="none" stroke="#334155" strokeWidth="1.5" />
      
      {/* Inner thin dark outline on orange circle */}
      <circle cx="250" cy="250" r="172" fill="none" stroke="#334155" strokeWidth="1.5" />

      {/* Inner White Circle */}
      <circle cx="250" cy="250" r="168" fill="#FFFFFF" stroke="#F1F5F9" strokeWidth="1.5" />

      {/* Curved Text: TRUNG TÂM NGOẠI NGỮ */}
      <text fill="#475569" fontSize="28" fontWeight="800" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" letterSpacing="4">
        <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
          TRUNG TÂM NGOẠI NGỮ
        </textPath>
      </text>

      {/* Curved Text: KỶ NGUYÊN ERA */}
      <text fill="#475569" fontSize="28" fontWeight="800" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" letterSpacing="4">
        <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
          KỶ NGUYÊN ERA
        </textPath>
      </text>

      {/* --- Central Graphics (Cap & Scroll) --- */}
      <g filter="url(#logoShadow)">
        {/* Cap Skull Base (The deep blue back portion of the hat) */}
        <path 
          d="M 165,215 Q 250,260 335,215 L 335,250 C 335,270 290,290 250,290 C 210,290 165,270 165,250 Z" 
          fill="#1E40AF" 
          stroke="#1E3A8A" 
          strokeWidth="2.5"
        />

        {/* Rolled Diploma Scroll */}
        <g transform="translate(132, 245) rotate(-6)">
          {/* Back shadow of scroll */}
          <rect x="10" y="10" width="216" height="36" rx="4" fill="#E2D1B3" />
          {/* Main scroll body */}
          <rect x="10" y="10" width="216" height="36" rx="4" fill="#FAF3E0" stroke="#78350F" strokeWidth="2.5" />
          {/* Scroll scroll roll inner curl on right */}
          <ellipse cx="226" cy="28" rx="7" ry="18" fill="#EAD8B5" stroke="#78350F" strokeWidth="2.5" />
          {/* Curl line details */}
          <path d="M 226,10 A 5,9 0 0,0 226,46" fill="none" stroke="#78350F" strokeWidth="2" />
        </g>

        {/* Dark Blue Ribbon tied around scroll in the middle */}
        <g transform="translate(242, 243)">
          {/* Ribbon loop knots */}
          <path d="M -10,12 C -24,2 -26,24 -4,20" fill="#0255cc" stroke="#1E3A8A" strokeWidth="2" />
          <path d="M 18,12 C 32,2 34,24 12,20" fill="#0255cc" stroke="#1E3A8A" strokeWidth="2" />
          {/* Ribbon tails hanging down */}
          <path d="M -4,15 C -15,22 -18,48 -10,50 C -4,42 -2,22 -4,15 Z" fill="#0255cc" stroke="#1E3A8A" strokeWidth="1.5" />
          <path d="M 12,15 C 23,22 26,48 18,50 C 12,42 10,22 12,15 Z" fill="#0255cc" stroke="#1E3A8A" strokeWidth="1.5" />
          {/* Ribbon main belt band around the scroll */}
          <rect x="-4" y="4" width="16" height="36" rx="2" fill="#004ac2" stroke="#1E3A8A" strokeWidth="2" />
        </g>
        
        {/* Diamond Mortarboard Top */}
        <polygon 
          points="250,140 375,175 250,212 125,175" 
          fill="#0056D2" 
          stroke="#1E3A8A" 
          strokeWidth="3.5" 
        />
        {/* Inner highlights of the cap diamond */}
        <polygon 
          points="250,144 365,175 250,206 135,175" 
          fill="#1E60E2" 
        />

        {/* Golden Tassel Button on top center */}
        <ellipse cx="250" cy="175" rx="7" ry="4.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />

        {/* Golden Tassel Cord */}
        <path d="M 250,175 Q 315,172 345,212" fill="none" stroke="#FBBF24" strokeWidth="3" />
        {/* Golden Tassel Fringe/Pendant */}
        <polygon points="345,212 334,238 351,241 345,212" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      </g>

      {/* 'ERA ENGLISH' Text in serif capital letters, matching screenshot typography */}
      <text 
        x="250" 
        y="350" 
        textAnchor="middle" 
        fill="#475569" 
        fontSize="32" 
        fontWeight="800" 
        fontFamily="Georgia, Cambria, 'Times New Roman', Times, serif"
        letterSpacing="2"
      >
        ERA ENGLISH
      </text>
    </svg>
  );
};
