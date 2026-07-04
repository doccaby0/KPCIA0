import React, { useState } from 'react';
import { UserProfile, LectureRequest, InstructorTier } from '../types';
import { Calendar, Clock, MapPin, Award, CheckCircle2, AlertCircle, Users, Check, Banknote, Sparkles, X } from 'lucide-react';

interface LectureBoardProps {
  currentUser: UserProfile | null;
  lectures: LectureRequest[];
  onApplyLecture: (lectureId: string) => void;
  onOpenAuthModal?: (tab: 'login' | 'register') => void;
}

export default function LectureBoard({
  currentUser,
  lectures,
  onApplyLecture,
  onOpenAuthModal
}: LectureBoardProps) {
  // Map popup states
  const [selectedMapLocation, setSelectedMapLocation] = useState<string | null>(null);
  const [selectedMapTitle, setSelectedMapTitle] = useState<string>('');

  // Tier order list to check qualification
  const tiersOrder: InstructorTier[] = [
    'Prestige Member',
    'Prestige Associate',
    'Prestige Professional',
    'Prestige Master',
    'Prestige Elite'
  ];

  const checkQualification = (userTier: InstructorTier, requiredTier: InstructorTier) => {
    const userIndex = tiersOrder.indexOf(userTier);
    const requiredIndex = tiersOrder.indexOf(requiredTier);
    return userIndex >= requiredIndex;
  };

  return (
    <div className="space-y-6" id="lecture-board-section">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5" id="board-header">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-100 font-display flex items-center gap-2">
            <Award className="w-5 h-5 text-kpcia-gold" /> 기업 교육 출강 매칭 게시판
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            운영사무국에서 접수한 강의 요청 목록입니다. 강사 등급에 따라서 출강을 신청할 수 있습니다.
          </p>
        </div>
      </div>



      {/* Lectures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="lectures-grid">
        {lectures.map((lecture) => {
          const isQualified = currentUser ? checkQualification(currentUser.tier, lecture.targetTier) : false;
          const hasApplied = currentUser ? lecture.applicants.includes(currentUser.uid) : false;
          const isAssignedToMe = currentUser ? lecture.assignedTo === currentUser.uid : false;

          // Badges rendering or labels
          const tierColors = {
            'Prestige Member': 'border-neutral-700 bg-neutral-950 text-neutral-400',
            'Prestige Associate': 'border-amber-700/40 bg-amber-950/20 text-amber-500',
            'Prestige Professional': 'border-blue-700/40 bg-blue-950/20 text-blue-400',
            'Prestige Master': 'border-red-700/40 bg-red-950/20 text-red-400',
            'Prestige Elite': 'border-emerald-700/40 bg-emerald-950/20 text-emerald-400'
          };

          return (
            <div
              key={lecture.id}
              className={`rounded-xl border bg-neutral-900/50 backdrop-blur p-5 flex flex-col justify-between hover:border-neutral-700 transition-all duration-300 relative overflow-hidden ${
                isAssignedToMe ? 'border-kpcia-gold/40 shadow-lg shadow-kpcia-gold/5' : 'border-neutral-800'
              }`}
              id={`lecture-card-${lecture.id}`}
            >
              {/* Highlight bar if assigned to me */}
              {isAssignedToMe && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-kpcia-gold" />
              )}

              {/* Card Top Information */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {/* Status Badges */}
                  <div className="flex items-center space-x-1.5">
                    {lecture.status === 'open' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20 animate-pulse">
                        신청 접수중
                      </span>
                    )}
                    {lecture.status === 'assigned' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-bold border border-blue-500/20">
                        배정 완료 ({lecture.assignedName})
                      </span>
                    )}
                    {lecture.status === 'completed' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-bold border border-neutral-700">
                        출강 종료
                      </span>
                    )}
                  </div>

                  {/* Required Tier Qualification */}
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${tierColors[lecture.targetTier]}`}>
                    {lecture.targetTier} ↑ 지원 가능
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-base text-neutral-100 tracking-tight leading-snug hover:text-kpcia-gold transition-colors">
                  {lecture.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-neutral-400 leading-relaxed font-sans line-clamp-3">
                  {lecture.description}
                </p>

                {/* Logistics */}
                <div className="grid grid-cols-2 gap-y-2.5 pt-3 border-t border-neutral-800/50 text-[11px] text-neutral-400 font-sans">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{lecture.date} ({lecture.time})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>소요시간 {lecture.duration}</span>
                  </div>
                  {lecture.attendees !== undefined && (
                    <div className="flex items-center space-x-2 col-span-2">
                      <Users className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span>수강 대상 인원: <strong className="text-neutral-200 font-mono">{lecture.attendees}명</strong></span>
                    </div>
                  )}
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMapLocation(lecture.location);
                        setSelectedMapTitle(lecture.title);
                      }}
                      className="flex items-center justify-between w-full p-2 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-850 hover:border-kpcia-gold/30 text-left transition-all duration-200 group/map cursor-pointer text-[10.5px]"
                      id={`map-trigger-${lecture.id}`}
                      title="출강 지도 위치 확인하기"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500 group-hover/map:text-kpcia-gold group-hover/map:scale-110 transition-all shrink-0" />
                        <span className="truncate font-medium text-neutral-300 group-hover/map:text-kpcia-gold underline underline-offset-2 decoration-neutral-700">
                          {lecture.location}
                        </span>
                      </div>
                      <span className="text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-400 group-hover/map:bg-kpcia-gold group-hover/map:border-kpcia-gold group-hover/map:text-kpcia-dark px-2 py-0.5 rounded font-mono font-bold shrink-0 transition-colors">
                        지도보기
                      </span>
                    </button>
                  </div>
                </div>

                {/* Associated Program Royalty Info */}
                {lecture.programId && (
                  <div className="bg-kpcia-gold/5 border border-kpcia-gold/15 rounded-lg p-2.5 flex items-center justify-between text-[11px]" id={`lecture-program-royalty-${lecture.id}`}>
                    <span className="text-neutral-300 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-kpcia-gold" /> 연계: {lecture.programTitle}
                    </span>
                    <span className="text-kpcia-gold font-mono font-bold">
                      마일리지 누적 지급: {lecture.mileageRoyalty.toLocaleString()} M
                    </span>
                  </div>
                )}
              </div>

              {/* Pricing, Applicants & Actions */}
              <div className="mt-5 pt-3.5 border-t border-neutral-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase font-mono">출강 강사료</div>
                  {!currentUser || currentUser.uid === 'guest' ? (
                    <div className="relative group/price mt-1" title="로그인 후 확인 가능합니다.">
                      <div className="text-sm font-bold text-neutral-450/40 flex items-center gap-1 font-mono select-none pointer-events-none filter blur-[4.5px]">
                        <Banknote className="w-4 h-4 text-neutral-600 shrink-0" />
                        {lecture.budget.toLocaleString()} KRW
                      </div>
                      <div className="absolute inset-y-0 left-0 flex items-center">
                        <span className="text-[9px] text-kpcia-gold/90 font-bold bg-kpcia-gold/10 border border-kpcia-gold/25 px-1.5 py-0.5 rounded shadow-sm">
                          🔒 로그인 후 공개
                        </span>
                      </div>
                    </div>
                  ) : isQualified || currentUser?.isAdmin ? (
                    <div className="text-sm font-bold text-neutral-200 flex items-center gap-1 font-mono">
                      <Banknote className="w-4 h-4 text-neutral-400" />
                      {lecture.budget.toLocaleString()} KRW
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-neutral-500 flex items-center gap-1 mt-1 font-sans" title="귀하의 등급이 자격 요건에 달하지 않아 강사료가 비공개 처리되었습니다.">
                      <span className="text-[10px]">🔒 등급제한 (비공개)</span>
                    </div>
                  )}
                </div>

                {/* Apply Actions */}
                <div id={`apply-actions-${lecture.id}`}>
                  {lecture.status === 'open' ? (
                    !currentUser || currentUser.uid === 'guest' ? (
                      <button
                        onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                        className="px-4 py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-bold rounded-lg transition-all shadow-md hover:shadow-kpcia-gold/10 cursor-pointer"
                        id={`login-to-apply-${lecture.id}`}
                      >
                        로그인 후 신청
                      </button>
                    ) : currentUser?.isAdmin ? (
                      <div className="text-xs text-neutral-500 font-mono flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>신청 강사 {lecture.applicants.length}명 대기중</span>
                      </div>
                    ) : isQualified ? (
                      hasApplied ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-neutral-800 text-neutral-400 text-xs font-bold rounded-lg border border-neutral-700 flex items-center gap-1.5 cursor-not-allowed"
                          id={`applied-btn-${lecture.id}`}
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>신청 완료</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onApplyLecture(lecture.id)}
                          className="px-4 py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-bold rounded-lg transition-all shadow-md hover:shadow-kpcia-gold/10"
                          id={`apply-btn-${lecture.id}`}
                        >
                          출강 신청하기
                        </button>
                      )
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-neutral-950 border border-neutral-800 text-neutral-500 text-xs font-bold rounded-lg cursor-not-allowed flex items-center gap-1"
                        id={`restrict-btn-${lecture.id}`}
                        title="귀하의 등급이 본 강의의 최저 자격 조건보다 낮아 지원할 수 없습니다."
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>등급 제한</span>
                      </button>
                    )
                  ) : lecture.status === 'assigned' ? (
                    isAssignedToMe ? (
                      <div className="flex items-center space-x-1.5 text-xs text-kpcia-gold font-bold bg-kpcia-gold/5 border border-kpcia-gold/15 px-3 py-1.5 rounded-lg" id={`assigned-to-me-${lecture.id}`}>
                        <CheckCircle2 className="w-4 h-4 text-kpcia-gold animate-bounce" />
                        <span>내게 배정된 강의</span>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-500 font-medium" id={`assigned-other-${lecture.id}`}>
                        출강 배정완료
                      </div>
                    )
                  ) : (
                    <div className="text-xs text-neutral-500 font-medium flex items-center gap-1" id={`completed-${lecture.id}`}>
                      <Check className="w-4 h-4 text-neutral-400" /> 출강 완료됨
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Modal */}
      {selectedMapLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-kpcia-gold flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> 출강 장소 상세 지도
                </h3>
                <p className="text-[10px] text-neutral-400 font-sans truncate max-w-md">
                  {selectedMapTitle}
                </p>
              </div>
              <button
                onClick={() => setSelectedMapLocation(null)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 space-y-1">
                <div className="text-[10px] text-neutral-500 font-mono">출강 위치 / 상세 주소</div>
                <div className="text-xs font-semibold text-neutral-200 font-sans flex items-center gap-1.5 select-all">
                  <span className="bg-kpcia-gold/10 text-kpcia-gold text-[9px] px-1.5 py-0.5 rounded border border-kpcia-gold/20 font-mono">ADDR</span>
                  {selectedMapLocation}
                </div>
              </div>

              {/* Map Iframe Container */}
              <div className="relative aspect-video rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                <iframe
                  title={`출강 주소 지도: ${selectedMapLocation}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  referrerPolicy="no-referrer"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedMapLocation)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-neutral-800 bg-neutral-950">
              <span className="text-[9px] text-neutral-500 font-sans">
                ※ 지도가 올바르게 노출되지 않을 경우 주소를 직접 복사하여 확인해주십시오.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedMapLocation)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold rounded-lg border border-neutral-700 transition-all w-full sm:w-auto"
                >
                  <MapPin className="w-3.5 h-3.5 text-kpcia-gold" />
                  <span>Google 지도 큰 화면 보기</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedMapLocation(null)}
                  className="px-4 py-1.5 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-[11px] font-extrabold rounded-lg transition-all w-full sm:w-auto cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
