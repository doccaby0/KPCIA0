import React from 'react';
import { DigitalBadge } from '../types';

interface BadgeCabinetProps {
  badges: DigitalBadge[];
  className?: string;
}

export default function BadgeCabinet({ badges, className = "" }: BadgeCabinetProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 ${className}`} id="badge-cabinet">
      {badges.map((badge) => (
        <div 
          key={badge.id} 
          className="flex flex-col items-center p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur text-center hover:border-kpcia-gold/50 transition-all duration-300 group"
          id={`badge-${badge.id}`}
        >
          <div className="relative w-16 h-16 mb-3 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
            {/* Glow background based on badge type */}
            <div className={`absolute inset-0 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300 ${
              badge.iconType === 'emerald_crown' ? 'bg-emerald-500' :
              badge.iconType === 'ruby_star' ? 'bg-red-500' :
              badge.iconType === 'sapphire_shield' ? 'bg-blue-500' :
              'bg-amber-600'
            }`} />

            {/* Medal SVGs */}
            {badge.iconType === 'bronze_medal' && (
              <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="28" fill="url(#bronzeGrad)" />
                <circle cx="32" cy="32" r="22" stroke="#E29251" strokeWidth="2" strokeDasharray="4 2" />
                <polygon points="32,16 36,28 48,28 38,36 42,48 32,40 22,48 26,36 16,28 28,28" fill="#F8F9FA" opacity="0.9" />
                <defs>
                  <linearGradient id="bronzeGrad" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#CA7D44" />
                    <stop offset="50%" stopColor="#E29251" />
                    <stop offset="100%" stopColor="#8C4F23" />
                  </linearGradient>
                </defs>
              </svg>
            )}

            {badge.iconType === 'silver_medal' && (
              <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="28" fill="url(#silverGrad)" />
                <circle cx="32" cy="32" r="22" stroke="#B0B5BC" strokeWidth="2" strokeDasharray="4 2" />
                <polygon points="32,16 36,28 48,28 38,36 42,48 32,40 22,48 26,36 16,28 28,28" fill="#FFFFFF" opacity="0.9" />
                <defs>
                  <linearGradient id="silverGrad" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#E6E8EA" />
                    <stop offset="50%" stopColor="#A2A9B1" />
                    <stop offset="100%" stopColor="#5E656B" />
                  </linearGradient>
                </defs>
              </svg>
            )}

            {badge.iconType === 'sapphire_shield' && (
              <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 6 L52 14 V32 C52 44.5 43.5 54.5 32 58 C20.5 54.5 12 44.5 12 32 V14 L32 6 Z" fill="url(#sapphireGrad)" stroke="#60A5FA" strokeWidth="2" />
                <path d="M32 12 L46 17.5 V32 C46 41 39.5 49 32 52 C24.5 49 18 41 18 32 V17.5 L32 12 Z" stroke="#3B82F6" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M32 18 L35 25 H43 L36 30 L39 38 L32 33 L25 38 L28 30 L21 25 H29 L32 18 Z" fill="#FFFFFF" />
                <defs>
                  <linearGradient id="sapphireGrad" x1="12" y1="6" x2="52" y2="58" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="50%" stopColor="#1D4ED8" />
                    <stop offset="100%" stopColor="#1E3A8A" />
                  </linearGradient>
                </defs>
              </svg>
            )}

            {badge.iconType === 'ruby_star' && (
              <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* 8-pointed gold star frame */}
                <path d="M32 4 L38 20 L54 14 L46 30 L60 32 L46 34 L54 50 L38 44 L32 60 L26 44 L10 50 L18 34 L4 32 L18 30 L10 14 L26 20 Z" fill="url(#goldRimGrad)" />
                {/* Ruby core medallion */}
                <circle cx="32" cy="32" r="18" fill="url(#rubyGrad)" stroke="#F59E0B" strokeWidth="1.5" />
                {/* Inner crown or icon */}
                <path d="M26 34 L28 26 L32 29 L36 26 L38 34 Z" fill="#F3F4F6" />
                <circle cx="32" cy="32" r="2" fill="#FCD34D" />
                <defs>
                  <linearGradient id="goldRimGrad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#9A7B1C" />
                  </linearGradient>
                  <linearGradient id="rubyGrad" x1="14" y1="14" x2="50" y2="50" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="50%" stopColor="#DC2626" />
                    <stop offset="100%" stopColor="#7F1D1D" />
                  </linearGradient>
                </defs>
              </svg>
            )}

            {badge.iconType === 'emerald_crown' && (
              <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outermost luxury gold shield outline */}
                <polygon points="32,4 58,16 58,48 32,60 6,48 6,16" fill="url(#goldRimGrad)" />
                {/* Emerald gemstone core */}
                <polygon points="32,8 54,18 54,46 32,56 10,46 10,18" fill="url(#emeraldGrad)" />
                {/* Crown symbol in gold */}
                <path d="M20,40 L44,40 L48,24 L39,32 L32,20 L25,32 L16,24 Z" fill="url(#goldRimGrad)" stroke="#FFF" strokeWidth="0.5" />
                <circle cx="32" cy="20" r="1.5" fill="#FFF" />
                <circle cx="16" cy="24" r="1.5" fill="#FFF" />
                <circle cx="48" cy="24" r="1.5" fill="#FFF" />
                <circle cx="32" cy="40" r="2.5" fill="#EF4444" />
                <defs>
                  <linearGradient id="goldRimGrad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FCD34D" />
                    <stop offset="30%" stopColor="#D4AF37" />
                    <stop offset="70%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#78350F" />
                  </linearGradient>
                  <linearGradient id="emeraldGrad" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#064E3B" />
                  </linearGradient>
                </defs>
              </svg>
            )}
          </div>
          <h4 className="font-display font-semibold text-sm text-neutral-100 group-hover:text-kpcia-gold transition-colors duration-300">
            {badge.title}
          </h4>
          <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
            {badge.description}
          </p>
          <span className="text-[10px] font-mono text-kpcia-gold/70 mt-2 bg-kpcia-gold/5 px-2 py-0.5 rounded-full border border-kpcia-gold/10">
            {badge.dateGranted} 발급
          </span>
        </div>
      ))}
    </div>
  );
}
