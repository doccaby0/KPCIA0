import React, { useState } from 'react';
import { UserProfile, LectureRequest, InstructorTier } from '../types';
import { Calendar, Clock, MapPin, Award, CheckCircle2, AlertCircle, Users, User, Check, Banknote, Sparkles, X, FileDown, Mail, Phone, LayoutGrid, FileSpreadsheet, Search } from 'lucide-react';

interface LectureBoardProps {
  currentUser: UserProfile | null;
  lectures: LectureRequest[];
  onApplyLecture: (lectureId: string) => void;
  onCancelApplyLecture?: (lectureId: string) => void;
  onOpenAuthModal?: (tab: 'login' | 'register') => void;
  allUsers?: UserProfile[];
  onAssignAssistant?: (lectureId: string, assistantId: string, assistantName: string) => void;
  onEvaluateAssistant?: (lectureId: string, assistantId: string, rating: number, comment: string) => void;
  onCompleteLecture?: (lectureId: string) => void;
}

export default function LectureBoard({
  currentUser,
  lectures,
  onApplyLecture,
  onCancelApplyLecture,
  onOpenAuthModal,
  allUsers,
  onAssignAssistant,
  onEvaluateAssistant,
  onCompleteLecture
}: LectureBoardProps) {
  // View mode switcher: default to 'grid' to show the original grid first
  const [viewMode, setViewMode] = useState<'excel' | 'grid'>('grid');
  const [boardSearchQuery, setBoardSearchQuery] = useState('');

  // Map popup states
  const [selectedMapLocation, setSelectedMapLocation] = useState<string | null>(null);
  const [selectedMapTitle, setSelectedMapTitle] = useState<string>('');

  // Apply popup and View Card states
  const [applyingLecture, setApplyingLecture] = useState<LectureRequest | null>(null);
  const [viewingCardForUser, setViewingCardForUser] = useState<UserProfile | null>(null);
  const [asstSearchQuery, setAsstSearchQuery] = useState('');

  // Assistant evaluation local states
  const [evalRating, setEvalRating] = useState<{ [lectureId: string]: number }>({});
  const [evalComment, setEvalComment] = useState<{ [lectureId: string]: string }>({});

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

  const downloadLectureAsExcel = (lecture: LectureRequest) => {
    const isPriceVisible = !currentUser || currentUser.uid === 'guest' 
      ? false 
      : currentUser.isAdmin || checkQualification(currentUser.tier, lecture.targetTier);

    const mainHrs = lecture.mainHours || 0;
    const asstHrs = lecture.assistantHours || 0;
    const materialFee = lecture.materialCost || 0;
    const mainFee = mainHrs * 100000;
    const asstFee = asstHrs * 50000;
    
    const isProgramAssociated = !!lecture.programId;
    const originalTotal = lecture.budget + materialFee;
    const totalCost = isProgramAssociated 
      ? (originalTotal - Math.round(originalTotal * 0.05)) 
      : originalTotal;

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
  table { border-collapse: collapse; font-family: 'Malgun Gothic', 'Dotum', sans-serif; width: 100%; }
  td { border: 1px solid #A0AEC0; padding: 12px 14px; font-size: 11px; color: #2D3748; height: 26px; vertical-align: middle; }
  .header-title { background-color: #1A365D; color: #FFFFFF; font-size: 16px; font-weight: bold; text-align: center; padding: 18px; border: 1px solid #1A365D; }
  .section-title { background-color: #E2E8F0; color: #2B6CB0; font-size: 12px; font-weight: bold; text-align: left; padding: 10px; border: 1px solid #CBD5E0; }
  .label-cell { background-color: #F7FAFC; font-weight: bold; text-align: center; color: #4A5568; width: 130px; }
  .value-cell { text-align: left; background-color: #FFFFFF; }
  .tbl-header { background-color: #EDF2F7; font-weight: bold; text-align: center; color: #2D3748; }
  .align-center { text-align: center; }
  .align-right { text-align: right; font-family: 'Courier New', monospace; font-weight: bold; }
  .total-row { background-color: #FEFCBF; font-weight: bold; color: #975A16; }
  .notice-text { color: #C53030; font-weight: bold; font-size: 11px; line-height: 1.6; background-color: #FFF5F5; padding: 12px; }
</style>
</head>
<body>
<table>
  <colgroup>
    <col width="110" style="width: 110px;" />
    <col width="120" style="width: 120px;" />
    <col width="130" style="width: 130px;" />
    <col width="120" style="width: 120px;" />
    <col width="180" style="width: 180px;" />
    <col width="220" style="width: 220px;" />
  </colgroup>
  <tr>
    <td colspan="6" class="header-title">[인사이트9교육연구소] 출강 강의 파견 안내서</td>
  </tr>
  <tr style="height: 10px;"><td colspan="6" style="border: none; height: 10px;"></td></tr>
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
  <tr style="height: 10px;"><td colspan="6" style="border: none; height: 10px;"></td></tr>
  <tr>
    <td colspan="6" class="section-title">2. 비용 및 정산 안내</td>
  </tr>
  <tr class="tbl-header">
    <td colspan="2">항목</td>
    <td>금액</td>
    <td colspan="2">계산 기준 및 내용</td>
    <td>비고 (주의사항)</td>
  </tr>
  <tr>
    <td colspan="2" class="align-center">주강사료</td>
    <td class="align-right">${isPriceVisible ? `${mainFee.toLocaleString()}원` : '[등급 달성시 공개]'}</td>
    <td colspan="2" class="align-center">100,000원 * ${mainHrs}시간</td>
    <td>소득세 원천징수 후 지급</td>
  </tr>
  <tr>
    <td colspan="2" class="align-center">보조강사료</td>
    <td class="align-right">${isPriceVisible ? `${asstFee.toLocaleString()}원` : '[등급 달성시 공개]'}</td>
    <td colspan="2" class="align-center">50,000원 * ${asstHrs}시간</td>
    <td>배정 시간 기준 실비 지급</td>
  </tr>
  <tr>
    <td colspan="2" class="align-center">소모 재료비</td>
    <td class="align-right">${materialFee.toLocaleString()}원</td>
    <td colspan="2" class="align-center">실비 정산 (키트 및 재료)</td>
    <td>정원 미달 시에도 남은 재료 소진 필수</td>
  </tr>
  <tr class="total-row">
    <td colspan="2" class="align-center">총 정산 금액</td>
    <td class="align-right">${isPriceVisible ? `${totalCost.toLocaleString()}원` : '[등급 달성시 공개]'}</td>
    <td colspan="2" class="align-center">${isProgramAssociated ? '강사료 합계 + 재료 실비 (지정 프로그램 5% 공제)' : '강사료 합계 + 재료 실비'}</td>
    <td>지급 완료시 프로그램 사용료(로열티) 전환 가능</td>
  </tr>
  <tr style="height: 10px;"><td colspan="6" style="border: none; height: 10px;"></td></tr>
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
  <tr style="height: 10px;"><td colspan="6" style="border: none; height: 10px;"></td></tr>
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
  <tr style="height: 10px;"><td colspan="6" style="border: none; height: 10px;"></td></tr>
  <tr>
    <td colspan="6" class="section-title">5. 주의 및 특이사항 (필수 준수)</td>
  </tr>
  <tr>
    <td colspan="6" class="notice-text">
      • 현장 담당자에게 소속 소개 시 '인사이트9교육연구소와 함께하는 협력 기관'이라고 소개해주세요.<br/>
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
    const file = new Blob(["\ufeff", htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `[인사이트9교육연구소]출강강의파견안내서_${lecture.title.replace(/[\s/\\:*?"<>|]/g, '_')}.xls`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Filter and sort lectures (newest first, so newly posted/announced lectures appear at the top-left)
  const filteredLectures = lectures
    .filter((lecture) => {
      if (!boardSearchQuery.trim()) return true;
      const query = boardSearchQuery.toLowerCase();
      return (
        lecture.title.toLowerCase().includes(query) ||
        (lecture.description && lecture.description.toLowerCase().includes(query)) ||
        lecture.location.toLowerCase().includes(query) ||
        (lecture.programTitle && lecture.programTitle.toLowerCase().includes(query)) ||
        (lecture.assignedName && lecture.assignedName.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <div className="space-y-6" id="lecture-board-section">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-5" id="board-header">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-100 font-display flex items-center gap-2">
            <Award className="w-5 h-5 text-kpcia-gold" /> 기업 교육 출강 매칭 게시판
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            운영사무국에서 접수한 강의 요청 목록입니다. 강사 등급에 따라서 출강을 신청할 수 있습니다.
          </p>
        </div>

        {/* View switching and Search inputs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Live Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="강의 주제, 장소, 기획안 검색..."
              value={boardSearchQuery}
              onChange={(e) => setBoardSearchQuery(e.target.value)}
              className="pl-8 pr-7 py-1.5 w-full sm:w-56 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-kpcia-gold font-sans"
            />
            {boardSearchQuery && (
              <button
                onClick={() => setBoardSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>

          {/* Toggle buttons */}
          <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800 shrink-0">
            <button
              onClick={() => setViewMode('excel')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'excel'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-extrabold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>스마트 엑셀 표</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-neutral-850 text-kpcia-gold border border-neutral-700 font-extrabold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>일반 카드 뷰</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'excel' ? (
        /* ==================== EXCEL SPREADSHEET TABLE VIEW ==================== */
        <div className="border border-neutral-800 rounded-xl bg-neutral-900/40 backdrop-blur overflow-hidden flex flex-col" id="excel-spreadsheet-container">
          {/* Excel Title bar */}
          <div className="bg-gradient-to-r from-emerald-950/90 to-neutral-950 border-b border-neutral-800 px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-sans">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-emerald-600 rounded flex items-center justify-center text-[9px] text-neutral-100 font-extrabold font-mono">
                X
              </div>
              <div>
                <span className="font-bold text-neutral-100">KPCIA_Lecture_Matching_Ledger.xlsx</span>
                <span className="text-[10px] text-neutral-400 ml-2 font-mono"> - Read Only (대용량 연동 장부)</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-850 font-mono">
                검색된 행: {filteredLectures.length} / {lectures.length}개
              </span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold animate-pulse">
                실시간 동기화 ON
              </span>
            </div>
          </div>

          {/* Table container with horizontal scroll */}
          <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            <table className="w-full text-left border-collapse text-xs select-text min-w-[1200px]">
              <thead>
                <tr className="bg-neutral-950 text-[10px] font-mono text-neutral-500 border-b border-neutral-850">
                  <th className="w-12 px-2 py-2 border-r border-neutral-850 text-center bg-neutral-950/60 font-semibold">Row</th>
                  <th className="w-24 px-3 py-2 border-r border-neutral-850 text-center uppercase bg-neutral-950/40">A (상태)</th>
                  <th className="min-w-[280px] px-3 py-2 border-r border-neutral-850 uppercase bg-neutral-950/40">B (출강 강의 주제)</th>
                  <th className="w-36 px-3 py-2 border-r border-neutral-850 uppercase bg-neutral-950/40">C (지원 자격)</th>
                  <th className="w-48 px-3 py-2 border-r border-neutral-850 uppercase bg-neutral-950/40">D (출강 일시 및 소요시간)</th>
                  <th className="w-48 px-3 py-2 border-r border-neutral-850 uppercase bg-neutral-950/40">E (출강 장소/기관)</th>
                  <th className="w-20 px-3 py-2 border-r border-neutral-850 text-right uppercase bg-neutral-950/40 font-semibold">F (인원)</th>
                  <th className="w-36 px-3 py-2 border-r border-neutral-850 text-right uppercase bg-neutral-950/40 font-semibold">G (출강 강사료)</th>
                  <th className="w-32 px-3 py-2 border-r border-neutral-850 text-right uppercase bg-neutral-950/40 font-semibold">H (재료비 총액)</th>
                  <th className="w-36 px-3 py-2 border-r border-neutral-850 text-right uppercase bg-neutral-950/40 font-semibold">I (총 출강비)</th>
                  <th className="w-48 px-3 py-2 border-r border-neutral-850 uppercase bg-neutral-950/40">J (연계 교안)</th>
                  <th className="w-48 px-3 py-2 border-r border-neutral-850 uppercase bg-neutral-950/40">K (보조 파트너)</th>
                  <th className="w-44 px-3 py-2 text-center uppercase bg-neutral-950/40">L (행동/출강 제어)</th>
                </tr>
              </thead>
              <tbody>
                {filteredLectures.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-12 text-center text-neutral-500 italic bg-neutral-950/10 font-sans">
                      검색어 또는 필터 조건에 부합하는 대용량 출강 강의가 장부에 존재하지 않습니다.
                    </td>
                  </tr>
                ) : (
                  filteredLectures.map((lecture, idx) => {
                    const isQualified = currentUser ? checkQualification(currentUser.tier, lecture.targetTier) : false;
                    const hasApplied = currentUser ? lecture.applicants.includes(currentUser.uid) : false;
                    const isAssignedToMe = currentUser ? lecture.assignedTo === currentUser.uid : false;

                    const isProgramAssociated = !!lecture.programId;
                    const originalTotal = lecture.budget + (lecture.materialCost || 0);
                    const appliedTotalCost = isProgramAssociated ? (originalTotal - Math.round(originalTotal * 0.05)) : originalTotal;

                    const tierColors = {
                      'Prestige Member': 'border-neutral-700 bg-neutral-950 text-neutral-400',
                      'Prestige Associate': 'border-amber-700/40 bg-amber-950/20 text-amber-500',
                      'Prestige Professional': 'border-blue-700/40 bg-blue-950/20 text-blue-400',
                      'Prestige Master': 'border-red-700/40 bg-red-950/20 text-red-400',
                      'Prestige Elite': 'border-emerald-700/40 bg-emerald-950/20 text-emerald-400'
                    };

                    return (
                      <tr 
                        key={lecture.id}
                        className={`border-b border-neutral-850 hover:bg-neutral-800/40 transition-colors font-sans ${
                          isAssignedToMe ? 'bg-kpcia-gold/10' : ''
                        }`}
                      >
                        {/* Row Index */}
                        <td className="px-2 py-3.5 border-r border-neutral-850 text-center font-mono text-neutral-500 bg-neutral-950/20 select-none">
                          {idx + 1}
                        </td>

                        {/* Col A: Status */}
                        <td className="px-3 py-3.5 border-r border-neutral-850 text-center">
                          {lecture.status === 'open' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20 animate-pulse">
                              신청접수
                            </span>
                          )}
                          {lecture.status === 'assigned' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-bold border border-blue-500/20">
                              배정완료
                            </span>
                          )}
                          {lecture.status === 'completed' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-bold border border-neutral-700">
                              출강종료
                            </span>
                          )}
                        </td>

                        {/* Col B: Title & Description */}
                        <td className="px-3 py-3.5 border-r border-neutral-850">
                          <div 
                            className="font-bold text-neutral-200 hover:text-kpcia-gold hover:underline cursor-pointer flex flex-wrap items-center gap-1.5"
                            onClick={() => {
                              if (lecture.status === 'open' && isQualified && !hasApplied) {
                                setApplyingLecture(lecture);
                              }
                            }}
                          >
                            <span className="whitespace-normal break-all leading-snug">{lecture.title}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadLectureAsExcel(lecture);
                              }}
                              className="text-[9px] bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-kpcia-gold hover:border-kpcia-gold/30 px-1.5 py-0.5 rounded shrink-0 font-sans flex items-center gap-0.5"
                              title="출강 파견 안내서 엑셀 변환"
                            >
                              <FileDown className="w-2.5 h-2.5" />
                              <span>출강안내</span>
                            </button>
                          </div>
                          <div className="text-[10.5px] text-neutral-400 mt-1.5 leading-relaxed whitespace-normal break-all">
                            {lecture.description}
                          </div>
                        </td>

                        {/* Col C: Target Tier */}
                        <td className="px-3 py-3.5 border-r border-neutral-850 text-center">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border ${tierColors[lecture.targetTier]}`}>
                            {lecture.targetTier} ↑
                          </span>
                        </td>

                        {/* Col D: Date & Time */}
                        <td className="px-3 py-3.5 border-r border-neutral-850 font-mono text-[11px] text-neutral-300 leading-relaxed">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-neutral-500" />
                            <span>{lecture.date}</span>
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-500" />
                            <span>{lecture.time} ({lecture.duration})</span>
                          </div>
                        </td>

                        {/* Col E: Location */}
                        <td className="px-3 py-3.5 border-r border-neutral-850 text-[11px] text-neutral-300">
                          <div className="flex flex-col gap-1.5">
                            <span className="whitespace-normal break-all" title={lecture.location}>{lecture.location}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMapLocation(lecture.location);
                                setSelectedMapTitle(lecture.title);
                              }}
                              className="text-[9px] bg-neutral-950 border border-neutral-800 text-kpcia-gold px-1.5 py-0.5 rounded w-max hover:bg-neutral-800 transition-colors cursor-pointer"
                            >
                              지도 보기
                            </button>
                          </div>
                        </td>

                        {/* Col F: Attendees */}
                        <td className="px-3 py-3.5 border-r border-neutral-850 text-right font-mono text-neutral-200">
                          {lecture.attendees ? `${lecture.attendees}명` : '-'}
                        </td>

                        {/* Col G: Budget (출강 강사료) */}
                        <td className="px-3 py-3.5 border-r border-neutral-850 text-right font-mono font-bold bg-neutral-900/10">
                          {!currentUser || currentUser.uid === 'guest' ? (
                            <span className="text-[9px] text-kpcia-gold bg-kpcia-gold/10 px-1.5 py-0.5 rounded border border-kpcia-gold/25">
                              🔒 등급공개
                            </span>
                          ) : isQualified || currentUser?.isAdmin ? (
                            <span className="text-neutral-100">
                              ₩{lecture.budget.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-500">
                              🔒 제한 (비공개)
                            </span>
                          )}
                        </td>

                        {/* Col H: Material Cost (재료비 총액) */}
                        <td className="px-3 py-3.5 border-r border-neutral-850 text-right font-mono text-neutral-300 bg-neutral-950/20">
                          {!currentUser || currentUser.uid === 'guest' ? (
                            <span className="text-[9px] text-neutral-500">
                              비공개
                            </span>
                          ) : isQualified || currentUser?.isAdmin ? (
                            <span className="text-neutral-300">
                              ₩{(lecture.materialCost || 0).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-500">
                              🔒 비공개
                            </span>
                          )}
                        </td>

                        {/* Col I: Total Outflow (총 출강비) */}
                        <td className="px-3 py-3.5 border-r border-neutral-850 text-right font-mono font-bold text-kpcia-gold bg-kpcia-gold/10">
                          {!currentUser || currentUser.uid === 'guest' ? (
                            <span className="text-[9px] text-kpcia-gold bg-kpcia-gold/10 px-1.5 py-0.5 rounded border border-kpcia-gold/25">
                              🔒 등급공개
                            </span>
                          ) : isQualified || currentUser?.isAdmin ? (
                            <div className="flex flex-col items-end">
                              <span>
                                ₩{appliedTotalCost.toLocaleString()}
                              </span>
                              {isProgramAssociated && (
                                <span className="text-[8px] text-neutral-400 font-normal mt-0.5">
                                  (5% 공제 적용)
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-neutral-500">
                              🔒 제한 (비공개)
                            </span>
                          )}
                        </td>

                        {/* Col J: Associated Program */}
                        <td className="px-3 py-3.5 border-r border-neutral-850 text-neutral-300">
                          {lecture.programId ? (() => {
                            const originalTotal = lecture.budget + (lecture.materialCost || 0);
                            const calculatedRoyalty = Math.round(originalTotal * 0.05);
                            const royaltyToShow = lecture.mileageRoyalty || calculatedRoyalty;
                            return (
                              <div className="space-y-1">
                                <div className="font-semibold text-neutral-200 text-[11px] flex items-center gap-1 whitespace-normal break-all" title={lecture.programTitle}>
                                  <Sparkles className="w-3 h-3 text-kpcia-gold shrink-0" />
                                  <span>{lecture.programTitle}</span>
                                </div>
                                <div className="text-[10px] text-kpcia-gold font-mono font-bold">
                                  로열티: {royaltyToShow.toLocaleString()} M
                                </div>
                              </div>
                            );
                          })() : (
                            <span className="text-neutral-500 italic text-[10px]">개별 위탁</span>
                          )}
                        </td>

                        {/* Col K: Assistant Partner */}
                        <td className="px-3 py-3.5 border-r border-neutral-850 text-[11px]">
                          {(() => {
                            const assistantUser = allUsers?.find(u => u.uid === lecture.assistantId);
                            const isViewerHigherTier = currentUser && (currentUser.isAdmin || currentUser.tier !== 'Prestige Member');
                            const canAssignAssistant = currentUser && (currentUser.isAdmin || currentUser.tier !== 'Prestige Member') && isAssignedToMe;

                            if (!lecture.assistantId) {
                              if (canAssignAssistant && lecture.status === 'assigned') {
                                return (
                                  <select
                                    className="px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-200 focus:border-kpcia-gold focus:outline-none cursor-pointer max-w-[130px]"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val) {
                                        const u = allUsers?.find(usr => usr.uid === val);
                                        if (u && onAssignAssistant) {
                                          onAssignAssistant(lecture.id, u.uid, u.name);
                                        }
                                      }
                                    }}
                                    defaultValue=""
                                  >
                                    <option value="" disabled>보조강사 매칭...</option>
                                    {allUsers?.filter(u => u.tier === 'Prestige Member' && !u.isAdmin && u.isApproved !== false).map(u => (
                                      <option key={u.uid} value={u.uid}>{u.name} (출강: {u.lectureCount || 0}회)</option>
                                    ))}
                                  </select>
                                );
                              }
                              return <span className="text-neutral-500 italic text-[10px]">매칭대기</span>;
                            }

                            return (
                              <div className="space-y-1">
                                <div className="text-kpcia-gold font-bold flex items-center gap-1">
                                  <Users className="w-3 h-3 text-kpcia-gold animate-pulse" />
                                  <span>{lecture.assistantName}</span>
                                </div>
                                {isViewerHigherTier && assistantUser?.profileCard?.contactPhone && (
                                  <div className="text-[9px] text-neutral-400 font-mono">
                                    {assistantUser.profileCard.contactPhone}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        {/* Col L: Action button */}
                        <td className="px-3 py-3.5 text-center">
                          <div className="flex items-center justify-center">
                            {lecture.status === 'open' ? (
                              !currentUser || currentUser.uid === 'guest' ? (
                                <button
                                  onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                                  className="px-3 py-1 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-[10px] font-bold rounded cursor-pointer whitespace-nowrap"
                                >
                                  신청
                                </button>
                              ) : currentUser?.isAdmin ? (
                                <span className="text-[10px] text-neutral-450 font-mono">
                                  {lecture.applicants.length}명 대기
                                </span>
                              ) : isQualified ? (
                                hasApplied ? (
                                  <button
                                    onClick={() => onCancelApplyLecture && onCancelApplyLecture(lecture.id)}
                                    className="px-2 py-1 bg-red-950/45 hover:bg-red-950/60 text-red-400 border border-red-900/40 text-[10px] font-bold rounded cursor-pointer whitespace-nowrap"
                                  >
                                    취소
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setApplyingLecture(lecture)}
                                    className="px-3 py-1 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-[10px] font-bold rounded cursor-pointer whitespace-nowrap"
                                  >
                                    출강 신청
                                  </button>
                                )
                              ) : (
                                <button
                                  disabled
                                  className="px-2 py-1 bg-neutral-950 border border-neutral-800 text-neutral-500 text-[10px] font-bold rounded cursor-not-allowed whitespace-nowrap"
                                  title="최저 자격 미달"
                                >
                                  등급제한
                                </button>
                              )
                            ) : lecture.status === 'assigned' ? (
                              isAssignedToMe ? (
                                <div className="flex flex-col gap-1 items-center">
                                  <span className="text-[9px] text-kpcia-gold font-bold">배정완료</span>
                                  {onCompleteLecture && (
                                    <button
                                      onClick={() => {
                                        if (window.confirm("본 출강 강의를 완전히 완료(종료) 처리하시겠습니까? 완료 후 동행 보조강사의 실습 평점 및 피드백을 즉시 입력하실 수 있습니다.")) {
                                          onCompleteLecture(lecture.id);
                                        }
                                      }}
                                      className="px-2 py-0.5 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-[9px] font-extrabold rounded cursor-pointer whitespace-nowrap"
                                    >
                                      종료처리
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-neutral-500 text-[10.5px]">배정완료</span>
                              )
                            ) : (
                              <span className="text-neutral-500 text-[10.5px] flex items-center gap-0.5 justify-center">
                                <Check className="w-3.5 h-3.5" /> 완료됨
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Excel Footer layout mockup */}
          <div className="bg-neutral-950 border-t border-neutral-800 px-4 py-2 flex items-center justify-between text-[11px] font-sans text-neutral-400 select-none">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono text-neutral-500">READY</span>
              <div className="h-3 w-px bg-neutral-800 mx-1" />
              <div className="flex bg-neutral-900 border border-neutral-800 rounded px-2 py-0.5 text-kpcia-gold font-extrabold text-[10px] cursor-default">
                📋 출강공고장부 (Sheet1)
              </div>
              <div className="px-2 py-0.5 hover:bg-neutral-900 rounded text-neutral-500 text-[10px] cursor-pointer">
                정산대기목록 (Sheet2)
              </div>
              <div className="px-2 py-0.5 hover:bg-neutral-900 rounded text-neutral-500 text-[10px] cursor-pointer">
                +
              </div>
            </div>
            <div className="text-[10px] text-neutral-500 font-mono hidden sm:block">
              Excel Engine v12.4 • Zoom 100% • Auto-synchronized
            </div>
          </div>
        </div>
      ) : (
        /* ==================== CLASSIC GRID CARD VIEW ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="lectures-grid">
          {filteredLectures.map((lecture) => {
            const isQualified = currentUser ? checkQualification(currentUser.tier, lecture.targetTier) : false;
            const hasApplied = currentUser ? lecture.applicants.includes(currentUser.uid) : false;
            const isAssignedToMe = currentUser ? lecture.assignedTo === currentUser.uid : false;

            const isProgramAssociated = !!lecture.programId;
            const originalTotal = lecture.budget + (lecture.materialCost || 0);
            const appliedTotalCost = isProgramAssociated ? (originalTotal - Math.round(originalTotal * 0.05)) : originalTotal;

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
                    <div className="flex items-center space-x-2">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${tierColors[lecture.targetTier]}`}>
                        {lecture.targetTier} ↑ 지원 가능
                      </span>
                    </div>
                  </div>

                  {/* Title & info buttons */}
                  <div className="flex items-start justify-between gap-1.5">
                    <h3 className="font-display font-bold text-base text-neutral-100 tracking-tight leading-snug hover:text-kpcia-gold transition-colors">
                      {lecture.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => downloadLectureAsExcel(lecture)}
                      className="text-[9px] bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-kpcia-gold hover:border-kpcia-gold/30 px-2 py-1 rounded shrink-0 font-sans flex items-center gap-1"
                      title="출강 파견 안내서 엑셀 변환 및 다운로드"
                    >
                      <FileDown className="w-3 h-3 text-neutral-400" />
                      <span>출강표</span>
                    </button>
                  </div>

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
                  {lecture.programId && (() => {
                    const originalTotal = lecture.budget + (lecture.materialCost || 0);
                    const calculatedRoyalty = Math.round(originalTotal * 0.05);
                    const royaltyToShow = lecture.mileageRoyalty || calculatedRoyalty;
                    return (
                      <div className="bg-kpcia-gold/5 border border-kpcia-gold/15 rounded-lg p-2.5 flex items-center justify-between text-[11px]" id={`lecture-program-royalty-${lecture.id}`}>
                        <span className="text-neutral-300 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-kpcia-gold" /> 연계: {lecture.programTitle}
                        </span>
                        <span className="text-kpcia-gold font-mono font-bold">
                          로열티: {royaltyToShow.toLocaleString()} M
                        </span>
                      </div>
                    );
                  })()}

                  {/* Assistant Instructor Matching & Feedback Panel */}
                  {(lecture.status === 'assigned' || lecture.status === 'completed') && (() => {
                    const assistantUser = allUsers?.find(u => u.uid === lecture.assistantId);
                    const isViewerHigherTier = currentUser && (currentUser.isAdmin || currentUser.tier !== 'Prestige Member');
                    
                    // Only high tier users (Prestige Associate+) are allowed to assign/bring assistant instructors (Prestige Member)
                    const canAssignAssistant = currentUser && (currentUser.isAdmin || currentUser.tier !== 'Prestige Member') && isAssignedToMe;

                    if (!lecture.assistantId) {
                      if (canAssignAssistant && lecture.status === 'assigned') {
                        return (
                          <div className="mt-3.5 p-3 rounded-lg bg-neutral-950/40 border border-neutral-800 space-y-2 text-left" id={`asst-match-${lecture.id}`}>
                            <div className="text-[10px] font-bold text-neutral-300 flex items-center gap-1.5 uppercase font-sans tracking-wide">
                              <Users className="w-3.5 h-3.5 text-kpcia-gold" />
                              보조강사 매칭 (Prestige Member 동행 신청)
                            </div>
                            <p className="text-[9.5px] text-neutral-400 font-sans leading-relaxed">
                              본 출강에 보조강사(Prestige Member)를 동행 지정할 수 있습니다. 동행 후 위원님께서 직접 평가 및 출강 실적(1회)을 인정해 주실 수 있습니다.
                            </p>
                            <select
                              id={`select-asst-${lecture.id}`}
                              className="w-full px-2.5 py-1.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-200 focus:border-kpcia-gold focus:outline-none cursor-pointer"
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val) {
                                  const u = allUsers?.find(usr => usr.uid === val);
                                  if (u && onAssignAssistant) {
                                    onAssignAssistant(lecture.id, u.uid, u.name);
                                  }
                                }
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled>보조강사(Prestige Member) 선택하기...</option>
                              {allUsers?.filter(u => u.tier === 'Prestige Member' && !u.isAdmin && u.isApproved !== false).map(u => (
                                <option key={u.uid} value={u.uid}>{u.name} (출강: {u.lectureCount || 0}회 | 평점: {u.averageRating?.toFixed(1) || '0.0'}점)</option>
                              ))}
                            </select>
                          </div>
                        );
                      }
                      return null;
                    }

                    return (
                      <div className="mt-3.5 p-3 rounded-lg bg-neutral-950/45 border border-kpcia-gold/15 space-y-3 text-left" id={`asst-details-${lecture.id}`}>
                        <div className="flex items-center justify-between border-b border-neutral-850 pb-1.5">
                          <span className="text-[10.5px] font-bold text-kpcia-gold flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-kpcia-gold animate-pulse" />
                            동행 보조강사: {lecture.assistantName}
                          </span>
                          <span className="text-[8.5px] bg-neutral-900 border border-neutral-800 text-neutral-450 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                            PARTNER
                          </span>
                        </div>

                        {/* Contact Phone & Region - Restricted to Upper Tiers */}
                        <div className="text-[10.5px] space-y-1 text-neutral-350 bg-neutral-900/60 p-2.5 rounded border border-neutral-850/40">
                          {isViewerHigherTier ? (
                            <div className="grid grid-cols-2 gap-2 font-sans text-[10px]">
                              <div>
                                <span className="text-neutral-500 block text-[9px] uppercase font-mono">📍 활동 지역</span>
                                <strong className="text-neutral-200">{assistantUser?.profileCard?.region || '서울'}</strong>
                              </div>
                              <div>
                                <span className="text-neutral-500 block text-[9px] uppercase font-mono">📞 비상 연락처</span>
                                <strong className="text-neutral-200">{assistantUser?.profileCard?.contactPhone || '미등록'}</strong>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[9px] text-neutral-450 italic text-center flex items-center justify-center gap-1 py-0.5">
                              <span>🔒 보조강사 개인연락처/지역은 상위 등급 권한자만 열람 가능합니다.</span>
                            </div>
                          )}
                        </div>

                        {/* Evaluation Panel */}
                        {isAssignedToMe && (
                          <div className="pt-2 border-t border-neutral-850 space-y-2 text-left">
                            {lecture.status !== 'completed' ? (
                              <div className="text-[10px] text-neutral-400 italic bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-850/60 text-center flex items-center justify-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-kpcia-gold animate-pulse shrink-0" />
                                <span>⏰ 본 출강 강의 완료(종료) 처리 후 보조강사 실무 평가가 활성화됩니다.</span>
                              </div>
                            ) : lecture.assistantEvaluated ? (
                              <div className="flex items-center justify-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-2.5 rounded-lg text-emerald-400 text-[10.5px] font-bold font-sans">
                                <Check className="w-3.5 h-3.5" />
                                <span>보조강사 실무 평가 완료 (출강 1회 반영됨)</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="text-[10px] font-extrabold text-neutral-300">
                                  ⭐ 동행 보조강사 평가 및 피드백 전송
                                </div>
                                <div className="flex items-center justify-between gap-2 bg-neutral-900/50 p-1 rounded border border-neutral-850">
                                  <span className="text-[9px] text-neutral-400 pl-1">수행 성과 점수:</span>
                                  <select
                                    value={evalRating[lecture.id] || 5}
                                    onChange={(e) => setEvalRating(prev => ({ ...prev, [lecture.id]: Number(e.target.value) }))}
                                    className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-[10px] font-bold text-kpcia-gold focus:border-kpcia-gold focus:outline-none cursor-pointer"
                                  >
                                    <option value={5}>★★★★★ (5.0 / 최고)</option>
                                    <option value={4.5}>★★★★☆ (4.5 / 우수)</option>
                                    <option value={4}>★★★★☆ (4.0 / 양호)</option>
                                    <option value={3.5}>★★★☆☆ (3.5 / 보통)</option>
                                    <option value={3}>★★★☆☆ (3.0 / 미흡)</option>
                                  </select>
                                </div>
                                <textarea
                                  rows={2}
                                  placeholder="동행 보조강사의 성실성, 교육 애티튜드 및 피드백을 기록해 주세요."
                                  value={evalComment[lecture.id] || ''}
                                  onChange={(e) => setEvalComment(prev => ({ ...prev, [lecture.id]: e.target.value }))}
                                  className="w-full px-2 py-1.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-200 placeholder-neutral-500 focus:border-kpcia-gold focus:outline-none font-sans leading-relaxed resize-none"
                                />
                                <button
                                  onClick={() => {
                                    if (onEvaluateAssistant && lecture.assistantId) {
                                      const rating = evalRating[lecture.id] || 5;
                                      const comment = evalComment[lecture.id]?.trim() || '동행 및 실무 실습 성실히 이행함.';
                                      onEvaluateAssistant(lecture.id, lecture.assistantId, rating, comment);
                                    }
                                  }}
                                  disabled={!evalComment[lecture.id]?.trim()}
                                  className="w-full py-1 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-[10px] font-extrabold rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  동행 평가 피드백 전송하기
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Pricing, Applicants & Actions */}
                <div className="mt-5 pt-3.5 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-2 min-w-[240px] w-full sm:w-auto p-3 rounded-lg bg-neutral-900/40 border border-neutral-800/80">
                    {/* Row 1: 총 출강비 */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-extrabold text-kpcia-gold flex items-center gap-1">
                        <span>총 출강비</span>
                        {isProgramAssociated && (
                          <span className="text-[8px] bg-kpcia-gold/10 text-kpcia-gold border border-kpcia-gold/20 px-1 py-0.2 rounded font-normal shrink-0">지정연계 5% 공제됨</span>
                        )}
                      </span>
                      {!currentUser || currentUser.uid === 'guest' ? (
                        <span className="text-sm font-bold text-kpcia-gold/50 blur-[3px] select-none font-mono">
                          ₩{appliedTotalCost.toLocaleString()} 원
                        </span>
                      ) : isQualified || currentUser?.isAdmin ? (
                        <span className="text-base font-black text-kpcia-gold font-mono tracking-tight">
                          ₩{appliedTotalCost.toLocaleString()} 원
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-500 font-medium">🔒 비공개</span>
                      )}
                    </div>

                    {/* Row 2: 출강 강사료 */}
                    <div className="flex items-center justify-between gap-4 border-t border-neutral-800/60 pt-1.5">
                      <span className="text-[11px] text-neutral-300 font-bold">└ 출강 강사료</span>
                      {!currentUser || currentUser.uid === 'guest' ? (
                        <span className="text-xs font-bold text-neutral-500 blur-[3px] select-none font-mono">
                          ₩{lecture.budget.toLocaleString()} 원
                        </span>
                      ) : isQualified || currentUser?.isAdmin ? (
                        <span className="text-xs font-bold text-neutral-100 font-mono">
                          ₩{lecture.budget.toLocaleString()} 원
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-500">🔒 비공개</span>
                      )}
                    </div>

                    {/* Row 3: 재료비 총액 */}
                    <div className="flex items-center justify-between gap-4 pt-1">
                      <span className="text-[11px] text-neutral-400 font-medium">└ 재료비 총액</span>
                      {!currentUser || currentUser.uid === 'guest' ? (
                        <span className="text-xs font-bold text-neutral-500 blur-[3px] select-none font-mono">
                          ₩{(lecture.materialCost || 0).toLocaleString()} 원
                        </span>
                      ) : isQualified || currentUser?.isAdmin ? (
                        <span className="text-xs font-semibold text-neutral-300 font-mono">
                          ₩{(lecture.materialCost || 0).toLocaleString()} 원
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-500">🔒 비공개</span>
                      )}
                    </div>
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
                          등급 달성시 신청
                        </button>
                      ) : currentUser?.isAdmin ? (
                        <div className="text-xs text-neutral-500 font-mono flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>신청 강사 {lecture.applicants.length}명 대기중</span>
                        </div>
                      ) : isQualified ? (
                        hasApplied ? (
                          <button
                            onClick={() => onCancelApplyLecture && onCancelApplyLecture(lecture.id)}
                            className="px-4 py-2 bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/40 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                            id={`applied-btn-${lecture.id}`}
                            title="신청 취소하기"
                          >
                            <X className="w-3.5 h-3.5 text-red-400" />
                            <span>신청 취소</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setApplyingLecture(lecture)}
                            className="px-4 py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-bold rounded-lg transition-all shadow-md hover:shadow-kpcia-gold/10 cursor-pointer"
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
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <div className="flex items-center space-x-1.5 text-xs text-kpcia-gold font-bold bg-kpcia-gold/5 border border-kpcia-gold/15 px-3 py-1.5 rounded-lg shrink-0 animate-pulse" id={`assigned-to-me-${lecture.id}`}>
                            <CheckCircle2 className="w-4 h-4 text-kpcia-gold" />
                            <span>내게 배정된 강의</span>
                          </div>
                          {onCompleteLecture && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("본 출강 강의를 완전히 완료(종료) 처리하시겠습니까? 완료 후 동행 보조강사의 실습 평점 및 피드백을 즉시 입력하실 수 있습니다.")) {
                                  onCompleteLecture(lecture.id);
                                }
                              }}
                              className="px-3.5 py-1.5 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-[10.5px] font-extrabold rounded-lg transition-all cursor-pointer shadow-md text-center shrink-0"
                              id={`lecturer-complete-btn-${lecture.id}`}
                            >
                              강의 완료(종료) 처리
                            </button>
                          )}
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
      )}

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

      {/* Assistant Matching Popup during Lecture Application */}
      {applyingLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-kpcia-gold flex items-center gap-2">
                  <Users className="w-4 h-4 text-kpcia-gold" /> 보조강사 동행 매칭 정보 & 출강 신청 확정
                </h3>
                <p className="text-[10px] text-neutral-400 font-sans truncate max-w-md">
                  신청 강의: {applyingLecture.title}
                </p>
              </div>
              <button
                onClick={() => setApplyingLecture(null)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-850 space-y-1 text-xs">
                <p className="text-neutral-200 font-medium">
                  💡 <strong>Prestige Member (보조 강사) 등급 동행 매칭 시스템</strong>
                </p>
                <p className="text-neutral-400 leading-relaxed mt-1">
                  KPCIA 주강사 위원님께서 출강하실 때, 실습 성장을 희망하는 Prestige Member 등급의 보조 강사를 지정하여 동행할 수 있습니다. 
                  동행을 신청할 경우, 출강 완료 후 위원님이 보조강사 평점 및 피드백을 부여하게 되며 해당 보조강사에게는 출강 1회 실적이 적립됩니다.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-2">
                  <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <span>👥 매칭 가능한 Prestige Member 보조강사 리스트 ({allUsers?.filter(u => u.tier === 'Prestige Member' && !u.isAdmin && u.isApproved !== false).length || 0}명)</span>
                  </h4>
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="🔍 보조강사 이름, 활동 지역, 전문분야 검색..."
                      value={asstSearchQuery}
                      onChange={(e) => setAsstSearchQuery(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      id="asst-search-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="col-span-2 text-center py-8 text-xs text-neutral-500">
                          검색 조건에 부합하는 보조강사가 존재하지 않습니다.
                        </div>
                      );
                    }

                    return filteredList.map((asst) => {
                      return (
                      <div 
                        key={asst.uid}
                        className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/40 hover:border-neutral-750 hover:bg-neutral-950/60 transition-all duration-300 flex flex-col justify-between space-y-3.5"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                              {asst.profileCard?.imageUrl ? (
                                <img src={asst.profileCard.imageUrl} alt={asst.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <User className="w-5 h-5 text-neutral-500" />
                              )}
                            </div>
                            <div className="text-left">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-xs font-bold text-neutral-100">{asst.name}</span>
                                <span className="text-[8px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-bold border border-neutral-700">Prestige Member</span>
                              </div>
                              <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">{asst.profileCard?.title || 'KPCIA 파트너 강사'}</span>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setViewingCardForUser(asst)}
                            className="px-2 py-1 rounded bg-kpcia-gold/10 hover:bg-kpcia-gold/20 border border-kpcia-gold/30 text-kpcia-gold text-[9px] font-bold transition-all cursor-pointer"
                          >
                            💳 강사 카드 정보
                          </button>
                        </div>

                        {/* Contact & Info fields */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] bg-neutral-950 p-2.5 rounded border border-neutral-900 font-sans">
                          <div>
                            <span className="text-neutral-500 block text-[8.5px] uppercase font-mono">📞 비상 연락처</span>
                            <strong className="text-neutral-300 font-mono">{asst.profileCard?.contactPhone || '010-5259-7458'}</strong>
                          </div>
                          <div>
                            <span className="text-neutral-500 block text-[8.5px] uppercase font-mono">📧 이메일</span>
                            <strong className="text-neutral-300 font-mono truncate block">{asst.profileCard?.contactEmail || asst.email}</strong>
                          </div>
                          <div className="col-span-2 border-t border-neutral-900/50 pt-1.5 mt-1">
                            <span className="text-neutral-500 block text-[8.5px] uppercase font-mono">📍 주요 활동 지역</span>
                            <strong className="text-neutral-300">{asst.profileCard?.region || '서울 및 수도권'}</strong>
                          </div>
                        </div>

                        {/* Bio preview */}
                        <p className="text-[10px] text-neutral-450 leading-relaxed font-sans line-clamp-2">
                          {asst.profileCard?.bio || '인사이트9교육연구소 및 KPCIA 소속으로 전문 실무진 보조 지도를 성실히 수행합니다.'}
                        </p>

                        {/* Action select */}
                        <button
                          type="button"
                          onClick={async () => {
                            onApplyLecture(applyingLecture.id);
                            if (onAssignAssistant) {
                              onAssignAssistant(applyingLecture.id, asst.uid, asst.name);
                            }
                            setApplyingLecture(null);
                          }}
                          className="w-full py-1.5 bg-neutral-900 hover:bg-neutral-850 text-kpcia-gold hover:text-white border border-kpcia-gold/30 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          🤝 {asst.name} 보조강사 동행 지정하여 출강 신청
                        </button>
                      </div>
                    );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-neutral-800 bg-neutral-950">
              <span className="text-[9px] text-neutral-500 font-sans text-left">
                ※ 보조강사 동행 지정을 원치 않으시면 '단독 출강 신청' 버튼을 통해 단독으로 신청하실 수 있습니다.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onApplyLecture(applyingLecture.id);
                    setApplyingLecture(null);
                  }}
                  className="px-4 py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer"
                >
                  🚀 보조강사 동행 없이 단독 출강 신청
                </button>
                <button
                  type="button"
                  onClick={() => setApplyingLecture(null)}
                  className="px-4 py-2 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Card Full Dialog */}
      {viewingCardForUser && (() => {
        const themeStyles = {
          classic: {
            bg: 'bg-gradient-to-br from-[#1c1d1f] to-[#0e0f10]',
            border: 'border-neutral-700',
            textAccent: 'text-neutral-300',
            goldAccent: 'text-neutral-400',
            badgeBg: 'bg-neutral-800/80',
            accentBorder: 'border-neutral-600',
            cardBadgeGlow: 'shadow-neutral-900/50',
            textTitle: 'text-neutral-100'
          },
          gold_luxury: {
            bg: 'bg-gradient-to-br from-[#1c1a15] to-[#0a0907]',
            border: 'border-kpcia-gold/30',
            textAccent: 'text-kpcia-gold',
            goldAccent: 'text-kpcia-gold',
            badgeBg: 'bg-kpcia-gold/10',
            accentBorder: 'border-kpcia-gold/20',
            cardBadgeGlow: 'shadow-kpcia-gold/10',
            textTitle: 'text-kpcia-gold'
          },
          midnight_sapphire: {
            bg: 'bg-gradient-to-br from-[#0f172a] to-[#030712]',
            border: 'border-blue-900/40',
            textAccent: 'text-blue-400',
            goldAccent: 'text-kpcia-gold',
            badgeBg: 'bg-blue-950/50',
            accentBorder: 'border-blue-800/30',
            cardBadgeGlow: 'shadow-blue-900/20',
            textTitle: 'text-blue-100'
          },
          elite_emerald: {
            bg: 'bg-gradient-to-br from-[#064e3b] to-[#022c22]',
            border: 'border-emerald-800/40',
            textAccent: 'text-emerald-400',
            goldAccent: 'text-kpcia-gold',
            badgeBg: 'bg-emerald-950/40',
            accentBorder: 'border-emerald-800/20',
            cardBadgeGlow: 'shadow-emerald-900/20',
            textTitle: 'text-emerald-500'
          }
        };

        const uCard = viewingCardForUser.profileCard || {};
        const uTheme = uCard.cardTheme || 'classic';
        const selectedStyle = themeStyles[uTheme] || themeStyles.classic;

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-[620px] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-neutral-850 bg-neutral-950">
                <span className="text-xs font-bold text-kpcia-gold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-kpcia-gold" /> {viewingCardForUser.name} 강사님의 KPCIA 공식 강사 카드 정보
                </span>
                <button
                  onClick={() => setViewingCardForUser(null)}
                  className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 flex justify-center bg-neutral-950/50">
                <div 
                  className={`w-full max-w-[500px] aspect-[1.586/1] rounded-2xl border ${selectedStyle.border} ${selectedStyle.bg} p-5 relative overflow-hidden shadow-2xl flex flex-col justify-between`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.05),transparent)] pointer-events-none" />
                  
                  {/* Top row */}
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-kpcia-gold to-amber-500 rounded-xl blur-[1px] opacity-75" />
                        <div className="relative w-10 h-10 rounded-xl bg-neutral-950 overflow-hidden flex items-center justify-center">
                          {uCard.imageUrl ? (
                            <img src={uCard.imageUrl} alt={viewingCardForUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <User className="w-4 h-4 text-neutral-500" />
                          )}
                        </div>
                      </div>

                      <div className="text-left">
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-[7px] font-mono tracking-widest uppercase font-semibold ${selectedStyle.textAccent}`}>
                            KPCIA CERTIFIED INSTRUCTOR CARD
                          </span>
                        </div>
                        <h3 className="text-sm font-bold tracking-tight text-neutral-100 font-display mt-0.5">
                          {viewingCardForUser.name}
                        </h3>
                        <p className={`text-[9px] font-medium ${selectedStyle.textAccent}`}>
                          {uCard.title || 'KPCIA 파트너 강사'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center space-x-1 border border-kpcia-gold/30 rounded px-1.5 py-0.5 bg-kpcia-gold/5 text-[7px] font-mono font-bold text-kpcia-gold">
                        {viewingCardForUser.tier.toUpperCase()}
                      </div>
                      <div className="text-[7.5px] font-mono text-neutral-400 mt-1">출강 {viewingCardForUser.lectureCount || 0}회 | 평점 {viewingCardForUser.averageRating?.toFixed(1) || '0.0'}점</div>
                    </div>
                  </div>

                  {/* Middle Row */}
                  <div className="grid grid-cols-2 gap-3 my-2 py-2 border-y border-neutral-800/50 relative z-10 text-left">
                    <div className="space-y-1 border-r border-neutral-800/50 pr-2">
                      <span className="text-[7.5px] font-mono text-neutral-500 block">INTRODUCTION</span>
                      <p className="text-[8.5px] text-neutral-300 leading-relaxed font-sans line-clamp-3">
                        {uCard.bio || '기업의 미래 인재 육성을 위해 혁신적인 실무 교육 과정을 설계하고 실행하는 KPCIA 프레스티지 강사입니다.'}
                      </p>
                    </div>
                    <div className="pl-2 space-y-1">
                      <span className="text-[7.5px] font-mono text-neutral-500 block">SPECIALTIES</span>
                      <div className="flex flex-wrap gap-1">
                        {uCard.specialties && uCard.specialties.length > 0 ? (
                          uCard.specialties.slice(0, 3).map((spec, i) => (
                            <span 
                              key={i} 
                              className={`text-[7.5px] px-1 py-0.2 rounded font-medium ${selectedStyle.badgeBg} ${selectedStyle.textAccent} border ${selectedStyle.accentBorder}`}
                            >
                              {spec}
                            </span>
                          ))
                        ) : (
                          <span className="text-[7.5px] text-neutral-500">등록된 전문분야 없음</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between relative z-10 text-[8px] font-mono text-neutral-400">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-2.5 h-2.5 text-neutral-500" />
                      <span>{uCard.contactEmail || viewingCardForUser.email}</span>
                    </div>
                    {uCard.contactPhone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="w-2.5 h-2.5 text-neutral-500" />
                        <span>{uCard.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-neutral-850 bg-neutral-950 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingCardForUser(null)}
                  className="px-4 py-1.5 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-bold rounded-lg cursor-pointer"
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
