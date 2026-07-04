import React from 'react';
import { UserProfile, LectureRequest, EducationalProgram } from '../types';
import { Smartphone, MessageSquare, Award, BookOpen, User, Grid, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';

interface AppSimulatorProps {
  currentUser: UserProfile;
  lectures: LectureRequest[];
  programs: EducationalProgram[];
  activeMobileTab: string;
  onMobileTabChange: (tab: string) => void;
  onApplyLecture: (lectureId: string) => void;
  onTabChange: (tab: string) => void;
}

export default function AppSimulator({
  currentUser,
  lectures,
  programs,
  activeMobileTab,
  onMobileTabChange,
  onApplyLecture,
  onTabChange
}: AppSimulatorProps) {
  const formatMileage = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  // Check if user is qualified
  const checkIsQualified = (userTier: string, requiredTier: string) => {
    const order = ['Prestige Member', 'Prestige Associate', 'Prestige Professional', 'Prestige Master', 'Prestige Elite'];
    return order.indexOf(userTier) >= order.indexOf(requiredTier);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-6" id="app-simulator-container">
      {/* Phone Case Frame */}
      <div className="w-[360px] h-[720px] rounded-[48px] border-[12px] border-neutral-900 bg-black shadow-2xl relative overflow-hidden flex flex-col justify-between" id="smartphone-frame">
        {/* Notch / Speaker */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-neutral-900 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-12 h-1 bg-neutral-800 rounded-full mb-1"></div>
        </div>

        {/* Status Bar */}
        <div className="h-10 bg-neutral-950 px-6 pt-3 flex justify-between items-center text-[10px] text-neutral-400 font-mono select-none relative z-40">
          <span>09:41</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 rounded font-bold border border-emerald-500/20">LTE</span>
            <div className="w-5 h-2.5 border border-neutral-700 rounded-sm p-0.5 flex">
              <div className="w-full h-full bg-neutral-300 rounded-xs"></div>
            </div>
          </div>
        </div>

        {/* Mobile Screen Content Area */}
        <div className="flex-1 bg-neutral-950 overflow-y-auto px-4 py-3 relative flex flex-col justify-between" id="phone-screen-content">
          <div className="space-y-4">
            {/* Mobile Brand Header */}
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mt-1" id="mobile-brand-row">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-neutral-900 border border-kpcia-gold flex items-center justify-center">
                  <span className="text-[10px] font-bold text-kpcia-gold">K</span>
                </div>
                <span className="text-xs font-display font-bold tracking-wider text-neutral-100">KPCIA MOBILE</span>
              </div>

              {/* Mobile Badge / Mileage */}
              <div className="flex items-center space-x-1">
                <span className="text-[9px] font-mono font-bold text-kpcia-gold bg-kpcia-gold/5 px-1.5 py-0.5 rounded border border-kpcia-gold/15">
                  {currentUser.name.split(' ')[0]} {formatMileage(currentUser.mileage)}M
                </span>
              </div>
            </div>

            {/* View Switching Router */}
            {currentUser.uid !== 'guest' && currentUser.isApproved === false ? (
              <div className="space-y-4 py-8 text-center animate-in fade-in" id="mobile-pending-view">
                <div className="w-12 h-12 rounded-full bg-kpcia-gold/15 flex items-center justify-center text-kpcia-gold mx-auto border border-kpcia-gold/20 animate-pulse mt-12">
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
                  <div className="space-y-3.5" id="mobile-lectures-view">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-neutral-200">출강 가능 강의 목록</h3>
                      <p className="text-[9px] text-neutral-500">강사님의 {currentUser.tier} 등급에 맞는 공고입니다.</p>
                    </div>

                    <div className="space-y-3" id="mobile-lectures-list">
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
                              <span className="text-[8px] font-mono text-kpcia-gold">{l.budget.toLocaleString()}원</span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-neutral-200 line-clamp-1">{l.title}</h4>
                              <div className="flex items-center space-x-2 text-[9px] text-neutral-400 font-sans">
                                <MapPin className="w-2.5 h-2.5 text-neutral-500" />
                                <span className="truncate">{l.location}</span>
                              </div>
                            </div>

                            {/* Action inside simulated phone */}
                            <div className="flex items-center justify-between pt-2 border-t border-neutral-900/50">
                              <span className="text-[8px] text-neutral-500 font-mono">{l.date} 출강</span>
                              {l.status === 'open' ? (
                                isQualified ? (
                                  hasApplied ? (
                                    <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">신청완료</span>
                                  ) : (
                                    <button
                                      onClick={() => onApplyLecture(l.id)}
                                      className="text-[9px] font-bold text-kpcia-dark bg-kpcia-gold hover:bg-kpcia-gold-hover px-2.5 py-1 rounded"
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
                  <div className="space-y-3.5" id="mobile-programs-view">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-neutral-200">저작권 프로그램 조회</h3>
                      <p className="text-[9px] text-neutral-500">협회 회원들의 라이선스 기획 교안입니다.</p>
                    </div>

                    <div className="space-y-2.5" id="mobile-programs-list">
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
                  <div className="space-y-3.5" id="mobile-profile-view">
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

                    {/* Edit Button redirection */}
                    <button
                      onClick={() => onTabChange('profile')}
                      className="w-full py-2 bg-neutral-900 border border-neutral-800 hover:border-kpcia-gold/40 text-neutral-300 text-[10px] font-bold rounded-lg transition-all text-center block"
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
          <div className="border-t border-neutral-900 pt-2.5 pb-1 flex justify-around items-center" id="phone-nav-bar">
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
                  className={`flex flex-col items-center space-y-1 transition-all ${
                    isSel ? 'text-kpcia-gold' : 'text-neutral-500 hover:text-neutral-400'
                  }`}
                  id={`phone-nav-item-${item.id}`}
                >
                  <IconComp className="w-4 h-4" />
                  <span className="text-[8px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Home Button Bar at the bottom center */}
        <div className="h-4 bg-black flex justify-center items-center pb-1">
          <div className="w-24 h-1 bg-neutral-800 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
