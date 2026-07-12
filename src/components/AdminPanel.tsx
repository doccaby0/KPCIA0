import React, { useState, useEffect } from 'react';
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
  FileDown,
  Edit,
  Edit3
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
      return { requiredLectures: 1000, requiredRating: 4.8, ratingPercent: 96 };
    case 'Prestige Master':
      return { requiredLectures: 10000, requiredRating: 4.9, ratingPercent: 98 };
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
  
  // Robust conversion: support both 100-point scale and 5.0 scale
  const currentAvgRating5 = currentAvgRating > 5.0 
    ? Number((currentAvgRating / 20).toFixed(2)) 
    : Number(currentAvgRating.toFixed(2));

  const hasEnoughLectures = currentLectures >= req.requiredLectures;
  const hasEnoughRating = currentAvgRating5 >= req.requiredRating;

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

export function getSpecialtiesList(user: UserProfile): string[] {
  if (user.profileCard?.specialties && user.profileCard.specialties.length > 0) {
    return user.profileCard.specialties;
  }
  const name = user.name || '';
  if (name.includes('김')) {
    return ['AI 에이전트 설계', 'LLM 프롬프트 고도화', '비즈니스 자동화'];
  } else if (name.includes('이')) {
    return ['MZ 리더십 코칭', '갈등 관리 의사소통', '조직 성과 극대화'];
  } else if (name.includes('박')) {
    return ['마이크로프로세서 설계', '임베디드 리눅스 커널', 'IoT 프로그래밍'];
  } else if (name.includes('최')) {
    return ['디지털 스토리텔링', '전략 마케팅 기획', '소비자 심리 분석'];
  } else if (name.includes('강') || name.includes('정')) {
    return ['글로벌 비즈니스 매너', '다문화 팀 빌딩', '협상 전략 솔루션'];
  }
  return ['기업 맞춤형 HRD 특강', '직무 역량 강화 설계', '스피치 및 강의 기법'];
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
  onUpdateLecture?: (lecture: LectureRequest) => void;
  onUpdateUserPerformance?: (userId: string, lectureCount: number, ratings: number[], bankAccount?: string) => void;
  onUpdateUserProfile?: (userId: string, updatedFields: Partial<UserProfile>) => void;
  onUpdateLectureSettlementStatus?: (lectureId: string, status: 'pending' | 'completed') => void;
  onDeleteUser?: (userId: string) => void;
  onDeleteProgram?: (programId: string) => void;
  onDeleteLecture?: (lectureId: string) => void;
  onEvaluateAssistant?: (lectureId: string, assistantId: string, rating: number, comment: string) => void;
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
  onUpdateLecture,
  onUpdateUserPerformance,
  onUpdateUserProfile,
  onUpdateLectureSettlementStatus,
  onDeleteUser,
  onDeleteProgram,
  onDeleteLecture,
  onEvaluateAssistant,
  onResetDatabase
}: AdminPanelProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'approvals' | 'lectures' | 'settlements' | 'members' | 'mileage' | 'proposals'>('dashboard');
  
  // Lecture Posting States
  const [showAddForm, setShowAddForm] = useState(false);
  const [lectTitle, setLectTitle] = useState('');
  const [lectDescription, setLectDescription] = useState('');
  const [lectTargetTier, setLectTargetTier] = useState<InstructorTier>('Prestige Associate');
  const [lectMainHours, setLectMainHours] = useState<string>('2');
  const [lectAssistantHours, setLectAssistantHours] = useState<string>('0');
  const [lectMaterialCostPerPerson, setLectMaterialCostPerPerson] = useState<string>('0');
  const [lectMaterialCost, setLectMaterialCost] = useState<string>('0');
  const [lectBudget, setLectBudget] = useState<number>(200000);
  const [lectMileageRoyalty, setLectMileageRoyalty] = useState<number>(5000);
  const [lectProgramId, setLectProgramId] = useState('');
  const [lectDate, setLectDate] = useState('2026-07-20');
  const [lectTime, setLectTime] = useState('14:00 - 16:00');
  const [lectDuration, setLectDuration] = useState('2 hours');
  const [lectLocation, setLectLocation] = useState('');
  const [lectAttendees, setLectAttendees] = useState<string>('30');
  const [lectManagerName, setLectManagerName] = useState('');
  const [lectManagerPhone, setLectManagerPhone] = useState('');

  // Lecture Editing States
  const [editingLecture, setEditingLecture] = useState<LectureRequest | null>(null);
  const [editLectTitle, setEditLectTitle] = useState('');
  const [editLectDescription, setEditLectDescription] = useState('');
  const [editLectTargetTier, setEditLectTargetTier] = useState<InstructorTier>('Prestige Associate');
  const [editLectMainHours, setEditLectMainHours] = useState<string>('2');
  const [editLectAssistantHours, setEditLectAssistantHours] = useState<string>('0');
  const [editLectMaterialCostPerPerson, setEditLectMaterialCostPerPerson] = useState<string>('0');
  const [editLectMaterialCost, setEditLectMaterialCost] = useState<string>('0');
  const [editLectBudget, setEditLectBudget] = useState<number>(200000);
  const [editLectMileageRoyalty, setEditLectMileageRoyalty] = useState<number>(5000);
  const [editLectProgramId, setEditLectProgramId] = useState('');
  const [editLectDate, setEditLectDate] = useState('');
  const [editLectTime, setEditLectTime] = useState('');
  const [editLectDuration, setEditLectDuration] = useState('');
  const [editLectLocation, setEditLectLocation] = useState('');
  const [editLectAttendees, setEditLectAttendees] = useState<string>('30');
  const [editLectManagerName, setEditLectManagerName] = useState('');
  const [editLectManagerPhone, setEditLectManagerPhone] = useState('');

  // Start Editing Lecture
  const handleStartEditLecture = (lecture: LectureRequest) => {
    setEditingLecture(lecture);
    setEditLectTitle(lecture.title || '');
    setEditLectDescription(lecture.description || '');
    setEditLectTargetTier(lecture.targetTier || 'Prestige Associate');
    setEditLectMainHours((lecture.mainHours || 2).toString());
    setEditLectAssistantHours((lecture.assistantHours || 0).toString());
    setEditLectMaterialCost((lecture.materialCost || 0).toString());
    const initialMaterial = lecture.materialCost || 0;
    const initialAttendeesCount = lecture.attendees || 30;
    setEditLectMaterialCostPerPerson(Math.round(initialMaterial / (initialAttendeesCount || 1)).toString());
    setEditLectBudget(lecture.budget || 200000);
    setEditLectMileageRoyalty(lecture.mileageRoyalty || 5000);
    setEditLectProgramId(lecture.programId || '');
    setEditLectDate(lecture.date || '');
    setEditLectTime(lecture.time || '');
    setEditLectDuration(lecture.duration || '');
    setEditLectLocation(lecture.location || '');
    setEditLectAttendees((lecture.attendees || 30).toString());
    setEditLectManagerName(lecture.managerName || '');
    setEditLectManagerPhone(lecture.managerPhone || '');
  };

  // Auto-calculate editLectBudget based on hours
  useEffect(() => {
    if (editingLecture) {
      const mainHrs = parseFloat(editLectMainHours) || 0;
      const asstHrs = parseFloat(editLectAssistantHours) || 0;
      const calcBudget = (mainHrs * 100000) + (asstHrs * 50000);
      setEditLectBudget(calcBudget);
    }
  }, [editLectMainHours, editLectAssistantHours, editingLecture]);

  // Auto-calculate editLectMaterialCost based on per person cost and attendees
  useEffect(() => {
    if (editingLecture) {
      const perPerson = parseFloat(editLectMaterialCostPerPerson) || 0;
      const attendees = parseFloat(editLectAttendees) || 0;
      setEditLectMaterialCost(Math.round(perPerson * attendees).toString());
    }
  }, [editLectMaterialCostPerPerson, editLectAttendees, editingLecture]);

  // Save Edited Lecture
  const handleSaveLectureEdit = () => {
    if (!editingLecture || !onUpdateLecture) return;
    
    const selectedProg = programs.find(p => p.id === editLectProgramId);
    const finalBudget = Number(editLectBudget);
    const finalMaterial = Number(editLectMaterialCost);
    const originalTotal = finalBudget + finalMaterial;
    
    const updated: LectureRequest = {
      ...editingLecture,
      title: editLectTitle,
      description: editLectDescription,
      targetTier: editLectTargetTier,
      budget: finalBudget,
      mileageRoyalty: selectedProg 
        ? Math.round(originalTotal * 0.05) 
        : Number(editLectMileageRoyalty),
      programId: editLectProgramId || undefined,
      programTitle: selectedProg ? selectedProg.title : undefined,
      date: editLectDate,
      time: editLectTime,
      duration: editLectDuration,
      location: editLectLocation,
      attendees: editLectAttendees ? Number(editLectAttendees) : undefined,
      managerName: editLectManagerName || undefined,
      managerPhone: editLectManagerPhone || undefined,
      mainHours: Number(editLectMainHours),
      assistantHours: Number(editLectAssistantHours),
      materialCost: finalMaterial,
    };
    
    onUpdateLecture(updated);
    setEditingLecture(null);
  };

  // Auto-calculate lectBudget based on hours
  useEffect(() => {
    const mainHrs = parseFloat(lectMainHours) || 0;
    const asstHrs = parseFloat(lectAssistantHours) || 0;
    const calcBudget = (mainHrs * 100000) + (asstHrs * 50000);
    setLectBudget(calcBudget);
  }, [lectMainHours, lectAssistantHours]);

  // Auto-calculate lectMaterialCost based on per person cost and attendees
  useEffect(() => {
    const perPerson = parseFloat(lectMaterialCostPerPerson) || 0;
    const attendees = parseFloat(lectAttendees) || 0;
    setLectMaterialCost(Math.round(perPerson * attendees).toString());
  }, [lectMaterialCostPerPerson, lectAttendees]);

  // Auto-calculate lectMileageRoyalty as 5% of total cost if designated program is selected
  useEffect(() => {
    if (lectProgramId) {
      const originalTotal = lectBudget + Number(lectMaterialCost);
      const calculatedMileage = Math.round(originalTotal * 0.05);
      setLectMileageRoyalty(calculatedMileage);
    }
  }, [lectProgramId, lectBudget, lectMaterialCost]);

  // Auto-calculate editLectMileageRoyalty as 5% of total cost if designated program is selected in edit form
  useEffect(() => {
    if (editLectProgramId) {
      const originalTotal = editLectBudget + Number(editLectMaterialCost);
      const calculatedMileage = Math.round(originalTotal * 0.05);
      setEditLectMileageRoyalty(calculatedMileage);
    }
  }, [editLectProgramId, editLectBudget, editLectMaterialCost]);
  
  // Search States
  const [memberSearch, setMemberSearch] = useState('');
  const [memberSortType, setMemberSortType] = useState<'name' | 'region' | 'rating'>('name');
  const [txSearch, setTxSearch] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(null);
  
  // Handlers state
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newTier, setNewTier] = useState<InstructorTier>('Prestige Associate');
  const [adjustAmount, setAdjustAmount] = useState<number>(1000);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [adjustReason, setAdjustReason] = useState('특별 우수 교안 가산 프로그램 사용료(로열티) 지급');
  const [mileageInputs, setMileageInputs] = useState<Record<string, string>>({});
  const [royaltyInputs, setRoyaltyInputs] = useState<Record<string, string>>({});

  // Performance and ratings states
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedMode, setExpandedMode] = useState<'performance' | 'profile' | 'evaluations'>('performance');
  const [perfLectureCount, setPerfLectureCount] = useState<string>('0');
  const [perfRatings, setPerfRatings] = useState<number[]>([]);
  const [newRatingInput, setNewRatingInput] = useState<string>('');
  const [perfBankAccount, setPerfBankAccount] = useState<string>('');

  // Instructor Personal Profile editing states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editSpecialties, setEditSpecialties] = useState('');
  const [editCareer, setEditCareer] = useState('');
  const [editEducation, setEditEducation] = useState('');
  const [editCardTheme, setEditCardTheme] = useState<'classic' | 'gold_luxury' | 'midnight_sapphire' | 'elite_emerald'>('classic');

  // Modal states for personal profile editing
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingUserForModal, setEditingUserForModal] = useState<UserProfile | null>(null);

  // Assistant Evaluation Modal states
  const [evaluatingLecture, setEvaluatingLecture] = useState<LectureRequest | null>(null);
  const [evalRating, setEvalRating] = useState<number>(5);
  const [evalComment, setEvalComment] = useState<string>('보조강사 업무를 훌륭하고 성실하게 수행해 주셨습니다.');

  const startEditingProfile = (user: UserProfile) => {
    setEditingUserForModal(user);
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditContactPhone(user.profileCard?.contactPhone || '');
    setEditContactEmail(user.profileCard?.contactEmail || '');
    setEditRegion(user.profileCard?.region || '서울');
    setEditBio(user.profileCard?.bio || '');
    setEditSpecialties((user.profileCard?.specialties || []).join(', '));
    setEditCareer((user.profileCard?.career || []).join('\n'));
    setEditEducation((user.profileCard?.education || []).join('\n'));
    setEditCardTheme(user.profileCard?.cardTheme || 'classic');
    setPerfBankAccount(user.profileCard?.bankAccount || '');
    setIsProfileModalOpen(true);
  };

  const handleCompleteClick = (lecture: LectureRequest) => {
    if (lecture.assistantId && onEvaluateAssistant) {
      setEvaluatingLecture(lecture);
      setEvalRating(5);
      setEvalComment('보조강사 업무를 훌륭하고 성실하게 수행해 주셨습니다.');
    } else {
      onCompleteLecture(lecture.id);
    }
  };

  const handleSaveProfile = (userId: string) => {
    if (!onUpdateUserProfile) return;
    const specialtiesArray = editSpecialties
      ? editSpecialties.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const careerArray = editCareer
      ? editCareer.split('\n').map(c => c.trim()).filter(Boolean)
      : [];
    const educationArray = editEducation
      ? editEducation.split('\n').map(e => e.trim()).filter(Boolean)
      : [];

    onUpdateUserProfile(userId, {
      name: editName.trim(),
      email: editEmail.trim(),
      profileCard: {
        title: (users.find(u => u.uid === userId)?.profileCard?.title || '공인 강사').trim(),
        bio: editBio.trim(),
        specialties: specialtiesArray,
        career: careerArray,
        education: educationArray,
        contactEmail: editContactEmail.trim(),
        contactPhone: editContactPhone.trim(),
        cardTheme: editCardTheme,
        region: editRegion.trim(),
        bankAccount: perfBankAccount.trim()
      }
    });
    setIsProfileModalOpen(false);
    setEditingUserForModal(null);
  };

  const startEditingPerformance = (user: UserProfile) => {
    if (expandedUserId === user.uid && expandedMode === 'performance') {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(user.uid);
      setExpandedMode('performance');
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
    const finalBudget = Number(lectBudget);
    const finalMaterial = Number(lectMaterialCost);
    const originalTotal = finalBudget + finalMaterial;

    const newLect = {
      title: lectTitle,
      description: lectDescription,
      targetTier: lectTargetTier,
      budget: finalBudget,
      mileageRoyalty: selectedProg 
        ? Math.round(originalTotal * 0.05) 
        : Number(lectMileageRoyalty),
      programId: lectProgramId || undefined,
      programTitle: selectedProg ? selectedProg.title : undefined,
      date: lectDate,
      time: lectTime,
      duration: lectDuration,
      location: lectLocation,
      attendees: lectAttendees ? Number(lectAttendees) : undefined,
      managerName: lectManagerName || undefined,
      managerPhone: lectManagerPhone || undefined,
      mainHours: Number(lectMainHours),
      assistantHours: Number(lectAssistantHours),
      materialCost: finalMaterial,
    };

    onAddLecture(newLect);
    setShowAddForm(false);
    
    // Reset Form
    setLectTitle('');
    setLectDescription('');
    setLectTargetTier('Prestige Associate');
    setLectMainHours('2');
    setLectAssistantHours('0');
    setLectMaterialCost('0');
    setLectBudget(200000);
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
    onAdjustMileage(userId, diff, `관리자 프로그램 사용료(로열티) 수동 직접 변경 (최종: ${targetVal.toLocaleString()} M)`);
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
    const finalAmount = adjustType === 'add' ? Math.abs(adjustAmount) : -Math.abs(adjustAmount);
    onAdjustMileage(selectedUser, finalAmount, adjustReason);
    setAdjustAmount(1000);
    setAdjustReason(adjustType === 'add' ? '특별 우수 교안 가산 프로그램 사용료(로열티) 지급' : '특별 규정 위반 또는 취소 사유 프로그램 사용료(로열티) 회수');
  };

  const downloadLectureAsExcel = (lecture: LectureRequest) => {
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
    <td colspan="6" class="header-title">[인사이트9교육연구소] 출강 강의 요청서</td>
  </tr>
  <tr style="height: 10px;"><td colspan="6" style="border: none; height: 10px;"></td></tr>
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
    <td class="align-right">${mainFee.toLocaleString()}원</td>
    <td colspan="2" class="align-center">100,000원 * ${mainHrs}시간</td>
    <td>소득세 원천징수 후 지급</td>
  </tr>
  <tr>
    <td colspan="2" class="align-center">보조강사료</td>
    <td class="align-right">${asstFee.toLocaleString()}원</td>
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
    <td class="align-right">${totalCost.toLocaleString()}원</td>
    <td colspan="2" class="align-center">강사료 합계 + 재료 실비</td>
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
    element.download = `[인사이트9교육연구소]출강강의요청서_${lecture.title.replace(/[\s/\\:*?"<>|]/g, '_')}.xls`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Filter lists
  const pendingLectures = [...lectures]
    .filter(l => l.status !== 'completed')
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  const completedLectures = [...lectures]
    .filter(l => l.status === 'completed')
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
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

  // Filtered lists based on search bar (supporting name, tier, title, and region search)
  const filteredApprovedUsers = approvedUsers.filter(u =>
    u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    u.tier.toLowerCase().includes(memberSearch.toLowerCase()) ||
    (u.profileCard?.title && u.profileCard.title.toLowerCase().includes(memberSearch.toLowerCase())) ||
    (u.profileCard?.region && u.profileCard.region.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  // Helper to dynamically calculate user's average rating in a robust manner
  const getDynamicAverageRating = (user: UserProfile): number => {
    if (user.lectureRatings && user.lectureRatings.length > 0) {
      return Number((user.lectureRatings.reduce((sum, val) => sum + val, 0) / user.lectureRatings.length).toFixed(1));
    }
    return user.averageRating !== undefined ? user.averageRating : 0;
  };

  // Sorted list of approved users based on selected sorting criteria (Region or Rating)
  const sortedApprovedUsers = [...filteredApprovedUsers].sort((a, b) => {
    if (memberSortType === 'region') {
      const regA = (a.profileCard?.region || '서울').trim();
      const regB = (b.profileCard?.region || '서울').trim();
      if (regA !== regB) {
        return regA.localeCompare(regB, 'ko');
      }
      // If regions are identical, sort by average rating descending, then by name
      const ratA = getDynamicAverageRating(a);
      const ratB = getDynamicAverageRating(b);
      if (ratA !== ratB) {
        return ratB - ratA;
      }
      return a.name.localeCompare(b.name, 'ko');
    }
    if (memberSortType === 'rating') {
      const ratA = getDynamicAverageRating(a);
      const ratB = getDynamicAverageRating(b);
      if (ratA !== ratB) {
        return ratB - ratA; // Descending order for satisfaction rating (highest first)
      }
      // If ratings are identical, sort by region, then by name
      const regA = (a.profileCard?.region || '서울').trim();
      const regB = (b.profileCard?.region || '서울').trim();
      if (regA !== regB) {
        return regA.localeCompare(regB, 'ko');
      }
      return a.name.localeCompare(b.name, 'ko');
    }
    // Default: Sort by Name
    return a.name.localeCompare(b.name, 'ko');
  });

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
              가입 승인, 저작권 심사, 강의 매칭 배정, 특별 기여 프로그램 사용료(로열티) 수동 정산 및 실시간 거래 장부를 실시간 원격 통제합니다.
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
          <Users className="w-4 h-4" />
          <span>강사 정보 및 자격 관리</span>
        </button>

        <button
          onClick={() => setActiveTab('mileage')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'mileage'
              ? 'border-kpcia-gold text-kpcia-gold bg-neutral-900/20'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
          id="tab-btn-mileage"
        >
          <Coins className="w-4 h-4" />
          <span>사용료(로열티) 조정 및 원장</span>
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
                  <History className="w-4 h-4 text-kpcia-gold" /> KPCIA 프로그램 사용료(로열티) 누적 트랜잭션 원장 (실시간 감사 장부)
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
                  {txSearch ? '검색어와 일치하는 트랜잭션 기록이 없습니다.' : '기록된 사용료(로열티) 거래가 존재하지 않습니다.'}
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
                    KPCIA에 등록된 모든 강사 가입 이력, 출강 실적, 교육 프로그램 저작권, 프로그램 사용료(로열티) 원장 거래 내역 및 제휴 제안 전체 데이터를 공고 초기 상태로 완전히 포맷합니다.
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
                                <p className="text-[10px] text-neutral-400 mt-0.5">강사의 오리지널 기획을 정교화하고 승인 시 지급될 프로그램 사용료(로열티)를 책정합니다.</p>
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
                                  <label className="text-[9px] font-mono text-amber-500 block mb-1">★ 승인 저작권 프로그램 사용료(로열티) 적립율</label>
                                  <div className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-amber-500/20 text-xs font-bold font-mono text-kpcia-gold">
                                    총 출강비의 5% (자동 적립)
                                  </div>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      onChange={(e) => setLectProgramId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      id="admin-lect-program"
                    >
                      <option value="">연계 프로그램 없음 (자유교안)</option>
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>{p.title} (저작자: {p.authorName})</option>
                      ))}
                    </select>
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

                {/* Hours & Fees & Materials Calculation Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block">
                      주강사 강의 시간 (단가: 100,000원)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="예: 2"
                        value={lectMainHours}
                        onChange={(e) => setLectMainHours(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-semibold text-neutral-100 focus:border-kpcia-gold focus:outline-none transition-colors"
                        id="admin-lect-main-hours"
                      />
                      <span className="absolute right-2.5 top-2 text-[9px] text-neutral-500 font-bold">시간</span>
                    </div>
                    <p className="text-[8.5px] text-neutral-500">※ 기본료: {(parseFloat(lectMainHours || '0') * 100000).toLocaleString()}원</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block">
                      보조강사 강의 시간 (단가: 50,000원)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="예: 0"
                        value={lectAssistantHours}
                        onChange={(e) => setLectAssistantHours(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-semibold text-neutral-100 focus:border-kpcia-gold focus:outline-none transition-colors"
                        id="admin-lect-assistant-hours"
                      />
                      <span className="absolute right-2.5 top-2 text-[9px] text-neutral-500 font-bold">시간</span>
                    </div>
                    <p className="text-[8.5px] text-neutral-500">※ 보조료: {(parseFloat(lectAssistantHours || '0') * 50000).toLocaleString()}원</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block">
                      1인당 재료비 (KRW) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder="예: 10000"
                        value={lectMaterialCostPerPerson}
                        onChange={(e) => setLectMaterialCostPerPerson(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-semibold text-neutral-100 focus:border-kpcia-gold focus:outline-none transition-colors"
                        id="admin-lect-material-cost-per-person"
                      />
                      <span className="absolute right-2.5 top-2 text-[9px] text-neutral-500 font-bold">원</span>
                    </div>
                    <p className="text-[8.5px] text-neutral-500">※ 인원({lectAttendees || '0'}명) 자동 곱산</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 block">
                      재료비 총액 (자동 계산)
                    </label>
                    <div className="relative">
                      <div className="w-full pl-3 pr-8 py-2 rounded-lg bg-neutral-950/60 border border-neutral-850 text-xs font-semibold text-neutral-400 flex items-center h-[34px]">
                        ₩{Number(lectMaterialCost).toLocaleString()}
                      </div>
                      <span className="absolute right-2.5 top-2.5 text-[9px] text-neutral-500 font-bold">원</span>
                    </div>
                    <p className="text-[8.5px] text-neutral-500">※ 실비 정산 및 청구 금액</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-kpcia-gold block">
                      출강 강사료 (자동 계산)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={lectBudget}
                        onChange={(e) => setLectBudget(Number(e.target.value))}
                        className="w-full pl-3 pr-8 py-2 rounded-lg bg-neutral-950 border border-kpcia-gold/30 text-xs font-mono font-bold text-kpcia-gold focus:border-kpcia-gold focus:outline-none transition-colors"
                        id="admin-lect-budget"
                      />
                      <span className="absolute right-2.5 top-2 text-[9px] text-kpcia-gold font-bold">원</span>
                    </div>
                    <p className="text-[8.5px] text-neutral-400">※ 임의 금액 입력/수정 가능</p>
                  </div>
                </div>

                {/* Total Lecture Cost Summary Display Dashboard */}
                {(() => {
                  const isProgramSelected = !!lectProgramId;
                  const originalTotal = lectBudget + Number(lectMaterialCost);
                  const finalTotal = isProgramSelected ? (originalTotal - Math.round(originalTotal * 0.05)) : originalTotal;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-neutral-950/40 border border-neutral-850">
                      <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-neutral-400 font-semibold">① 출강 강사료</div>
                          <div className="text-sm font-bold text-neutral-100 mt-1 font-mono">
                            ₩{lectBudget.toLocaleString()} <span className="text-[10px] font-normal text-neutral-400">원</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono text-right leading-tight">
                          주강사 + 보조강사<br/>수당 합계액
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-neutral-400 font-semibold">② 재료비 총액</div>
                          <div className="text-sm font-bold text-neutral-200 mt-1 font-mono">
                            ₩{Number(lectMaterialCost).toLocaleString()} <span className="text-[10px] font-normal text-neutral-400">원</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono text-right leading-tight">
                          1인당 재료비<br/>× {lectAttendees || 0}명
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-gradient-to-r from-kpcia-gold/15 to-amber-500/5 border border-kpcia-gold/25 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-kpcia-gold font-bold flex items-center gap-1.5">
                            <span>③ 총 출강비 청구액</span>
                            {isProgramSelected && <span className="text-[8px] bg-kpcia-gold/20 text-kpcia-gold px-1 py-0.2 rounded font-normal">지정프로그램 5% 공제</span>}
                          </div>
                          <div className="text-base font-extrabold text-kpcia-gold mt-1 font-mono">
                            ₩{finalTotal.toLocaleString()} <span className="text-xs font-semibold">원</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-kpcia-gold/70 font-mono text-right leading-tight">
                          {isProgramSelected ? (
                            <>
                              강사료+재료비에서<br/>프로그램 사용료(로열티) 5% 차감
                            </>
                          ) : (
                            <>
                              강사료 + 재료비<br/>최종 실청구액
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                        <button
                          type="button"
                          onClick={() => handleStartEditLecture(lecture)}
                          className="px-3.5 py-2 border border-neutral-800 bg-neutral-900 hover:bg-neutral-850 hover:border-kpcia-gold/40 text-neutral-200 hover:text-kpcia-gold text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm w-full sm:w-auto"
                          title="출강 강의 요청 공고 내용을 수정 및 변경합니다."
                          id={`admin-edit-lecture-${lecture.id}`}
                        >
                          <Edit className="w-3.5 h-3.5 text-neutral-400" />
                          <span>공고 수정</span>
                        </button>

                        {onDeleteLecture && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`정말로 '${lecture.title}' 출강 공고를 취소하고 영구 삭제하시겠습니까?`)) {
                                onDeleteLecture(lecture.id);
                              }
                            }}
                            className="px-3.5 py-2 border border-red-900/30 bg-red-950/10 hover:bg-red-950/25 hover:border-red-500 text-red-400 hover:text-red-300 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm w-full sm:w-auto"
                            title="출강 강의 요청 공고를 취소하고 영구 삭제합니다."
                            id={`admin-cancel-lecture-${lecture.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500/80" />
                            <span>공고 삭제</span>
                          </button>
                        )}

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
                              onClick={() => handleCompleteClick(lecture)}
                              className="w-full sm:w-auto px-4 py-2 bg-kpcia-gold text-kpcia-dark text-xs font-extrabold rounded-lg hover:bg-kpcia-gold-hover transition-all flex items-center justify-center space-x-1 shadow-lg shadow-kpcia-gold/10 cursor-pointer"
                              id={`complete-btn-${lecture.id}`}
                            >
                              <CheckCircle className="w-4 h-4 text-kpcia-dark" />
                              <span>출강 완료 승인 & 사용료(로열티) 즉시 정산</span>
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
                <span className="text-lg font-mono font-bold text-emerald-500">
                  {completedLectures.filter(l => l.settlementStatus === 'completed').length}건
                </span>
              </div>
              <div className="p-3.5 bg-neutral-950 border border-neutral-850 rounded-xl text-left">
                <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase block">총 누적 정산 지급액 (송금완료)</span>
                <span className="text-lg font-mono font-bold text-kpcia-gold">
                  {completedLectures.filter(l => l.settlementStatus === 'completed').reduce((sum, l) => sum + l.budget, 0).toLocaleString()}원
                </span>
              </div>
              <div className="p-3.5 bg-neutral-950 border border-neutral-850 rounded-xl text-left">
                <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase block">미지급 대기 잔액</span>
                <span className="text-lg font-mono font-bold text-amber-500">
                  {completedLectures.filter(l => l.settlementStatus !== 'completed').reduce((sum, l) => sum + l.budget, 0).toLocaleString()}원
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
                    <th className="p-3 text-center">송금 처리 및 완료</th>
                    <th className="p-3 text-center">공고 삭제</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850">
                  {completedLectures.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-xs text-neutral-500 italic">
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
                            <div className="flex items-center justify-center gap-2">
                              {lecture.settlementStatus === 'completed' ? (
                                <>
                                  <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                                    ✓ 송금 완료
                                  </span>
                                  <button
                                    onClick={() => onUpdateLectureSettlementStatus?.(lecture.id, 'pending')}
                                    className="px-1.5 py-1 border border-neutral-800 hover:border-neutral-700 hover:text-neutral-200 text-neutral-500 text-[9px] font-bold rounded transition-all cursor-pointer"
                                    title="송금 대기 상태로 변경"
                                    id={`settlement-revert-btn-${lecture.id}`}
                                  >
                                    재설정
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                                    • 익월말 지급 대기
                                  </span>
                                  <button
                                    onClick={() => onUpdateLectureSettlementStatus?.(lecture.id, 'completed')}
                                    className="px-2.5 py-1 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-[10px] font-extrabold rounded transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-kpcia-gold/10"
                                    title="송금 처리 완료로 표기"
                                    id={`settlement-complete-btn-${lecture.id}`}
                                  >
                                    완료
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {onDeleteLecture && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`정말로 완료된 '${lecture.title}' 출강 공고 및 모든 관련 정산 내역을 데이터베이스에서 영구히 삭제하시겠습니까?`)) {
                                    onDeleteLecture(lecture.id);
                                  }
                                }}
                                className="p-1.5 border border-red-900/30 bg-red-950/10 hover:bg-red-950/30 text-red-400 hover:text-red-300 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer hover:border-red-500"
                                title="완료된 공고 영구 삭제"
                                id={`settlement-delete-btn-${lecture.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            )}
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
                         {/* ==================== TAB 4: MEMBERS (강사 정보 및 자격 관리) ==================== */}
        {activeTab === 'members' && (
          <div className="space-y-6 animate-in fade-in duration-200" id="pane-members">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="members-grid">
              
              {/* Left Column: Instructor List (5 Cols) */}
              <div className="lg:col-span-5 bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 text-left flex flex-col h-[650px]" id="members-list-panel">
                <div className="flex items-center justify-between gap-3 border-b border-neutral-800/80 pb-3 mb-4">
                  <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-kpcia-gold" /> 강사 인명부 및 등급 관리
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                    총 {approvedUsers.length}명
                  </span>
                </div>

                {/* Search and Sort controls */}
                <div className="flex flex-col gap-2.5 mb-4">
                  <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="강사 성명 검색..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 focus:border-kpcia-gold focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-500 font-sans">정렬 기준:</span>
                    <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5 text-[9px] h-7">
                      <button
                        onClick={() => setMemberSortType('name')}
                        className={`px-2 py-0.5 rounded transition-all font-bold cursor-pointer ${memberSortType === 'name' ? 'bg-kpcia-gold text-kpcia-dark' : 'text-neutral-450 hover:text-neutral-200'}`}
                      >
                        이름순
                      </button>
                      <button
                        onClick={() => setMemberSortType('region')}
                        className={`px-2 py-0.5 rounded transition-all font-bold cursor-pointer ${memberSortType === 'region' ? 'bg-kpcia-gold text-kpcia-dark' : 'text-neutral-450 hover:text-neutral-200'}`}
                      >
                        지역별
                      </button>
                      <button
                        onClick={() => setMemberSortType('rating')}
                        className={`px-2 py-0.5 rounded transition-all font-bold cursor-pointer ${memberSortType === 'rating' ? 'bg-kpcia-gold text-kpcia-dark' : 'text-neutral-450 hover:text-neutral-200'}`}
                      >
                        만족도순
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scrolling List */}
                <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                  {sortedApprovedUsers.length === 0 ? (
                    <div className="text-center py-12 text-xs text-neutral-500 italic">
                      검색 조건에 맞는 강사가 없습니다.
                    </div>
                  ) : (
                    sortedApprovedUsers.map((user) => {
                      if (user.isAdmin) return null;
                      const isSelected = expandedUserId === user.uid;
                      return (
                        <div 
                          key={user.uid}
                          onClick={() => {
                            setExpandedUserId(user.uid);
                            setExpandedMode('profile');
                            setEditName(user.name || '');
                            setEditEmail(user.email || '');
                            setEditContactPhone(user.profileCard?.contactPhone || '');
                            setEditContactEmail(user.profileCard?.contactEmail || '');
                            setEditRegion(user.profileCard?.region || '서울');
                            setEditBio(user.profileCard?.bio || '');
                            setEditSpecialties((user.profileCard?.specialties || getSpecialtiesList(user)).join(', '));
                            setEditCareer((user.profileCard?.career || []).join('\n'));
                            setEditEducation((user.profileCard?.education || []).join('\n'));
                            setEditCardTheme(user.profileCard?.cardTheme || 'classic');
                            setPerfBankAccount(user.profileCard?.bankAccount || '');
                          }}
                          className={`p-3 rounded-lg border text-left transition-all cursor-pointer relative group ${
                            isSelected 
                              ? 'bg-neutral-800/40 border-kpcia-gold/60 shadow-lg shadow-kpcia-gold/5' 
                              : 'bg-neutral-950/40 border-neutral-850 hover:border-neutral-750'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-neutral-100 flex items-center gap-1.5 flex-wrap">
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditingProfile(user);
                                  }}
                                  className="hover:text-kpcia-gold hover:underline cursor-pointer flex items-center gap-1 group/name font-extrabold"
                                  title="클릭하여 강사 상세 정보 및 프로필 통합 수정하기"
                                >
                                  {user.name}
                                  <Edit3 className="w-3 h-3 text-neutral-500 group-hover/name:text-kpcia-gold inline transition-colors" />
                                </span>
                                <span className="text-[9px] font-mono font-bold text-kpcia-gold bg-kpcia-gold/10 px-1.5 py-0.5 rounded border border-kpcia-gold/20">
                                  {user.tier}
                                </span>
                              </div>
                              <div className="text-[10px] text-neutral-400 font-sans mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span>출강: <strong className="text-neutral-200 font-mono">{user.lectureCount || 0}회</strong></span>
                                <span className="text-neutral-700 font-mono">|</span>
                                <span>평가: <strong className="text-amber-500 font-mono">{user.averageRating !== undefined ? user.averageRating.toFixed(1) : '0.0'}점</strong></span>
                                <span className="text-neutral-700 font-mono">|</span>
                                <span>지역: <strong className="text-neutral-200 font-mono">{user.profileCard?.region || '서울'}</strong></span>
                              </div>
                              
                              {/* Specialties rendering */}
                              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[300px]">
                                {getSpecialtiesList(user).map((spec, sIdx) => (
                                  <span 
                                    key={sIdx} 
                                    className="text-[8.5px] font-medium text-kpcia-gold/90 bg-kpcia-gold/5 border border-kpcia-gold/15 px-1.5 py-0.5 rounded shadow-sm"
                                  >
                                    ⚡ {spec}
                                  </span>
                                ))}
                              </div>

                              <div className="text-[9px] text-neutral-500 font-mono mt-2 flex items-center gap-1">
                                <span>✉ {user.email}</span>
                              </div>
                            </div>

                            {/* Tier Change Inline & Withdrawal - StopPropagation to prevent choosing */}
                            <div className="flex flex-col items-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={user.tier}
                                onChange={(e) => handleUpgrade(user.uid, e.target.value as any)}
                                className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-755 text-[9px] font-bold text-neutral-300 focus:border-kpcia-gold focus:outline-none cursor-pointer"
                                title="등급 즉시 상향/하향"
                              >
                                {tiers.map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>

                              {deletingUserId === user.uid ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      if (onDeleteUser) onDeleteUser(user.uid);
                                      setDeletingUserId(null);
                                    }}
                                    className="px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-bold rounded cursor-pointer"
                                  >
                                    탈퇴확인
                                  </button>
                                  <button
                                    onClick={() => setDeletingUserId(null)}
                                    className="px-1.5 py-0.5 bg-neutral-800 text-neutral-400 text-[8px] rounded cursor-pointer"
                                  >
                                    취소
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingUserId(user.uid)}
                                  className="text-[8px] text-neutral-500 hover:text-red-400 font-bold transition-all"
                                  title="강사회 회원 영구 탈퇴 처리"
                                >
                                  회원탈퇴
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Detailed Editor Dashboard (7 Cols) */}
              <div className="lg:col-span-7" id="members-editor-panel">
                {!expandedUserId ? (
                  /* Blank Slate Unselected State */
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 text-center h-[650px] flex flex-col justify-center items-center">
                    <div className="w-14 h-14 rounded-full bg-neutral-950 flex items-center justify-center border border-neutral-800 mb-4 shadow-inner">
                      <Users className="w-6 h-6 text-neutral-500" />
                    </div>
                    <h4 className="text-sm font-bold text-neutral-300 font-display mb-2">
                      강사 프로필 및 자격 종합 편집실
                    </h4>
                    <p className="text-[11px] text-neutral-400 max-w-sm leading-relaxed mb-6">
                      좌측 강사 목록에서 편집할 강사를 선택해 주십시오. 
                      강사의 인적사항, 노출용 강사 프로필 카드(경력/학력/테마), 
                      정산 계좌 정보, 그리고 출강 실적 및 강의 만족도 평가를 원스톱으로 업데이트할 수 있습니다.
                    </p>
                    <div className="border border-neutral-850 bg-neutral-950/20 px-4 py-3 rounded-lg text-[10px] text-neutral-500 italic flex items-center gap-1.5 text-center">
                      <span>💡 팁: 등급 권한은 목록에서 직접 빠르고 편리하게 변경할 수 있습니다.</span>
                    </div>
                  </div>
                ) : (() => {
                  const selectedUserProfile = users.find(u => u.uid === expandedUserId);
                  if (!selectedUserProfile) return null;
                  return (
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 text-left h-[650px] flex flex-col animate-in fade-in zoom-in-95 duration-150">
                      
                      {/* Header info */}
                      <div className="border-b border-neutral-800 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-extrabold text-neutral-100 flex items-center gap-1.5">
                            <Edit3 className="w-4 h-4 text-kpcia-gold" /> {selectedUserProfile.name} 강사 통합 관리실
                          </h3>
                          <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            UID: {selectedUserProfile.uid} | 회원 가입일: {selectedUserProfile.createdAt ? selectedUserProfile.createdAt.split('T')[0] : '미기재'}
                          </p>
                        </div>

                        {/* Mode selector tab-like buttons */}
                        <div className="flex bg-neutral-950 p-1 border border-neutral-800 rounded-lg shrink-0">
                          <button
                            onClick={() => {
                              setExpandedMode('profile');
                              setEditName(selectedUserProfile.name || '');
                              setEditEmail(selectedUserProfile.email || '');
                              setEditContactPhone(selectedUserProfile.profileCard?.contactPhone || '');
                              setEditContactEmail(selectedUserProfile.profileCard?.contactEmail || '');
                              setEditRegion(selectedUserProfile.profileCard?.region || '서울');
                              setEditBio(selectedUserProfile.profileCard?.bio || '');
                              setEditSpecialties((selectedUserProfile.profileCard?.specialties || []).join(', '));
                              setEditCareer((selectedUserProfile.profileCard?.career || []).join('\n'));
                              setEditEducation((selectedUserProfile.profileCard?.education || []).join('\n'));
                              setEditCardTheme(selectedUserProfile.profileCard?.cardTheme || 'classic');
                              setPerfBankAccount(selectedUserProfile.profileCard?.bankAccount || '');
                            }}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                              expandedMode === 'profile' 
                                ? 'bg-kpcia-gold text-neutral-950' 
                                : 'text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            개인 프로필 수정
                          </button>
                          <button
                            onClick={() => {
                              setExpandedMode('performance');
                              setPerfLectureCount((selectedUserProfile.lectureCount || 0).toString());
                              setPerfRatings(selectedUserProfile.lectureRatings || []);
                              setNewRatingInput('');
                              setPerfBankAccount(selectedUserProfile.profileCard?.bankAccount || '');
                            }}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                              expandedMode === 'performance' 
                                ? 'bg-kpcia-gold text-neutral-950' 
                                : 'text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            실적 및 평가 관리
                          </button>
                          <button
                            onClick={() => {
                              setExpandedMode('evaluations');
                            }}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                              expandedMode === 'evaluations' 
                                ? 'bg-kpcia-gold text-neutral-950' 
                                : 'text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            동행 평가 피드백 ({selectedUserProfile.assistantEvaluations?.length || 0}건)
                          </button>
                        </div>
                      </div>

                      {/* Body - Scrolling content */}
                      <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-4">
                        
                        {/* Dynamic Promotion Recommendation Banner */}
                        {(() => {
                          const promoStatus = getPromotionStatus(selectedUserProfile);
                          if (!promoStatus || !promoStatus.isEligible) return null;
                          return (
                            <div className="bg-gradient-to-r from-kpcia-gold/15 via-neutral-950 to-neutral-950 border border-kpcia-gold/40 p-3.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left animate-in fade-in duration-300">
                              <div className="space-y-0.5">
                                <h4 className="text-xs font-bold text-kpcia-gold flex items-center gap-1.5 uppercase font-mono">
                                  <Award className="w-4 h-4 text-kpcia-gold animate-bounce" /> KPCIA 승급 대상 감지됨
                                </h4>
                                <p className="text-[10.5px] text-neutral-300 leading-relaxed font-sans">
                                  {selectedUserProfile.name} 강사님은 출강 <strong>{promoStatus.currentLectures}회</strong> 및 누적 평균 만족도 <strong>{promoStatus.currentAvgRating5.toFixed(2)}점</strong>으로 <strong>{promoStatus.nextTier}</strong> 승격 자격(기준: {promoStatus.requiredLectures}회 / {promoStatus.requiredRating}점)을 충족하였습니다.
                                </p>
                              </div>
                              <button
                                onClick={() => onUpgradeUserTier(selectedUserProfile.uid, promoStatus.nextTier)}
                                className="px-3.5 py-1.5 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-[10px] font-black rounded-lg transition-all shadow-md flex items-center gap-1 cursor-pointer shrink-0"
                              >
                                <Award className="w-3.5 h-3.5 text-kpcia-dark" />
                                <span>즉시 승격 승인</span>
                              </button>
                            </div>
                          );
                        })()}

                        {expandedMode === 'profile' && (
                          <div className="bg-neutral-950/40 border border-neutral-850 p-6 rounded-xl text-center space-y-4 animate-in fade-in duration-200">
                            <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 mx-auto">
                              <Users className="w-5 h-5 text-kpcia-gold" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-neutral-200">
                                {selectedUserProfile.name} 강사의 개인 정보 및 프로필 정밀 편집
                              </h4>
                              <p className="text-[10.5px] text-neutral-400 max-w-sm mx-auto leading-relaxed">
                                인적사항(성명/이메일), 프로필 카드 세부 항목(경력/학력/소개), 주 활동지역 및 계좌번호, 카드 디자인 테마 등을 전용 팝업 편집창에서 쾌적하고 편리하게 수정할 수 있습니다.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => startEditingProfile(selectedUserProfile)}
                              className="px-4 py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 mx-auto cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4 text-kpcia-dark" />
                              <span>프로필 정밀 편집기 팝업 열기</span>
                            </button>
                          </div>
                        )}

                        {expandedMode === 'performance' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-4">
                                <div>
                                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">총 출강 강의 수</label>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-24 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-850 text-xs text-neutral-400 font-mono font-bold select-none text-center">
                                      {perfLectureCount}
                                    </div>
                                    <span className="text-xs text-neutral-400 font-bold">회 출강 완료</span>
                                  </div>
                                  <p className="text-[9px] text-neutral-500 mt-1">※ 누적 출강 횟수는 강의 만족도 평점을 추가하거나 삭제하면 자동으로 가감 반영됩니다.</p>
                                </div>

                                <div className="pt-3 border-t border-neutral-800/60">
                                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">🏦 정산 정보용 강사 계좌번호</label>
                                  <input
                                    type="text"
                                    placeholder="예: 국민은행 045-3424-234234"
                                    value={perfBankAccount}
                                    onChange={(e) => setPerfBankAccount(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                                  />
                                  <p className="text-[9px] text-neutral-500 mt-1">※ 정산실 탭과 프로필 카드에 공통으로 표기되는 강사의 대표 수당 수령 계좌입니다.</p>
                                </div>

                                <div className="pt-3 border-t border-neutral-800/60">
                                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">신규 강의 만족도 평점 평가 기록 추가 (0.0 ~ 5.0 만점)</label>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      min={0}
                                      max={5}
                                      step={0.1}
                                      placeholder="예: 4.9"
                                      value={newRatingInput}
                                      onChange={(e) => setNewRatingInput(e.target.value)}
                                      className="w-24 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none font-mono"
                                    />
                                    <span className="text-xs text-neutral-400">점</span>
                                    <button
                                      type="button"
                                      onClick={handleAddRating}
                                      disabled={!newRatingInput}
                                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-kpcia-gold text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-40"
                                    >
                                      추가
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Existing Ratings List & Stats on Right */}
                              <div className="bg-neutral-950/40 border border-neutral-850 p-4 rounded-xl space-y-3">
                                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 border-b border-neutral-900 pb-2">
                                  <span>등록된 강의 피드백 평점 목록 ({perfRatings.length}건)</span>
                                  <span className="text-kpcia-gold font-mono font-black text-xs">
                                    평균: {perfRatings.length > 0 ? (perfRatings.reduce((a, b) => a + b, 0) / perfRatings.length).toFixed(1) : '0.0'}점 / 5.0
                                  </span>
                                </div>

                                {perfRatings.length === 0 ? (
                                  <div className="text-center py-12 text-xs text-neutral-500 italic">
                                    수집된 출강 만족도 피드백 평점이 없습니다. 좌측 하단에서 만족도 점수를 입력해 주십시오.
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1 animate-in fade-in">
                                    {perfRatings.map((rating, idx) => (
                                      <div 
                                        key={idx} 
                                        className="flex items-center justify-between px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 group"
                                      >
                                        <span>{rating}점</span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveRating(idx)}
                                          className="text-red-500 hover:text-red-400 transition-colors text-[10px] font-black cursor-pointer opacity-80 group-hover:opacity-100"
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
                          </div>
                        )}

                        {expandedMode === 'evaluations' && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="bg-neutral-950/45 border border-neutral-850 p-5 rounded-xl space-y-3">
                              <div className="flex items-center justify-between text-xs font-bold text-neutral-300 border-b border-neutral-900 pb-2.5">
                                <span className="flex items-center gap-1.5">
                                  <Users className="w-4 h-4 text-kpcia-gold" />
                                  상위 등급 강사 출강 동행 평가 피드백 ({selectedUserProfile.assistantEvaluations?.length || 0}건)
                                </span>
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  Prestige Member 보조강사 동행 전용
                                </span>
                              </div>

                              {!selectedUserProfile.assistantEvaluations || selectedUserProfile.assistantEvaluations.length === 0 ? (
                                <div className="text-center py-14 text-xs text-neutral-500 italic font-sans">
                                  아직 상위 등급 강사로부터 받은 보조강사 동행 평가가 없습니다.
                                </div>
                              ) : (
                                <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                                  {selectedUserProfile.assistantEvaluations.map((evalItem) => (
                                    <div key={evalItem.id} className="p-4 rounded-lg bg-neutral-950 border border-neutral-850 text-left space-y-2.5">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-0.5">
                                          <div className="text-[11px] font-extrabold text-neutral-200 font-sans">
                                            {evalItem.lectureTitle}
                                          </div>
                                          <div className="text-[10px] text-neutral-500 font-mono">
                                            평가일자: {evalItem.createdAt ? evalItem.createdAt.split('T')[0] : '미기재'}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-kpcia-gold/10 border border-kpcia-gold/20 px-2 py-0.5 rounded text-kpcia-gold font-mono font-bold text-[10px] shrink-0">
                                          ★ {evalItem.rating.toFixed(1)}점
                                        </div>
                                      </div>

                                      <div className="text-xs text-neutral-300 leading-relaxed font-sans bg-neutral-900/60 p-2.5 rounded border border-neutral-850/40">
                                        {evalItem.comment}
                                      </div>

                                      <div className="text-[10px] text-neutral-400 font-sans flex items-center justify-end gap-1.5">
                                        <span>평가자: </span>
                                        <strong className="text-neutral-300 font-extrabold">{evalItem.evaluatorName}</strong>
                                        <span className="bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-850 text-[8.5px] font-mono text-neutral-400">
                                          {evalItem.evaluatorTier}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Footer buttons */}
                      <div className="border-t border-neutral-800 pt-3 flex items-center justify-end gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setExpandedUserId(null)}
                          className="px-4 py-2 border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 text-xs font-bold rounded-xl cursor-pointer"
                        >
                          목록으로 돌아가기
                        </button>
                        {expandedMode === 'profile' ? (
                          <button
                            type="button"
                            onClick={() => handleSaveProfile(selectedUserProfile.uid)}
                            className="px-5 py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-extrabold rounded-xl flex items-center gap-1 shadow-md shadow-kpcia-gold/10 cursor-pointer"
                          >
                            <Check className="w-4 h-4 text-kpcia-dark" />
                            <span>프로필 변경사항 최종 저장</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSavePerformance(selectedUserProfile.uid)}
                            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 text-xs font-extrabold rounded-xl flex items-center gap-1 shadow-md shadow-emerald-500/10 cursor-pointer"
                          >
                            <Check className="w-4 h-4 text-neutral-950" />
                            <span>출강 실적 및 만족도 저장</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        )}

        {/* ==================== TAB 4-2: MILEAGE (사용료(로열티) 조정 및 원장) ==================== */}
        {activeTab === 'mileage' && (
          <div className="space-y-6 animate-in fade-in duration-200" id="pane-mileage">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="mileage-grid">
              
              {/* Left Bento: Direct Mileage Adjust & Program Royalties (6 Cols) */}
              <div className="lg:col-span-6 space-y-6" id="mileage-left-bento">
                
                {/* Direct Mileage Adjust List */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 text-left flex flex-col h-[350px]" id="mileage-direct-adjust-panel">
                  <div className="flex items-center justify-between gap-3 border-b border-neutral-800/80 pb-3 mb-3">
                    <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-kpcia-gold" /> 강사별 사용료(로열티) 정밀 개별 조정
                    </h3>
                    <div className="relative w-40">
                      <Search className="absolute left-2 top-1.5 w-3 h-3 text-neutral-500" />
                      <input
                        type="text"
                        placeholder="성명 검색..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        className="w-full pl-7 pr-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-100 placeholder-neutral-500 focus:border-kpcia-gold focus:outline-none h-6"
                      />
                    </div>
                  </div>

                  {/* List Table */}
                  <div className="overflow-y-auto flex-1 pr-1">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-850 text-neutral-500 text-[9px] font-mono text-left">
                          <th className="pb-2 font-normal">성명</th>
                          <th className="pb-2 font-normal">등급 권한</th>
                          <th className="pb-2 font-normal text-right">현재 사용료(로열티)</th>
                          <th className="pb-2 font-normal text-center w-36">수동 변경</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900/40">
                        {approvedUsers.filter(u => !u.isAdmin && u.name.toLowerCase().includes(memberSearch.toLowerCase())).map((user) => (
                          <tr key={user.uid} className="hover:bg-neutral-950/20 text-neutral-300 text-xs">
                            <td className="py-2.5 font-bold text-neutral-200">{user.name}</td>
                            <td className="py-2.5 text-[10px] text-neutral-400">{user.tier.split(' ')[1] || user.tier}</td>
                            <td className="py-2.5 text-right font-mono font-bold text-kpcia-gold">{user.mileage.toLocaleString()} M</td>
                            <td className="py-2.5 text-center">
                              <div className="flex items-center justify-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="number"
                                  title="사용료(로열티) 조정"
                                  value={mileageInputs[user.uid] !== undefined ? mileageInputs[user.uid] : user.mileage}
                                  onChange={(e) => handleMileageChange(user.uid, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleApplyDirectMileage(user.uid, user.mileage);
                                    }
                                  }}
                                  className="w-16 px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-[10px] text-center font-mono text-kpcia-gold focus:border-kpcia-gold focus:outline-none"
                                  id={`input-mileage-${user.uid}`}
                                />
                                <span className="text-[9px] text-neutral-500 font-mono">M</span>
                                {mileageInputs[user.uid] !== undefined && mileageInputs[user.uid] !== user.mileage.toString() && (
                                  <button
                                    onClick={() => handleApplyDirectMileage(user.uid, user.mileage)}
                                    className="px-1.5 py-0.5 rounded bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-[9px] font-black cursor-pointer shadow"
                                    id={`apply-mileage-btn-${user.uid}`}
                                  >
                                    저장
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Educational Program Mileage Adjustments */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 text-left h-[274px] flex flex-col" id="program-royalty-management">
                  <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 mb-2 border-b border-neutral-800/80 pb-2.5">
                    <BookOpen className="w-4 h-4 text-kpcia-gold" /> 등재 교육 콘텐츠별 정산 사용료(로열티) 조율
                  </h3>
                  <p className="text-[10px] text-neutral-400 mb-3">
                    강사가 기획 등재한 콘텐츠가 다른 강사에 의해 출강 완료 시, 해당 원작자 강사에게 총 출강비의 5% 프로그램 사용료(로열티)가 지적재산 로열티로 즉시 자동 정산 누적됩니다.
                  </p>
                  <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                    {programs.filter(p => p.isApproved !== false).map((program) => (
                      <div 
                        key={program.id}
                        className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 flex items-center justify-between gap-3 text-left"
                      >
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-neutral-200 truncate">{program.title}</h4>
                          <p className="text-[9px] text-neutral-400">원작자: {program.authorName}</p>
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
                              >
                                예
                              </button>
                              <button
                                onClick={() => setDeletingProgramId(null)}
                                className="px-1.5 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-[8px] font-bold rounded cursor-pointer"
                              >
                                아니오
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingProgramId(program.id)}
                              className="p-1 rounded text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
                              title="교육 콘텐츠 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <span className="text-[10px] text-kpcia-gold font-bold font-mono bg-kpcia-gold/10 px-2.5 py-1 rounded border border-kpcia-gold/20">
                            총 출강비의 5%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Bento: Special Hand Adjustment & Mileage Ledger (6 Cols) */}
              <div className="lg:col-span-6 space-y-6" id="mileage-right-bento">
                
                {/* Special Hand Adjustment Form */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 text-left" id="mileage-adjust-panel">
                  <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 mb-3 border-b border-neutral-800/80 pb-2.5">
                    <DollarSign className="w-4 h-4 text-kpcia-gold" /> 특별 공로 사용료(로열티) 직접 수동 변동 처리
                  </h3>
                  <form onSubmit={handleAdjustSubmit} className="space-y-3.5" id="mileage-adjust-form">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 block mb-1">지급/차감 대상 강사 지정</label>
                      <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none cursor-pointer"
                      >
                        <option value="">강사를 지정하십시오</option>
                        {approvedUsers.map(u => (
                          <option key={u.uid} value={u.uid}>{u.name} ({u.tier.split(' ')[1] || u.tier})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 block mb-1">사용료(로열티) 조정 구분</label>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustType('add');
                            setAdjustReason('특별 우수 교안 가산 프로그램 사용료(로열티) 지급');
                          }}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                            adjustType === 'add'
                              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/10'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-300'
                          }`}
                        >
                          ➕ 사용료(로열티) 지급 (넣기)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustType('subtract');
                            setAdjustReason('특별 규정 위반 또는 취소 사유 프로그램 사용료(로열티) 회수');
                          }}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                            adjustType === 'subtract'
                              ? 'bg-red-950/40 border-red-500 text-red-400 shadow-sm shadow-red-500/10'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-300'
                          }`}
                        >
                          ➖ 사용료(로열티) 차감 (빼기)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-400 block mb-1">변동 사용료(로열티) 값</label>
                        <input
                          type="number"
                          placeholder="예: 3000"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(Math.abs(Number(e.target.value)))}
                          required
                          className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-400 block mb-1">변동 형식</label>
                        <div className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-bold text-center">
                          {adjustType === 'add' ? (
                            <span className="text-emerald-400">+ 지급 처리 (가산)</span>
                          ) : (
                            <span className="text-red-400">- 회수 처리 (차감)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 block mb-1">변동 지급/회수 구체 사유</label>
                      <input
                        type="text"
                        placeholder="예: 최우수 교육 보조자료 개발 공헌 공로 가산"
                        value={adjustReason}
                        onChange={(e) => setAdjustReason(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedUser}
                      className="w-full py-2 bg-neutral-950 hover:bg-neutral-900 border border-kpcia-gold text-kpcia-gold font-bold text-xs rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {adjustType === 'add' ? '🎁 사용료(로열티) 지급 실행' : '⚠️ 사용료(로열티) 차감/회수 실행'}
                    </button>
                  </form>
                </div>

                {/* Association Mileage Ledger (History Transactions) */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 text-left h-[300px] flex flex-col" id="mileage-ledger-panel">
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 mb-3">
                    <h3 className="text-xs font-bold font-display uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-kpcia-gold" /> 협회 사용료(로열티) 거래 종합 원장 (Ledger)
                    </h3>
                    <span className="text-[9px] font-mono font-bold text-neutral-500 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                      총 {transactions.length}건 기록됨
                    </span>
                  </div>

                  {/* Ledger table */}
                  <div className="overflow-y-auto flex-1 pr-1">
                    {transactions.length === 0 ? (
                      <div className="text-center py-12 text-xs text-neutral-500 italic">
                        거래 내역 원장이 존재하지 않습니다.
                      </div>
                    ) : (
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-neutral-850 text-neutral-500 text-[9px] font-mono">
                            <th className="pb-2 font-normal">일자</th>
                            <th className="pb-2 font-normal">대상 강사</th>
                            <th className="pb-2 font-normal text-center">분류</th>
                            <th className="pb-2 font-normal text-right">변동량</th>
                            <th className="pb-2 font-normal pl-4">사유 및 상세</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-900/35">
                          {[...transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((tx) => {
                            const isPositive = tx.amount >= 0;
                            let typeLabel = '기타';
                            let typeColor = 'text-neutral-400 bg-neutral-950';
                            if (tx.type === 'admin_adjust') {
                              typeLabel = '수동조정';
                              typeColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
                            } else if (tx.type === 'lecture_payout') {
                              typeLabel = '강의수당';
                              typeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                            } else if (tx.type === 'royalty') {
                              typeLabel = '콘텐츠로열티';
                              typeColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                            } else if (tx.type === 'program_register') {
                              typeLabel = '콘텐츠등록';
                              typeColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
                            }

                            return (
                              <tr key={tx.id} className="text-[11px] hover:bg-neutral-950/20 text-neutral-300">
                                <td className="py-2 text-neutral-400 font-mono" title={tx.createdAt}>
                                  {tx.createdAt ? tx.createdAt.split('T')[0] : '미기재'}
                                </td>
                                <td className="py-2 font-bold text-neutral-200">{tx.userName}</td>
                                <td className="py-2 text-center">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${typeColor}`}>
                                    {typeLabel}
                                  </span>
                                </td>
                                <td className={`py-2 text-right font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {isPositive ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} M
                                </td>
                                <td className="py-2 pl-4 text-neutral-400 truncate max-w-[120px]" title={tx.description}>
                                  {tx.description}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
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

        {/* ==================== GLOBAL PERSONAL PROFILE EDIT MODAL ==================== */}
        {isProfileModalOpen && editingUserForModal && (
          <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-kpcia-gold" />
                  <div>
                    <h3 className="text-xs font-bold text-neutral-200">
                      [{editName}] 강사 개인 정보 및 프로필 정밀 편집
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      UID: {editingUserForModal.uid}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setEditingUserForModal(null);
                  }}
                  className="w-7 h-7 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 flex items-center justify-center text-xs transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body - Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Name & Email Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">강사 성명</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      placeholder="강사 본명 기재"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">가입 로그인 이메일</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      placeholder="계정 아이디용 이메일"
                    />
                  </div>
                </div>

                {/* Contact Phone & Contact Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">프로필 노출용 전화번호</label>
                    <input
                      type="text"
                      value={editContactPhone}
                      onChange={(e) => setEditContactPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      placeholder="예: 010-1234-5678"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">프로필 노출용 연락처 이메일</label>
                    <input
                      type="email"
                      value={editContactEmail}
                      onChange={(e) => setEditContactEmail(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      placeholder="예: info@email.com"
                    />
                  </div>
                </div>

                {/* Region & Bank Account */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">활동 주지역</label>
                    <select
                      value={editRegion}
                      onChange={(e) => setEditRegion(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none cursor-pointer"
                    >
                      {['서울', '경기', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">🏦 정산 은행 및 계좌번호</label>
                    <input
                      type="text"
                      value={perfBankAccount}
                      onChange={(e) => setPerfBankAccount(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                      placeholder="예: 신한은행 110-345-XXXXXX"
                    />
                  </div>
                </div>

                {/* Bio & Specialties */}
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">프로필 메인 한줄 소개 (Bio)</label>
                  <input
                    type="text"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                    placeholder="소개 카드를 장식할 시그니처 소개 구절을 입력하십시오."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">전문 강의 분야 (쉼표로 구분)</label>
                  <input
                    type="text"
                    value={editSpecialties}
                    onChange={(e) => setEditSpecialties(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                    placeholder="예: 마이크로프로세서, 임베디드, IOT 설계, 인공지능 엔지니어링"
                  />
                </div>

                {/* Career & Education Textareas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">주요 약력 / 출강 경력 (한 줄에 하나씩)</label>
                    <textarea
                      rows={4}
                      value={editCareer}
                      onChange={(e) => setEditCareer(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none font-sans leading-relaxed resize-none"
                      placeholder="예: 前 삼성전자 수석 연구원&#10;現 한국임베디드협회 수석 교육위원"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 block mb-1">학력 및 보유 전문 자격 (한 줄에 하나씩)</label>
                    <textarea
                      rows={4}
                      value={editEducation}
                      onChange={(e) => setEditEducation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-kpcia-gold focus:outline-none font-sans leading-relaxed resize-none"
                      placeholder="예: 카이스트 정보통신공학 석사 졸업&#10;임베디드소프트웨어 정밀 자격증 (S급)"
                    />
                  </div>
                </div>

                {/* Card Theme Picker */}
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 block mb-2">디지털 강사카드 비주얼 테마</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'classic', name: '클래식 슬레이트', color: 'border-neutral-700 bg-neutral-950 text-neutral-300' },
                      { id: 'gold_luxury', name: '골드 럭셔리', color: 'border-kpcia-gold/40 bg-gradient-to-br from-neutral-950 to-amber-950/20 text-kpcia-gold' },
                      { id: 'midnight_sapphire', name: '미드나잇 사파이어', color: 'border-blue-900/40 bg-gradient-to-br from-neutral-950 to-blue-950/20 text-blue-400' },
                      { id: 'emerald_elite', name: '엘리트 에메랄드', color: 'border-emerald-900/40 bg-gradient-to-br from-neutral-950 to-emerald-950/20 text-emerald-400' }
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setEditCardTheme(theme.id as any)}
                        className={`p-2 rounded-lg border text-[10px] font-extrabold text-center transition-all cursor-pointer ${theme.color} ${
                          editCardTheme === theme.id 
                            ? 'ring-2 ring-kpcia-gold border-kpcia-gold scale-[1.02]' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-neutral-800 bg-neutral-950/40 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setEditingUserForModal(null);
                  }}
                  className="px-4 py-2 border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 text-xs font-bold rounded-xl cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveProfile(editingUserForModal.uid)}
                  className="px-5 py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-md shadow-kpcia-gold/10 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-kpcia-dark" />
                  <span>변경사항 저장하기</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ASSISTANT EVALUATION MODAL ==================== */}
        {evaluatingLecture && evaluatingLecture.assistantId && (
          <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-kpcia-gold" />
                  <div>
                    <h3 className="text-xs font-bold text-neutral-200">
                      보조강사 파트너 종합 평가 피드백
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      강의명: {evaluatingLecture.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEvaluatingLecture(null)}
                  className="w-7 h-7 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 flex items-center justify-center text-xs transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 text-left">
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 text-xs">
                  <p className="text-neutral-400 leading-relaxed">
                    동행한 보조강사 <strong className="text-kpcia-gold">{evaluatingLecture.assistantName}</strong> 님의 강의 실습 및 지원 업무 성과를 공정하게 평가해 주세요. 본 피드백은 강사 역량 향상 및 출강 데이터 원장에 기록됩니다.
                  </p>
                </div>

                {/* Star rating selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 block">만족도 평점</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setEvalRating(score)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                      >
                        <svg
                          className={`w-8 h-8 ${score <= evalRating ? 'text-amber-400 fill-current' : 'text-neutral-600'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.24.588 1.81l-3.97 2.88a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.97-2.88a1 1 0 00-1.176 0l-3.97 2.88c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.97-2.88c-.772-.57-.372-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z"
                          />
                        </svg>
                      </button>
                    ))}
                    <span className="text-sm font-mono font-bold text-amber-400 ml-2">{evalRating}.0 / 5.0</span>
                  </div>
                </div>

                {/* Comment area */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 block">종합 지원 의견 및 피드백</label>
                  <textarea
                    rows={3}
                    value={evalComment}
                    onChange={(e) => setEvalComment(e.target.value)}
                    placeholder="보조강사의 실습 태도, 학습 조력 정도 등에 대한 피드백을 기재해 주세요."
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-neutral-800 bg-neutral-950/40 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEvaluatingLecture(null)}
                  className="px-4 py-2 border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 text-xs font-bold rounded-xl cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (onEvaluateAssistant && evaluatingLecture.assistantId) {
                       await onEvaluateAssistant(evaluatingLecture.id, evaluatingLecture.assistantId, evalRating, evalComment);
                    }
                    onCompleteLecture(evaluatingLecture.id);
                    setEvaluatingLecture(null);
                  }}
                  className="px-5 py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-md shadow-kpcia-gold/10 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-kpcia-dark" />
                  <span>평가 완료 & 출강 최종 승인</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== LECTURE EDITING MODAL ==================== */}
        {editingLecture && (
          <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-kpcia-gold" />
                  <div>
                    <h3 className="text-xs font-bold text-neutral-200">
                      출강 강의 공고 요청서 수정 및 변경
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      강의 ID: {editingLecture.id}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingLecture(null)}
                  className="w-7 h-7 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 flex items-center justify-center text-xs transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 overflow-y-auto text-left text-xs">
                {/* 1. Basic Info */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-kpcia-gold uppercase tracking-wider pb-1 border-b border-neutral-800">
                    기본 강의 정보
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-semibold block">강의 대표 주제명 *</label>
                      <input
                        type="text"
                        value={editLectTitle}
                        onChange={(e) => setEditLectTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-medium focus:border-kpcia-gold focus:outline-none text-xs"
                        placeholder="예: 인공지능 디지털 혁신 특강"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-semibold block">연계 교육 과정 교안</label>
                      <select
                        value={editLectProgramId}
                        onChange={(e) => setEditLectProgramId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-150 font-medium focus:border-kpcia-gold focus:outline-none text-xs"
                      >
                        <option value="">-- 연계 공인 교안 없음 (순수 개별 위탁 출강) --</option>
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} (저작권료 요율: 총 출강비의 5%)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-400 font-semibold block">강의 상세 안내 및 의뢰 시놉시스 *</label>
                    <textarea
                      rows={3}
                      value={editLectDescription}
                      onChange={(e) => setEditLectDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-medium focus:border-kpcia-gold focus:outline-none text-xs resize-none"
                      placeholder="강의 개요, 수강 대상 및 세부 커리큘럼 아웃라인 기재"
                    />
                  </div>
                </div>

                {/* 2. Schedule & Target */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-bold text-kpcia-gold uppercase tracking-wider pb-1 border-b border-neutral-800">
                    일정 및 지원 자격 조건
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-semibold block">출강 일자 *</label>
                      <input
                        type="date"
                        value={editLectDate}
                        onChange={(e) => setEditLectDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-medium focus:border-kpcia-gold focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-semibold block">출강 상세 시간대 *</label>
                      <input
                        type="text"
                        value={editLectTime}
                        onChange={(e) => setEditLectTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-medium focus:border-kpcia-gold focus:outline-none text-xs"
                        placeholder="예: 14:00 - 16:00"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-semibold block">강의 총 시간 (Duration) *</label>
                      <input
                        type="text"
                        value={editLectDuration}
                        onChange={(e) => setEditLectDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-medium focus:border-kpcia-gold focus:outline-none text-xs"
                        placeholder="예: 2 hours"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-semibold block">출강 장소/기관 정보 *</label>
                      <input
                        type="text"
                        value={editLectLocation}
                        onChange={(e) => setEditLectLocation(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-medium focus:border-kpcia-gold focus:outline-none text-xs"
                        placeholder="예: 현대자동차 상계 연수원"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-semibold block">교육 예상 수강 인원 *</label>
                      <input
                        type="number"
                        value={editLectAttendees}
                        onChange={(e) => setEditLectAttendees(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-medium focus:border-kpcia-gold focus:outline-none text-xs"
                        placeholder="예: 30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-semibold block">최소 자격 허들 등급 *</label>
                      <select
                        value={editLectTargetTier}
                        onChange={(e) => setEditLectTargetTier(e.target.value as InstructorTier)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-medium focus:border-kpcia-gold focus:outline-none text-xs"
                      >
                        <option value="Prestige Member">Prestige Member (일반)</option>
                        <option value="Prestige Associate">Prestige Associate (어소시에이트)</option>
                        <option value="Prestige Professional">Prestige Professional (프로페셔널)</option>
                        <option value="Prestige Master">Prestige Master (마스터)</option>
                        <option value="Prestige Elite">Prestige Elite (엘리트)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Hours & Expenses & Contact */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-bold text-kpcia-gold uppercase tracking-wider pb-1 border-b border-neutral-800">
                    출강 예산 세무 구성 및 비상 연락처
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-semibold block">주강사 강의 시간 *</label>
                      <input
                        type="number"
                        step="0.5"
                        value={editLectMainHours}
                        onChange={(e) => setEditLectMainHours(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-medium focus:border-kpcia-gold focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-semibold block">보조강사 배정 시간 *</label>
                      <input
                        type="number"
                        step="0.5"
                        value={editLectAssistantHours}
                        onChange={(e) => setEditLectAssistantHours(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-medium focus:border-kpcia-gold focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-semibold block">1인당 재료비 *</label>
                      <input
                        type="number"
                        value={editLectMaterialCostPerPerson}
                        onChange={(e) => setEditLectMaterialCostPerPerson(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-medium focus:border-kpcia-gold focus:outline-none text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-semibold block">재료비 총액 (자동 계산)</label>
                      <div className="w-full px-3 py-2 rounded-lg bg-neutral-950/60 border border-neutral-850 text-neutral-400 font-semibold text-xs flex items-center h-[34px]">
                        ₩{Number(editLectMaterialCost).toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-kpcia-gold font-semibold block">출강 강사료 (자동 계산)</label>
                      <input
                        type="number"
                        value={editLectBudget}
                        onChange={(e) => setEditLectBudget(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-kpcia-gold/30 text-kpcia-gold font-bold focus:border-kpcia-gold focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  {/* Edit Form Total Lecture Cost Summary Display Dashboard */}
                  {(() => {
                    const isProgramSelected = !!editLectProgramId;
                    const originalTotal = editLectBudget + Number(editLectMaterialCost);
                    const finalTotal = isProgramSelected ? (originalTotal - Math.round(originalTotal * 0.05)) : originalTotal;
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-neutral-950/40 border border-neutral-850 mt-1">
                        <div className="p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800 flex items-center justify-between text-xs">
                          <div>
                            <div className="text-[9px] text-neutral-400 font-semibold">① 출강 강사료</div>
                            <div className="text-xs font-bold text-neutral-100 mt-0.5 font-mono">
                              ₩{editLectBudget.toLocaleString()} <span className="text-[9px] font-normal text-neutral-400">원</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800 flex items-center justify-between text-xs">
                          <div>
                            <div className="text-[9px] text-neutral-400 font-semibold">② 재료비 총액</div>
                            <div className="text-xs font-bold text-neutral-200 mt-0.5 font-mono">
                              ₩{Number(editLectMaterialCost).toLocaleString()} <span className="text-[9px] font-normal text-neutral-400">원</span>
                            </div>
                          </div>
                          <div className="text-[9px] text-neutral-500 font-mono text-right">
                            {editLectAttendees || 0}명 대상
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-gradient-to-r from-kpcia-gold/15 to-amber-500/5 border border-kpcia-gold/25 flex items-center justify-between text-xs">
                          <div>
                            <div className="text-[9px] text-kpcia-gold font-bold flex items-center gap-1.5">
                              <span>③ 총 출강비 청구액</span>
                              {isProgramSelected && <span className="text-[8px] bg-kpcia-gold/20 text-kpcia-gold px-1 py-0.2 rounded font-normal">5% 공제</span>}
                            </div>
                            <div className="text-sm font-extrabold text-kpcia-gold mt-0.5 font-mono">
                              ₩{finalTotal.toLocaleString()} <span className="text-[10px] font-semibold">원</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-semibold block">위탁 기업 담당자명</label>
                      <input
                        type="text"
                        value={editLectManagerName}
                        onChange={(e) => setEditLectManagerName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-medium focus:border-kpcia-gold focus:outline-none text-xs"
                        placeholder="예: 김정우 책임연구원"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-semibold block">담당자 연락처</label>
                      <input
                        type="text"
                        value={editLectManagerPhone}
                        onChange={(e) => setEditLectManagerPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-medium focus:border-kpcia-gold focus:outline-none text-xs"
                        placeholder="예: 010-1234-5678"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-neutral-800 bg-neutral-950/40 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingLecture(null)}
                  className="px-4 py-2 border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 text-xs font-bold rounded-xl cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSaveLectureEdit}
                  className="px-5 py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-md shadow-kpcia-gold/10 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-kpcia-dark" />
                  <span>공고 변경사항 적용</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
