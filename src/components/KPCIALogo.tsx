import React from 'react';

interface KPCIALogoProps {
  variant?: 'header' | 'hero' | 'certificate' | 'compact';
  theme?: 'dark' | 'light' | 'certificate';
}

export default function KPCIALogo({ variant = 'hero', theme = 'dark' }: KPCIALogoProps) {
  // Color configuration based on theme
  const isLight = theme === 'light';
  const isCert = theme === 'certificate';
  
  // Brand colors
  const primaryNavy = '#0B2144'; // Clean, elegant deep navy from the image
  const goldAccent = 'url(#goldLogoGrad)';  // Luxury gold gradient
  const lightText = '#F3F4F6';   // White/light gray for dark background
  const subtitleColor = isLight || isCert ? '#55657D' : '#9CA3AF';

  const mainColor = isLight || isCert ? primaryNavy : lightText;

  // Let's build a clean, accurate SVG logo representation
  const renderSVGLogo = (height: number) => {
    // Width is proportional to height (approx 3.5 : 1 ratio)
    const width = height * 3.5;
    
    return (
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 350 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="select-none"
      >
        <defs>
          {/* Multi-stop premium gold gradient for luxury brand style */}
          <linearGradient id="goldLogoGrad" x1="0%" y1="30%" x2="100%" y2="70%">
            <stop offset="0%" stopColor="#DFB651" />
            <stop offset="25%" stopColor="#F7E4A3" />
            <stop offset="50%" stopColor="#D29E30" />
            <stop offset="75%" stopColor="#FCE7AA" />
            <stop offset="100%" stopColor="#9C6B16" />
          </linearGradient>
        </defs>

        {/* Letter K */}
        {/* Left vertical stem */}
        <path d="M12 15 H24 V85 H12 Z" fill={mainColor} />
        {/* Lower diagonal leg */}
        <path d="M24 50 L56 85 H38 L18 57 Z" fill={mainColor} />
        {/* Upper-right diagonal leg in Gold */}
        <path d="M20 52 L52 15 H36 L12 43 Z" fill={goldAccent} />
        
        {/* Letter P */}
        <path d="M72 15 H112 C128 15 138 25 138 42 C138 58 128 68 112 68 H84 V85 H72 V15 Z M84 27 V56 H110 C118 56 124 52 124 42 C124 32 118 27 110 27 H84 Z" fill={mainColor} />
        
        {/* Letter C */}
        <path d="M195 28 C185 18 172 15 160 15 C135 15 118 31 118 50 C118 69 135 85 160 85 C174 85 186 80 195 72 L188 62 C181 68 172 72 160 72 C143 72 131 62 131 50 C131 38 143 28 160 28 C172 28 181 32 188 38 L195 28 Z" fill={mainColor} />
        
        {/* Letter I */}
        <path d="M210 15 H222 V85 H210 V15 Z" fill={mainColor} />
        
        {/* Letter A with gold swoosh/arc */}
        {/* Left diagonal and top corner */}
        <path d="M246 85 L272 15 H286 L298 48 C294 48 290 49 286 50 L279 32 L260 85 H246 Z" fill={mainColor} />
        {/* Right diagonal bottom */}
        <path d="M298 48 L312 85 H296 L290 68 C293 61 296 55 298 48 Z" fill={mainColor} />
        {/* Gold swoosh crossing the A and curving beautifully */}
        <path d="M252 58 C270 54 290 48 315 48 C330 48 342 53 350 60 C336 53 322 51 310 52 C285 54 265 62 252 58 Z" fill={goldAccent} />
      </svg>
    );
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-950 border border-kpcia-gold/30 shadow-lg shadow-kpcia-gold/5 shrink-0">
        <div className="w-8 h-8">
          {renderSVGLogo(32)}
        </div>
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className="flex items-center space-x-3 select-none" id="kpcia-logo-header">
        <div className="w-24 h-7 shrink-0">
          {renderSVGLogo(28)}
        </div>
        <div className="hidden lg:flex flex-col justify-center border-l border-neutral-800 pl-3 leading-none">
          <span className="text-[10px] font-bold tracking-tight text-neutral-100 font-sans">한국프레스티지기업강사협회</span>
          <span className="text-[7px] text-neutral-500 font-mono tracking-tighter mt-0.5">PRESTIGE CORPORATE INSTRUCTOR ASSOCIATION</span>
        </div>
      </div>
    );
  }

  if (variant === 'certificate') {
    return (
      <div className="flex flex-col items-center text-center space-y-1.5 select-none" id="kpcia-logo-cert">
        <div className="w-56 h-16">
          {renderSVGLogo(64)}
        </div>
        <div className="space-y-0.5 text-center">
          <h2 className="text-[14px] font-bold text-[#0B2144] tracking-[0.25em] font-sans">한국프레스티지기업강사협회</h2>
          <p className="text-[8px] text-[#55657D] font-mono tracking-widest uppercase">Korea Prestige Corporate Instructor Association (KPCIA)</p>
        </div>
      </div>
    );
  }

  // Default: Hero / Full Stacked logo
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-3 p-4 select-none" id="kpcia-logo-hero">
      <div className="w-64 h-16 sm:h-20 max-w-full">
        {renderSVGLogo(80)}
      </div>
      <div className="space-y-1 text-center">
        <h2 className={`text-base sm:text-lg font-black tracking-[0.3em] font-sans ${isLight ? 'text-[#0B2144]' : 'text-neutral-100'}`}>
          한국프레스티지기업강사협회
        </h2>
        <p className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase" style={{ color: subtitleColor }}>
          Korea Prestige Corporate Instructor Association (KPCIA)
        </p>
      </div>
    </div>
  );
}
