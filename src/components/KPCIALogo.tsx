import React from 'react';

interface KPCIALogoProps {
  variant?: 'header' | 'hero' | 'certificate' | 'compact';
  theme?: 'dark' | 'light' | 'certificate';
}

export default function KPCIALogo({ variant = 'hero', theme = 'dark' }: KPCIALogoProps) {
  const isLight = theme === 'light';
  const isCert = theme === 'certificate';
  
  const subtitleColor = isLight || isCert ? '#334155' : '#D1D5DB'; // Slate-700 vs gray-300 for maximum readability

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-950 border border-kpcia-gold/40 shadow-lg shadow-kpcia-gold/5 shrink-0 select-none transition-all duration-300 hover:scale-110 hover:border-kpcia-gold hover:shadow-kpcia-gold/20 cursor-pointer">
        <span className="font-display font-black text-sm tracking-tighter bg-gradient-to-r from-kpcia-gold via-amber-200 to-kpcia-gold bg-clip-text text-transparent">
          KPCIA
        </span>
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className="flex items-center space-x-3 select-none transition-all duration-300 hover:scale-[1.02] cursor-pointer group" id="kpcia-logo-header">
        <div className="flex flex-col items-start leading-none">
          <span className="font-display font-black text-base tracking-wider bg-gradient-to-r from-kpcia-gold via-amber-200 to-kpcia-gold bg-clip-text text-transparent transition-all duration-300 group-hover:brightness-110">
            KPCIA
          </span>
        </div>
        <div className="hidden sm:flex flex-col justify-center border-l border-neutral-800/80 pl-3 leading-tight">
          <span className="text-[11px] font-black tracking-wider text-neutral-100 font-sans transition-all duration-300 group-hover:text-kpcia-gold">
            한국프레스티지기업강사협회
          </span>
          <span className="text-[7.5px] text-neutral-350 font-mono tracking-wider mt-0.5 font-bold uppercase transition-all duration-300 group-hover:text-neutral-200">
            KOREA PRESTIGE CORPORATE INSTRUCTOR ASSOCIATION
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'certificate') {
    return (
      <div className="flex flex-col items-center text-center space-y-1.5 select-none transition-all duration-500 hover:scale-[1.01] cursor-pointer group" id="kpcia-logo-cert">
        <span className="font-display font-black text-3xl tracking-[0.25em] bg-gradient-to-r from-[#A07A20] via-[#D4AF37] to-[#8C6410] bg-clip-text text-transparent group-hover:brightness-105 transition-all">
          KPCIA
        </span>
        <div className="space-y-0.5 text-center">
          <h2 className="text-[14px] font-black text-[#0B2144] tracking-[0.3em] font-sans uppercase group-hover:text-[#D4AF37] transition-colors duration-300">
            한국프레스티지기업강사협회
          </h2>
          <p className="text-[8px] text-[#1E293B] font-mono tracking-[0.15em] uppercase font-bold">
            Korea Prestige Corporate Instructor Association (KPCIA)
          </p>
        </div>
      </div>
    );
  }

  // Default: Hero / Stacked
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-2 p-4 select-none transition-all duration-500 hover:scale-[1.03] cursor-pointer group" id="kpcia-logo-hero">
      <span className="font-display font-black text-4xl sm:text-5xl tracking-[0.25em] bg-gradient-to-r from-kpcia-gold via-amber-200 to-kpcia-gold bg-clip-text text-transparent drop-shadow-md transition-all duration-500 group-hover:scale-105 group-hover:rotate-1">
        KPCIA
      </span>
      <div className="space-y-1.5 text-center">
        <h2 className={`text-base sm:text-lg font-black tracking-[0.3em] font-sans transition-all duration-300 group-hover:text-kpcia-gold ${isLight ? 'text-[#0B2144]' : 'text-neutral-500'} group-hover:text-neutral-100`}>
          한국프레스티지기업강사협회
        </h2>
        <p className="text-[9.5px] sm:text-[10px] font-mono tracking-widest uppercase font-extrabold transition-all duration-300 group-hover:text-neutral-200" style={{ color: subtitleColor }}>
          Korea Prestige Corporate Instructor Association (KPCIA)
        </p>
      </div>
    </div>
  );
}

