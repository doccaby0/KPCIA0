import React, { useState } from 'react';
import { UserProfile, LectureRequest, EducationalProgram } from '../types';
import { 
  Award, 
  BookOpen, 
  User, 
  MapPin, 
  Clock, 
  Settings, 
  LogOut, 
  LogIn, 
  X, 
  ChevronDown, 
  AlertCircle, 
  Check, 
  Globe,
  Users,
  FileDown
} from 'lucide-react';

interface AppSimulatorProps {
  currentUser: UserProfile | null;
  allUsers?: UserProfile[];
  onUserChange?: (userId: string) => void;
  onLogout?: () => void;
  onLogin?: (emailOrName: string, password?: string) => boolean | Promise<boolean>;
  lectures: LectureRequest[];
  programs: EducationalProgram[];
  activeMobileTab: string;
  onMobileTabChange: (tab: string) => void;
  onApplyLecture: (lectureId: string) => void;
  onTabChange: (tab: string) => void;
}

export default function AppSimulator({
  currentUser,
  allUsers = [],
  onUserChange,
  onLogout,
  onLogin,
  lectures,
  programs,
  activeMobileTab,
  onMobileTabChange,
  onApplyLecture,
  onTabChange
}: AppSimulatorProps) {
  const [showUserModal, setShowUserModal] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const formatMileage = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  // Check if user is qualified for a tier
  const checkIsQualified = (userTier: string, requiredTier: string) => {
    const order = ['Prestige Member', 'Prestige Associate', 'Prestige Professional', 'Prestige Master', 'Prestige Elite'];
    return order.indexOf(userTier) >= order.indexOf(requiredTier);
  };

  const downloadLectureAsTxt = (lecture: LectureRequest) => {
    const isPriceVisible = !currentUser || currentUser.uid === 'guest' 
      ? false 
      : currentUser.isAdmin || checkIsQualified(currentUser.tier, lecture.targetTier);

    const textContent = `==================================================
KPCIA 한국프레스티지강사협회 - 출강 공고 상세 정보 (모바일)
==================================================

■ 공고 제목       : ${lecture.title}
■ 최저 지원 등급 : ${lecture.targetTier} 이상
■ 출강 일자       : ${lecture.date}
■ 출강 시간       : ${lecture.time} (${lecture.duration})
■ 수강 대상       : ${lecture.attendees ? `${lecture.attendees}명` : '상세 정보 참조'}
■ 출강 장소       : ${lecture.location}
■ 출강 강사료     : ${isPriceVisible ? `${lecture.budget.toLocaleString()} KRW` : '[로그인 및 자격 획득 후 공개]'}
■ 마일리지 로열티 : ${lecture.mileageRoyalty.toLocaleString()} M
■ 연계 교육 프로그램 : ${lecture.programTitle || '없음'}
■ 공고 상태       : ${lecture.status === 'open' ? '모집중 (지원 가능)' : lecture.status === 'assigned' ? '배정 완료' : '종료'}

--------------------------------------------------
[ 상세 강의 설명 ]
--------------------------------------------------
${lecture.description}

==================================================
본 공고는 KPCIA 회원 및 검증된 소속 강사를 위한 공식 출강 정보입니다.
출강 및 제휴 문의: KPCIA 한국프레스티지강사협회 (dh_kim@kpcia.or.kr)
출력 일시: ${new Date().toLocaleString('ko-KR')}
==================================================`;

    const element = document.createElement("a");
    const file = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `KPCIA_출강공고_${lecture.title.replace(/[\s/\\:*?"<>|]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleMobileLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginId.trim()) {
      setLoginError('아이디 또는 이메일을 입력해 주세요.');
      return;
    }
    if (onLogin) {
      const success = await onLogin(loginId, loginPassword);
      if (success) {
        setLoginId('');
        setLoginPassword('');
      } else {
        setLoginError('아이디 또는 비밀번호가 잘못되었습니다.');
      }
    }
  };

  const handleQuickLogin = async (user: UserProfile) => {
    setLoginError('');
    if (onLogin) {
      // Demo login uses email or name, passwords match demo defaults
      const success = await onLogin(user.loginId || user.email, '123456');
      if (success) {
        setLoginId('');
        setLoginPassword('');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 select-none" id="app-simulator-container">
      {/* Phone Case Frame */}
      <div className="w-[360px] h-[720px] rounded-[48px] border-[12px] border-neutral-900 bg-neutral-950 shadow-2xl relative overflow-hidden flex flex-col" id="smartphone-frame">
        {/* Notch / Speaker */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-neutral-900 rounded-b-2xl z-50 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-1 bg-neutral-800 rounded-full mb-1"></div>
        </div>

        {/* Status Bar */}
        <div className="h-10 bg-neutral-950 px-6 pt-3 flex justify-between items-center text-[10px] text-neutral-400 font-mono select-none relative z-40 shrink-0">
          <span>09:41</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 rounded font-bold border border-emerald-500/20">LTE</span>
            <div className="w-5 h-2.5 border border-neutral-700 rounded-sm p-0.5 flex">
              <div className="w-full h-full bg-neutral-300 rounded-xs"></div>
            </div>
          </div>
        </div>

        {currentUser ? (
          <>
            {/* Mobile Brand Header with User Profile Dropdown Button */}
            <div className="bg-neutral-950 px-4 pb-3 pt-1 border-b border-neutral-900/60 shrink-0 z-30" id="mobile-brand-row">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => onTabChange('home')}
                  className="flex items-center space-x-1.5 text-left cursor-pointer group hover:scale-[1.02] transition-transform duration-300 animate-in fade-in"
                  id="mobile-unified-logo-link"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded bg-neutral-900 border border-kpcia-gold/50 shadow-md">
                    <span className="font-display font-black text-[10px] tracking-tighter bg-gradient-to-r from-kpcia-gold via-amber-200 to-kpcia-gold bg-clip-text text-transparent group-hover:brightness-110">
                      KPC
                    </span>
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[9px] font-black tracking-wider text-neutral-200 group-hover:text-kpcia-gold transition-colors">
                      한국프레스티지기업강사협회
                    </span>
                    <span className="text-[6.5px] text-neutral-500 font-mono tracking-wider uppercase font-bold">
                      KPCIA MOBILE
                    </span>
                  </div>
                </button>

                {/* Clickable Mobile User Account Button */}
                <button
                  onClick={() => setShowUserModal(true)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-kpcia-gold/40 text-neutral-200 hover:text-kpcia-gold transition-all duration-200 shadow-sm cursor-pointer"
                  id="mobile-user-trigger-btn"
                >
                  <span className="text-[9.5px] font-mono font-bold">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-2.5 h-2.5 text-neutral-500" />
                </button>
              </div>
            </div>

            {/* Scrollable Mobile Screen Content Area */}
            <div className="flex-1 bg-neutral-950 overflow-y-auto px-4 py-3.5 custom-scrollbar" id="phone-screen-scrollable">
              {currentUser.uid !== 'guest' && currentUser.isApproved === false ? (
                <div className="space-y-4 py-6 text-center animate-in fade-in" id="mobile-pending-view">
                  <div className="w-12 h-12 rounded-full bg-kpcia-gold/15 flex items-center justify-center text-kpcia-gold mx-auto border border-kpcia-gold/20 animate-pulse mt-8">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 px-2">
                    <h4 className="text-xs font-bold text-neutral-200">가입 승인 심사 진행 중</h4>
                    <p className="text-[10px] text-neutral-400 leading-relaxed">
                      안녕하세요, <strong className="text-kpcia-gold">{currentUser.name}</strong> 강사님! 현재 운영사무국의 출강 자격 승인을 대기하고 있습니다. 승인 완료 후 모바일 앱 서비스가 활성화됩니다.
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-left max-w-[280px] mx-auto text-[9px] text-neutral-400 space-y-1.5 mt-4">
                    <strong className="text-kpcia-gold block">💡 빠른 가입 승인 방법:</strong>
                    <span>PC 웹 포털로 복귀 후, 우측 상단 프로필에서 <strong>"KPCIA 운영사무국" (관리자 계정)</strong>으로 전환하여, <strong>"협회 관리자실" (Admin)</strong> 메뉴에서 승인을 완료해 주세요.</span>
                  </div>
                </div>
              ) : (
                <>
                  {activeMobileTab === 'lectures' && (
                    <div className="space-y-3.5 animate-in fade-in duration-300" id="mobile-lectures-view">
                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-neutral-200">출강 가능 강의 목록</h3>
                        <p className="text-[9px] text-neutral-500">강사님의 {currentUser.tier} 등급에 맞는 공고입니다.</p>
                      </div>

                      <div className="space-y-3 pb-4" id="mobile-lectures-list">
                        {lectures.map((l) => {
                          const isQualified = checkIsQualified(currentUser.tier, l.targetTier);
                          const hasApplied = l.applicants.includes(currentUser.uid);
                          const isMyJob = l.assignedTo === currentUser.uid;

                          return (
                            <div 
                              key={l.id} 
                              className={`p-3 rounded-xl border bg-neutral-900/60 flex flex-col justify-between space-y-2.5 hover:border-neutral-800 transition-all ${
                                isMyJob ? 'border-kpcia-gold/40 bg-kpcia-gold/5' : 'border-neutral-900'
                              }`}
                              id={`mobile-lect-${l.id}`}
                            >
                              <div className="flex justify-between items-start">
                                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                  l.targetTier === 'Prestige Elite' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/20' :
                                  l.targetTier === 'Prestige Master' ? 'bg-red-950/40 text-red-400 border border-red-800/20' :
                                  'bg-blue-950/40 text-blue-400 border border-blue-800/20'
                                }`}>
                                  {l.targetTier}
                                </span>
                                <span className="text-[8px] font-mono text-kpcia-gold">
                                  {currentUser.uid === 'guest' ? (
                                    <span className="blur-[3px] select-none opacity-50">
                                      {l.budget.toLocaleString()}원
                                    </span>
                                  ) : currentUser.isAdmin || isQualified 
                                    ? `${l.budget.toLocaleString()}원` 
                                    : '🔒 등급 상향 시 공개'}
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                <h4 className="text-xs font-bold text-neutral-200 line-clamp-1">{l.title}</h4>
                                {l.description && (
                                  <p className="text-[9px] text-neutral-400 line-clamp-2 leading-relaxed font-sans">
                                    {l.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-neutral-400 font-sans pt-0.5">
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-2.5 h-2.5 text-neutral-500 shrink-0" />
                                    <span className="truncate max-w-[120px]">{l.location}</span>
                                  </div>
                                  {l.attendees !== undefined && (
                                    <div className="flex items-center space-x-1 border-l border-neutral-800 pl-2">
                                      <Users className="w-2.5 h-2.5 text-neutral-500 shrink-0" />
                                      <span>{l.attendees}명</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-neutral-900/50">
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-[8px] text-neutral-500 font-mono">{l.date} 출강</span>
                                  <button
                                    onClick={() => downloadLectureAsTxt(l)}
                                    className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-kpcia-gold transition-colors cursor-pointer"
                                    title="메모장(TXT) 다운로드"
                                    id={`mobile-txt-down-${l.id}`}
                                  >
                                    <FileDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                {l.status === 'open' ? (
                                  isQualified ? (
                                    hasApplied ? (
                                      <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 animate-in zoom-in-95">신청완료</span>
                                    ) : (
                                      <button
                                        onClick={() => onApplyLecture(l.id)}
                                        className="text-[9px] font-bold text-kpcia-dark bg-kpcia-gold hover:bg-kpcia-gold-hover px-2.5 py-1 rounded transition-colors"
                                        id={`mobile-apply-btn-${l.id}`}
                                      >
                                        출강 신청
                                      </button>
                                    )
                                  ) : (
                                    <span className="text-[8px] text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded">등급 제한</span>
                                  )
                                ) : l.status === 'assigned' ? (
                                  isMyJob ? (
                                    <span className="text-[8px] font-bold text-kpcia-gold bg-kpcia-gold/10 px-2 py-0.5 rounded border border-kpcia-gold/20">내 강의 배정</span>
                                  ) : (
                                    <span className="text-[8px] text-neutral-500">배정완료</span>
                                  )
                                ) : (
                                  <span className="text-[8px] text-neutral-500">종료</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeMobileTab === 'programs' && (
                    <div className="space-y-3.5 animate-in fade-in duration-300" id="mobile-programs-view">
                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-neutral-200">저작권 프로그램 조회</h3>
                        <p className="text-[9px] text-neutral-500">협회 회원들의 라이선스 기획 교안입니다.</p>
                      </div>

                      <div className="space-y-2.5 pb-4" id="mobile-programs-list">
                        {programs.map((p) => (
                          <div key={p.id} className="p-3 rounded-xl border border-neutral-900 bg-neutral-900/60 space-y-1.5" id={`mobile-prog-${p.id}`}>
                            <div className="flex justify-between items-center">
                              <h4 className="text-[11px] font-bold text-neutral-200 truncate max-w-[180px]">{p.title}</h4>
                              <span className="text-[8px] text-kpcia-gold font-mono font-bold">+{p.royaltyRate.toLocaleString()} M</span>
                            </div>
                            <p className="text-[9px] text-neutral-400 line-clamp-2 leading-relaxed">{p.description}</p>
                            <div className="flex justify-between items-center text-[8px] text-neutral-500 pt-1.5 border-t border-neutral-950">
                              <span>설계자: {p.authorName}</span>
                              <span>라이선스 정식 인증</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeMobileTab === 'profile' && (
                    <div className="space-y-3.5 animate-in fade-in duration-300" id="mobile-profile-view">
                      {/* Mobile Digital Card Presentation */}
                      <div className="p-4 rounded-2xl border border-kpcia-gold/20 bg-gradient-to-br from-[#1c1a15] to-black space-y-3 shadow-lg shadow-kpcia-gold/5" id="mobile-profile-presentation">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-mono text-kpcia-gold tracking-widest uppercase">KPCIA PRESTIGE CARD</span>
                            <h3 className="text-sm font-bold text-neutral-100">{currentUser.name}</h3>
                            <p className="text-[9px] text-neutral-400 font-sans">{currentUser.profileCard?.title || 'KPCIA 전문 강사'}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] bg-kpcia-gold/10 text-kpcia-gold border border-kpcia-gold/25 px-1.5 py-0.5 rounded font-mono font-bold uppercase">{currentUser.tier.replace('Prestige ', '')}</span>
                          </div>
                        </div>

                        <div className="text-[9px] text-neutral-300 leading-normal line-clamp-3 font-sans border-t border-neutral-900 pt-2.5">
                          {currentUser.profileCard?.bio || '기업의 성장을 이끌어가는 정예 HRD 전문 강사입니다.'}
                        </div>

                        <div className="flex justify-between items-center pt-2 text-[8px] text-neutral-500 font-mono">
                          <span>{currentUser.email}</span>
                          <span>마일리지: {formatMileage(currentUser.mileage)} M</span>
                        </div>
                      </div>

                      {/* Mobile Badges List */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-neutral-300">내 배지 보관함 ({currentUser.badges.length})</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {currentUser.badges.map((b) => (
                            <div key={b.id} className="p-2 rounded-lg bg-neutral-900 border border-neutral-900 flex items-center space-x-1.5" id={`mobile-badge-${b.id}`}>
                              <div className="w-5 h-5 rounded-full bg-kpcia-gold/10 flex items-center justify-center text-[9px]">🎖️</div>
                              <span className="text-[8px] font-bold text-neutral-300 truncate">{b.title.replace(' Prestige', '')}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => onTabChange('profile')}
                        className="w-full py-2 bg-neutral-900 border border-neutral-800 hover:border-kpcia-gold/40 text-neutral-300 text-[10px] font-bold rounded-lg transition-all text-center block cursor-pointer"
                        id="mobile-edit-profile-redirect"
                      >
                        프로필 카드 수정하기 (PC 포털로 이동)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mobile Bottom Tab Navigation */}
            <div className="border-t border-neutral-900/60 bg-neutral-950 pt-2.5 pb-1 flex justify-around items-center shrink-0 z-30" id="phone-nav-bar">
              {[
                { id: 'lectures', label: '강의요청', icon: Award },
                { id: 'programs', label: '저작권', icon: BookOpen },
                { id: 'profile', label: '내정보', icon: User }
              ].map((item) => {
                const IconComp = item.icon;
                const isSel = activeMobileTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onMobileTabChange(item.id)}
                    className={`flex flex-col items-center space-y-1 transition-all cursor-pointer ${
                      isSel ? 'text-kpcia-gold scale-105' : 'text-neutral-500 hover:text-neutral-400'
                    }`}
                    id={`phone-nav-item-${item.id}`}
                  >
                    <IconComp className="w-4 h-4" />
                    <span className="text-[8px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* ==========================================================
             MOBILE LOGIN SCREEN (Inside the phone frame when currentUser is null)
             ========================================================== */
          <div className="flex-1 bg-neutral-950 flex flex-col justify-between p-5 relative z-30 overflow-y-auto custom-scrollbar" id="mobile-login-container">
            <div className="space-y-5 my-auto">
              {/* Gold Emblem Badge Logo */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-900 to-black border-2 border-kpcia-gold/55 shadow-lg shadow-kpcia-gold/10 mx-auto flex items-center justify-center">
                  <span className="font-display font-black text-xs text-kpcia-gold tracking-widest">KPC</span>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black tracking-wider text-neutral-200">한국프레스티지기업강사협회</h3>
                  <span className="text-[7.5px] text-neutral-500 font-mono tracking-widest uppercase font-bold">PRESTIGE INSTRUCTOR APP</span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleMobileLoginSubmit} className="space-y-3" id="mobile-login-form">
                {loginError && (
                  <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/30 text-[9px] text-red-400 flex items-start gap-1.5 animate-in fade-in" id="mobile-login-error">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="이메일 또는 아이디 입력"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="w-full bg-neutral-900/80 border border-neutral-800 focus:border-kpcia-gold/50 rounded-lg px-3 py-2 text-[10px] text-neutral-100 placeholder:text-neutral-500 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="비밀번호 입력"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-neutral-900/80 border border-neutral-800 focus:border-kpcia-gold/50 rounded-lg px-3 py-2 text-[10px] text-neutral-100 placeholder:text-neutral-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-[10.5px] font-black rounded-lg transition-all shadow-md shadow-kpcia-gold/5 cursor-pointer"
                >
                  로그인
                </button>
              </form>


            </div>

            {/* Guest Action */}
            <div className="text-center pt-3 border-t border-neutral-900/50">
              <button
                type="button"
                onClick={() => {
                  const guestUser: UserProfile = {
                    uid: 'guest',
                    email: 'guest@kpcia.org',
                    name: '비회원 게스트',
                    tier: 'Prestige Member',
                    mileage: 0,
                    profileCard: {
                      title: '비회원 게스트',
                      bio: '비회원 상태로 제휴 제안 및 협회 소개를 확인하는 중입니다.',
                      specialties: [],
                      career: [],
                      education: [],
                      contactEmail: 'guest@kpcia.org',
                      contactPhone: '',
                      cardTheme: 'classic'
                    },
                    badges: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isAdmin: false
                  };
                  if (onUserChange) onUserChange('guest');
                }}
                className="text-[9px] text-neutral-500 hover:text-kpcia-gold underline cursor-pointer"
              >
                비회원 게스트로 일단 둘러보기
              </button>
            </div>
          </div>
        )}

        {/* Home Button Bar at the bottom center */}
        <div className="h-4 bg-black flex justify-center items-center pb-1 shrink-0 z-30">
          <div className="w-24 h-1 bg-neutral-800 rounded-full"></div>
        </div>

        {/* ==========================================================
           INTERACTIVE POPUP DRAWER MODAL (Inside the phone frame overlay)
           ========================================================== */}
        {showUserModal && currentUser && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end animate-in fade-in duration-300" id="mobile-user-modal-overlay">
            {/* Modal Bottom Sheet Sheet */}
            <div className="bg-neutral-900 border-t border-neutral-800 rounded-t-[28px] p-4 pb-6 space-y-4 max-h-[85%] overflow-y-auto animate-in slide-in-from-bottom-20 duration-300" id="mobile-bottom-sheet">
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-1">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-kpcia-gold animate-ping"></div>
                  <h4 className="text-[11px] font-bold text-neutral-200">KPCIA 강사 회원 정보</h4>
                </div>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="p-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                  id="close-mobile-modal-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Bio Card */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-[11.5px] font-bold text-neutral-100">{currentUser.name}</h5>
                    <p className="text-[8.5px] text-neutral-400 font-mono mt-0.5">{currentUser.email}</p>
                  </div>
                  <span className="text-[7.5px] font-mono px-1.5 py-0.5 rounded bg-kpcia-gold/10 text-kpcia-gold border border-kpcia-gold/25 font-bold uppercase">
                    {currentUser.tier.replace('Prestige ', '')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-neutral-900 text-[8px] text-neutral-400 font-mono">
                  <span>보유 마일리지</span>
                  <span className="font-bold text-kpcia-gold">{formatMileage(currentUser.mileage)} M</span>
                </div>
              </div>



              {/* Actions Footer */}
              <div className="pt-2 flex gap-2">
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserModal(false);
                    }}
                    className="flex-1 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-red-400 hover:text-red-300 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    id="mobile-modal-logout-btn"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>로그아웃</span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    onTabChange('home');
                    setShowUserModal(false);
                  }}
                  className="flex-1 py-2 bg-kpcia-gold/10 hover:bg-kpcia-gold/25 border border-kpcia-gold/20 text-kpcia-gold text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  id="mobile-modal-pc-btn"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>PC 포털 이동</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
