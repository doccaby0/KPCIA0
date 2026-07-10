import React, { useState } from 'react';
import { UserProfile, LectureRequest, InstructorTier } from '../types';
import { Calendar, Clock, MapPin, Award, CheckCircle2, AlertCircle, Users, Check, Banknote, Sparkles, X, FileDown } from 'lucide-react';

interface LectureBoardProps {
  currentUser: UserProfile | null;
  lectures: LectureRequest[];
  onApplyLecture: (lectureId: string) => void;
  onOpenAuthModal?: (tab: 'login' | 'register') => void;
  allUsers?: UserProfile[];
  onAssignAssistant?: (lectureId: string, assistantId: string, assistantName: string) => void;
  onEvaluateAssistant?: (lectureId: string, assistantId: string, rating: number, comment: string) => void;
}

export default function LectureBoard({
  currentUser,
  lectures,
  onApplyLecture,
  onOpenAuthModal,
  allUsers,
  onAssignAssistant,
  onEvaluateAssistant
}: LectureBoardProps) {
  // Map popup states
  const [selectedMapLocation, setSelectedMapLocation] = useState<string | null>(null);
  const [selectedMapTitle, setSelectedMapTitle] = useState<string>('');

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
    const totalCost = lecture.budget + materialFee;

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
    <td colspan="2" class="align-center">강사료 합계 + 재료 실비</td>
    <td>지급 완료시 마일리지 전환 가능</td>
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
                  <div className="flex items-center space-x-2">
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${tierColors[lecture.targetTier]}`}>
                      {lecture.targetTier} ↑ 지원 가능
                    </span>
                  </div>
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
                          {lecture.assistantEvaluated ? (
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
              <div className="mt-5 pt-3.5 border-t border-neutral-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase font-mono">출강 강사료</div>
                  {!currentUser || currentUser.uid === 'guest' ? (
                    <div className="relative group/price mt-1" title="등급 달성시 확인 가능합니다.">
                      <div className="text-sm font-bold text-neutral-450/40 flex items-center gap-1 font-mono select-none pointer-events-none filter blur-[4.5px]">
                        <Banknote className="w-4 h-4 text-neutral-600 shrink-0" />
                        {lecture.budget.toLocaleString()} KRW
                      </div>
                      <div className="absolute inset-y-0 left-0 flex items-center">
                        <span className="text-[9px] text-kpcia-gold/90 font-bold bg-kpcia-gold/10 border border-kpcia-gold/25 px-1.5 py-0.5 rounded shadow-sm">
                          등급 달성시 공개
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
