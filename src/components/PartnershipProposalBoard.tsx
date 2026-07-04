import React, { useState } from 'react';
import { UserProfile, PartnershipProposal } from '../types';
import { Handshake, Send, CheckCircle, Clock, AlertCircle, FileText, Sparkles, Building, Phone, Mail, User } from 'lucide-react';

interface PartnershipProposalBoardProps {
  currentUser: UserProfile;
  proposals: PartnershipProposal[];
  onSubmitProposal: (proposalData: any) => void;
}

export default function PartnershipProposalBoard({
  currentUser,
  proposals,
  onSubmitProposal
}: PartnershipProposalBoardProps) {
  const [showForm, setShowForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [proposerName, setProposerName] = useState(currentUser.uid === 'guest' ? '' : (currentUser.name || ''));
  const [email, setEmail] = useState(currentUser.uid === 'guest' ? '' : (currentUser.email || ''));
  const [phone, setPhone] = useState(currentUser.uid === 'guest' ? '' : (currentUser.profileCard?.contactPhone || ''));
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !proposerName || !email || !title || !content) return;

    onSubmitProposal({
      companyName,
      proposerName,
      email,
      phone,
      title,
      content
    });

    // Reset Form
    setCompanyName('');
    setTitle('');
    setContent('');
    setIsSubmittedSuccessfully(true);
    setTimeout(() => {
      setIsSubmittedSuccessfully(false);
      setShowForm(false);
    }, 3000);
  };

  // Filter proposals submitted by the current user or show relevant ones
  const userProposals = proposals.filter(p => p.email === currentUser.email);

  return (
    <div className="space-y-8" id="partnership-proposal-section">
      {/* Introduction Hero Card */}
      <div className="bg-gradient-to-r from-neutral-900 via-kpcia-dark to-neutral-900 border border-kpcia-gold/30 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6" id="proposal-hero">
        <div className="space-y-2 max-w-xl text-left">
          <span className="text-[10px] font-mono tracking-widest font-bold text-kpcia-gold uppercase bg-kpcia-gold/5 border border-kpcia-gold/15 px-2.5 py-1 rounded inline-block">
            KPCIA ENTERPRISE PARTNERSHIP
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100 font-display flex items-center gap-2">
            <Handshake className="w-6 h-6 text-kpcia-gold" /> KPCIA 공식 기업 제휴 및 교육 협력 제안처
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans">
            대기업 교육 연수 MOU, 지자체 공직자 정기 위탁 교육, 정예 자격 검정 협력, 강사 파견 계약 및 세미나 후원 등 다각적인 상생 비즈니스 모델을 협회 본部に 정식 제안해 주십시오. 등급 위원회 및 이사회가 상시 성실하게 심사하여 연락 드립니다.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-3 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-kpcia-gold/10 shrink-0 flex items-center gap-1.5 cursor-pointer"
          id="toggle-proposal-form-btn"
        >
          <Sparkles className="w-4 h-4" />
          <span>신규 제휴 협력 제안하기</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="proposal-layout">
        {/* Left: Form or Guideline */}
        <div className={`${currentUser.isAdmin ? 'lg:col-span-7' : 'lg:col-span-12 max-w-4xl mx-auto w-full'} space-y-6`}>
          {showForm ? (
            <div className="bg-neutral-900 border border-kpcia-gold/30 rounded-2xl p-6 relative overflow-hidden" id="proposal-form-container">
              {isSubmittedSuccessfully ? (
                <div className="py-12 text-center space-y-4 animate-in fade-in duration-300">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 flex items-center justify-center mx-auto text-xl">
                    ✓
                  </div>
                  <h3 className="font-display font-bold text-neutral-100 text-sm">제휴 제안서 정상 접수 완료</h3>
                  <p className="text-xs text-neutral-400 font-sans max-w-xs mx-auto leading-relaxed">
                    작성하신 협력 제안서가 비영리 한국프레스티지기업강사협회(KPCIA) 기획운영사무국 데이터베이스에 등록되었습니다. 검토 후 신속히 연락 드리겠습니다.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 font-sans text-left">
                  <div className="border-b border-neutral-800 pb-3">
                    <h3 className="font-display font-bold text-sm text-kpcia-gold flex items-center gap-1.5">
                      <Send className="w-4 h-4" /> 공식 비즈니스 제휴 제안서 작성
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-kpcia-gold" /> 제안 기관 / 회사명 <span className="text-kpcia-gold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="예: 삼성전자 상생협력센터"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-kpcia-gold" /> 제안자 성명 <span className="text-kpcia-gold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="예: 홍길동 팀장"
                        value={proposerName}
                        onChange={(e) => setProposerName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-kpcia-gold" /> 회신받을 이메일 주소 <span className="text-kpcia-gold">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="contact@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-kpcia-gold" /> 대표 연락처
                      </label>
                      <input
                        type="tel"
                        placeholder="010-1234-5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-kpcia-gold" /> 제안서 제목 <span className="text-kpcia-gold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="제휴 및 강사 매칭 위탁 건의 핵심 요약 제목을 입력하십시오."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      상세 제안서 내용 및 비즈니스 개요 <span className="text-kpcia-gold">*</span>
                    </label>
                    <textarea
                      required
                      rows={6}
                      placeholder="협력의 구체적인 내용, 예산 규모, 일시, 희망하는 강사 요건(등급) 및 기대 효과를 자세히 기술하여 주십시오. 검토 위원회 심사 속도가 빨라집니다."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none resize-none font-sans"
                    />
                  </div>

                  <div className="flex space-x-2 pt-2 border-t border-neutral-800/60">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-bold rounded-lg transition-all"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-extrabold rounded-lg transition-all shadow-md shadow-kpcia-gold/15"
                    >
                      제안서 제출하기
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Custom Partnership Info guidelines block */
            <div className="space-y-6" id="proposal-guidelines">
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4 text-left">
                <h3 className="font-display font-bold text-sm text-neutral-200 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-kpcia-gold" /> 기업 교육 파트너십 상생 혜택
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800/60 space-y-1.5">
                    <h4 className="font-bold text-kpcia-gold">검증된 최고 등급 강사진 배정</h4>
                    <p className="text-[11px] text-neutral-400 leading-normal">
                      KPCIA의 엄격한 심사를 통과한 Prestige Elite 및 Master급 명품 강사진을 기업에 매칭하여 최고의 만족도를 보장합니다.
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800/60 space-y-1.5">
                    <h4 className="font-bold text-kpcia-gold">독창적 명품 교육과정 제휴</h4>
                    <p className="text-[11px] text-neutral-400 leading-normal">
                      독창성과 교육 효과가 검증된 공인 기획 프로그램을 당사 기업 실정에 맞춰 커스터마이징하여 제공받을 수 있습니다.
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800/60 space-y-1.5">
                    <h4 className="font-bold text-kpcia-gold">투명한 마일리지 누적 정산</h4>
                    <p className="text-[11px] text-neutral-400 leading-normal">
                      협회 전용 디지털 원장 및 에스크로 제도를 적용하여 출강 성료 시 강사와 콘텐츠 원작자에게 정확히 정산 지급됩니다.
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800/60 space-y-1.5">
                    <h4 className="font-bold text-kpcia-gold">지자체 및 공공 위탁 교육 우대</h4>
                    <p className="text-[11px] text-neutral-400 leading-normal">
                      비영리 민간 단체 세무 혜택 및 지방 정부 혁신 교육 파트너십 예산을 통해 합리적이고 신뢰도 높은 예산 처리가 가능합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 border border-neutral-800 bg-neutral-900/10 rounded-xl space-y-3 text-left">
                <h4 className="text-xs font-bold text-neutral-300 font-display flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-kpcia-gold" /> 제휴 검토 위원회 심사 절차 안내
                </h4>
                <div className="relative pl-4 border-l border-neutral-800 space-y-4 text-xs font-sans">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 w-2 h-2 rounded-full bg-kpcia-gold" />
                    <strong className="text-neutral-200">1단계: 제안 접수</strong>
                    <p className="text-[11px] text-neutral-400 mt-0.5">상단 [신규 제휴 협력 제안하기] 폼을 작성해 제출하면 즉시 운영국에 배정됩니다.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 w-2 h-2 rounded-full bg-neutral-700" />
                    <strong className="text-neutral-200">2단계: 등급 위원회 적합성 검토</strong>
                    <p className="text-[11px] text-neutral-400 mt-0.5">요청한 강사 요건과 등급(Prestige), 교안 마일리지 누적 등을 고려해 실무 담당자가 매칭 후보군을 필터링합니다.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 w-2 h-2 rounded-full bg-neutral-700" />
                    <strong className="text-neutral-200">3단계: 최종 통보 및 계약</strong>
                    <p className="text-[11px] text-neutral-400 mt-0.5">검토 개시 후 최대 3영업일 이내에 담당자에게 유선 및 이메일로 공식 심사 결과를 안내 드립니다.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: User's submitted proposals list - Only viewable by Administration (운영사무국/Admin) */}
        {currentUser.isAdmin && (
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5" id="my-proposals-history">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-kpcia-gold flex items-center gap-1.5 mb-4 border-b border-neutral-800/80 pb-2">
                <Clock className="w-4 h-4 text-kpcia-gold" /> 전체 제휴 제안 접수 내역 (운영사무국 전용)
              </h3>

              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {proposals.length === 0 ? (
                  <div className="text-center py-12 text-xs text-neutral-500 font-sans">
                    접수된 제휴 및 협력 제안서가 없습니다.
                  </div>
                ) : (
                  proposals.map((proposal) => (
                    <div 
                      key={proposal.id} 
                      className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2.5 hover:border-neutral-700 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-neutral-500 font-mono">{proposal.id}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          proposal.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' :
                          proposal.status === 'declined' ? 'bg-red-500/10 text-red-500 border-red-500/25' :
                          proposal.status === 'reviewed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/25' :
                          'bg-amber-500/10 text-amber-500 border-amber-500/25'
                        }`}>
                          {proposal.status === 'accepted' ? '승인 완료' :
                           proposal.status === 'declined' ? '반려' :
                           proposal.status === 'reviewed' ? '검토중' : '대기중'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-neutral-200">{proposal.title}</h4>
                        <p className="text-[10px] text-neutral-400 font-sans">기관: {proposal.companyName} ({proposal.proposerName})</p>
                        <p className="text-[9px] text-neutral-500 font-sans">이메일: {proposal.email} | 연락처: {proposal.phone || '미기재'}</p>
                      </div>

                      <div className="p-2.5 bg-neutral-900 rounded text-[11px] text-neutral-300 font-sans leading-relaxed line-clamp-3">
                        {proposal.content}
                      </div>

                      <div className="text-[9px] text-neutral-500 text-right font-mono">
                        등록일: {new Date(proposal.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
