import React, { useState } from 'react';
import { UserProfile, LectureRequest, EducationalProgram } from '../types';
import { useFirestore } from '../lib/firebase';
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
  FileDown,
  UserCheck
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
  onCancelApplyLecture?: (lectureId: string) => void;
  onAssignAssistant?: (lectureId: string, assistantId: string, assistantName: string) => void;
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
  onCancelApplyLecture,
  onAssignAssistant,
  onTabChange
}: AppSimulatorProps) {
  const [showUserModal, setShowUserModal] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Apply popup and View Card states for simulator
  const [applyingLecture, setApplyingLecture] = useState<LectureRequest | null>(null);
  const [viewingCardForUser, setViewingCardForUser] = useState<UserProfile | null>(null);
  const [asstSearchQuery, setAsstSearchQuery] = useState('');

  const isApprovedAuthor = currentUser && programs && programs.some(p => p.authorId === currentUser.uid && p.isApproved !== false);

  const formatMileage = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  // Check if user is qualified for a tier
  const checkIsQualified = (userTier: string, requiredTier: string) => {
    const order = ['Prestige Member', 'Prestige Associate', 'Prestige Professional', 'Prestige Master', 'Prestige Elite'];
    return order.indexOf(userTier) >= order.indexOf(requiredTier);
  };

  const downloadLectureAsExcel = (lecture: LectureRequest) => {
    const isPriceVisible = !currentUser || currentUser.uid === 'guest' 
      ? false 
      : currentUser.isAdmin || checkIsQualified(currentUser.tier, lecture.targetTier);

    const totalCost = lecture.budget + 400000;

    const htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<!--[if gte mso 9]>
<xml>
<x:ExcelWorkbook>
<x:ExcelWorksheets>
<x:ExcelWorksheet>
<x:Name>출강강의파견안내서</x:Name>
<x:WorksheetOptions>
<x:DisplayGridlines/>
</x:WorksheetOptions>
</x:ExcelWorksheet>
</x:ExcelWorksheets>
</x:ExcelWorkbook>
</xml>
<![endif]-->
<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
<style>
  table { border-collapse: collapse; font-family: 'Malgun Gothic', 'Dotum', sans-serif; }
  td { border: 1px solid #D1D5DB; padding: 10px; font-size: 11px; vertical-align: middle; }
  .header-title { background-color: #1F4E79; color: #FFFFFF; font-size: 16px; font-weight: bold; text-align: center; padding: 15px; border: 1px solid #1F4E79; }
  .section-title { background-color: #D9E1F2; color: #1F4E79; font-size: 12px; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #B4C6E7; }
  .label-cell { background-color: #F2F2F2; font-weight: bold; text-align: center; width: 120px; }
  .value-cell { text-align: left; }
  .tbl-header { background-color: #D9E1F2; font-weight: bold; text-align: center; }
  .align-center { text-align: center; }
  .align-right { text-align: right; }
  .total-row { background-color: #FFF2CC; font-weight: bold; }
  .notice-text { color: #C00000; font-weight: bold; font-size: 11px; line-height: 1.6; }
</style>
</head>
<body>
<table>
  <tr>
    <td colspan="6" class="header-title">[인사이트9교육연구소] 출강 강의 파견 안내서</td>
  </tr>
  <tr style="height: 10px;"><td colspan="6" style="border: none;"></td></tr>
  <tr>
    <td colspan="6" class="section-title">1. 기본 강의 정보</td>
  </tr>
  <tr>
    <td class="label-cell">기관명</td>
    <td colspan="5" class="value-cell">${lecture.location ? lecture.location.split(' ')[0] : '협력기관'}</td>
  </tr>
  <tr>
    <td class="label-cell">교육 일정</td>
    <td colspan="2" class="value-cell">${lecture.date}</td>
    <td class="label-cell">교육 시간</td>
    <td colspan="2" class="value-cell">${lecture.time} (총 ${lecture.duration})</td>
  </tr>
  <tr>
    <td class="label-cell">장소</td>
    <td colspan="5" class="value-cell">${lecture.location}</td>
  </tr>
  <tr>
    <td class="label-cell">교육 주제</td>
    <td colspan="5" class="value-cell">${lecture.title}</td>
  </tr>
  <tr>
    <td class="label-cell">현장 담당자</td>
    <td colspan="2" class="value-cell">${lecture.managerName || '김성진'}</td>
    <td class="label-cell">연락처</td>
    <td colspan="2" class="value-cell">${lecture.managerPhone || '010-5259-7458'}</td>
  </tr>
  <tr style="height: 10px;"><td colspan="6" style="border: none;"></td></tr>
  <tr>
    <td colspan="6" class="section-title">2. 비용 및 정산 안내</td>
  </tr>
  <tr class="tbl-header">
    <td colspan="2">항목</td>
    <td>금액 / 계산 기준</td>
    <td colspan="2">내용</td>
    <td>비고 (주의사항)</td>
  </tr>
  <tr>
    <td colspan="2" class="align-center">강사료</td>
    <td class="align-right">${isPriceVisible ? `${lecture.budget.toLocaleString()}원` : '[등급 달성시 공개]'}</td>
    <td colspan="2" class="align-center">${lecture.duration}</td>
    <td>실비 정산 가능</td>
  </tr>
  <tr>
    <td colspan="2" class="align-center">재료비</td>
    <td class="align-right">400,000원</td>
    <td colspan="2" class="align-center">20000 * 20</td>
    <td>(정원 미달 시에도 남은 재료 소진 필수)</td>
  </tr>
  <tr class="total-row">
    <td colspan="2" class="align-center">총 비용</td>
    <td class="align-right">${isPriceVisible ? `${totalCost.toLocaleString()}원` : '[등급 달성시 공개]'}</td>
    <td colspan="2" class="align-center"></td>
    <td>합계 금액</td>
  </tr>
  <tr style="height: 10px;"><td colspan="6" style="border: none;"></td></tr>
  <tr>
    <td colspan="6" class="section-title">3. 프로그램 진행 플로우 (강사 행동 요령)</td>
  </tr>
  <tr class="tbl-header">
    <td>단계</td>
    <td colspan="2">시간 및 타이밍</td>
    <td colspan="2">주요 행동 지침</td>
    <td>완료 체크</td>
  </tr>
  <tr>
    <td class="align-center">사전 준비</td>
    <td colspan="2" class="align-center">강의 시작 30분 전</td>
    <td colspan="2">현장 도착 완료 및 교육장 세팅 후 '세팅 완료 사진' 촬영 필수</td>
    <td class="align-center">[ ]</td>
  </tr>
  <tr>
    <td class="align-center">강의 진행</td>
    <td colspan="2" class="align-center">강의 중</td>
    <td colspan="2">수강생 교육 진행 및 활발한 스케치 사진(강의 중 사진) 촬영</td>
    <td class="align-center">[ ]</td>
  </tr>
  <tr>
    <td class="align-center">마무리</td>
    <td colspan="2" class="align-center">강의 종료 10분 전</td>
    <td colspan="2">프로그램 완료, 결과물 모아서 단체 사진 촬영 및 만족도 QR 조사 실시</td>
    <td class="align-center">[ ]</td>
  </tr>
  <tr>
    <td class="align-center">사후 보고</td>
    <td colspan="2" class="align-center">강의 종료 후 즉시</td>
    <td colspan="2">촬영한 모든 사진(세팅, 강의, 결과물 등)을 대표님 카카오톡으로 전송</td>
    <td class="align-center">[ ]</td>
  </tr>
  <tr style="height: 10px;"><td colspan="6" style="border: none;"></td></tr>
  <tr>
    <td colspan="6" class="section-title">4. 강의 후 행정 및 결제 처리 안내</td>
  </tr>
  <tr>
    <td colspan="2" class="label-cell">지출증빙 영수증 제출</td>
    <td colspan="4" class="value-cell">총예산 지출증빙 영수증을 사진 촬영 또는 이메일로 발송 (insight9edu@naver.com)</td>
  </tr>
  <tr>
    <td colspan="2" class="label-cell">현금영수증 발행 정보</td>
    <td colspan="4" class="value-cell">사업자 지출증빙용: 702-41-00899 (인사이트9교육연구소)</td>
  </tr>
  <tr>
    <td colspan="2" class="label-cell">현장 추가 문의 응대</td>
    <td colspan="4" class="value-cell">현장 담당자의 프로그램/강의 예산 추가 문의 시 -> '인사이트9교육연구소(본사)에 연락하시면 안내해 드립니다'로 응대</td>
  </tr>
  <tr style="height: 10px;"><td colspan="6" style="border: none;"></td></tr>
  <tr>
    <td colspan="6" class="section-title">5. 주의 및 특이사항 (필수 준수)</td>
  </tr>
  <tr>
    <td colspan="6" class="notice-text">
      • 현장 담당자에게 소속 소개 시 인사이트9교육연구소와 함께하는 협력 기관·이라고 소개해주세요.<br/>
      • 출강 전 현장 담당자와 연락하여 강의장 컨디션, 시간, 장소, 특이사항을 사전 체크해주세요.<br/>
      • 현장에서 인원 추가는 절대 불가합니다. 요청 시 '본사에서 정해진 인원으로만 진행된다'고 안내해주세요.<br/>
      • 개인/협회/공방 SNS나 블로그에 후기 PR 게시 시 '인사이트9교육연구소와 협업했다'는 내용을 꼭 기재해주세요.
    </td>
  </tr>
</table>
</body>
</html>
    `.trim();

    const element = document.createElement("a");
    const file = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `[인사이트9교육연구소]출강강의파견안내서_${lecture.title.replace(/[\s/\\:*?"<>|]/g, '_')}.xls`;
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
            {useFirestore && (
              <span className="text-[7.5px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-black border border-emerald-500/20 flex items-center gap-0.5" id="mobile-sync-status">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                SYNC
              </span>
            )}
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
              <>
                {currentUser && currentUser.uid !== 'guest' && currentUser.isApproved === false && (
                  <div className="p-3 bg-amber-950/40 border border-amber-850/50 rounded-xl text-[10px] text-amber-300 leading-normal space-y-1 my-2">
                    <p className="font-bold">⚠️ 가입 승인 대기 중 (임시 제한)</p>
                    <p className="text-[9.5px] text-neutral-400">
                      현재 운영사무국의 강사 자격 승인 심사 대기 상태입니다. 공고 조회만 가능하며, 승인 완료 후 출강 신청 등 모든 정식 기능이 활성화됩니다.
                    </p>
                  </div>
                )}
                {activeMobileTab === 'lectures' && (
                  <div className="space-y-3.5 animate-in fade-in duration-300" id="mobile-lectures-view">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-neutral-200">출강 가능 강의 목록</h3>
                      <p className="text-[9px] text-neutral-500">강사님의 {currentUser.tier} 등급에 맞는 공고입니다.</p>
                    </div>

                      <div className="space-y-3 pb-4" id="mobile-lectures-list">
                        {[...lectures]
                          .sort((a, b) => {
                            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                            return dateB - dateA;
                          })
                          .map((l) => {
                          const isQualified = checkIsQualified(currentUser.tier, l.targetTier);
                          const hasApplied = l.applicants.includes(currentUser.uid);
                          const isMyJob = l.assignedTo === currentUser.uid;

                          const isLectBlurred = currentUser.uid === 'guest' || (!currentUser.isAdmin && !isQualified);

                          return (
                            <div 
                              key={l.id} 
                              className={`p-3 rounded-xl border bg-neutral-900/60 flex flex-col justify-between space-y-2.5 hover:border-neutral-800 transition-all relative overflow-hidden ${
                                isLectBlurred ? 'border-neutral-850 bg-neutral-950/20 pointer-events-none select-none' : isMyJob ? 'border-kpcia-gold/40 bg-kpcia-gold/5' : 'border-neutral-900'
                              }`}
                              id={`mobile-lect-${l.id}`}
                            >
                              {/* Absolute Lock Overlay */}
                              {isLectBlurred && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-2 text-center z-10 pointer-events-auto select-none">
                                  <div className="p-2 bg-neutral-950/95 border border-neutral-850 rounded-lg flex flex-col items-center gap-1 shadow-xl max-w-[95%]">
                                    <span className="text-[12px] animate-bounce">🔒</span>
                                    <span className="text-[9.5px] font-extrabold text-kpcia-gold tracking-tight">
                                      {l.targetTier.replace('Prestige ', '')} 이상
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Mobile Card Content Wrapper with Blur Filter */}
                              <div className={`flex flex-col justify-between h-full space-y-2.5 ${isLectBlurred ? "blur-[6px] select-none pointer-events-none" : ""}`}>
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
                                      onClick={() => downloadLectureAsExcel(l)}
                                      className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-kpcia-gold transition-colors cursor-pointer"
                                      title="출강 강의 파견 안내서(변경 강의 요청서) 다운로드"
                                      id={`mobile-xls-down-${l.id}`}
                                    >
                                      <FileDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  {l.status === 'open' ? (
                                    isQualified ? (
                                      hasApplied ? (
                                        <button
                                          onClick={() => onCancelApplyLecture && onCancelApplyLecture(l.id)}
                                          className="text-[9px] font-bold text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 px-2 py-0.5 rounded transition-colors cursor-pointer"
                                          id={`mobile-cancel-apply-btn-${l.id}`}
                                        >
                                          신청 취소
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => setApplyingLecture(l)}
                                          className="text-[9px] font-bold text-kpcia-dark bg-kpcia-gold hover:bg-kpcia-gold-hover px-2.5 py-1 rounded transition-colors cursor-pointer"
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
                              <span className="text-[8px] text-kpcia-gold font-mono font-bold">총 출강비의 5%</span>
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
                          {isApprovedAuthor && (
                            <span>사용료(로열티): {formatMileage(currentUser.mileage)} M</span>
                          )}
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
              </div>

            {/* Mobile Bottom Tab Navigation */}
            <div className="border-t border-neutral-900/60 bg-neutral-950 py-3.5 flex justify-around items-center shrink-0 z-30" id="phone-nav-bar">
              {[
                { id: 'lectures', label: '강의요청', icon: Award },
                { id: 'programs', label: '저작권', icon: BookOpen },
                { id: 'profile', label: '내정보', icon: User }
              ].filter(item => {
                if (currentUser && currentUser.uid !== 'guest' && currentUser.isApproved === false) {
                  return item.id === 'lectures';
                }
                return true;
              }).map((item) => {
                const IconComp = item.icon;
                const isSel = activeMobileTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onMobileTabChange(item.id)}
                    className={`p-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSel ? 'text-kpcia-gold scale-110 bg-kpcia-gold/10' : 'text-neutral-500 hover:text-neutral-400'
                    }`}
                    id={`phone-nav-item-${item.id}`}
                    title={item.label}
                  >
                    <IconComp className="w-5 h-5" />
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
                
                {isApprovedAuthor && (
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-900 text-[8px] text-neutral-400 font-mono">
                    <span>보유 프로그램 사용료(로열티)</span>
                    <span className="font-bold text-kpcia-gold">{formatMileage(currentUser.mileage)} M</span>
                  </div>
                )}
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

      {/* Assistant Matching Popup during Lecture Application on Mobile Simulator */}
      {applyingLecture && (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col justify-end animate-in fade-in slide-in-from-bottom duration-200">
          <div className="bg-neutral-900 border-t border-neutral-800 rounded-t-3xl max-h-[85%] flex flex-col text-left">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-850">
              <div>
                <h3 className="text-xs font-bold text-kpcia-gold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-kpcia-gold" /> 보조강사 동행 매칭
                </h3>
                <div className="flex flex-col gap-0.5 mt-1">
                  <span className="text-[9px] text-neutral-450 block truncate max-w-[240px]">
                    신청 강의: {applyingLecture.title}
                  </span>
                  <span className="text-[8px] self-start px-1.5 py-0.2 rounded bg-kpcia-gold/15 text-kpcia-gold border border-kpcia-gold/20 font-bold font-mono">
                    🛡️ 지원 자격: {applyingLecture.targetTier} ↑
                  </span>
                </div>
              </div>
              <button
                onClick={() => setApplyingLecture(null)}
                className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <p className="text-[9.5px] text-neutral-400 leading-relaxed bg-neutral-950 p-2.5 rounded border border-neutral-850">
                실습 성장을 희망하는 Prestige Member 등급의 보조 강사를 지정하여 동행할 수 있습니다. 
              </p>

              {/* Search input for mobile */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 보조강사 이름, 활동 지역, 전문분야 검색..."
                  value={asstSearchQuery}
                  onChange={(e) => setAsstSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[10px] font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                  id="mobile-asst-search-input"
                />
              </div>

              <div className="space-y-2.5">
                {(() => {
                  const filteredList = (allUsers || [])
                    .filter(u => u.tier === 'Prestige Member' && !u.isAdmin && u.isApproved !== false)
                    .filter(u => {
                      if (!asstSearchQuery.trim()) return true;
                      const query = asstSearchQuery.toLowerCase();
                      const nameMatch = u.name?.toLowerCase().includes(query);
                      const regionMatch = u.profileCard?.region?.toLowerCase().includes(query);
                      const titleMatch = u.profileCard?.title?.toLowerCase().includes(query);
                      const specMatch = u.profileCard?.specialties?.some(s => s.toLowerCase().includes(query));
                      return nameMatch || regionMatch || titleMatch || specMatch;
                    });

                  if (filteredList.length === 0) {
                    return (
                      <div className="text-center py-6 text-xs text-neutral-500">
                        검색 조건에 부합하는 보조강사가 존재하지 않습니다.
                      </div>
                    );
                  }

                  return filteredList.map((asst) => (
                    <div key={asst.uid} className="p-3 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-2 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded bg-neutral-900 overflow-hidden shrink-0 flex items-center justify-center border border-neutral-800">
                            {asst.profileCard?.imageUrl ? (
                              <img src={asst.profileCard.imageUrl} alt={asst.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <User className="w-4 h-4 text-neutral-500" />
                            )}
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-neutral-200">{asst.name}</div>
                            <span className="text-[8px] text-neutral-500 font-mono block">{asst.profileCard?.title || 'KPCIA 보조강사'}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setViewingCardForUser(asst)}
                          className="px-2 py-0.5 rounded bg-kpcia-gold/15 text-kpcia-gold text-[8px] font-bold border border-kpcia-gold/20 cursor-pointer"
                        >
                          카드 정보
                        </button>
                      </div>

                      <div className="text-[8.5px] text-neutral-400 space-y-0.5 bg-neutral-950 p-1.5 rounded border border-neutral-900/60 font-mono">
                        <div>📞 {asst.profileCard?.contactPhone || '010-5259-7458'}</div>
                        <div className="truncate">📧 {asst.profileCard?.contactEmail || asst.email}</div>
                        <div>📍 {asst.profileCard?.region || '서울'}</div>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          onApplyLecture(applyingLecture.id);
                          if (onAssignAssistant) {
                            onAssignAssistant(applyingLecture.id, asst.uid, asst.name);
                          }
                          setApplyingLecture(null);
                        }}
                        className="w-full py-1 bg-neutral-900 hover:bg-neutral-850 text-kpcia-gold text-[8.5px] font-bold rounded border border-kpcia-gold/20 cursor-pointer"
                      >
                        🤝 {asst.name} 지정 및 신청
                      </button>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-neutral-850 bg-neutral-950 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  onApplyLecture(applyingLecture.id);
                  setApplyingLecture(null);
                }}
                className="w-full py-2 bg-kpcia-gold text-kpcia-dark text-[10px] font-bold rounded-lg cursor-pointer"
              >
                🚀 보조강사 동행 없이 단독 출강 신청
              </button>
              <button
                type="button"
                onClick={() => setApplyingLecture(null)}
                className="w-full py-2 bg-neutral-900 text-neutral-400 text-[10px] font-bold rounded-lg border border-neutral-800 cursor-pointer"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Card Full Dialog on Mobile */}
      {viewingCardForUser && (() => {
        const themeStyles = {
          classic: { bg: 'bg-gradient-to-br from-[#1c1d1f] to-[#0e0f10]', border: 'border-neutral-700', textAccent: 'text-neutral-300' },
          gold_luxury: { bg: 'bg-gradient-to-br from-[#1c1a15] to-[#0a0907]', border: 'border-kpcia-gold/30', textAccent: 'text-kpcia-gold' },
          midnight_sapphire: { bg: 'bg-gradient-to-br from-[#0f172a] to-[#030712]', border: 'border-blue-900/40', textAccent: 'text-blue-400' },
          elite_emerald: { bg: 'bg-gradient-to-br from-[#064e3b] to-[#022c22]', border: 'border-emerald-800/40', textAccent: 'text-emerald-400' }
        };

        const uCard = viewingCardForUser.profileCard || {};
        const uTheme = uCard.cardTheme || 'classic';
        const selectedStyle = themeStyles[uTheme] || themeStyles.classic;

        return (
          <div className="absolute inset-0 z-[110] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-[320px] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-left">
              <div className="flex items-center justify-between p-3 border-b border-neutral-850 bg-neutral-950">
                <span className="text-[9px] font-bold text-kpcia-gold">
                  {viewingCardForUser.name} 강사 카드
                </span>
                <button
                  onClick={() => setViewingCardForUser(null)}
                  className="p-1 rounded bg-neutral-900 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 flex justify-center bg-neutral-950/40">
                <div className={`w-full max-w-[280px] aspect-[1.586/1] rounded-xl border ${selectedStyle.border} ${selectedStyle.bg} p-3.5 relative overflow-hidden flex flex-col justify-between`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.03),transparent)] pointer-events-none" />
                  
                  {/* Top */}
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-neutral-950 overflow-hidden flex items-center justify-center border border-neutral-850">
                        {uCard.imageUrl ? (
                          <img src={uCard.imageUrl} alt={viewingCardForUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="w-3 h-3 text-neutral-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-[9px] font-bold text-neutral-100">{viewingCardForUser.name}</h4>
                        <span className={`text-[6.5px] block font-medium ${selectedStyle.textAccent}`}>{uCard.title || 'KPCIA 보조강사'}</span>
                      </div>
                    </div>

                    <span className="text-[6px] border border-kpcia-gold/30 rounded px-1 py-0.2 bg-kpcia-gold/5 font-mono text-kpcia-gold uppercase leading-none">
                      {viewingCardForUser.tier}
                    </span>
                  </div>

                  {/* Middle */}
                  <p className="text-[7.5px] text-neutral-350 leading-relaxed font-sans line-clamp-2 my-1.5">
                    {uCard.bio || '기업의 미래 인재 육성을 지원하는 전문 KPCIA 강사입니다.'}
                  </p>

                  {/* Bottom */}
                  <div className="flex items-center justify-between text-[7px] font-mono text-neutral-400">
                    <span className="truncate max-w-[120px]">{uCard.contactEmail || viewingCardForUser.email}</span>
                    <span>{uCard.contactPhone || '010-XXXX-XXXX'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-neutral-850 bg-neutral-950 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingCardForUser(null)}
                  className="px-3 py-1 bg-kpcia-gold text-kpcia-dark text-[9px] font-bold rounded cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
