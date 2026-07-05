import React, { useState } from 'react';
import { UserProfile, InstructorTier } from '../types';
import { Shield, Sparkles, User, LogIn, ChevronDown, Award, X, Plus, Home, Briefcase, BookOpen, Handshake, Smartphone } from 'lucide-react';
import KPCIALogo from './KPCIALogo';

interface HeaderProps {
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  onUserChange: (userId: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileSimulated: boolean;
  onToggleSimulator: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
  onOpenAuthModal?: (tab: 'login' | 'register') => void;
}

export default function Header({
  currentUser,
  allUsers,
  onUserChange,
  activeTab,
  onTabChange,
  isMobileSimulated,
  onToggleSimulator,
  onOpenRegister,
  onLogout,
  onOpenAuthModal
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Helper to format mileage with commas
  const formatMileage = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const isUserAdmin = currentUser ? currentUser.isAdmin : false;
  const isUserGuestOrNull = currentUser ? currentUser.uid === 'guest' : true;

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-kpcia-dark/95 backdrop-blur-md" id="header">
      {/* Association Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between" id="header-container">
        {/* Logo and Brand with KPCIALogo component */}
        <div className="flex items-center cursor-pointer select-none shrink-0 animate-in fade-in duration-300" onClick={() => onTabChange('home')} id="logo-section">
          <KPCIALogo variant="header" theme="dark" />
        </div>

        {/* Navigation Tabs (Desktop Website View) - Clean Icons with tooltips */}
        <nav className="hidden md:flex space-x-2" id="desktop-nav">
          {[
            { id: 'home', label: '협회 소개', icon: <Home className="w-4 h-4" /> },
            { id: 'lectures', label: '출강 공고 매칭', icon: <Briefcase className="w-4 h-4" /> },
            { id: 'programs', label: '교육 프로그램 기획', icon: <BookOpen className="w-4 h-4" />, instructorOnly: true },
            { id: 'proposal', label: '제휴 및 협력 제안', icon: <Handshake className="w-4 h-4" /> },
            { id: 'admin', label: '협회 관리자실', icon: <Shield className="w-4 h-4" />, adminOnly: true }
          ].map((tab) => {
            if (tab.adminOnly && !isUserAdmin) return null;
            if (tab.instructorOnly && isUserGuestOrNull) return null;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`group relative p-2.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-kpcia-gold/15 text-kpcia-gold border border-kpcia-gold/30 shadow-lg shadow-kpcia-gold/5'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border border-transparent'
                }`}
                id={`tab-${tab.id}`}
              >
                {tab.icon}
                
                {/* Micro tooltip on mouse hover */}
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 duration-200 bg-neutral-950/95 border border-neutral-800 text-neutral-100 text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none transition-all whitespace-nowrap z-50">
                  <span className="font-semibold">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Persona Switcher */}
        <div className="flex items-center space-x-4" id="header-user-section">
          {currentUser ? (
            /* User Mileage and Profile Widget */
            <div 
              className="relative" 
              id="user-profile-dropdown"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-kpcia-gold/50 transition-all text-left"
                id="user-dropdown-btn"
              >
                {/* Badge Icon Indicator */}
                <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-kpcia-gold">
                  {currentUser.isAdmin ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <Award className="w-4 h-4" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    {currentUser.name}
                    {/* Mileage explicitly displayed next to name! */}
                    {currentUser.uid !== 'guest' && (
                      <span className="text-kpcia-gold font-mono font-bold bg-kpcia-gold/5 px-1.5 py-0.5 rounded border border-kpcia-gold/10">
                        [{formatMileage(currentUser.mileage)} M]
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-kpcia-gold animate-pulse"></span>
                    {currentUser.uid === 'guest' ? '비회원 (제안용)' : currentUser.tier}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {/* Persona Switcher Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full pt-1.5 w-72 z-50 animate-in fade-in slide-in-from-top-3 duration-200" id="user-dropdown-menu-wrapper">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-lg shadow-2xl p-2.5 space-y-1.5" id="user-dropdown-menu">
                    
                    {/* Instructor Card Link (로그아웃 위에) */}
                    {currentUser && currentUser.uid !== 'guest' && (
                      <div className="pb-1 border-b border-neutral-900">
                        <button
                          onClick={() => {
                            onTabChange('profile');
                            setDropdownOpen(false);
                          }}
                          className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'profile'
                              ? 'bg-kpcia-gold/15 text-kpcia-gold border border-kpcia-gold/25 shadow-lg shadow-kpcia-gold/5'
                              : 'text-neutral-300 hover:text-neutral-100 hover:bg-neutral-900 border border-transparent'
                          }`}
                          id="dropdown-profile-btn"
                        >
                          <Award className="w-3.5 h-3.5 text-kpcia-gold" />
                          <span>강사 정보 카드 (My Profile)</span>
                        </button>
                      </div>
                    )}

                    {/* Logout Action */}
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          onLogout();
                          setDropdownOpen(false);
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/30 border border-red-950/50 hover:border-red-500/50 text-red-400 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        id="logout-btn"
                      >
                        <span>로그아웃</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark transition-all font-bold text-xs cursor-pointer shadow-lg shadow-kpcia-gold/10"
              id="header-auth-btn"
            >
              <LogIn className="w-3.5 h-3.5 text-kpcia-dark" />
              <span>회원가입 / 로그인</span>
            </button>
          )}
        </div>
      </div>
    </header>
    
    {/* Mobile Navigation (Bottom Nav) for actual mobile screens */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/90 backdrop-blur-md border-t border-neutral-850 px-2 py-3.5 flex justify-around items-center" id="mobile-bottom-nav">
      {[
        { id: 'home', label: '협회소개', icon: <Home className="w-5 h-5" /> },
        { id: 'lectures', label: '출강공고', icon: <Briefcase className="w-5 h-5" /> },
        { id: 'programs', label: '교육기획', icon: <BookOpen className="w-5 h-5" />, instructorOnly: true },
        { id: 'proposal', label: '제휴제안', icon: <Handshake className="w-5 h-5" /> },
        { id: 'admin', label: '관리자', icon: <Shield className="w-5 h-5" />, adminOnly: true }
      ].map((tab) => {
        if (tab.adminOnly && !isUserAdmin) return null;
        if (tab.instructorOnly && isUserGuestOrNull) return null;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-kpcia-gold scale-110 bg-kpcia-gold/10'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
            }`}
            id={`mobile-tab-${tab.id}`}
            title={tab.label}
          >
            {tab.icon}
          </button>
        );
      })}
    </nav>
  </>
  );
}
