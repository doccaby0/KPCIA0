import React, { useState } from 'react';
import { UserProfile, LectureRequest, MileageTransaction, InstructorTier, EducationalProgram, PartnershipProposal } from '../types';
import { 
  Shield, 
  Users, 
  Award, 
  CheckSquare, 
  Plus, 
  DollarSign, 
  History, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle, 
  ArrowRightLeft, 
  BookOpen, 
  Handshake, 
  Check, 
  Search, 
  LayoutDashboard, 
  UserCheck, 
  Coins, 
  FileText, 
  ChevronRight, 
  Activity,
  Trash2,
  CreditCard,
  FileDown
} from 'lucide-react';

export function getLectureMilestoneBadge(lectureCount?: number) {
  if (lectureCount === undefined || lectureCount < 10) return null;
  if (lectureCount >= 10000) {
    return { name: '👑 Prestige 10K Club', color: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/30 font-bold', desc: '출강 10,000회 돌파 최고의 명사' };
  }
  if (lectureCount >= 1000) {
    return { name: '🔴 Prestige 1K Club', color: 'text-red-400 bg-red-950/50 border-red-500/30 font-bold', desc: '출강 1,000회 돌파 수석 가이드' };
  }
  if (lectureCount >= 100) {
    return { name: '🔵 Prestige 100 Club', color: 'text-sky-400 bg-sky-950/50 border-sky-500/30 font-bold', desc: '출강 100회 돌파 실전 전문가' };
  }
  // lectureCount >= 10
  return { name: '🟤 Prestige 10 Club', color: 'text-amber-500 bg-amber-950/50 border-amber-500/30 font-bold', desc: '출강 10회 돌파 입증된 강사' };
}

export function getNextTier(currentTier: InstructorTier): InstructorTier | null {
  switch (currentTier) {
    case 'Prestige Member': return 'Prestige Associate';
    case 'Prestige Associate': return 'Prestige Professional';
    case 'Prestige Professional': return 'Prestige Master';
    case 'Prestige Master': return 'Prestige Elite';
    default: return null;
  }
}

export function getPromotionRequirement(currentTier: InstructorTier) {
  switch (currentTier) {
    case 'Prestige Member':
      return { requiredLectures: 10, requiredRating: 4.5, ratingPercent: 90 };
    case 'Prestige Associate':
      return { requiredLectures: 100, requiredRating: 4.6, ratingPercent: 92 };
    case 'Prestige Professional':
      return { requiredLectures: 1000, requiredRating: 4.7, ratingPercent: 94 };
    case 'Prestige Master':
      return { requiredLectures: 10000, requiredRating: 4.8, ratingPercent: 96 };
    default:
      return null;
  }
}

export function getPromotionStatus(user: UserProfile) {
  const currentTier = user.tier;
  const nextTier = getNextTier(currentTier);
  if (!nextTier) return null;

  const req = getPromotionRequirement(currentTier);
  if (!req) return null;

  const currentLectures = user.lectureCount || 0;
  const currentAvgRating = user.averageRating || 0;
  const currentAvgRating5 = Number((currentAvgRating / 20).toFixed(2));

  const hasEnoughLectures = currentLectures >= req.requiredLectures;
  const hasEnoughRating = currentAvgRating5 >= req.requiredRating || currentAvgRating >= req.ratingPercent;

  const isEligible = hasEnoughLectures && hasEnoughRating;

  return {
    nextTier,
    requiredLectures: req.requiredLectures,
    requiredRating: req.requiredRating,
    ratingPercent: req.ratingPercent,
    currentLectures,
    currentAvgRating5,
    isEligible,
  };
}

interface AdminPanelProps {
  users: UserProfile[];
  lectures: LectureRequest[];
  transactions: MileageTransaction[];
  programs: EducationalProgram[];
  proposals: PartnershipProposal[];
  onUpgradeUserTier: (userId: string, newTier: InstructorTier) => void;
  onAssignLecturer: (lectureId: string, userId: string, userName: string) => void;
  onCompleteLecture: (lectureId: string) => void;
  onAdjustMileage: (userId: string, amount: number, description: string) => void;
  onUpdateProgramRoyalty: (programId: string, newRoyalty: number) => void;
  onUpdateProposalStatus: (proposalId: string, status: 'pending' | 'reviewed' | 'accepted' | 'declined') => void;
  onApproveUser?: (userId: string) => void;
  onRejectUser?: (userId: string) => void;
  onApproveProgram?: (programId: string, updatedProgram: EducationalProgram) => void;
  onAddLecture?: (lecture: any) => void;
  onUpdateUserPerformance?: (userId: string, lectureCount: number, ratings: number[], bankAccount?: string) => void;
  onDeleteUser?: (userId: string) => void;
  onDeleteProgram?: (programId: string) => void;
  onResetDatabase?: () => void;
}

export default function AdminPanel({
  users,
  lectures,
  transactions,
  programs,
  proposals,
  onUpgradeUserTier,
  onAssignLecturer,
  onCompleteLecture,
  onAdjustMileage,
  onUpdateProgramRoyalty,
  onUpdateProposalStatus,
  onApproveUser,
  onRejectUser,
  onApproveProgram,
  onAddLecture,
  onUpdateUserPerformance,
  onDeleteUser,
  onDeleteProgram,
  onResetDatabase
}: AdminPanelProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'approvals' | 'lectures' | 'settlements' | 'members' | 'proposals'>('dashboard');
  
  // Lecture Posting States
  const [showAddForm, setShowAddForm] = useState(false);
  const [lectTitle, setLectTitle] = useState('');
  const [lectDescription, setLectDescription] = useState('');
  const [lectTargetTier, setLectTargetTier] = useState<InstructorTier>('Prestige Associate');
  const [lectBudget, setLectBudget] = useState<number>(1000000);
  const [lectMileageRoyalty, setLectMileageRoyalty] = useState<number>(5000);
  const [lectProgramId, setLectProgramId] = useState('');
  const [lectDate, setLectDate] = useState('2026-07-20');
  const [lectTime, setLectTime] = useState('14:00 - 16:00');
  const [lectDuration, setLectDuration] = useState('2 hours');
  const [lectLocation, setLectLocation] = useState('');
  const [lectAttendees, setLectAttendees] = useState<string>('30');
  const [lectManagerName, setLectManagerName] = useState('');
  const [lectManagerPhone, setLectManagerPhone] = useState('');
  
  // Search States
  const [memberSearch, setMemberSearch] = useState('');
  const [txSearch, setTxSearch] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(null);
  
  // Handlers state
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newTier, setNewTier] = useState<InstructorTier>('Prestige Associate');
  const [adjustAmount, setAdjustAmount] = useState<number>(1000);
  const [adjustReason, setAdjustReason] = useState('특별 우수 교안 가산 마일리지 지급');
  const [mileageInputs, setMileageInputs] = useState<Record<string, string>>({});
  const [royaltyInputs, setRoyaltyInputs] = useState<Record<string, string>>({});

  // Performance and ratings states
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [perfLectureCount, setPerfLectureCount] = useState<string>('0');
  const [perfRatings, setPerfRatings] = useState<number[]>([]);
  const [newRatingInput, setNewRatingInput] = useState<string>('');
  const [perfBankAccount, setPerfBankAccount] = useState<string>('');

  const startEditingPerformance = (user: UserProfile) => {
    if (expandedUserId === user.uid) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(user.uid);
      setPerfLectureCount((user.lectureCount || 0).toString());
      setPerfRatings(user.lectureRatings || []);
      setNewRatingInput('');
      setPerfBankAccount(user.profileCard?.bankAccount || '');
    }
  };

  const handleSavePerformance = (userId: string) => {
    if (!onUpdateUserPerformance) return;
    const count = parseInt(perfLectureCount, 10);
    onUpdateUserPerformance(userId, isNaN(count) ? 0 : count, perfRatings, perfBankAccount);
    setExpandedUserId(null);
  };

  const handleAddRating = () => {
    const r = parseFloat(newRatingInput);
    if (isNaN(r) || r < 0 || r > 5) return;
    const ratingValue = Number(r.toFixed(1));
    const updatedRatings = [...perfRatings, ratingValue];
    setPerfRatings(updatedRatings);
    setNewRatingInput('');
    
    // Increment lecture count by 1 automatically when a score is added
    const currentCount = parseInt(perfLectureCount, 10);
    const nextCount = isNaN(currentCount) ? 1 : currentCount + 1;
    setPerfLectureCount(nextCount.toString());
  };

  const handleRemoveRating = (indexToRemove: number) => {
    const updatedRatings = perfRatings.filter((_, idx) => idx !== indexToRemove);
    setPerfRatings(updatedRatings);
    
    // Decrement lecture count by 1 automatically (down to minimum 0)
    const currentCount = parseInt(perfLectureCount, 10);
    if (!isNaN(currentCount) && currentCount > 0) {
      setPerfLectureCount((currentCount - 1).toString());
    }
  };

  const handleCreateLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lectTitle || !lectLocation || !onAddLecture) return;

    const selectedProg = programs.find(p => p.id === lectProgramId);

    const newLect = {
      title: lectTitle,
      description: lectDescription,
      targetTier: lectTargetTier,
      budget: Number(lectBudget),
      mileageRoyalty: selectedProg ? selectedProg.royaltyRate : Number(lectMileageRoyalty),
      programId: lectProgramId || undefined,
      programTitle: selectedProg ? selectedProg.title : undefined,
      date: lectDate,
      time: lectTime,
      duration: lectDuration,
      location: lectLocation,
      attendees: lectAttendees ? Number(lectAttendees) : undefined,
      managerName: lectManagerName || undefined,
      managerPhone: lectManagerPhone || undefined,
    };

    onAddLecture(newLect);
    setShowAddForm(false);
    
    // Reset Form
    setLectTitle('');
    setLectDescription('');
    setLectTargetTier('Prestige Associate');
    setLectBudget(1000000);
    setLectMileageRoyalty(5000);
    setLectProgramId('');
    setLectLocation('');
    setLectAttendees('30');
    setLectManagerName('');
    setLectManagerPhone('');
  };

  // Editing and approval states for Educational Programs
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTargetAudience, setEditTargetAudience] = useState('');
  const [editCurriculumInput, setEditCurriculumInput] = useState('');
  const [editRoyaltyRate, setEditRoyaltyRate] = useState<number>(5000);

  const startEditingProgram = (program: EducationalProgram) => {
    setEditingProgramId(program.id);
    setEditTitle(program.title);
    setEditDescription(program.description);
    setEditTargetAudience(program.targetAudience);
    setEditCurriculumInput(program.curriculum.join('\n'));
    setEditRoyaltyRate(program.royaltyRate || 5000);
  };

  const handleSaveAndApproveProgram = (programId: string) => {
    if (!onApproveProgram) return;
    const curriculum = editCurriculumInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const originalProg = programs.find(p => p.id === programId);
    if (!originalProg) return;

    const updatedProg: EducationalProgram = {
      ...originalProg,
      title: editTitle,
      description: editDescription,
      targetAudience: editTargetAudience,
      curriculum: curriculum.length > 0 ? curriculum : originalProg.curriculum,
      royaltyRate: Number(editRoyaltyRate),
      isApproved: true, // Mark approved!
    };

    onApproveProgram(programId, updatedProg);
    setEditingProgramId(null);
  };

  const tiers: InstructorTier[] = [
    'Prestige Member',
    'Prestige Associate',
    'Prestige Professional',
    'Prestige Master',
    'Prestige Elite'
  ];

  const handleRoyaltyChange = (programId: string, value: string) => {
    setRoyaltyInputs(prev => ({
      ...prev,
      [programId]: value
    }));
  };

  const handleApplyRoyalty = (programId: string, currentRoyalty: number) => {
    const inputVal = royaltyInputs[programId];
    if (inputVal === undefined || inputVal === '') return;
    const targetVal = parseInt(inputVal, 10);
    if (isNaN(targetVal) || targetVal < 0) return;
    onUpdateProgramRoyalty(programId, targetVal);
    
    // Clear input state for this program
    setRoyaltyInputs(prev => {
      const copy = { ...prev };
      delete copy[programId];
      return copy;
    });
  };

  const handleUpgrade = (userId: string, targetTier: InstructorTier) => {
    onUpgradeUserTier(userId, targetTier);
  };

  const handleMileageChange = (userId: string, value: string) => {
    setMileageInputs(prev => ({
      ...prev,
      [userId]: value
    }));
  };

  const handleApplyDirectMileage = (userId: string, currentMileage: number) => {
    const inputVal = mileageInputs[userId];
    if (inputVal === undefined || inputVal === '') return;
    const targetVal = parseInt(inputVal, 10);
    if (isNaN(targetVal) || targetVal < 0) return;
    
    const diff = targetVal - currentMileage;
    onAdjustMileage(userId, diff, `관리자 마일리지 수동 직접 변경 (최종: ${targetVal.toLocaleString()} M)`);
    // Clear input
    setMileageInputs(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustAmount) return;
    onAdjustMileage(selectedUser, adjustAmount, adjustReason);
    setAdjustAmount(1000);
    setAdjustReason('특별 우수 교안 가산 마일리지 지급');
  };

  const downloadLectureAsExcel = (lecture: LectureRequest) => {
    const totalCost = lecture.budget + 400000;

    const htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<!--[if gte mso 9]>
<xml>
<x:ExcelWorkbook>
<x:ExcelWorksheets>
<x:ExcelWorksheet>
<x:Name>출강강의요청서</x:Name>
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
    <td colspan="6" class="header-title">[인사이트9교육연구소] 출강 강의 요청서</td>
  </tr>
  <tr style="height: 10px;"><td colspan="6" style="border: none;"></td></tr>
  <tr>
    <td colspan="6" class="section-title">1. 기본 강의 요청 정보</td>
  </tr>
  <tr>
    <td class="label-cell">기관명</td>
    <td colspan="5" class="value-cell">${lecture.location ? lecture.location.split(' ')[0] : '협력기관'}</td>
  </tr>
  <tr>
    <td class="label-cell">교육 일정</td>
    <td colspan="2" class="value-cell">${lecture.date || '추후협의'}</td>
    <td class="label-cell">교육 시간</td>
    <td colspan="2" class="value-cell">${lecture.time || '추후협의'} (총 ${lecture.duration || '추후협의'})</td>
  </tr>
  <tr>
    <td class="label-cell">장소</td>
    <td colspan="5" class="value-cell">${lecture.location || '추후협의'}</td>
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
    <td class="align-right">${lecture.budget.toLocaleString()}원</td>
    <td colspan="2" class="align-center">${lecture.duration || '추후협의'}</td>
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
    <td class="align-right">${totalCost.toLocaleString()}원</td>
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
    const file = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `[인사이트9교육연구소]출강강의요청서_${lecture.title.replace(/[\s/\\:*?"<>|]/g, '_')}.xls`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Filter lists
  const pendingLectures = lectures.filter(l => l.status !== 'completed');
  const completedLectures = lectures.filter(l => l.status === 'completed');
  const pendingApprovals = users.filter(u => !u.isAdmin && u.isApproved === false);
  const approvedUsers = users.filter(u => !u.isAdmin && u.isApproved !== false);
  const pendingPrograms = programs.filter(p => p.isApproved === false);
  const pendingProposals = proposals.filter(p => p.status === 'pending');

  // KPI Calculations
  const totalApprovedInstructorsCount = approvedUsers.length;
  const pendingApprovalsCount = pendingApprovals.length;
  const pendingProgramsCount = pendingPrograms.length;
  const activeLecturesCount = pendingLectures.length;
  const completedLecturesCount = completedLectures.length;
  const totalMileageIssued = users.reduce((sum, u) => sum + (u.mileage || 0), 0);
  const pendingProposalsCount = pendingProposals.length;

  // Filtered lists based on search bar
  const filteredApprovedUsers = approvedUsers.filter(u =>
    u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    u.tier.toLowerCase().includes(memberSearch.toLowerCase()) ||
    (u.profileCard?.title && u.profileCard.title.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  const filteredTransactions = transactions.filter(tx =>
    tx.userName.toLowerCase().includes(txSearch.toLowerCase()) ||
    tx.description.toLowerCase().includes(txSearch.toLowerCase()) ||
    tx.type.toLowerCase().includes(txSearch.toLowerCase())
  );

  return (
    <div className="space-y-6" id="admin-panel-main">
      {/* 1. Admin Header Panel */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl relative overflow-hidden" id="admin-banner">
        <div className="absolute top-0 right-0 w-80 h-80 bg-kpcia-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 z-10 text-left">
            <span className="text-[10px] font-mono tracking-widest font-extrabold text-kpcia-gold uppercase flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> KPCIA EXECUTIVE CONTROL TOWER
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-100 font-display">
              협회 총괄 운영사무국 통제실
            </h2>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              가입 승인, 저작권 심사, 강의 매칭 배정, 특별 기여 마일리지 수동 정산 및 실시간 거래 장부를 실시간 원격 통제합니다.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-800/80 rounded-xl px-4 py-3 z-10 text-left shrink-0">
            <Activity className="w-5 h-5 text-kpcia-gold animate-pulse" />
            <div>
              <div className="text-lg font-mono font-extrabold text-kpcia-gold">{users.length}명</div>
              <p className="text-[10px] text-neutral-500 font-sans">KPCIA 누적 가입 회원</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Bento KPIs (Clicking shifts active tab) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="admin-bento-kpis">
        {/* KPI 1: Signups pending */}
        <button
          onClick={() => setActiveTab('approvals')}
          className={`p-4 rounded-xl border text-left transition-all duration-300 relative group overflow-hidden cursor-pointer ${
            pendingApprovalsCount > 0 
              ? 'bg-amber-950/10 border-amber-500/30 hover:border-amber-500/60 shadow-lg shadow-amber-500/5' 
              : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
          }`}
          id="kpi-signups"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono font-bold text-neutral-500 group-hover:text-neutral-400 transition-colors">가입 신청 대기</span>
            <Users className={`w-4 h-4 ${pendingApprovalsCount > 0 ? 'text-amber-500' : 'text-neutral-500'}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-mono font-bold ${pendingApprovalsCount > 0 ? 'text-amber-500' : 'text-neutral-200'}`}>
              {pendingApprovalsCount}
            </span>
            <span className="text-[10px] text-neutral-500">명</span>
          </div>
          <div className="text-[9px] text-neutral-500 font-sans mt-2 flex items-center gap-0.5 group-hover:text-kpcia-gold transition-colors">
            자세히 검토하기 <ChevronRight className="w-3 h-3" />
          </div>
          {pendingApprovalsCount > 0 && (
            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-amber-500 rounded-bl-full" />
          )}
        </button>

        {/* KPI 2: Course copyrights pending */}
        <button
          onClick={() => setActiveTab('approvals')}
          className={`p-4 rounded-xl border text-left transition-all duration-300 relative group overflow-hidden cursor-pointer ${
            pendingProgramsCount > 0 
              ? 'bg-kpcia-gold/10 border-kpcia-gold/30 hover:border-kpcia-gold/60 shadow-lg shadow-kpcia-gold/5' 
              : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
          }`}
          id="kpi-copyrights"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono font-bold text-neutral-500 group-hover:text-neutral-400 transition-colors">저작권 심사 대기</span>
            <BookOpen className={`w-4 h-4 ${pendingProgramsCount > 0 ? 'text-kpcia-gold' : 'text-neutral-500'}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-mono font-bold ${pendingProgramsCount > 0 ? 'text-kpcia-gold' : 'text-neutral-200'}`}>
              {pendingProgramsCount}
            </span>
            <span className="text-[10px] text-neutral-500">건</span>
          </div>
          <div className="text-[9px] text-neutral-500 font-sans mt-2 flex items-center gap-0.5 group-hover:text-kpcia-gold transition-colors">
            자세히 검토하기 <ChevronRight className="w-3 h-3" />
          </div>
          {pendingProgramsCount > 0 && (
            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-kpcia-gold rounded-bl-full" />
          )}
        </button>

        {/* KPI 3: Open Matching */}
        <button
          onClick={() => setActiveTab('lectures')}
          className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 text-left transition-all duration-300 relative group hover:border-neutral-700 cursor-pointer"
          id="kpi-matchings"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono font-bold text-neutral-500 group-hover:text-neutral-400 transition-colors">활성 출강 배정</span>
            <CheckSquare className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-bold text-sky-400">
              {activeLecturesCount}
            </span>
            <span className="text-[10px] text-neutral-500 font-sans">건 매칭중</span>
          </div>
          <div className="text-[9px] text-neutral-500 font-sans mt-2 flex items-center gap-0.5 group-hover:text-kpcia-gold transition-colors">
            출강 배정실 바로가기 <ChevronRight className="w-3 h-3" />
          </div>
        </button>

        {/* KPI 4: Settlements */}
        <button
          onClick={() => setActiveTab('settlements')}
          className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 text-left transition-all duration-300 relative group hover:border-neutral-700 cursor-pointer"
          id="kpi-settlements"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono font-bold text-neutral-500 group-hover:text-neutral-400 transition-colors">출강 정산 완료</span>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-bold text-amber-500">
              {completedLecturesCount}
            </span>
            <span className="text-[10px] text-neutral-500 font-sans">건 완료</span>
          </div>
          <div className="text-[9px] text-neutral-500 font-sans mt-2 flex items-center gap-0.5 group-hover:text-kpcia-gold transition-colors">
            정산실 바로가기 <ChevronRight className="w-3 h-3" />
          </div>
        </button>
      </div>

      {/* 3. Sleek Tab Navigation System */}
      <div className="border-b border-neutral-800 flex flex-wrap gap-2 pt-2" id="admin-tab-bar">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'border-kpcia-gold text-kpcia-gold bg-neutral-900/20'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
          id="tab-btn-dashboard"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>대시보드 개요</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all relative cursor-pointer ${
            activeTab === 'approvals'
              ? 'border-kpcia-gold text-kpcia-gold bg-neutral-900/20'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
          id="tab-btn-approvals"
        >
          <UserCheck className="w-4 h-4" />
          <span>가입 및 저작권 심사처</span>
          {(pendingApprovalsCount > 0 || pendingProgramsCount > 0) && (
            <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold bg-amber-500 text-neutral-950 rounded-full animate-pulse">
              {pendingApprovalsCount + pendingProgramsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('lectures')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all relative cursor-pointer ${
            activeTab === 'lectures'
              ? 'border-kpcia-gold text-kpcia-gold bg-neutral-900/20'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
          id="tab-btn-lectures"
        >
          <CheckSquare className="w-4 h-4" />
          <span>출강 배정실</span>
          {activeLecturesCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold bg-sky-500 text-neutral-950 rounded-full">
              {activeLecturesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settlements')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all relative cursor-pointer ${
            activeTab === 'settlements'
              ? 'border-kpcia-gold text-kpcia-gold bg-neutral-900/20'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
          id="tab-btn-settlements"
        >
          <CreditCard className="w-4 h-4" />
          <span>정산실</span>
          {completedLecturesCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold bg-amber-500 text-neutral-950 rounded-full">
              {completedLecturesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'members'
              ? 'border-kpcia-gold text-kpcia-gold bg-neutral-900/20'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
          id="tab-btn-members"
        >
          <Coins className="w-4 h-4" />
          <span>강사 & 마일리지 관리</span>
        </button>

        <button
          onClick={() => setActiveTab('proposals')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all relative cursor-pointer ${
            activeTab === 'proposals'
              ? 'border-kpcia-gold text-kpcia-gold bg-neutral-900/20'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
          id="tab-btn-proposals"
        >
          <Handshake className="w-4 h-4" />
          <span>기업 제휴 제안서</span>
          {pendingProposalsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold bg-amber-500 text-neutral-950 rounded-full">
              {pendingProposalsCount}
            </span>
          )}
        </button>
      </div>

      {/* 4. Tab Content Router */}
      <div className="space-y-6" id="admin-tab-content">
        
        {/* ==================== TAB 1: DASHBOARD OVERVIEW ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200" id="pane-dashboard">
            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-xl text-left space-y-2">
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">강의 매칭 지표</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">성공적으로 마무리된 출강</span>
                  <span className="text-sm font-mono font-bold text-neutral-200">{completedLecturesCount}건</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-neutral-850">
                  <span className="text-xs text-neutral-400">현재 접수·진행 중인 출강</span>
                  <span className="text-sm font-mono font-bold text-sky-400">{activeLecturesCount}건</span>
                </div>
              </div>

              <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-xl text-left space-y-2">
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">콘텐츠 라이선스 지표</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">협회 공식 공인 프로그램</span>
                  <span className="text-sm font-mono font-bold text-kpcia-gold">{programs.filter(p => p.isApproved !== false).length}건</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-neutral-850">
                  <span className="text-xs text-neutral-400">저작권 신규 심사 대기</span>
                  <span className="text-sm font-mono font-bold text-amber-500">{pendingProgramsCount}건</span>
                </div>
              </div>

              <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-xl text-left space-y-2">
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase">비즈니스 파트너십</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">검토 대기 중인 기업제안</span>
                  <span className="text-sm font-mono font-bold text-amber-500">{pendingProposalsCount}건</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-neutral-850">
                  <span className="text-xs text-neutral-400">전체 접수 제휴 제안</span>
                  <span className="text-sm font-mono font-bold text-neutral-200">{proposals.length}건</span>
                </div>
              </div>
            </div>

            {/* Notification alert banner */}
            {(pendingApprovalsCount > 0 || pendingProgramsCount > 0) && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-500">운영사무국 처리 대기 사항 안내</h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      가입 신청 승인 <strong className="text-amber-500">{pendingApprovalsCount}명</strong>, 신규 교육 콘텐츠 저작권 심사 <strong className="text-kpcia-gold">{pendingProgramsCount}건</strong>이 접수되어 처리를 기다리고 있습니다.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-[10px] font-extrabold rounded-lg transition-all shrink-0 cursor-pointer"
                >
                  지금 즉시 결재하기
                </button>
              </div>
            )}

            {/* 승급 예정 강사 현황 (Promotion Eligible Instructors) */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5" id="promotion-eligible-panel">
              <div className="border-b border-neutral-800/80 pb-3 mb-4 flex items-center justify-between">
                <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-kpcia-gold animate-pulse" /> KPCIA 승급 대상 강사 심사대 (기본 승급 요건 부합자)
                </h3>
                <span className="text-[9px] bg-kpcia-gold/10 border border-kpcia-gold/20 text-kpcia-gold px-2 py-0.5 rounded font-bold font-mono uppercase">
                  PROMOTIONS DESK
                </span>
              </div>

              {(() => {
                const eligibleUsers = approvedUsers.filter(u => {
                  if (u.isAdmin) return false;
                  const status = getPromotionStatus(u);
                  return status && status.isEligible;
                });

                if (eligibleUsers.length === 0) {
                  return (
                    <div className="text-center py-6 text-xs text-neutral-500 font-sans">
                      현재 각 등급별 승급 요건(10/100/1000/10000강의 및 평점 만족도)을 모두 충족하여 승급을 앞두고 있는 강사가 없습니다.
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {eligibleUsers.map(user => {
                      const status = getPromotionStatus(user);
                      if (!status) return null;
                      return (
                        <div 
                          key={user.uid}
                          className="p-4 rounded-xl bg-gradient-to-r from-kpcia-gold/5 via-neutral-950 to-neutral-950 border border-kpcia-gold/30 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
                          id={`promo-user-${user.uid}`}
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-extrabold text-neutral-100">{user.name} 강사님</span>
                              <div className="flex items-center gap-1 text-[10px]">
                                <span className="bg-neutral-900 border border-neutral-850 text-neutral-400 px-2 py-0.5 rounded">
                                  {user.tier}
                                </span>
                                <span className="text-kpcia-gold font-bold">➔</span>
                                <span className="bg-kpcia-gold/15 border border-kpcia-gold/30 text-kpcia-gold px-2 py-0.5 rounded font-extrabold">
                                  {status.nextTier}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-sans">
                              {/* Stat 1: Lecture count */}
                              <div className="bg-neutral-900/40 p-2 rounded-lg border border-neutral-850">
                                <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
                                  <span>누적 출강 실적</span>
                                  <span className="font-mono text-neutral-400">기준: {status.requiredLectures}회 이상</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-neutral-200 font-mono">{status.currentLectures}회</span>
                                  <span className="text-emerald-500 font-bold text-[10px]">요건 충족 (100%+)</span>
                                </div>
                              </div>

                              {/* Stat 2: Satisfaction avg */}
                              <div className="bg-neutral-900/40 p-2 rounded-lg border border-neutral-850">
                                <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
                                  <span>누적 평균 만족도</span>
                                  <span className="font-mono text-neutral-400">기준: {status.requiredRating}점 (90+점) 이상</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-kpcia-gold font-mono">
                                    {(user.averageRating ? user.averageRating / 20 : 0).toFixed(2)} / 5.0점 ({user.averageRating?.toFixed(1)}점)
                                  </span>
                                  <span className="text-emerald-500 font-bold text-[10px]">요건 충족</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => onUpgradeUserTier(user.uid, status.nextTier)}
                            className="px-4 py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-[10px] font-extrabold rounded-xl transition-all shadow-lg shadow-kpcia-gold/10 shrink-0 flex items-center justify-center gap-1 cursor-pointer self-start md:self-center"
                            id={`approve-promo-btn-${user.uid}`}
                          >
                            <Award className="w-3.5 h-3.5 text-kpcia-dark" />
                            <span>상위 등급 즉시 승격 승인</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Transaction Ledger Log (Searchable block on Dashboard) */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5" id="ledger-panel">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3 mb-4">
                <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-kpcia-gold" /> KPCIA 마일리지 누적 트랜잭션 원장 (실시간 감사 장부)
                </h3>
                <div className="relative max-w-xs w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="강사명 또는 거래 내용 검색..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-100 placeholder-neutral-500 focus:border-kpcia-gold focus:outline-none"
                  />
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-500">
                  {txSearch ? '검색어와 일치하는 트랜잭션 기록이 없습니다.' : '기록된 마일리지 거래가 존재하지 않습니다.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1" id="ledger-logs">
                  {[...filteredTransactions].reverse().map((tx) => (
                    <div 
                      key={tx.id} 
                      className="p-3 rounded bg-neutral-950 border border-neutral-800/60 flex items-center justify-between text-xs font-mono hover:border-neutral-800 transition-all text-left gap-4"
                      id={`ledger-tx-${tx.id}`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className="text-[10px] text-neutral-500 font-mono shrink-0">{tx.createdAt.split('T')[1]?.substring(0, 5) || '00:00'}</div>
                        <div className="flex items-center space-x-1 bg-neutral-900 border border-neutral-800 rounded px-1.5 py-0.5 text-[8px] font-bold uppercase shrink-0">
                          <ArrowRightLeft className="w-3.5 h-3.5 text-kpcia-gold" />
                          <span>{tx.type}</span>
                        </div>
                        <div className="text-neutral-300 font-sans font-medium truncate">
                          <strong className="text-neutral-200">{tx.userName}</strong>: {tx.description}
                        </div>
                      </div>
                      <div className={`font-bold shrink-0 font-mono ${tx.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.amount >= 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} M
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* System Control & Master Reset (Admin Only) */}
            {onResetDatabase && (
              <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-left" id="admin-master-reset-panel">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <Trash2 className="w-4.5 h-4.5 text-red-500" />
                    KPCIA 플랫폼 전체 마스터 데이터 초기화
                  </h4>
                  <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">
                    KPCIA에 등록된 모든 강사 가입 이력, 출강 실적, 교육 프로그램 저작권, 마일리지 원장 거래 내역 및 제휴 제안 전체 데이터를 공고 초기 상태로 완전히 포맷합니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("정말로 모든 출강/프로그램/강사 전체 데이터를 공고 당시의 초기 상태로 복구하시겠습니까? 로그인 정보 및 변경된 전체 레코드가 전면 유실됩니다.")) {
                      onResetDatabase();
                    }
                  }}
                  className="px-4 py-2 bg-red-950/30 hover:bg-red-950/55 text-red-400 hover:text-red-300 border border-red-900/40 hover:border-red-800/50 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.015] duration-300 shrink-0 self-start sm:self-center"
                  id="admin-reset-db-btn"
                >
                  <span>♻ KPCIA 전체 데이터 공고 초기화</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: APPROVALS DESK ==================== */}
        {activeTab === 'approvals' && (
          <div className="space-y-6 animate-in fade-in duration-200" id="pane-approvals">
            
            {/* Split Signups and Programs Copyrights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: New Instructor Signups (4 cols on lg, or let's do full widths split vertically) */}
              <div className="lg:col-span-5 bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 text-left" id="pending-approvals-panel">
                <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300 flex items-center justify-between border-b border-neutral-800/80 pb-2 mb-4">
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <Users className="w-4 h-4" />
                    <span>가입 승인 대기 목록 ({pendingApprovalsCount}명)</span>
                  </span>
                  <span className="text-[9px] bg-neutral-950 px-2 py-0.5 rounded text-neutral-400 font-mono">
                    Signups Desk
                  </span>
                </h3>

                {pendingApprovalsCount === 0 ? (
                  <div className="text-center py-12 text-xs text-neutral-500 font-sans" id="no-pending-approvals">
                    승인 대기 중인 신규 강사 신청건이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4" id="pending-approvals-grid">
                    {pendingApprovals.map((user) => (
                      <div 
                        key={user.uid} 
                        className="p-4 rounded-xl bg-neutral-950 border border-amber-500/20 relative overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-all space-y-3"
                        id={`pending-card-${user.uid}`}
                      >
                        <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-500 text-[8px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-bl border-l border-b border-amber-500/15">
                          PENDING
                        </div>

                        <div className="space-y-1 text-left">
                          <div className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                            {user.name}
                            <span className="text-[9px] font-mono font-bold text-kpcia-gold bg-kpcia-gold/10 px-1.5 py-0.5 rounded border border-kpcia-gold/25">
                              {user.tier}
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-400 font-sans space-y-0.5 pt-1">
                            <div>이메일: <strong className="text-neutral-300">{user.email}</strong></div>
                            {user.profileCard?.contactPhone && (
                              <div>연락처: <span className="text-neutral-300">{user.profileCard.contactPhone}</span></div>
                            )}
                            {user.profileCard?.title && (
                              <div>전문 분야: <span className="text-neutral-300">{user.profileCard.title}</span></div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-neutral-900 flex space-x-2">
                          <button
                            onClick={() => onRejectUser && onRejectUser(user.uid)}
                            className="flex-1 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-neutral-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                            id={`reject-btn-${user.uid}`}
                          >
                            가입 거절
                          </button>
                          <button
                            onClick={() => onApproveUser && onApproveUser(user.uid)}
                            className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 text-[10px] font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-emerald-500/10"
                            id={`approve-btn-${user.uid}`}
                          >
                            <Check className="w-3 h-3 text-neutral-950" />
                            <span>최종 승인</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: New Course Programs (7 cols on lg) */}
              <div className="lg:col-span-7 bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 text-left" id="pending-programs-panel">
                <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300 flex items-center justify-between border-b border-neutral-800/80 pb-2 mb-4">
                  <span className="flex items-center gap-1.5 text-kpcia-gold">
                    <BookOpen className="w-4 h-4" />
                    <span>콘텐츠 독창적 저작권 등록 심사처 ({pendingProgramsCount}건)</span>
                  </span>
                  <span className="text-[9px] bg-neutral-950 px-2 py-0.5 rounded text-neutral-400 font-mono">
                    Copyright Review
                  </span>
                </h3>

                {pendingProgramsCount === 0 ? (
                  <div className="text-center py-12 text-xs text-neutral-500 font-sans" id="no-pending-programs">
                    저작권 심사 및 수정보완을 대기 중인 신규 교육 콘텐츠 신청건이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4" id="pending-programs-list">
                    {pendingPrograms.map((program) => {
                      const isEditing = editingProgramId === program.id;

                      return (
                        <div 
                          key={program.id} 
                          className={`p-4 rounded-xl border relative transition-all space-y-4 text-left ${
                            isEditing 
                              ? 'border-kpcia-gold bg-neutral-950 shadow-lg shadow-kpcia-gold/5' 
                              : 'bg-neutral-950 border-neutral-850 hover:border-neutral-800'
                          }`}
                          id={`pending-program-${program.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[9px] font-mono font-bold text-neutral-500 block">PROG ID: {program.id.toUpperCase()}</span>
                              <h4 className="text-sm font-bold text-neutral-100 font-display mt-0.5">{program.title}</h4>
                              <p className="text-[10px] text-neutral-400 mt-1 font-sans">
                                제안 강사: <strong className="text-neutral-300">{program.authorName}</strong> | 대상: <span className="text-neutral-300">{program.targetAudience}</span>
                              </p>
                            </div>
                            {!isEditing && (
                              <button
                                onClick={() => startEditingProgram(program)}
                                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-kpcia-gold/40 hover:border-kpcia-gold text-kpcia-gold text-[10px] font-bold rounded-lg transition-all cursor-pointer shrink-0"
                                id={`edit-prog-btn-${program.id}`}
                              >
                                심사·보완 및 최종 공인하기
                              </button>
                            )}
                          </div>

                          {!isEditing ? (
                            <div className="text-xs space-y-2">
                              <div className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-800/40">
                                <span className="text-[9px] font-mono text-neutral-500 block mb-1">기획 의도 및 내용 개요</span>
                                <p className="text-neutral-300 leading-relaxed font-sans">{program.description}</p>
                              </div>
                              <div className="bg-neutral-900/30 p-3 rounded-lg border border-neutral-850">
                                <span className="text-[9px] font-mono text-neutral-500 block mb-1">초안 커리큘럼</span>
                                <ul className="list-disc list-inside space-y-1 text-neutral-400 font-sans">
                                  {program.curriculum.map((item, idx) => (
                                    <li key={idx} className="text-[11px]">{item}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-neutral-900/30 border border-neutral-800 p-4 rounded-lg space-y-4 animate-in fade-in duration-200">
                              <div className="border-b border-neutral-800 pb-2">
                                <span className="text-xs font-bold text-kpcia-gold">운영사무국 프로그램 수정보완 편집기</span>
                                <p className="text-[10px] text-neutral-400 mt-0.5">강사의 오리지널 기획을 정교화하고 승인 시 지급될 마일리지를 책정합니다.</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[9px] font-mono text-neutral-400 block mb-1">프로그램 명칭 수정</label>
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSaveAndApproveProgram(program.id);
                                      }
                                    }}
                                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-semibold text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-mono text-neutral-400 block mb-1">교육 대상 수정</label>
                                  <input
                                    type="text"
                                    value={editTargetAudience}
                                    onChange={(e) => setEditTargetAudience(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSaveAndApproveProgram(program.id);
                                      }
                                    }}
                                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-semibold text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[9px] font-mono text-neutral-400 block mb-1">기획 의도 및 개요 수정</label>
                                <textarea
                                  rows={2}
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-200 focus:border-kpcia-gold focus:outline-none resize-none"
                                />
                              </div>

                              <div>
                                <label className="text-[9px] font-mono text-neutral-400 block mb-1">커리큘럼 보완 (줄바꿈 단위 구분)</label>
                                <textarea
                                  rows={3}
                                  value={editCurriculumInput}
                                  onChange={(e) => setEditCurriculumInput(e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 focus:border-kpcia-gold focus:outline-none resize-none"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end pt-2 border-t border-neutral-850">
                                <div>
                                  <label className="text-[9px] font-mono text-amber-500 block mb-1">★ 승인 지급 마일리지 누적 비율 (M)</label>
                                  <input
                                    type="number"
                                    value={editRoyaltyRate}
                                    onChange={(e) => setEditRoyaltyRate(Number(e.target.value))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSaveAndApproveProgram(program.id);
                                      }
                                    }}
                                    min={0}
                                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-amber-500/40 text-xs font-bold font-mono text-kpcia-gold focus:border-kpcia-gold focus:outline-none"
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingProgramId(null)}
                                    className="px-3 py-1.5 border border-neutral-800 bg-neutral-950 text-neutral-400 text-xs font-bold rounded-lg hover:bg-neutral-900 cursor-pointer"
                                  >
                                    수정 취소
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveAndApproveProgram(program.id)}
                                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 text-xs font-extrabold rounded-lg flex items-center gap-1 shadow-md shadow-emerald-500/10 cursor-pointer"
                                    id={`approve-prog-confirm-${program.id}`}
                                  >
                                    <Check className="w-4 h-4 text-neutral-950" />
                                    <span>심사 완료 및 저작권 승인</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: LECTURE MATCHING (출강 배정실) ==================== */}
        {activeTab === 'lectures' && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 text-left animate-in fade-in duration-200" id="matching-panel">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4 mb-5">
              <div>
                <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 mb-1">
                  <CheckSquare className="w-4 h-4 text-kpcia-gold" /> 출강 배정실 (강사 심의 및 최종 매칭)
                </h3>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  출강 신청을 접수한 강사들의 등급 및 적합성을 평가하여 최종 강사로 배정하고, 공고별 공식 강의 요청서(엑셀 파일)를 실시간 출력합니다.
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-kpcia-gold/15 cursor-pointer shrink-0"
                id="admin-add-lecture-btn"
              >
                <Plus className="w-4 h-4" />
                <span>강의 요청서 공고하기</span>
              </button>
            </div>

            {/* Lecture Post Form inside Admin Panel */}
            {showAddForm && (
              <form onSubmit={handleCreateLecture} className="bg-neutral-950 border border-kpcia-gold/30 rounded-xl p-6 space-y-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-300" id="lecture-add-form">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                  <h4 className="font-display font-bold text-sm text-kpcia-gold flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-kpcia-gold" /> 신규 출강 강의 요청 공고 등록 (사무국 전용)
                  </h4>
                  <span className="text-[10px] text-neutral-400 font-mono">KPCIA ADMIN ONLY</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">강의 명칭 / 주제</label>
                    <input
                      type="text"
                      placeholder="예: 현대자동차 차세대 신사업본부 리더십 포럼"
                      value={lectTitle}
                      onChange={(e) => setLectTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      id="admin-lect-title"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">강의 진행 장소 / 기업 정보</label>
                    <input
                      type="text"
                      placeholder="예: 경기도 용인시 삼성인력개발원"
                      value={lectLocation}
                      onChange={(e) => setLectLocation(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      id="admin-lect-location"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block mb-1">강의 설명 및 세부 요구사항</label>
                  <textarea
                    rows={3}
                    placeholder="대기업 파견 강사로서 담당할 세부 커리큘럼 및 기대사항을 자세히 적어주세요."
                    value={lectDescription}
                    onChange={(e) => setLectDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none resize-none"
                    id="admin-lect-desc"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Required Tier */}
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">지원 가능한 최소 강사 등급</label>
                    <select
                      value={lectTargetTier}
                      onChange={(e) => setLectTargetTier(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      id="admin-lect-tier"
                    >
                      <option value="Prestige Member">Prestige Member (일반)</option>
                      <option value="Prestige Associate">Prestige Associate (어소시에이트)</option>
                      <option value="Prestige Professional">Prestige Professional (프로페셔널)</option>
                      <option value="Prestige Master">Prestige Master (마스터)</option>
                      <option value="Prestige Elite">Prestige Elite (엘리트)</option>
                    </select>
                  </div>

                  {/* Associate Educational Program */}
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">지정 교육 프로그램 연계</label>
                    <select
                      value={lectProgramId}
                      onChange={(e) => {
                        setLectProgramId(e.target.value);
                        const selected = programs.find(p => p.id === e.target.value);
                        if (selected) {
                          setLectMileageRoyalty(selected.royaltyRate);
                        }
                      }}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      id="admin-lect-program"
                    >
                      <option value="">연계 프로그램 없음 (자유교안)</option>
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>{p.title} (저작자: {p.authorName})</option>
                      ))}
                    </select>
                  </div>

                  {/* Budget / Price */}
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">출강 강사료 (KRW 원화)</label>
                    <input
                      type="number"
                      value={lectBudget}
                      onChange={(e) => setLectBudget(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      id="admin-lect-budget"
                    />
                  </div>

                  {/* Attendees Count */}
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">수강 대상 인원 (명)</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="예: 30"
                      value={lectAttendees}
                      onChange={(e) => setLectAttendees(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      id="admin-lect-attendees"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">출강 일정</label>
                    <input
                      type="date"
                      value={lectDate}
                      onChange={(e) => setLectDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold"
                      id="admin-lect-date"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">강의 진행 시간</label>
                    <input
                      type="text"
                      value={lectTime}
                      onChange={(e) => setLectTime(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold"
                      id="admin-lect-time"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">총 소요 시간</label>
                    <input
                      type="text"
                      value={lectDuration}
                      onChange={(e) => setLectDuration(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold"
                      id="admin-lect-duration"
                    />
                  </div>
                  {/* Royalty Amount Manual Input if no program */}
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">
                      원작 저작자 지급 마일리지 누적 (M)
                    </label>
                    <input
                      type="number"
                      value={lectMileageRoyalty}
                      onChange={(e) => setLectMileageRoyalty(Number(e.target.value))}
                      disabled={!!lectProgramId}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold disabled:opacity-50"
                      id="admin-lect-royalty"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">현장 담당자 이름</label>
                    <input
                      type="text"
                      placeholder="예: 김성진"
                      value={lectManagerName}
                      onChange={(e) => setLectManagerName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      id="admin-lect-manager-name"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">현장 담당자 연락처</label>
                    <input
                      type="text"
                      placeholder="예: 010-5259-7458"
                      value={lectManagerPhone}
                      onChange={(e) => setLectManagerPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      id="admin-lect-manager-phone"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-neutral-800 bg-neutral-950 text-neutral-400 text-xs font-bold rounded-lg hover:bg-neutral-900 transition-all cursor-pointer"
                    id="admin-form-lect-cancel"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-kpcia-gold text-kpcia-dark text-xs font-bold rounded-lg hover:bg-kpcia-gold-hover transition-all cursor-pointer"
                    id="admin-form-lect-submit"
                  >
                    공고 게시 완료
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4" id="matching-list">
              {pendingLectures.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-500">
                  대기 중이거나 수행 중인 출강 프로젝트 건이 없습니다.
                </div>
              ) : (
                pendingLectures.map((lecture) => {
                  const appliedUsers = users.filter(u => lecture.applicants.includes(u.uid));

                  return (
                    <div 
                      key={lecture.id}
                      className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left hover:border-neutral-800 transition-all"
                      id={`admin-matching-row-${lecture.id}`}
                    >
                      <div className="space-y-2 max-w-lg">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase font-mono ${
                            lecture.status === 'open' 
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}>
                            {lecture.status === 'open' ? '강사 매칭·접수중' : '출강 수행·교육중'}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono">ID: {lecture.id}</span>
                          <span className="text-[10px] text-neutral-400">예산: <strong className="text-neutral-300 font-mono">{lecture.budget.toLocaleString()} KRW</strong></span>
                        </div>
                        
                        <h4 className="text-sm font-bold text-neutral-200 font-display">{lecture.title}</h4>
                        <div className="text-[10px] text-neutral-400 font-sans grid grid-cols-2 gap-x-4 gap-y-1">
                          <div>요청 장소: <span className="text-neutral-300">{lecture.location}</span></div>
                          <div>요청 날짜: <span className="text-neutral-300">{lecture.date || '추후 결정'}</span></div>
                        </div>

                        {lecture.programId && (
                          <div className="text-[9px] text-kpcia-gold font-bold bg-kpcia-gold/10 px-2.5 py-1 rounded inline-block border border-kpcia-gold/15 mt-1">
                            독점 공인 교안 연계: {lecture.programTitle} (+{lecture.mileageRoyalty.toLocaleString()} M 저작권 라이선스료 지급 대기)
                          </div>
                        )}
                      </div>

                      {/* Matching Action Module */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-900" id={`admin-matching-actions-${lecture.id}`}>
                        
                        <button
                          type="button"
                          onClick={() => downloadLectureAsExcel(lecture)}
                          className="px-3.5 py-2 border border-neutral-800 bg-neutral-900 hover:bg-neutral-850 hover:border-kpcia-gold/40 text-neutral-200 hover:text-kpcia-gold text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm w-full sm:w-auto"
                          title="출강 강의 요청서를 엑셀(XLS) 파일로 다운로드합니다."
                          id={`admin-download-req-xls-${lecture.id}`}
                        >
                          <FileDown className="w-3.5 h-3.5 text-neutral-400" />
                          <span>강의 요청서</span>
                        </button>

                        {/* Status 1: Open for application - Admin selects the candidate to assign */}
                        {lecture.status === 'open' && (
                          <div className="space-y-1.5 w-full sm:w-auto">
                            <span className="text-[9px] font-mono text-neutral-500 block uppercase">출강 신청자 목록 ({appliedUsers.length}명)</span>
                            {appliedUsers.length === 0 ? (
                              <span className="text-[10px] text-neutral-500 block italic">강사의 출강 신청을 실시간 대기 중입니다.</span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5 max-w-sm">
                                {appliedUsers.map((u) => (
                                  <button
                                    key={u.uid}
                                    onClick={() => onAssignLecturer(lecture.id, u.uid, u.name)}
                                    className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-kpcia-gold text-[10px] font-bold text-neutral-300 hover:text-kpcia-gold transition-all flex items-center space-x-1 cursor-pointer"
                                    id={`assign-btn-${lecture.id}-${u.uid}`}
                                  >
                                    <span>{u.name} ({u.tier.split(' ')[1] || u.tier}) 배정</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Status 2: Assigned & Ongoing - Admin marks lecture completed to pay mileage */}
                        {lecture.status === 'assigned' && (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                            <div className="text-xs text-neutral-400">
                              수행 강사: <strong className="text-neutral-200">{lecture.assignedName}</strong>
                            </div>
                            <button
                              onClick={() => onCompleteLecture(lecture.id)}
                              className="w-full sm:w-auto px-4 py-2 bg-kpcia-gold text-kpcia-dark text-xs font-extrabold rounded-lg hover:bg-kpcia-gold-hover transition-all flex items-center justify-center space-x-1 shadow-lg shadow-kpcia-gold/10 cursor-pointer"
                              id={`complete-btn-${lecture.id}`}
                            >
                              <CheckCircle className="w-4 h-4 text-kpcia-dark" />
                              <span>출강 완료 승인 & 마일리지 즉시 정산</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 3.5: SETTLEMENTS (정산실) ==================== */}
        {activeTab === 'settlements' && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 text-left animate-in fade-in duration-200" id="settlements-panel">
            <div className="border-b border-neutral-800/80 pb-4 mb-5">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 mb-1">
                <CreditCard className="w-4 h-4 text-kpcia-gold" /> 정산실 (강사별 출강 비용 원장 및 송금 제어소)
              </h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                성공적으로 완료 처리된 출강 강의의 정산 예정 금액과 강사별 은행 계좌 정보를 대조하고, 익월 말일 자동 지급 일정을 관리 감독합니다.
              </p>
            </div>

            {/* Settlement KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-3.5 bg-neutral-950 border border-neutral-850 rounded-xl text-left">
                <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase block">총 정산 완료 건수</span>
                <span className="text-lg font-mono font-bold text-neutral-200">{completedLectures.length}건</span>
              </div>
              <div className="p-3.5 bg-neutral-950 border border-neutral-850 rounded-xl text-left">
                <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase block">총 누적 정산 지급액</span>
                <span className="text-lg font-mono font-bold text-kpcia-gold">
                  {completedLectures.reduce((sum, l) => sum + l.budget, 0).toLocaleString()}원
                </span>
              </div>
              <div className="p-3.5 bg-neutral-950 border border-neutral-850 rounded-xl text-left">
                <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase block">미지급 대기 잔액</span>
                <span className="text-lg font-mono font-bold text-amber-500">
                  {completedLectures.reduce((sum, l) => sum + l.budget, 0).toLocaleString()}원
                </span>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto border border-neutral-800 rounded-xl bg-neutral-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 font-bold">
                    <th className="p-3">배정 번호</th>
                    <th className="p-3">출강 강사명 (계좌번호)</th>
                    <th className="p-3">강의명 / 출강 주제</th>
                    <th className="p-3 text-center">강의 수행일</th>
                    <th className="p-3 text-right">정산 지급액</th>
                    <th className="p-3 text-center">지급 예정일</th>
                    <th className="p-3 text-center">송금 처리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850">
                  {completedLectures.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-xs text-neutral-500 italic">
                        정산 대상이 되는 완료된 출강 강의 건이 아직 없습니다.
                      </td>
                    </tr>
                  ) : (
                    completedLectures.map((lecture) => {
                      const instructor = users.find(u => u.uid === lecture.assignedTo || u.name === lecture.assignedName);
                      const bankAccount = instructor?.profileCard?.bankAccount || '계좌 정보 미기재';

                      // Calculate settlement date (last day of following month)
                      const getSettlementDate = (dateStr: string) => {
                        if (!dateStr) return '익월 말일';
                        try {
                          const cleaned = dateStr.replace(/[\.\/]/g, '-').trim();
                          const parts = cleaned.split('-');
                          if (parts.length >= 2) {
                            const year = parseInt(parts[0], 10);
                            const month = parseInt(parts[1], 10); // 1-indexed
                            if (!isNaN(year) && !isNaN(month)) {
                              const lastDay = new Date(year, month + 1, 0);
                              const y = lastDay.getFullYear();
                              const m = String(lastDay.getMonth() + 1).padStart(2, '0');
                              const d = String(lastDay.getDate()).padStart(2, '0');
                              return `${y}년 ${m}월 ${d}일 (익월 말일)`;
                            }
                          }
                          return '강의 다음 달 말일 정산';
                        } catch (e) {
                          return '강의 다음 달 말일 정산';
                        }
                      };

                      return (
                        <tr key={lecture.id} className="hover:bg-neutral-900/40 text-neutral-300">
                          <td className="p-3 font-mono text-[10px] text-neutral-500">{lecture.id}</td>
                          <td className="p-3">
                            <div className="font-bold text-neutral-200">{lecture.assignedName || '지정 안됨'}</div>
                            <div className="text-[10px] text-kpcia-gold font-mono flex items-center gap-1 mt-0.5">
                              🏦 {bankAccount}
                            </div>
                          </td>
                          <td className="p-3 font-medium text-neutral-200">{lecture.title}</td>
                          <td className="p-3 text-center font-mono text-[11px] text-neutral-400">{lecture.date || '기재 없음'}</td>
                          <td className="p-3 text-right font-mono font-bold text-kpcia-gold">{lecture.budget.toLocaleString()}원</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 font-mono text-[11px] border border-neutral-800">
                              {getSettlementDate(lecture.date)}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                              • 익월말 지급 대기
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: MEMBERS & MILEAGE ==================== */}
        {activeTab === 'members' && (
          <div className="space-y-6 animate-in fade-in duration-200" id="pane-members">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="admin-row-1">
              
              {/* Left Column: Member Tier & Search (7 Cols) */}
              <div className="lg:col-span-7 bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 text-left" id="user-tier-management-panel">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3 mb-4">
                  <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-kpcia-gold" /> 회원 등급 승격 및 정밀 자격 관리
                  </h3>
                  <div className="relative w-full sm:w-48">
                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="강사 명칭 검색..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-100 placeholder-neutral-500 focus:border-kpcia-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                  {filteredApprovedUsers.length === 0 ? (
                    <div className="text-center py-12 text-xs text-neutral-500">
                      검색 조건에 맞는 회원이 존재하지 않습니다.
                    </div>
                  ) : (
                    filteredApprovedUsers.map((user) => {
                      if (user.isAdmin) return null; // Avoid editing admin here
                      const isExpanded = expandedUserId === user.uid;
                      return (
                        <div key={user.uid} className="space-y-2 border border-neutral-800/40 p-1.5 rounded-xl bg-neutral-950/20" id={`user-performance-wrapper-${user.uid}`}>
                          <div 
                            className="flex flex-col xl:flex-row xl:items-center justify-between p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 hover:border-neutral-800 transition-all gap-4 text-left"
                            id={`admin-user-row-${user.uid}`}
                          >
                            <div className="space-y-1">
                              <div className="text-xs font-bold text-neutral-100 flex flex-wrap items-center gap-1.5">
                                <span>{user.name}</span>
                                <span className="text-[9px] font-mono font-bold text-kpcia-gold bg-kpcia-gold/10 px-1.5 py-0.5 rounded border border-kpcia-gold/20">
                                  {user.mileage.toLocaleString()} M
                                </span>
                                {user.lectureCount !== undefined && user.lectureCount >= 10 && (() => {
                                  const milestone = getLectureMilestoneBadge(user.lectureCount);
                                  if (!milestone) return null;
                                  return (
                                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${milestone.color}`} title={milestone.desc}>
                                      {milestone.name}
                                    </span>
                                  );
                                })()}
                              </div>
                              <div className="text-[10px] text-neutral-400 font-sans flex items-center gap-1.5">
                                <span>등급 권한:</span>
                                <strong className="text-neutral-200">{user.tier}</strong>
                              </div>
                              <div className="text-[10px] text-neutral-400 font-sans flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-0.5">
                                <span>출강 실적: <strong className="text-neutral-200 font-mono">{user.lectureCount || 0}회</strong></span>
                                <span className="text-neutral-600 font-mono">|</span>
                                <span>평균 만족도: <strong className="text-amber-500 font-mono">{user.averageRating !== undefined ? user.averageRating.toFixed(1) : '0.0'}점</strong></span>
                              </div>
                              <div className="text-[10px] text-neutral-400 font-sans flex items-center gap-1.5 pt-1 mt-1 border-t border-neutral-900/40">
                                <span className="text-kpcia-gold font-bold">🏦 등록 계좌:</span>
                                <span className="text-neutral-200 font-medium">{user.profileCard?.bankAccount || '미등록 (계좌 등록 필요)'}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                              {/* Direct Mileage Editing */}
                              <div className="flex items-center space-x-1.5 bg-neutral-900 border border-neutral-850 px-2 py-1 rounded-lg" id={`mileage-direct-container-${user.uid}`}>
                                <span className="text-[9px] text-neutral-400 font-sans">수동입력:</span>
                                <input
                                  type="number"
                                  title="마일리지 정밀 조정"
                                  value={mileageInputs[user.uid] !== undefined ? mileageInputs[user.uid] : user.mileage}
                                  onChange={(e) => handleMileageChange(user.uid, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleApplyDirectMileage(user.uid, user.mileage);
                                    }
                                  }}
                                  className="w-16 px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-700 text-[10px] text-center font-mono text-kpcia-gold focus:border-kpcia-gold focus:outline-none"
                                  id={`input-mileage-${user.uid}`}
                                />
                                <span className="text-[9px] text-neutral-500 font-mono">M</span>
                                {mileageInputs[user.uid] !== undefined && mileageInputs[user.uid] !== user.mileage.toString() && (
                                  <button
                                    onClick={() => handleApplyDirectMileage(user.uid, user.mileage)}
                                    className="px-2 py-0.5 rounded bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-[9px] font-extrabold transition-all shadow cursor-pointer"
                                    id={`apply-mileage-btn-${user.uid}`}
                                  >
                                    저장
                                  </button>
                                )}
                              </div>

                              {/* Tier Change Dropdown */}
                              <div className="flex items-center space-x-1">
                                <span className="text-[9px] text-neutral-400 font-sans">등급변경:</span>
                                <select
                                  value={user.tier}
                                  onChange={(e) => handleUpgrade(user.uid, e.target.value as any)}
                                  className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-[10px] font-semibold text-neutral-300 focus:border-kpcia-gold focus:outline-none cursor-pointer"
                                  id={`select-tier-${user.uid}`}
                                >
                                  {tiers.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Perform & Rating Edit Trigger Button */}
                              <button
                                onClick={() => startEditingPerformance(user)}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                  isExpanded 
                                    ? 'bg-kpcia-gold text-neutral-950 shadow-md shadow-kpcia-gold/10' 
                                    : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-kpcia-gold/50'
                                }`}
                                id={`perf-btn-${user.uid}`}
                              >
                                <Activity className="w-3.5 h-3.5" />
                                <span>실적·평가</span>
                              </button>

                              {/* Member Deletion / Withdrawal */}
                              {deletingUserId === user.uid ? (
                                <div className="flex items-center space-x-1 animate-in fade-in zoom-in-95 bg-red-950/20 px-1.5 py-1 rounded border border-red-900/30" id={`deleting-confirm-container-${user.uid}`}>
                                  <span className="text-[9px] text-red-400 font-bold mr-1">정말 탈퇴 처리합니까?</span>
                                  <button
                                    onClick={() => {
                                      if (onDeleteUser) onDeleteUser(user.uid);
                                      setDeletingUserId(null);
                                    }}
                                    className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white text-[9px] font-extrabold rounded transition-all cursor-pointer shadow shadow-red-600/20"
                                    id={`confirm-delete-btn-${user.uid}`}
                                  >
                                    확인
                                  </button>
                                  <button
                                    onClick={() => setDeletingUserId(null)}
                                    className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-[9px] font-bold rounded border border-neutral-850 transition-all cursor-pointer"
                                    id={`cancel-delete-btn-${user.uid}`}
                                  >
                                    취소
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingUserId(user.uid)}
                                  className="px-2 py-1 rounded text-[10px] font-bold text-red-400 bg-red-950/20 border border-red-900/30 hover:border-red-700/60 hover:text-red-300 hover:bg-red-950/40 transition-all flex items-center gap-1 cursor-pointer"
                                  id={`delete-btn-${user.uid}`}
                                  title="강사 협회 회원 탈퇴 처리"
                                >
                                  <span>회원 탈퇴</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* expandable panel for rating/lecture counts */}
                          {isExpanded && (
                            <div className="p-4 rounded-lg bg-neutral-900/60 border border-kpcia-gold/20 space-y-4 animate-in slide-in-from-top-2 duration-200" id={`perf-panel-${user.uid}`}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-2">
                                <span className="text-[11px] font-bold text-kpcia-gold flex items-center gap-1">
                                  ★ {user.name} 강사 출강 실적 및 만족도 평가 관리
                                </span>
                                <span className="text-[9px] font-mono text-neutral-400">
                                  최근 수정: {user.updatedAt ? user.updatedAt.split('T')[0] : '기록 없음'}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Left: Lecture count input & new rating input */}
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">총 출강 횟수 (직접 기재 가능)</label>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="number"
                                        min={0}
                                        value={perfLectureCount}
                                        onChange={(e) => setPerfLectureCount(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleSavePerformance(user.uid);
                                          }
                                        }}
                                        className="w-24 px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none font-mono"
                                        id={`perf-lecture-input-${user.uid}`}
                                      />
                                      <span className="text-xs text-neutral-400">회</span>
                                    </div>
                                    <p className="text-[9px] text-neutral-500 mt-1">※ 강의 만족도 점수를 추가하면 자동으로 출강 횟수가 가산됩니다.</p>
                                  </div>

                                  <div className="pt-2 border-t border-neutral-800/60">
                                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">🏦 강사 계좌번호 (정산 정보)</label>
                                    <input
                                      type="text"
                                      placeholder="예: 신한은행 110-345-234234"
                                      value={perfBankAccount}
                                      onChange={(e) => setPerfBankAccount(e.target.value)}
                                      className="w-full px-2.5 py-1.5 rounded bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                                      id={`perf-bank-account-input-${user.uid}`}
                                    />
                                    <p className="text-[9px] text-neutral-500 mt-1">※ 이 계좌는 정산 완료 시 출강 강사 정산실에서 한눈에 조회됩니다.</p>
                                  </div>

                                  <div className="pt-2 border-t border-neutral-800/60">
                                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">개별 강의 만족도 점수 추가 (0.0 ~ 5.0점 만점)</label>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="number"
                                        min={0}
                                        max={5}
                                        step={0.1}
                                        placeholder="예: 4.8"
                                        value={newRatingInput}
                                        onChange={(e) => setNewRatingInput(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddRating();
                                          }
                                        }}
                                        className="w-24 px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none font-mono"
                                        id={`perf-rating-input-${user.uid}`}
                                      />
                                      <span className="text-xs text-neutral-400">점</span>
                                      <button
                                        type="button"
                                        onClick={handleAddRating}
                                        disabled={!newRatingInput}
                                        className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-kpcia-gold text-[10px] font-bold rounded transition-all cursor-pointer disabled:opacity-40"
                                        id={`perf-add-rating-btn-${user.uid}`}
                                      >
                                        추가
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Existing Ratings list & calculated average */}
                                <div className="space-y-3 bg-neutral-950/40 p-3 rounded-lg border border-neutral-850">
                                  <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400">
                                    <span>등록된 만족도 평가 목록 ({perfRatings.length}건)</span>
                                    <span className="text-kpcia-gold font-mono">
                                      평균: {perfRatings.length > 0 ? (perfRatings.reduce((a, b) => a + b, 0) / perfRatings.length).toFixed(1) : '0.0'}점
                                    </span>
                                  </div>

                                  {perfRatings.length === 0 ? (
                                    <div className="text-center py-6 text-[10px] text-neutral-500 italic">
                                      등록된 만족도 점수가 없습니다. 점수를 추가해 주십시오.
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                                      {perfRatings.map((rating, idx) => (
                                        <div 
                                          key={idx} 
                                          className="flex items-center space-x-1.5 px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-neutral-300"
                                        >
                                          <span>{rating}점</span>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveRating(idx)}
                                            className="text-red-500 hover:text-red-400 transition-colors text-[9px] font-black cursor-pointer"
                                            title="삭제"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Actions: Save or Cancel */}
                              <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-800">
                                <button
                                  type="button"
                                  onClick={() => setExpandedUserId(null)}
                                  className="px-3 py-1.5 border border-neutral-800 bg-neutral-950 text-neutral-400 text-xs font-bold rounded-lg hover:bg-neutral-900 cursor-pointer"
                                  id={`cancel-perf-${user.uid}`}
                                >
                                  취소
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSavePerformance(user.uid)}
                                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 text-xs font-extrabold rounded-lg flex items-center gap-1 shadow-md shadow-emerald-500/10 cursor-pointer"
                                  id={`save-perf-${user.uid}`}
                                >
                                  <Check className="w-3.5 h-3.5 text-neutral-950" />
                                  <span>실적 및 평가 저장</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Special Adjustments (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Special Hand Adjustment Form */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 text-left" id="mileage-adjust-panel">
                  <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 mb-3 border-b border-neutral-800/80 pb-2">
                    <DollarSign className="w-4 h-4 text-kpcia-gold" /> 특별 공로 마일리지 직접 수동 변동 처리
                  </h3>
                  <form onSubmit={handleAdjustSubmit} className="space-y-4" id="mileage-adjust-form">
                    <div>
                      <label className="text-[9px] font-mono text-neutral-400 block mb-1">지급 대상 강사 지정</label>
                      <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none cursor-pointer"
                        id="form-adjust-user"
                      >
                        <option value="">강사를 선택하십시오</option>
                        {approvedUsers.map(u => (
                          <option key={u.uid} value={u.uid}>{u.name} ({u.tier.split(' ')[1] || u.tier})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-mono text-neutral-400 block mb-1">변동 마일리지 값</label>
                        <input
                          type="number"
                          placeholder="예: 3000"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(Number(e.target.value))}
                          required
                          className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                          id="form-adjust-amount"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-neutral-400 block mb-1">변동 형식</label>
                        <div className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-bold text-neutral-300">
                          {adjustAmount >= 0 ? '가산 (+) 처리' : '차감 (-) 처리'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-mono text-neutral-400 block mb-1">변동 지급 사유</label>
                      <input
                        type="text"
                        placeholder="사유를 기재하십시오."
                        value={adjustReason}
                        onChange={(e) => setAdjustReason(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                        id="form-adjust-reason"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedUser}
                      className="w-full py-2 bg-neutral-950 hover:bg-neutral-900 border border-kpcia-gold text-kpcia-gold font-bold text-xs rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      id="form-adjust-submit-btn"
                    >
                      마일리지 수동 정산 발행 실행
                    </button>
                  </form>
                </div>

                {/* Educational Program Mileage Adjustments */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 text-left" id="program-royalty-management">
                  <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 mb-3 border-b border-neutral-800/80 pb-2">
                    <BookOpen className="w-4 h-4 text-kpcia-gold" /> 등재 교육 콘텐츠별 정산 마일리지 조율
                  </h3>
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {programs.filter(p => p.isApproved !== false).map((program) => (
                      <div 
                        key={program.id}
                        className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 flex items-center justify-between gap-3 text-left"
                      >
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-neutral-200 truncate">{program.title}</h4>
                          <p className="text-[9px] text-neutral-400">저작자: {program.authorName}</p>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          {deletingProgramId === program.id ? (
                            <div className="flex items-center space-x-1 bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/30" id={`deleting-program-confirm-${program.id}`}>
                              <span className="text-[8px] text-red-400 font-bold">정말 삭제?</span>
                              <button
                                onClick={() => {
                                  if (onDeleteProgram) onDeleteProgram(program.id);
                                  setDeletingProgramId(null);
                                }}
                                className="px-1.5 py-0.5 bg-red-600 hover:bg-red-500 text-white text-[8px] font-extrabold rounded cursor-pointer"
                                id={`btn-confirm-delete-prog-${program.id}`}
                              >
                                예
                              </button>
                              <button
                                onClick={() => setDeletingProgramId(null)}
                                className="px-1.5 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-[8px] font-bold rounded cursor-pointer"
                                id={`btn-cancel-delete-prog-${program.id}`}
                              >
                                아니오
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingProgramId(program.id)}
                              className="p-1 rounded text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
                              title="교육 콘텐츠 삭제"
                              id={`btn-trigger-delete-prog-${program.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <input
                            type="number"
                            title="콘텐츠 마일리지 조정"
                            value={royaltyInputs[program.id] !== undefined ? royaltyInputs[program.id] : program.royaltyRate}
                            onChange={(e) => handleRoyaltyChange(program.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleApplyRoyalty(program.id, program.royaltyRate);
                              }
                            }}
                            className="w-16 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-[10px] text-center font-mono text-kpcia-gold focus:border-kpcia-gold focus:outline-none"
                            id={`input-royalty-${program.id}`}
                          />
                          <span className="text-[9px] text-neutral-500 font-mono">M</span>
                          {royaltyInputs[program.id] !== undefined && royaltyInputs[program.id] !== program.royaltyRate.toString() && (
                            <button
                              onClick={() => handleApplyRoyalty(program.id, program.royaltyRate)}
                              className="p-1 px-2 rounded bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-[9px] font-extrabold transition-all cursor-pointer"
                              id={`save-royalty-btn-${program.id}`}
                            >
                              저장
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: CORPORATE PARTNERSHIPS ==================== */}
        {activeTab === 'proposals' && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 text-left animate-in fade-in duration-200" id="proposals-review-management">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 mb-2 border-b border-neutral-800/80 pb-2">
              <Handshake className="w-4 h-4 text-kpcia-gold" /> 외부 기관 제휴 및 협력 사업 제안서 검토 본부
            </h3>
            <p className="text-[11px] text-neutral-400 mb-5 leading-relaxed">
              지자체, 정부부처 및 공기업·대기업들로부터 접수된 교육 출강 제휴 제안서를 실시간 모니터링하고 심사 답변을 처리합니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="proposals-list">
              {proposals.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-xs text-neutral-500">
                  접수되어 검토 중인 비즈니스 제휴서가 존재하지 않습니다.
                </div>
              ) : (
                proposals.map((prop) => (
                  <div 
                    key={prop.id}
                    className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-3.5 hover:border-neutral-800 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-kpcia-gold font-bold font-display uppercase block">{prop.companyName}</span>
                          <p className="text-[9px] text-neutral-400 mt-0.5 font-sans">
                            제안자: {prop.proposerName} | 이메일: {prop.email}
                          </p>
                        </div>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
                          prop.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          prop.status === 'declined' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          prop.status === 'reviewed' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                          'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {prop.status === 'accepted' ? '제휴 승인 완료' :
                           prop.status === 'declined' ? '제휴 반려 처리' :
                           prop.status === 'reviewed' ? '검토 완료' : '접수 검토중'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <h4 className="text-xs font-bold text-neutral-100">{prop.title}</h4>
                        <div className="text-[10px] text-neutral-300 font-sans leading-relaxed whitespace-pre-wrap bg-neutral-900/60 p-3 rounded-lg border border-neutral-850 max-h-40 overflow-y-auto">
                          {prop.content}
                        </div>
                      </div>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="flex justify-end gap-1.5 pt-3 border-t border-neutral-900">
                      <button
                        onClick={() => onUpdateProposalStatus(prop.id, 'reviewed')}
                        className={`px-3 py-1 rounded text-[9px] font-bold border transition-all cursor-pointer ${
                          prop.status === 'reviewed' 
                            ? 'bg-sky-500 text-neutral-950 border-transparent font-extrabold' 
                            : 'bg-transparent text-neutral-400 border-neutral-800 hover:text-sky-400 hover:border-sky-500/30'
                        }`}
                      >
                        검토완료
                      </button>
                      <button
                        onClick={() => onUpdateProposalStatus(prop.id, 'accepted')}
                        className={`px-3 py-1 rounded text-[9px] font-bold border transition-all cursor-pointer ${
                          prop.status === 'accepted' 
                            ? 'bg-emerald-500 text-neutral-950 border-transparent font-extrabold' 
                            : 'bg-transparent text-neutral-400 border-neutral-800 hover:text-emerald-400 hover:border-emerald-500/30'
                        }`}
                      >
                        사업승인
                      </button>
                      <button
                        onClick={() => onUpdateProposalStatus(prop.id, 'declined')}
                        className={`px-3 py-1 rounded text-[9px] font-bold border transition-all cursor-pointer ${
                          prop.status === 'declined' 
                            ? 'bg-red-500 text-neutral-950 border-transparent font-extrabold' 
                            : 'bg-transparent text-neutral-400 border-neutral-800 hover:text-red-400 hover:border-red-500/30'
                        }`}
                      >
                        정중히 반려
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
