import React, { useState } from 'react';
import { UserProfile, EducationalProgram } from '../types';
import { BookOpen, Sparkles, PlusCircle, Bookmark, Award, HelpCircle, GraduationCap, CheckCircle } from 'lucide-react';

interface ProgramBoardProps {
  currentUser: UserProfile | null;
  programs: EducationalProgram[];
  onRegisterProgram: (program: any) => void;
}

export default function ProgramBoard({ currentUser, programs, onRegisterProgram }: ProgramBoardProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [curriculumInput, setCurriculumInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    // Split curriculum by newline or commas
    const curriculum = curriculumInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const newProg = {
      title,
      description,
      royaltyRate: 0, // Admin will set this upon approval
      targetAudience,
      curriculum: curriculum.length > 0 ? curriculum : ["1강: 핵심 오리엔테이션", "2강: 실전 응용 프레임워크", "3강: 종합 피드백"],
      isApproved: false // Starts as unapproved
    };

    onRegisterProgram(newProg);
    setShowForm(false);
    // Reset
    setTitle('');
    setDescription('');
    setTargetAudience('');
    setCurriculumInput('');
  };

  return (
    <div className="space-y-6" id="program-board-section">
      {/* Introduction Block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5" id="program-header">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-100 font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-kpcia-gold" /> KPCIA 공인 명품 교육 프로그램 설계처
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            협회 강사들이 직접 기획 및 개발한 정예 교육 프로그램입니다. 타 강사가 해당 프로그램을 활용해 출강 시 저작자에게 마일리지가 누적 지급됩니다.
          </p>
        </div>

        {/* Register Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-neutral-900 border border-kpcia-gold hover:border-kpcia-gold-hover text-kpcia-gold hover:text-kpcia-gold-hover text-xs font-bold rounded-lg transition-all flex items-center gap-2"
          id="toggle-add-program-btn"
        >
          <PlusCircle className="w-4 h-4" />
          <span>내 교육 프로그램 등재하기</span>
        </button>
      </div>

      {/* Program Registration Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-neutral-900 border border-kpcia-gold/30 rounded-xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300" id="program-register-form">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="font-display font-bold text-sm text-kpcia-gold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> 신규 교육 콘텐츠 저작권(마일리지 누적) 등록 요청
            </h3>
            <span className="text-[10px] text-kpcia-gold bg-kpcia-gold/5 px-2 py-0.5 rounded border border-kpcia-gold/10">
              등재 완료 시 +1,000 M 특별 축하 지원금
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono text-neutral-400 block mb-1">프로그램 정식 명칭</label>
              <input
                type="text"
                placeholder="예: 초격차 리더십 코칭 에센스"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                id="form-prog-title"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-neutral-400 block mb-1">핵심 교육 대상</label>
              <input
                type="text"
                placeholder="예: 대기업 중간 관리자, 신임 부서장"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                id="form-prog-audience"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-neutral-400 block mb-1">프로그램 기획 의도 및 개요</label>
            <input
              type="text"
              placeholder="과정의 핵심 목표와 해결하고자 하는 기업 문제를 서술하십시오."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
              id="form-prog-desc"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-neutral-400 block mb-1">커리큘럼 설계안 (줄바꿈으로 구분)</label>
            <textarea
              rows={4}
              placeholder="1강: 교육 개요 및 방향성&#10;2강: 실전 비즈니스 케이스 워크숍&#10;3강: 팀 빌딩 및 종합 피드백"
              value={curriculumInput}
              onChange={(e) => setCurriculumInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none resize-none font-mono"
              id="form-prog-curriculum"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-neutral-800 bg-neutral-950 text-neutral-400 text-xs font-bold rounded-lg hover:bg-neutral-900"
              id="form-prog-cancel"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-kpcia-gold text-kpcia-dark text-xs font-bold rounded-lg hover:bg-kpcia-gold-hover"
              id="form-prog-submit"
            >
              프로그램 협회 등재 완료
            </button>
          </div>
        </form>
      )}

      {/* Program Loyalty Info Panel */}
      <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4" id="loyalty-structure-panel">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-kpcia-gold font-display uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4" /> KPCIA 마일리지 누적 지급 구조
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl font-sans">
            협회 정식 프로그램 등재 후, 다른 회원이 해당 라이선스로 출강을 마쳤을 때, <strong>누적 마일리지(M)</strong>가 원작 설계자의 잔액으로 즉각 자동 지급되는 특허 제도를 운영하고 있습니다.
          </p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-center min-w-44" id="stat-support">
          <div className="text-lg font-mono font-bold text-kpcia-gold">100% 실시간</div>
          <p className="text-[10px] text-neutral-500 mt-0.5">정산 누락 방지 자동 트래킹</p>
        </div>
      </div>

      {/* Programs List Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-400">
          공인 완료 프로그램 ({programs.filter(p => p.isApproved !== false).length}개)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="programs-grid">
          {programs.filter(p => p.isApproved !== false).map((program) => (
            <div
              key={program.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 hover:border-neutral-700 hover:bg-neutral-900/60 transition-all duration-300 flex flex-col justify-between"
              id={`program-card-${program.id}`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-1">
                    <Bookmark className="w-4 h-4 text-kpcia-gold" />
                    <span className="text-[10px] font-mono text-neutral-500 font-bold">PROG ID: {program.id.toUpperCase()}</span>
                  </div>
                  {currentUser && program.authorId === currentUser.uid ? (
                    <span className="text-[9px] px-2 py-0.5 rounded bg-kpcia-gold/15 text-kpcia-gold font-bold border border-kpcia-gold/20">
                      내가 기획한 프로그램
                    </span>
                  ) : (
                    <span className="text-[9px] text-neutral-500 font-sans">
                      저작자: {program.authorName}
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-neutral-100 tracking-tight leading-snug">
                    {program.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans line-clamp-3">
                    {program.description}
                  </p>
                </div>

                {/* Targets */}
                <div className="text-[10px] bg-neutral-950/60 p-2 rounded border border-neutral-800/50 flex items-center space-x-2">
                  <GraduationCap className="w-3.5 h-3.5 text-kpcia-gold shrink-0" />
                  <span className="text-neutral-300 truncate">대상: {program.targetAudience}</span>
                </div>

                {/* Curriculum List */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-neutral-500 block">CURRICULUM OUTLINE</span>
                  <ul className="text-[10px] text-neutral-400 space-y-1 bg-neutral-950/30 p-2 rounded border border-neutral-800/30">
                    {program.curriculum.slice(0, 3).map((chapter, i) => (
                      <li key={i} className="truncate flex items-center gap-1 text-neutral-300">
                        <CheckCircle className="w-3 h-3 text-neutral-600 shrink-0" />
                        <span>{chapter}</span>
                      </li>
                    ))}
                    {program.curriculum.length > 3 && (
                      <li className="text-[9px] text-kpcia-gold/70 pl-4 font-mono font-bold">
                        외 {program.curriculum.length - 3}개 강좌 커리큘럼 추가 제공...
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Royalty Amount display */}
              <div className="mt-5 pt-3.5 border-t border-neutral-800/80 flex items-center justify-between" id={`program-footer-${program.id}`}>
                <div>
                  <span className="text-[9px] text-neutral-500 block font-mono">건당 지급 마일리지 누적</span>
                  <span className="text-sm font-mono font-bold text-kpcia-gold">
                    +{program.royaltyRate.toLocaleString()} M
                  </span>
                </div>
                <div className="text-[9px] text-neutral-400 font-sans">
                  KPCIA 라이선스 공인 완료
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User's Pending Programs */}
      {currentUser && programs.filter(p => p.isApproved === false && p.authorId === currentUser.uid).length > 0 && (
        <div className="pt-6 border-t border-neutral-800 space-y-4" id="pending-my-programs">
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> 저작권 등록 심사 대기 중인 내 프로그램
          </h3>
          <p className="text-[11px] text-neutral-400">
            운영사무국에서 프로그램 구성을 수정/보완 및 검토한 후, 일괄 마일리지를 측정하여 최종 확정(승인)하게 됩니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.filter(p => p.isApproved === false && p.authorId === currentUser.uid).map((program) => (
              <div
                key={program.id}
                className="rounded-xl border border-amber-500/20 bg-amber-950/5 p-5 flex flex-col justify-between"
                id={`pending-program-card-${program.id}`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-mono text-neutral-500 font-bold">PROG ID: {program.id.toUpperCase()}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                      심사 대기중
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-display font-bold text-sm text-neutral-100">
                      {program.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-3">
                      {program.description}
                    </p>
                  </div>

                  <div className="text-[10px] bg-neutral-950/60 p-2 rounded border border-neutral-800/50 flex items-center space-x-2">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-neutral-300 truncate">대상: {program.targetAudience}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-neutral-850 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-neutral-500 block font-mono">협회 심사 후 책정 예정</span>
                    <span className="text-xs font-mono font-bold text-neutral-400">
                      대기 중 (Pending)
                    </span>
                  </div>
                  <span className="text-[9px] text-neutral-500">
                    심사 프로세스 진행 중
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
