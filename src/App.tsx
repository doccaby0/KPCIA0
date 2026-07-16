import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  LectureRequest, 
  EducationalProgram, 
  MileageTransaction, 
  InstructorTier, 
  DigitalBadge, 
  PartnershipProposal,
  AssistantEvaluation
} from './types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { StorageService, generateBadgeForTier } from './lib/firebase';
import { sanitizeString, sanitizePhone } from './utils/security';
import { 
  Award, 
  BookOpen, 
  GraduationCap, 
  CheckCircle, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  Plus, 
  LogIn, 
  X, 
  RefreshCw, 
  Cloud, 
  Search, 
  Filter, 
  Send, 
  Shield, 
  User, 
  FileText, 
  Check, 
  AlertCircle, 
  Trash2, 
  Coins,
  Lock,
  Settings,
  Star,
  Home
} from 'lucide-react';

export default function App() {
  // Navigation states
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Core Entity States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [lectures, setLectures] = useState<LectureRequest[]>([]);
  const [programs, setPrograms] = useState<EducationalProgram[]>([]);
  const [transactions, setTransactions] = useState<MileageTransaction[]>([]);
  const [proposals, setProposals] = useState<PartnershipProposal[]>([]);

  // Modals & Active Forms
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedInstructorCard, setSelectedInstructorCard] = useState<UserProfile | null>(null);
  
  // Login Form States
  const [loginId, setLoginId] = useState<string>('');
  const [loginPw, setLoginPw] = useState<string>('');
  
  // Register Form States
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regLoginId, setRegLoginId] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regTier, setRegTier] = useState<InstructorTier>('Prestige Member');
  const [regSpecialties, setRegSpecialties] = useState<string>('');
  const [regBio, setRegBio] = useState<string>('');
  const [regOrgName, setRegOrgName] = useState<string>('');
  const [regSnsLink, setRegSnsLink] = useState<string>('');

  // Register Form Verification & Terms States
  const [regTermsAccepted, setRegTermsAccepted] = useState<boolean>(false);
  const [regVerificationCode, setRegVerificationCode] = useState<string>('');
  const [sentVerificationCode, setSentVerificationCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [showEmailSimulator, setShowEmailSimulator] = useState<boolean>(false);
  const [lecturePage, setLecturePage] = useState<number>(1);

  // Propose Program Form States
  const [newProgTitle, setNewProgTitle] = useState<string>('');
  const [newProgDesc, setNewProgDesc] = useState<string>('');
  const [newProgAudience, setNewProgAudience] = useState<string>('');
  const [newProgCurriculum, setNewProgCurriculum] = useState<string>('');
  const [newProgRoyalty, setNewProgRoyalty] = useState<number>(100);

  // Partnership Proposal Form States
  const [partCompany, setPartCompany] = useState<string>('');
  const [partProposer, setPartProposer] = useState<string>('');
  const [partEmail, setPartEmail] = useState<string>('');
  const [partPhone, setPartPhone] = useState<string>('');
  const [partTitle, setPartTitle] = useState<string>('');
  const [partContent, setPartContent] = useState<string>('');

  // Lecture Creation Form (Admin Only - Auto Calculating)
  const [newLecTitle, setNewLecTitle] = useState<string>('');
  const [newLecCompany, setNewLecCompany] = useState<string>('');
  const [newLecDesc, setNewLecDesc] = useState<string>('');
  const [newLecTier, setNewLecTier] = useState<InstructorTier>('Prestige Member');
  const [newLecDate, setNewLecDate] = useState<string>('2026-07-20');
  const [newLecLocation, setNewLecLocation] = useState<string>('');
  const [newLecManagerName, setNewLecManagerName] = useState<string>('');
  const [newLecManagerPhone, setNewLecManagerPhone] = useState<string>('');
  const [newLecAttendees, setNewLecAttendees] = useState<number>(25);
  const [newLecHours, setNewLecHours] = useState<number>(3);
  const [newLecMaterialCost, setNewLecMaterialCost] = useState<number>(10000);
  const [newLecProgramId, setNewLecProgramId] = useState<string>('');

  // Certificate Modal States
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [selectedCertificateLecture, setSelectedCertificateLecture] = useState<LectureRequest | null>(null);
  const [certificateType, setCertificateType] = useState<'appointment' | 'matching'>('appointment');

  // Evaluation Modal States
  const [showEvaluationModal, setShowEvaluationModal] = useState<boolean>(false);
  const [evaluationLectureId, setEvaluationLectureId] = useState<string>('');
  const [evaluationRating, setEvaluationRating] = useState<number>(5);
  const [evaluationComment, setEvaluationComment] = useState<string>('');

  // Admin Lecture Ratings Map (lectureId -> rating value)
  const [adminLectureRatings, setAdminLectureRatings] = useState<Record<string, number>>({});

  // Admin Sub-tab (lectures, instructors, proposals)
  const [adminSubTab, setAdminSubTab] = useState<'lectures' | 'instructors' | 'proposals'>('lectures');

  // Instructor Profile Editing (Admin Only)
  const [editingInstructor, setEditingInstructor] = useState<UserProfile | null>(null);
  const [editInstName, setEditInstName] = useState<string>('');
  const [editInstTier, setEditInstTier] = useState<InstructorTier>('Prestige Member');
  const [editInstMileage, setEditInstMileage] = useState<number>(0);
  const [editInstTitle, setEditInstTitle] = useState<string>('');
  const [editInstBio, setEditInstBio] = useState<string>('');
  const [editInstSpecialties, setEditInstSpecialties] = useState<string>('');

  // Search & Filters
  const [searchInstructor, setSearchInstructor] = useState<string>('');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [searchLecture, setSearchLecture] = useState<string>('');
  const [filterLecTier, setFilterLecTier] = useState<string>('all');

  // Trigger global notifications
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // On Load: Load data from StorageService & Initialize Synchronously
  useEffect(() => {
    const initializeData = async () => {
      try {
        await StorageService.seedDatabaseIfEmpty();
        await StorageService.autoSyncLocalAndCloud();
      } catch (err) {
        console.warn("Auto-sync error on load:", err);
      }

      // Fetch clean current states
      const loadedUsers = StorageService.getLocalUsers();
      const loadedLectures = StorageService.getLocalLectures();
      const loadedPrograms = StorageService.getLocalPrograms();
      const loadedTransactions = StorageService.getLocalTransactions();
      const loadedProposals = StorageService.getLocalProposals();

      setUsers(loadedUsers);
      setLectures(loadedLectures);
      setPrograms(loadedPrograms);
      setTransactions(loadedTransactions);
      setProposals(loadedProposals);

      // Check current login session
      const savedUserUid = StorageService.getSessionItem('kpcia_logged_in_uid') || StorageService.getLocalItem('kpcia_logged_in_uid');
      if (savedUserUid) {
        const found = loadedUsers.find(u => u.uid === savedUserUid);
        if (found) {
          setCurrentUser(found);
        }
      }
    };

    initializeData();

    // Setup active listeners to Cloud Firestore for real-time reactions
    let unsubs: (() => void)[] = [];
    try {
      const unsubUsers = StorageService.subscribeUsers((updated) => {
        setUsers(updated);
        StorageService.setLocal('users', updated);
        const loggedInUid = StorageService.getSessionItem('kpcia_logged_in_uid') || StorageService.getLocalItem('kpcia_logged_in_uid');
        if (loggedInUid) {
          const foundUser = updated.find(u => u.uid === loggedInUid);
          if (foundUser) setCurrentUser(foundUser);
        }
      });
      const unsubLectures = StorageService.subscribeLectures((updated) => {
        setLectures(updated);
        StorageService.setLocal('lectures', updated);
      });
      const unsubPrograms = StorageService.subscribePrograms((updated) => {
        setPrograms(updated);
        StorageService.setLocal('programs', updated);
      });
      const unsubTransactions = StorageService.subscribeTransactions((updated) => {
        setTransactions(updated);
        StorageService.setLocal('transactions', updated);
      });
      const unsubProposals = StorageService.subscribeProposals((updated) => {
        setProposals(updated);
        StorageService.setLocal('proposals', updated);
      });

      unsubs = [unsubUsers, unsubLectures, unsubPrograms, unsubTransactions, unsubProposals];
    } catch (e) {
      console.warn("Real-time cloud subscription fell back to local-first mode safely.", e);
    }

    return () => {
      unsubs.forEach(unsub => {
        try { unsub(); } catch (e) {}
      });
    };
  }, []);

  // Authentication: Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = sanitizeString(loginId);
    const cleanPw = sanitizeString(loginPw);

    if (!cleanId || !cleanPw) {
      triggerToast("아이디와 비밀번호를 모두 입력해 주세요.", "error");
      return;
    }

    // Check seed accounts & custom accounts
    const foundUser = users.find(u => u.loginId === cleanId && u.password === cleanPw);
    if (foundUser) {
      setCurrentUser(foundUser);
      StorageService.setSessionItem('kpcia_logged_in_uid', foundUser.uid);
      StorageService.setLocalItem('kpcia_logged_in_uid', foundUser.uid);
      triggerToast(`반갑습니다, ${foundUser.name} 강사님! 환영합니다.`, "success");
      setShowAuthModal(false);
      setLoginId('');
      setLoginPw('');
    } else {
      triggerToast("일치하는 가입 정보를 찾을 수 없습니다. 아이디와 비밀번호를 확인해 주세요.", "error");
    }
  };

  // Authentication: Logout
  const handleLogout = () => {
    setCurrentUser(null);
    StorageService.removeSessionItem('kpcia_logged_in_uid');
    StorageService.removeLocalItem('kpcia_logged_in_uid');
    triggerToast("로그아웃 되었습니다.", "info");
    setActiveTab('home');
  };

  // Account Withdrawal / Delete Account
  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    const confirmDelete = window.confirm("정말로 한국프레스티지기업강사협회 회원 탈퇴를 진행하시겠습니까? 그동안 쌓인 마일리지와 디지털 명함 정보가 즉시 영구 삭제되며 복구할 수 없습니다.");
    if (!confirmDelete) return;

    try {
      const targetUid = currentUser.uid;
      const updatedUsers = users.filter(u => u.uid !== targetUid);
      setUsers(updatedUsers);
      await StorageService.deleteUser(targetUid);
      
      setCurrentUser(null);
      StorageService.removeSessionItem('kpcia_logged_in_uid');
      StorageService.removeLocalItem('kpcia_logged_in_uid');
      triggerToast("회원 탈퇴가 안전하게 처리되었습니다. 그동안 KPCIA를 이용해 주셔서 진심으로 감사드립니다.", "info");
      setActiveTab('home');
    } catch (err) {
      console.error(err);
      triggerToast("회원 탈퇴 처리 중 오류가 발생했습니다.", "error");
    }
  };

  // Registration simple verification helpers
  const handleSendVerificationCode = async () => {
    const cleanEmail = sanitizeString(regEmail);
    const cleanPhone = sanitizePhone(regPhone);
    if (!cleanEmail && !cleanPhone) {
      triggerToast("인증번호를 수신할 이메일 또는 휴대폰 번호를 올바르게 입력해 주세요.", "error");
      return;
    }
    const generatedCode = String(Math.floor(1000 + Math.random() * 9000));
    setSentVerificationCode(generatedCode);
    setIsVerifying(true);
    setIsVerified(false);
    
    if (cleanEmail) {
      triggerToast(`✉️ [KPCIA 운영국] ${cleanEmail} 주소로 실제 인증 메일을 발송하는 중입니다...`, "info");
      
      try {
        // Send directly using FormSubmit with the registrant's input email
        const response = await fetch(`https://formsubmit.co/ajax/${cleanEmail}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: "KPCIA 회원 관리 시스템",
            email: cleanEmail,
            _subject: "[KPCIA] 한국프레스티지기업강사협회 회원가입 본인인증 번호",
            message: `안녕하세요, KPCIA(한국프레스티지기업강사협회) 운영사무국입니다.

귀하의 포털 회원 가입 및 본인인증 승인을 위한 보안 코드를 안내해 드립니다.

인증 보안코드: [ ${generatedCode} ]

가입 화면의 인증 필드에 위 4자리 숫자를 입력해 주십시오.

(가입 신청 이메일: ${cleanEmail})

* 본 메일은 KPCIA 회원 관리 시스템에 의해 자동 발송되었습니다.`,
            _honey: ""
          })
        });

        if (response.ok) {
          triggerToast(`🎉 [KPCIA 운영국] ${cleanEmail} 메일함으로 인증 메일이 성공적으로 발송되었습니다!`, "success");
        } else {
          triggerToast(`⚠️ 메일 발송에 다소 지연이 있을 수 있습니다. 메일함을 확인해 주세요.`, "info");
        }
      } catch (err) {
        console.error("FormSubmit send error:", err);
        triggerToast(`⚠️ 인증 메일 발송에 실패했습니다. 이메일 주소를 다시 확인해 주세요.`, "error");
      }
    } else {
      triggerToast(`[KPCIA 본부] 이메일 주소를 확인해 주세요.`, "error");
    }
  };

  const handleConfirmVerificationCode = () => {
    if (!regVerificationCode) {
      triggerToast("전송받으신 4자리 인증번호를 입력해 주세요.", "error");
      return;
    }
    if (regVerificationCode === sentVerificationCode) {
      setIsVerified(true);
      setIsVerifying(false);
      triggerToast("🎉 본인 인증이 완벽하게 완료되었습니다!", "success");
    } else {
      triggerToast("❌ 인증번호가 일치하지 않습니다. 다시 입력해 주세요.", "error");
    }
  };

  // Registration: Register New Instructor
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeString(regName);
    const cleanEmail = sanitizeString(regEmail);
    const cleanPhone = sanitizePhone(regPhone);
    const cleanLId = sanitizeString(regLoginId);
    const cleanLPw = sanitizeString(regPassword);
    const cleanSpecialties = sanitizeString(regSpecialties).split(',').map(s => s.trim()).filter(Boolean);
    const cleanBio = sanitizeString(regBio);
    const cleanOrgName = sanitizeString(regOrgName);
    const cleanSnsLink = sanitizeString(regSnsLink);

    if (!cleanName || !cleanEmail || !cleanLId || !cleanLPw || !cleanOrgName) {
      triggerToast("필수 가입 정보(성함, 연락처, 이메일, 아이디, 비밀번호, 기업/기관/공방 이름)를 모두 입력해 주세요.", "error");
      return;
    }

    if (!regTermsAccepted) {
      triggerToast("이용약관 및 고품격 개인정보 보호 방침에 반드시 동의해 주셔야 가입이 승인됩니다.", "error");
      return;
    }

    if (!isVerified) {
      triggerToast("휴대폰/이메일 간편 본인 인증 단계를 완료해 주세요.", "error");
      return;
    }

    // Check duplicate ID
    if (users.some(u => u.loginId === cleanLId)) {
      triggerToast("이미 존재하는 아이디입니다. 다른 아이디를 입력해 주세요.", "error");
      return;
    }

    const newUid = `user_${Date.now()}`;
    const newBadge = generateBadgeForTier('Prestige Member');

    const newUser: UserProfile = {
      uid: newUid,
      email: cleanEmail,
      name: cleanName,
      tier: 'Prestige Member', // Forced to member (일반 회원)
      organizationName: cleanOrgName,
      mileage: 1000, // Initial signup mileage gift
      isApproved: false,
      loginId: cleanLId,
      password: cleanLPw,
      profileCard: {
        title: `일반 회원 소속 프로 강사`,
        bio: cleanBio || "안녕하십니까, 기업의 지속가능한 성장을 돕는 명품 비즈니스 전문 강사입니다.",
        specialties: cleanSpecialties.length > 0 ? cleanSpecialties : ["기업 교육", "비즈니스 매너", "리더십"],
        career: [
          `소속: ${cleanOrgName}`,
          "현 KPCIA 프레스티지 기업강사협회 정회원",
          "전 기업체 사내 교육 강사"
        ],
        education: ["대학교 경영학 학사 학위 취득"],
        contactEmail: cleanEmail,
        contactPhone: cleanPhone || "010-0000-0000",
        cardTheme: 'classic',
        websiteUrl: cleanSnsLink
      },
      badges: [newBadge],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    await StorageService.saveUser(newUser);

    // Auto login
    setCurrentUser(newUser);
    StorageService.setSessionItem('kpcia_logged_in_uid', newUid);
    StorageService.setLocalItem('kpcia_logged_in_uid', newUid);

    // Initial mileage gift transaction
    const initialTx: MileageTransaction = {
      id: `tx_init_${Date.now()}`,
      userId: newUid,
      userName: cleanName,
      type: 'admin_adjust',
      amount: 1000,
      description: 'KPCIA 신규 가입 웰컴 축하 1,000 마일리지 지급',
      createdAt: new Date().toISOString()
    };
    await StorageService.addTransaction(initialTx);

    triggerToast("⏳ KPCIA 가입이 완료되었습니다. 협회 마스터 정회원 승인 완료 후 모든 메뉴 사용이 가능합니다.", "info");
    setShowAuthModal(false);
    
    // Clear forms
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegLoginId('');
    setRegPassword('');
    setRegSpecialties('');
    setRegBio('');
    setRegOrgName('');
    setRegSnsLink('');
    setRegTermsAccepted(false);
    setRegVerificationCode('');
    setSentVerificationCode('');
    setIsVerifying(false);
    setIsVerified(false);
  };

  // Feature: Apply for a Corporate Lecture Opening
  const handleApplyLecture = async (lectureId: string) => {
    if (!currentUser) {
      triggerToast("출강 공고에 지원하시려면 강사 계정으로 먼저 로그인해 주세요.", "error");
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }

    const lect = lectures.find(l => l.id === lectureId);
    if (!lect) return;

    if (lect.applicants.includes(currentUser.uid)) {
      triggerToast("이미 출강 신청이 완료된 강의 공고입니다.", "info");
      return;
    }

    // Perform application
    const updatedApplicants = [...lect.applicants, currentUser.uid];
    const updatedLect: LectureRequest = {
      ...lect,
      applicants: updatedApplicants
    };

    // Fast local update
    const updatedLectures = lectures.map(l => l.id === lectureId ? updatedLect : l);
    setLectures(updatedLectures);
    await StorageService.saveLecture(updatedLect);
    triggerToast("👍 성공적으로 출강 신청이 접수되었습니다! 운영국 자격 검수 후 개별 통보됩니다.", "success");
  };

  // Feature: Propose a Certified Educational Program
  const handleProposeProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      triggerToast("교육 과정을 제안하시려면 강사 로그인이 필요합니다.", "error");
      return;
    }

    const userRank = getTierRank(currentUser.tier);
    if (userRank < 4) {
      triggerToast("고품격 교육 과정 제안 및 저작권 등록은 최소 'Prestige Master' 등급 이상만 가능합니다. (현재 등급: " + currentUser.tier + ")", "error");
      return;
    }

    const cleanTitle = sanitizeString(newProgTitle);
    const cleanDesc = sanitizeString(newProgDesc);
    const cleanAudience = sanitizeString(newProgAudience);
    const cleanCurr = sanitizeString(newProgCurriculum).split('\n').map(c => c.trim()).filter(Boolean);

    if (!cleanTitle || !cleanDesc) {
      triggerToast("과정 명칭과 기본 설명을 기입해 주세요.", "error");
      return;
    }

    const newProg: EducationalProgram = {
      id: `prog_${Date.now()}`,
      title: cleanTitle,
      description: cleanDesc,
      authorId: currentUser.uid,
      authorName: currentUser.name,
      royaltyRate: Number(newProgRoyalty) || 100,
      curriculum: cleanCurr.length > 0 ? cleanCurr : ["과정 오리엔테이션", "이론 및 핵심 역량 실습", "종합 워크숍 및 질의응답"],
      targetAudience: cleanAudience || "전사 임직원 및 기업 실무 교육 대상자",
      createdAt: new Date().toISOString(),
      isApproved: true // Auto-approved for fast editing
    };

    const updatedProgs = [...programs, newProg];
    setPrograms(updatedProgs);
    await StorageService.saveProgram(newProg);

    triggerToast("🚀 회원님이 설계하신 명품 기업 교육 제안서가 성공적으로 공식 카탈로그에 등록되었습니다!", "success");
    
    // Clear Form & close modal or navigate
    setNewProgTitle('');
    setNewProgDesc('');
    setNewProgAudience('');
    setNewProgCurriculum('');
    setNewProgRoyalty(100);
  };

  // Feature: Submit Partnership & Inquiries
  const handleAddProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanComp = sanitizeString(partCompany);
    const cleanName = sanitizeString(partProposer);
    const cleanEmail = sanitizeString(partEmail);
    const cleanPhone = sanitizePhone(partPhone);
    const cleanTitle = sanitizeString(partTitle);
    const cleanCont = sanitizeString(partContent);

    if (!cleanComp || !cleanName || !cleanTitle || !cleanCont) {
      triggerToast("의뢰 업체명, 담당자 정보, 문의 내용을 정확히 기재해 주세요.", "error");
      return;
    }

    const newProposal: PartnershipProposal = {
      id: `prop_${Date.now()}`,
      companyName: cleanComp,
      proposerName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      title: cleanTitle,
      content: cleanCont,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updatedProps = [...proposals, newProposal];
    setProposals(updatedProps);
    await StorageService.saveProposal(newProposal);

    triggerToast("📧 제휴/프로그램 매칭 의뢰서가 KPCIA 운영사무국으로 안전하게 발송되었습니다!", "success");

    // Clear Forms
    setPartCompany('');
    setPartProposer('');
    setPartEmail('');
    setPartPhone('');
    setPartTitle('');
    setPartContent('');
  };

  // Feature: Post Official Lecture Request (Admin or Guest-Admin simulator)
  const handleCreateLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeString(newLecTitle);
    const cleanCompany = sanitizeString(newLecCompany);
    const cleanDesc = sanitizeString(newLecDesc);
    const cleanLocation = sanitizeString(newLecLocation);
    const cleanMName = sanitizeString(newLecManagerName);
    const cleanMPhone = sanitizePhone(newLecManagerPhone);

    if (!cleanTitle || !cleanCompany || !cleanDesc) {
      triggerToast("출강 명칭, 요청 사명, 상세 개요를 작성해 주세요.", "error");
      return;
    }

    // Auto calculate budget based on rule:
    // 주강사비 = 시간당 100,000원
    // 보조강사비 = 20명 이상 시 시간당 50,000원 (20명 미만 시 0원)
    // 총 재료비 = 인원 x 1인당 재료비
    const mainFee = newLecHours * 100000;
    const assistantFee = newLecAttendees >= 20 ? newLecHours * 50000 : 0;
    const materialFee = newLecAttendees * newLecMaterialCost;
    const computedBudget = mainFee + assistantFee + materialFee;

    const assocProgram = programs.find(p => p.id === newLecProgramId);
    const computedRoyalty = assocProgram ? assocProgram.royaltyRate : 0;

    const newLec: LectureRequest = {
      id: `lect_${Date.now()}`,
      title: cleanTitle,
      companyName: cleanCompany,
      description: cleanDesc,
      targetTier: newLecTier,
      budget: computedBudget,
      mileageRoyalty: computedRoyalty,
      programId: newLecProgramId || undefined,
      programTitle: assocProgram ? assocProgram.title : undefined,
      date: newLecDate,
      time: "14:00 - 17:00",
      duration: `${newLecHours}시간`,
      location: cleanLocation || "기업 연수원 혹은 사내 교육장",
      attendees: newLecAttendees,
      managerName: cleanMName || "인재개발원 담당자",
      managerPhone: cleanMPhone || "010-0000-0000",
      status: 'open',
      applicants: [],
      createdAt: new Date().toISOString(),
      mainHours: newLecHours,
      assistantHours: newLecAttendees >= 20 ? newLecHours : 0,
      materialCost: newLecMaterialCost
    };

    const updatedLectures = [newLec, ...lectures];
    setLectures(updatedLectures);
    await StorageService.saveLecture(newLec);

    triggerToast("📢 신규 기업 출강 요청 공고가 메인 보드에 즉시 게시되었습니다!", "success");

    // Clear Form
    setNewLecTitle('');
    setNewLecCompany('');
    setNewLecDesc('');
    setNewLecLocation('');
    setNewLecManagerName('');
    setNewLecManagerPhone('');
    setNewLecProgramId('');
  };

  // Helper: Display Tier badge styling
  const getTierColor = (tier: InstructorTier) => {
    switch (tier) {
      case 'Prestige Legend':
        return 'bg-amber-500 text-neutral-950 border border-[#D4AF37] font-black shadow-lg shadow-amber-500/20';
      case 'Prestige Elite':
        return 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30';
      case 'Prestige Master':
        return 'bg-amber-950/40 text-amber-400 border border-amber-500/30';
      case 'Prestige Professional':
        return 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/30';
      case 'Prestige Associate':
        return 'bg-sky-950/40 text-sky-400 border border-sky-500/30';
      default:
        return 'bg-neutral-900 text-neutral-400 border border-neutral-800';
    }
  };

  const getTierRank = (tier: InstructorTier): number => {
    switch (tier) {
      case 'Prestige Legend': return 6;
      case 'Prestige Elite': return 5;
      case 'Prestige Master': return 4;
      case 'Prestige Professional': return 3;
      case 'Prestige Associate': return 2;
      default: return 1;
    }
  };

  // Helper: Get Digital Card Custom Style Matching Theme
  const getCardThemeClass = (theme: string) => {
    switch (theme) {
      case 'gold_luxury':
        return 'bg-gradient-to-br from-neutral-950 via-[#181510] to-neutral-900 border-[#D4AF37] text-neutral-100 shadow-2xl';
      case 'midnight_sapphire':
        return 'bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-neutral-950 border-blue-500/50 text-blue-100 shadow-2xl';
      case 'elite_emerald':
        return 'bg-gradient-to-br from-neutral-950 via-[#0A1D1A] to-neutral-950 border-emerald-500/50 text-emerald-100 shadow-2xl';
      default:
        return 'bg-gradient-to-br from-neutral-900 to-neutral-950 border-neutral-800 text-neutral-200 shadow-xl';
    }
  };

  // --- KPCIA NEW ADVANCED BUSINESS LOGIC HANDLERS ---

  // 1. Assign Lecturers to Lecture Request (Admin)
  const handleAssignLecturers = async (lectureId: string, mainId: string, assistantId?: string) => {
    const lect = lectures.find(l => l.id === lectureId);
    if (!lect) return;

    const mainInst = users.find(u => u.uid === mainId);
    const assistantInst = assistantId ? users.find(u => u.uid === assistantId) : null;

    if (!mainInst) {
      triggerToast("주강사를 지정해 주세요.", "error");
      return;
    }

    const updatedLec: LectureRequest = {
      ...lect,
      assignedTo: mainId,
      assignedName: mainInst.name,
      assistantId: assistantId || undefined,
      assistantName: assistantInst ? assistantInst.name : undefined,
      status: 'assigned'
    };

    const updatedLectures = lectures.map(l => l.id === lectureId ? updatedLec : l);
    setLectures(updatedLectures);
    await StorageService.saveLecture(updatedLec);
    triggerToast(`🎉 ${mainInst.name} 강사님(주강사) 배정이 완료되었습니다!`, "success");
  };

  // 2. Complete Lecture and Distribute Royalties & Mileage (Admin)
  const handleCompleteLectureAndSettle = async (lectureId: string, rating: number = 5.0) => {
    const lect = lectures.find(l => l.id === lectureId);
    if (!lect) return;

    if (lect.status !== 'assigned') {
      triggerToast("강사 배정이 완료된 상태에서만 정산 및 완료처리가 가능합니다.", "error");
      return;
    }

    const mainId = lect.assignedTo!;
    const assistantId = lect.assistantId;

    const mainInst = users.find(u => u.uid === mainId);
    const assistantInst = assistantId ? users.find(u => u.uid === assistantId) : null;

    if (!mainInst) return;

    // Calculations for settlement payouts
    // 주강사: (주강사 시간 x 100,000 KRW) / 1000 = 마일리지 (또는 시간당 100 M)
    const mainHours = lect.mainHours || 3;
    const mainPayout = mainHours * 100; // 100 M per hour

    // 보조강사: (보조강사 시간 x 50,000 KRW) / 1000 = 마일리지 (또는 시간당 50 M)
    const assistantHours = lect.assistantHours || 0;
    const assistantPayout = assistantHours * 50; // 50 M per hour

    // Create main instructor payout tx
    const mainTx: MileageTransaction = {
      id: `tx_main_${Date.now()}_1`,
      userId: mainId,
      userName: mainInst.name,
      type: 'lecture_payout',
      amount: mainPayout,
      description: `[KPCIA 출강정산] '${lect.title}' 주강사 ${mainHours}시간 정산 지급 (만족도: ${rating.toFixed(1)})`,
      relatedId: lectureId,
      createdAt: new Date().toISOString()
    };

    // Calculate updated average rating for main instructor
    const mainRatings = mainInst.lectureRatings || [];
    const updatedMainRatings = [...mainRatings, rating];
    const avgMainRating = Number((updatedMainRatings.reduce((a, b) => a + b, 0) / updatedMainRatings.length).toFixed(2));

    // Update Main User profile (mileage, counts, and ratings)
    const updatedMainUser: UserProfile = {
      ...mainInst,
      mileage: mainInst.mileage + mainPayout,
      lectureCount: (mainInst.lectureCount || 0) + 1,
      lectureRatings: updatedMainRatings,
      averageRating: avgMainRating,
      updatedAt: new Date().toISOString()
    };

    let updatedUsersList = users.map(u => u.uid === mainId ? updatedMainUser : u);

    await StorageService.saveUser(updatedMainUser);
    await StorageService.addTransaction(mainTx);

    // If there is assistant instructor, pay out mileage
    if (assistantInst && assistantPayout > 0) {
      const assistantTx: MileageTransaction = {
        id: `tx_ass_${Date.now()}_2`,
        userId: assistantInst.uid,
        userName: assistantInst.name,
        type: 'lecture_payout',
        amount: assistantPayout,
        description: `[KPCIA 출강정산] '${lect.title}' 보조강사 ${assistantHours}시간 정산 지급`,
        relatedId: lectureId,
        createdAt: new Date().toISOString()
      };

      const updatedAssUser: UserProfile = {
        ...assistantInst,
        mileage: assistantInst.mileage + assistantPayout,
        lectureCount: (assistantInst.lectureCount || 0) + 1,
        updatedAt: new Date().toISOString()
      };

      updatedUsersList = updatedUsersList.map(u => u.uid === assistantInst.uid ? updatedAssUser : u);

      await StorageService.saveUser(updatedAssUser);
      await StorageService.addTransaction(assistantTx);
    }

    // Program royalty payout to the program author if lecture associated with a curriculum program
    if (lect.programId) {
      const prog = programs.find(p => p.id === lect.programId);
      if (prog) {
        const author = users.find(u => u.uid === prog.authorId);
        if (author) {
          const royaltyTx: MileageTransaction = {
            id: `tx_royalty_${Date.now()}_3`,
            userId: author.uid,
            userName: author.name,
            type: 'royalty',
            amount: prog.royaltyRate,
            description: `[KPCIA 지식저작권] 제안 과정 '${prog.title}' 출강 활용에 따른 마일리지 로열티 지급`,
            relatedId: prog.id,
            createdAt: new Date().toISOString()
          };

          const updatedAuthor: UserProfile = {
            ...author,
            mileage: author.mileage + prog.royaltyRate,
            updatedAt: new Date().toISOString()
          };

          updatedUsersList = updatedUsersList.map(u => u.uid === author.uid ? updatedAuthor : u);

          await StorageService.saveUser(updatedAuthor);
          await StorageService.addTransaction(royaltyTx);
        }
      }
    }

    // Apply users state update
    setUsers(updatedUsersList);

    // Complete lecture request with satisfaction rating
    const completedLec: LectureRequest = {
      ...lect,
      status: 'completed',
      settlementStatus: 'completed',
      lectureRating: rating
    };

    const updatedLectures = lectures.map(l => l.id === lectureId ? completedLec : l);
    setLectures(updatedLectures);
    await StorageService.saveLecture(completedLec);

    // Also update currently logged-in user state if they are the one affected
    if (currentUser) {
      const updatedMe = updatedUsersList.find(u => u.uid === currentUser.uid);
      if (updatedMe) {
        setCurrentUser(updatedMe);
      }
    }

    triggerToast(`💰 출강 완료 정산 및 만족도 평점(${rating.toFixed(1)}) 등록이 성공적으로 실행되어 마일리지가 정상 지급되었습니다!`, "success");
  };

  // 3. Evaluate Assistant Instructor (Main Lecturer)
  const handleEvaluateAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const lect = lectures.find(l => l.id === evaluationLectureId);
    if (!lect || !lect.assistantId) return;

    const assistantUser = users.find(u => u.uid === lect.assistantId);
    if (!assistantUser) return;

    const evaluation: AssistantEvaluation = {
      id: `eval_${Date.now()}`,
      lectureId: lect.id,
      lectureTitle: lect.title,
      evaluatorId: currentUser.uid,
      evaluatorName: currentUser.name,
      evaluatorTier: currentUser.tier,
      rating: evaluationRating,
      comment: evaluationComment,
      createdAt: new Date().toISOString()
    };

    const existingEvals = assistantUser.assistantEvaluations || [];
    const updatedEvals = [...existingEvals, evaluation];

    // Recalculate average rating for assistant evaluations
    const allRatings = updatedEvals.map(ev => ev.rating);
    const avgRating = Number((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(2));

    const updatedAssUser: UserProfile = {
      ...assistantUser,
      assistantEvaluations: updatedEvals,
      lectureRatings: [...(assistantUser.lectureRatings || []), evaluationRating],
      averageRating: avgRating,
      updatedAt: new Date().toISOString()
    };

    await StorageService.saveUser(updatedAssUser);

    // Mark evaluation as done on lecture
    const updatedLec: LectureRequest = {
      ...lect,
      assistantEvaluated: true
    };
    const updatedLectures = lectures.map(l => l.id === lect.id ? updatedLec : l);
    setLectures(updatedLectures);
    await StorageService.saveLecture(updatedLec);

    triggerToast(`⭐ ${assistantUser.name} 보조강사님에 대한 성실성 상호평가가 등록되었습니다!`, "success");
    setShowEvaluationModal(false);
    setEvaluationComment('');
    setEvaluationRating(5);
  };

  // 4. Check & Automatic Upgrades (Self Triggered or Admin Triggered)
  const handleAutoUpgradeUser = async (userId: string) => {
    const user = users.find(u => u.uid === userId);
    if (!user) return;

    // Check if eligible
    const totalLectures = user.lectureCount || 0;
    const avgSatisfaction = user.averageRating || 4.5; // default fallback if no ratings
    const assistantCount = user.assistantEvaluations?.length || 0;

    let targetTier: InstructorTier = user.tier;

    // Check tiers sequentially from highest downwards
    if (totalLectures >= 10000 && avgSatisfaction >= 4.9) {
      targetTier = 'Prestige Legend';
    } else if (totalLectures >= 1000 && avgSatisfaction >= 4.8) {
      targetTier = 'Prestige Elite';
    } else if (totalLectures >= 100 && avgSatisfaction >= 4.6) {
      targetTier = 'Prestige Master';
    } else if (totalLectures >= 10 && avgSatisfaction >= 4.5) {
      targetTier = 'Prestige Professional';
    } else if (assistantCount >= 5 && avgSatisfaction >= 4.5) {
      targetTier = 'Prestige Associate';
    }

    if (targetTier !== user.tier) {
      const newBadge = generateBadgeForTier(targetTier);
      const updatedUser: UserProfile = {
        ...user,
        tier: targetTier,
        badges: [...user.badges.filter(b => b.tier !== targetTier), newBadge],
        updatedAt: new Date().toISOString()
      };

      await StorageService.saveUser(updatedUser);
      
      // Auto credit promotional mileage gift
      let mileagePromo = 500;
      if (targetTier === 'Prestige Legend') mileagePromo = 10000;
      else if (targetTier === 'Prestige Elite') mileagePromo = 5000;
      else if (targetTier === 'Prestige Master') mileagePromo = 2500;
      else if (targetTier === 'Prestige Professional') mileagePromo = 1000;

      const promoTx: MileageTransaction = {
        id: `tx_promo_${Date.now()}`,
        userId: user.uid,
        userName: user.name,
        type: 'admin_adjust',
        amount: mileagePromo,
        description: `[KPCIA 등급자동승격] '${targetTier}' 승급 진입 축하 ${mileagePromo.toLocaleString()}M 마일리지 보너스 지급!`,
        createdAt: new Date().toISOString()
      };
      await StorageService.addTransaction(promoTx);

      triggerToast(`🎉 대단합니다! ${user.name} 강사님이 '${targetTier}' 등급으로 자동 승격되었습니다!`, "success");
      return true;
    } else {
      triggerToast(`ℹ️ ${user.name} 강사님은 현재 등급의 기준을 충분히 수행 중이며, 다음 단계 승급 요건을 확인해 주세요.`, "info");
      return false;
    }
  };

  // 5. Review Partnership Proposal Status (Admin)
  const handleUpdateProposalStatus = async (proposalId: string, status: 'pending' | 'reviewed' | 'accepted' | 'declined') => {
    const prop = proposals.find(p => p.id === proposalId);
    if (!prop) return;

    const updatedProp: PartnershipProposal = {
      ...prop,
      status
    };

    const updatedProposals = proposals.map(p => p.id === proposalId ? updatedProp : p);
    setProposals(updatedProposals);
    await StorageService.saveProposal(updatedProp);
    triggerToast(`📧 제휴 의뢰서 상태가 '${status}'(으)로 변경 업데이트되었습니다.`, "success");
  };

  // 6. Generate credentials & trigger certificate modal download
  const handleOpenCertificate = (lecture: LectureRequest, type: 'appointment' | 'matching') => {
    setSelectedCertificateLecture(lecture);
    setCertificateType(type);
    setShowCertificateModal(true);
  };

  // 7. Download Certificate PDF
  const handleDownloadCertificatePDF = () => {
    const element = document.getElementById('kpcia-certificate-print');
    if (!element) {
      triggerToast("출력 대상을 찾을 수 없습니다.", "error");
      return;
    }

    triggerToast("📄 고해상도 PDF 증명서를 생성하여 내려받는 중입니다. 잠시만 기다려 주세요...", "info");
    
    html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#0d0d0e"
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 297; // A4 landscape width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`KPCIA_Certificate_${Date.now()}.pdf`);
      triggerToast("✅ 디지털 위임장 및 매칭 증명서가 PDF로 성공적으로 다운로드되었습니다!", "success");
    }).catch((err) => {
      console.error("PDF download failure:", err);
      triggerToast("증명서 생성 중 오류가 발생했습니다. 다시 시도해 주세요.", "error");
    });
  };

  // 8. Manual Tier Update (Admin)
  const handleManualTierUpdate = async (userId: string, targetTier: InstructorTier) => {
    const user = users.find(u => u.uid === userId);
    if (!user) return;

    const newBadge = generateBadgeForTier(targetTier);
    const updatedUser: UserProfile = {
      ...user,
      tier: targetTier,
      badges: [...user.badges.filter(b => b.tier !== targetTier), newBadge],
      updatedAt: new Date().toISOString()
    };

    await StorageService.saveUser(updatedUser);
    triggerToast(`👑 ${user.name} 강사님의 등급이 '${targetTier}'(으)로 수동 조정되었습니다.`, "success");
  };

  // 8.5. Toggle User Approval Status (Admin)
  const handleToggleUserApproval = async (userId: string) => {
    const user = users.find(u => u.uid === userId);
    if (!user) return;

    const nextApprovedState = !user.isApproved;
    const updatedUser: UserProfile = {
      ...user,
      isApproved: nextApprovedState,
      updatedAt: new Date().toISOString()
    };

    const updatedUsers = users.map(u => u.uid === userId ? updatedUser : u);
    setUsers(updatedUsers);
    await StorageService.saveUser(updatedUser);

    if (currentUser?.uid === userId) {
      setCurrentUser(updatedUser);
    }

    triggerToast(`👤 ${user.name} 강사님의 가입 승인 상태가 '${nextApprovedState ? "최종 정회원 승인" : "승인 대기"}' 상태로 변경되었습니다.`, "success");
  };

  // 9. Save Instructor Profile Changes (Admin)
  const handleSaveInstructorEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstructor) return;

    const cleanName = sanitizeString(editInstName);
    const cleanTitle = sanitizeString(editInstTitle);
    const cleanBio = sanitizeString(editInstBio);
    const cleanSpecialties = sanitizeString(editInstSpecialties).split(',').map(s => s.trim()).filter(Boolean);

    if (!cleanName) {
      triggerToast("강사 성함을 입력해 주세요.", "error");
      return;
    }

    const updatedUser: UserProfile = {
      ...editingInstructor,
      name: cleanName,
      tier: editInstTier,
      mileage: editInstMileage,
      profileCard: {
        ...editingInstructor.profileCard,
        title: cleanTitle || `${editInstTier} 소속 프로 강사`,
        bio: cleanBio,
        specialties: cleanSpecialties
      },
      updatedAt: new Date().toISOString()
    };

    const updatedUsers = users.map(u => u.uid === editingInstructor.uid ? updatedUser : u);
    setUsers(updatedUsers);
    await StorageService.saveUser(updatedUser);

    triggerToast(`✨ ${cleanName} 강사님의 정보가 성공적으로 업데이트되었습니다.`, "success");
    setEditingInstructor(null);
  };

  // Sub-navigation: Render dynamic components of page
  return (
    <div className="min-h-screen bg-[#09090B] text-neutral-100 font-sans antialiased selection:bg-amber-500/20 selection:text-amber-300">
      
      {/* 🔔 Toast Feedback Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-[9999] max-w-sm w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex gap-3">
            <span className="text-lg">
              {toast.type === 'success' ? '✨' : toast.type === 'error' ? '🚨' : 'ℹ️'}
            </span>
            <div className="text-xs text-neutral-200 font-medium leading-relaxed">
              {toast.message}
            </div>
          </div>
        </div>
      )}

      {/* 👑 Luxury Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#09090B]/90 backdrop-blur-md border-b border-neutral-900/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo Brand Block */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-widest text-neutral-100 font-display">KPCIA</span>
                <span className="text-[10px] font-extrabold bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded border border-[#D4AF37]/20 uppercase tracking-widest">PRESTIGE</span>
              </div>
              <h1 className="text-[10px] font-medium text-neutral-400 tracking-tight">한국프레스티지기업강사협회</h1>
            </div>
          </div>

          {/* Desktop Navigation Links (Icon-based with Tooltips) */}
          <nav className="hidden md:flex items-center gap-2">
            {[
              { id: 'home', label: '협회 소개', icon: <Home className="w-4 h-4" /> },
              { id: 'lectures', label: '출강 정보센터', icon: <FileText className="w-4 h-4" /> },
              ...(currentUser && currentUser.isApproved ? [{ id: 'programs', label: '고품격 교육과정', icon: <BookOpen className="w-4 h-4" /> }] : []),
              { id: 'partnership', label: '제휴 및 출강의뢰', icon: <Send className="w-4 h-4" /> },
              ...(currentUser?.isAdmin ? [{ id: 'admin', label: '👑 관리자 마스터실', icon: <Settings className="w-4 h-4 text-[#D4AF37]" /> }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative group p-3 rounded-xl transition-all cursor-pointer border ${
                  activeTab === tab.id 
                    ? 'bg-neutral-900 text-[#D4AF37] border-[#D4AF37]/20 shadow-inner' 
                    : 'text-neutral-400 hover:text-[#D4AF37] hover:bg-neutral-900 border-transparent hover:border-neutral-800'
                }`}
              >
                {tab.icon}
                
                {/* Descriptive hover tooltip */}
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-neutral-950 border border-neutral-800 text-[#D4AF37] text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-2xl whitespace-nowrap z-50">
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>

          {/* User Signin Status Actions */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="relative group">
                <button 
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#D4AF37]/40 text-neutral-200 hover:text-white transition-all cursor-pointer text-xs"
                >
                  <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="font-bold">{currentUser.name} 강사님</span>
                  <span className="text-[9px] bg-amber-500/10 text-[#D4AF37] px-1.5 py-0.5 rounded-full border border-amber-500/20">{currentUser.mileage.toLocaleString()} M</span>
                </button>
                
                {/* Popover Dropdown Menu on Hover */}
                <div className="absolute right-0 top-full pt-1.5 w-48 hidden group-hover:block hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-1.5 shadow-2xl space-y-1">
                    <button
                      onClick={() => setActiveTab('mypage')}
                      className="w-full text-left px-3 py-2 rounded-lg text-neutral-300 hover:text-[#D4AF37] hover:bg-neutral-800 transition-colors text-[11px] font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>사용자 정보 (My Profile)</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-neutral-300 hover:text-[#D4AF37] hover:bg-neutral-800 transition-colors text-[11px] font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5 rotate-180" />
                      <span>로그아웃</span>
                    </button>
                    <div className="border-t border-neutral-800 my-1"></div>
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-[11px] font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>회원 탈퇴</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 text-xs font-bold hover:brightness-110 shadow-lg shadow-amber-500/5 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>강사 로그인 / 등록</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ⚠️ Pending Approval Global Warning Banner */}
      {currentUser && !currentUser.isApproved && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-400 py-3 px-6 text-xs font-semibold text-center select-all flex items-center justify-center gap-2">
          <span>⏳ <strong>KPCIA 본부 알림</strong>: 현재 가입 승인 대기 상태입니다. 운영국의 최종 정회원 승인 처리 전까지는 '고품격 교육과정' 등의 고급 서비스 이용이 일부 제한됩니다.</span>
          <span className="text-neutral-400">|</span>
          <span>💡 <strong>체험 가이드</strong>: 관리자 계정 <code>insight9lab</code> (비밀번호 <code>400828</code>)로 로그인하신 뒤, 마스터실의 '소속 강사 관리'에서 정회원 승인을 수동 부여해 보세요!</span>
        </div>
      )}

      {/* 🚀 MAIN HERO AREA (Only on Home Tab) */}
      {activeTab === 'home' && (
        <section className="relative overflow-hidden pt-12 pb-24 border-b border-neutral-900" id="hero-panel">
          {/* Ambient golden glow gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Core Value Statements */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold tracking-widest uppercase">
                <Sparkles className="w-3 h-3 animate-pulse" />
                <span>Premium Business Education Association</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white font-sans">
                대한민국 초일류 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-400">
                  기업 교육의 기준, KPCIA
                </span>
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-lg">
                한국프레스티지기업강사협회(KPCIA)는 고도의 강사 검증 및 등급(Tier) 평가를 통과한 우수 사외 기업교육 전문가들의 최고 권위 연합체입니다. 혁신적인 AI 워크플로우 실무부터 차세대 리더십, 기업 맞춤형 커리큘럼까지 최고 수준의 교육 품질을 약속합니다.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button 
                  onClick={() => setActiveTab('lectures')}
                  className="px-5 py-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-[#D4AF37]/50 text-neutral-200 hover:text-[#D4AF37] transition-all text-xs font-bold cursor-pointer"
                >
                  실시간 출강 공고 열람
                </button>
                <button 
                  onClick={() => setActiveTab('partnership')}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-[#D4AF37] text-neutral-950 hover:brightness-110 shadow-lg shadow-amber-500/10 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>기업 출강 및 교육 매칭 의뢰</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Association Vision Pillars Card */}
            <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-900 backdrop-blur-md space-y-6">
              <h3 className="text-xs font-extrabold text-[#D4AF37] uppercase tracking-widest font-display border-b border-neutral-800/80 pb-3">KPCIA 협회 3대 핵심 기둥</h3>
              
              <div className="flex gap-4">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[#D4AF37] h-11 w-11 shrink-0 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-100">우수 강사 정량 등급제 (Tier Validation)</h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    강의력은 기본, 만족도 평가 점수에 기초한 5대 자격 등급제를 정립하여 기업체 교육 담당자에게 차별화된 공신력을 제공합니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[#D4AF37] h-11 w-11 shrink-0 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-100">투명한 강사 로열티 마일리지 모델</h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    강사가 개발한 명품 교안이 동료 출강에 활용될 때마다 정직한 로열티가 마일리지(M)로 환원되어, 우수한 지식 지적 재산권을 보호하고 격려합니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[#D4AF37] h-11 w-11 shrink-0 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-100">기업 교육 최적화 매칭 보드 운영</h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    기업 연수원, 사내 인재원 등 유수의 파트너사들이 출강 공고를 게시하면, AI 자격 등급에 필적하는 우수 강사 군단이 실시간으로 지원하고 매칭됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 🔮 PAGE BODY CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12" id="main-content-area">
        
        {/* TAB 1: HOME PANEL */}
        {activeTab === 'home' && (
          <div className="space-y-16" id="home-view">
            
            {/* Quick Introduction Slider Cards */}
            <div className="grid md:grid-cols-3 gap-6" id="home-features-grid">
              <div className="p-6 rounded-2xl bg-[#121214] border border-neutral-900 hover:border-neutral-800 transition-all flex flex-col justify-between" id="card-feat-1">
                <div className="space-y-3">
                  <span className="text-2xl">🤖</span>
                  <h4 className="text-xs font-bold text-neutral-100">최신 생성형 AI 실무 생산성</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    임직원들의 기획안 및 프레젠테이션, 자료 조사 업무에 생성형 AI 엔진을 녹여내는 핵심 노하우를 가장 앞서 보급합니다.
                  </p>
                </div>
                <button onClick={() => setActiveTab('programs')} className="text-[10px] text-[#D4AF37] font-bold mt-4 flex items-center gap-1 hover:underline">
                  교육과정 더보기 <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-[#121214] border border-neutral-900 hover:border-neutral-800 transition-all flex flex-col justify-between" id="card-feat-2">
                <div className="space-y-3">
                  <span className="text-2xl">👥</span>
                  <h4 className="text-xs font-bold text-neutral-100">MZ 세대 피드백 및 감성 코칭</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    기업의 허리가 되는 팀장 및 중간관리자들의 실전 소통 스킬과 리더십 시뮬레이션을 전방위 전수합니다.
                  </p>
                </div>
                <button onClick={() => setActiveTab('programs')} className="text-[10px] text-[#D4AF37] font-bold mt-4 flex items-center gap-1 hover:underline">
                  교육과정 더보기 <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-[#121214] border border-neutral-900 hover:border-neutral-800 transition-all flex flex-col justify-between" id="card-feat-3">
                <div className="space-y-3">
                  <span className="text-2xl">💼</span>
                  <h4 className="text-xs font-bold text-neutral-100">수요자 맞춤 기업 교육 개발</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    기업의 당면한 과제(ESG, 미래 신성장 동력, 조직문화 융합)에 맞춘 완전 주문 제작형 프로그램을 수립합니다.
                  </p>
                </div>
                <button onClick={() => setActiveTab('partnership')} className="text-[10px] text-[#D4AF37] font-bold mt-4 flex items-center gap-1 hover:underline">
                  제휴 문의하기 <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>



            {/* 🎖️ Tier Descriptions & Promotion Conditions Guide Block */}
            <div className="p-8 rounded-2xl bg-[#0e0e10] border border-neutral-900 space-y-6 mt-8" id="tier-guide-section">
              <div className="border-b border-neutral-800 pb-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span className="text-[#D4AF37]">🎖️</span> KPCIA 공식 강사단 자격 등급 체계 및 승급 조건
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  협회는 정량적 출강 실적(횟수) 및 수강생 만족도 상호평가를 반영하여 투명하고 엄격하게 자격 등급을 관리합니다.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    tier: 'Prestige Member',
                    title: '일반 회원',
                    desc: '기본 신규 가입 시 부여되는 일반 회원 자격 등급',
                    conditions: 'KPCIA 본부 간편 본인인증 완료 및 약관 동의',
                    color: 'text-neutral-400 bg-neutral-950/60 border border-neutral-900/60',
                    badgeColor: 'bg-neutral-800 text-neutral-300',
                    icon: <User className="w-5 h-5 text-neutral-400" />
                  },
                  {
                    tier: 'Prestige Associate',
                    title: '프레스티지 어소시에이트',
                    desc: '보조강사로서 성실성과 역량을 공인받는 협력적 실무 등급',
                    conditions: '보조강사 출강 평가 5회 이상 충족 및 평균 만족도 4.5 이상',
                    color: 'text-[#CD7F32] bg-[#CD7F32]/5 border border-[#CD7F32]/10',
                    badgeColor: 'bg-[#CD7F32]/10 text-[#CD7F32]',
                    icon: <GraduationCap className="w-5 h-5 text-[#CD7F32]" />
                  },
                  {
                    tier: 'Prestige Professional',
                    title: '프레스티지 프로페셔널',
                    desc: '전문 주강사로서의 단독 출강 능력을 인정받은 전문 실무 등급',
                    conditions: '단독/주강사 기업 출강 실적 10회 이상 및 평균 만족도 4.5 이상',
                    color: 'text-blue-400 bg-blue-500/5 border border-blue-500/10',
                    badgeColor: 'bg-blue-500/10 text-blue-400',
                    icon: <Award className="w-5 h-5 text-blue-400" />
                  },
                  {
                    tier: 'Prestige Master',
                    title: '프레스티지 마스터',
                    desc: '고급 기업 교육 설계 및 지식 저작권을 발행할 수 있는 고품격 마스터 등급',
                    conditions: '기업 출강 실적 100회 이상 및 평균 만족도 4.6 이상',
                    color: 'text-[#D4AF37] bg-[#D4AF37]/5 border border-[#D4AF37]/10',
                    badgeColor: 'bg-[#D4AF37]/10 text-[#D4AF37]',
                    icon: <Shield className="w-5 h-5 text-[#D4AF37]" />
                  },
                  {
                    tier: 'Prestige Elite',
                    title: '프레스티지 엘리트',
                    desc: '초일류 대기업 연수원 마스터 및 특별 초빙 전용 엘리트 등급',
                    conditions: '기업 출강 실적 1,000회 이상 및 평균 만족도 4.8 이상',
                    color: 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/10',
                    badgeColor: 'bg-emerald-500/10 text-emerald-400',
                    icon: <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                  },
                  {
                    tier: 'Prestige Legend',
                    title: '프레스티지 레전드',
                    desc: '대한민국 기업 교육계의 살아있는 거장, 최상위 명예 명장 등급',
                    conditions: '출강 실적 10,000회 이상 및 평균 만족도 4.9 이상',
                    color: 'text-purple-400 bg-purple-500/5 border border-purple-500/10',
                    badgeColor: 'bg-purple-500/10 text-purple-400',
                    icon: <Star className="w-5 h-5 text-purple-400 animate-bounce" />
                  }
                ].map((item, idx) => (
                  <div key={idx} className={`p-5 rounded-xl transition-all space-y-4 ${item.color}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                          {item.tier}
                        </span>
                        <h4 className="text-sm font-black text-white mt-1.5">{item.title}</h4>
                      </div>
                      <span className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-850 flex items-center justify-center">
                        {item.icon}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-300 leading-relaxed font-semibold">
                      {item.desc}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-neutral-800/60 text-[11px]">
                      <div>
                        <span className="text-neutral-500 block font-bold">📋 승급 조건</span>
                        <span className="text-neutral-200">{item.conditions}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-900/60 text-[11px] text-neutral-400 leading-relaxed">
                ℹ️ <strong>자동 심사 프로세스 안내</strong>: 소속 강사님들이 출강을 완료하고 정산이 이루어질 때마다 시스템이 누적 실적을 실시간으로 감지하여 등급 승격 및 보너스 마일리지를 자동 지급합니다. 임의의 수동 등급 보정이 필요하신 경우, KPCIA 운영사무국 마스터실을 통해 조율 가능합니다.
              </div>
            </div>

          </div>
        )}



        {/* TAB 3: LECTURE BOARD PANEL */}
        {activeTab === 'lectures' && (
          <div className="space-y-8" id="lectures-view">
            
            {/* Title & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-neutral-900">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white">KPCIA 실시간 출강 요청 매칭 공고</h2>
                <p className="text-xs text-neutral-400 mt-1">기업, 기관, 단체에서 접수된 사외 전문 특강 출강 요청 현황판입니다.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">자격 등급 충족 시 즉각 지원 가능</span>
              </div>
            </div>

            {/* Filter Panel */}
            <div className="grid md:grid-cols-3 gap-4" id="lecture-filter-row">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="출강 기업명 또는 교육 제목 검색..."
                  value={searchLecture}
                  onChange={(e) => setSearchLecture(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <select
                  value={filterLecTier}
                  onChange={(e) => setFilterLecTier(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-neutral-300 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                >
                  <option value="all">🎖️ 모든 지원자격 등급 전체보기</option>
                  <option value="Prestige Elite">Prestige Elite 등급 전용</option>
                  <option value="Prestige Master">Prestige Master 이상</option>
                  <option value="Prestige Professional">Prestige Professional 이상</option>
                  <option value="Prestige Associate">Prestige Associate 이상</option>
                  <option value="Prestige Member">Prestige Member 전용</option>
                </select>
              </div>

              <div className="text-xs text-neutral-500 flex items-center justify-end font-medium">
                모집 중인 출강 공고: <strong className="text-[#D4AF37] mx-1">{lectures.filter(l => l.status === 'open').length}</strong> 건
              </div>
            </div>

            {/* Lectures List with Pagination */}
            <div id="lecture-notices-list" className="space-y-6">
              {(() => {
                const filteredLectures = lectures.filter(l => {
                  const queryText = searchLecture.toLowerCase();
                  const titleMatch = l.title.toLowerCase().includes(queryText) || (l.companyName && l.companyName.toLowerCase().includes(queryText));
                  const tierMatch = filterLecTier === 'all' || l.targetTier === filterLecTier;
                  return titleMatch && tierMatch;
                });
                
                const itemsPerPage = 5;
                const totalPages = Math.ceil(filteredLectures.length / itemsPerPage) || 1;
                const currentPage = Math.min(lecturePage, totalPages);
                const paginatedLectures = filteredLectures.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                return (
                  <>
                    <div className="space-y-4">
                      {paginatedLectures.map(lecture => {
                        const hasApplied = currentUser && lecture.applicants.includes(currentUser.uid);
                        const userRank = currentUser ? getTierRank(currentUser.tier) : 0;
                        const targetRank = getTierRank(lecture.targetTier);
                        const isRestricted = !currentUser?.isAdmin && (userRank < targetRank);
                        
                        // For assigned check
                        const isMainLecturer = currentUser && lecture.assignedTo === currentUser.uid;
                        const isAssistantLecturer = currentUser && lecture.assistantId === currentUser.uid;

                        return (
                          <div 
                            key={lecture.id}
                            className="p-6 rounded-2xl bg-[#121214] border border-neutral-900 hover:border-neutral-800 transition-all relative overflow-hidden flex flex-col gap-6"
                          >
                            {/* Top Header Row (Always clear and visible!) */}
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800/60 pb-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-extrabold bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded border border-[#D4AF37]/20 uppercase tracking-wider">
                                  {lecture.companyName || "익명 기업"}
                                </span>
                                <span className={`text-[9px] font-black px-2 py-1 rounded ${getTierColor(lecture.targetTier)}`}>
                                  지원 자격: {lecture.targetTier}
                                </span>
                                <span className="text-[10px] text-neutral-500 font-bold">
                                  📅 {lecture.date} ({lecture.time})
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  lecture.status === 'completed' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : lecture.status === 'assigned'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-amber-500/10 text-[#D4AF37] border border-[#D4AF37]/20'
                                }}`}>
                                  {lecture.status === 'completed' ? '출강 완료(정산완료)' : lecture.status === 'assigned' ? '강사배정 완료' : '강사모집 중'}
                                </span>
                              </div>
                            </div>

                            {/* Content Area: Blurred if restricted */}
                            <div className="relative">
                              <div className={`space-y-4 ${isRestricted ? 'blur-md select-none pointer-events-none' : ''}`}>
                                <div className="space-y-2">
                                  <h3 className="text-base font-black text-white">{lecture.title}</h3>
                                  <p className="text-[11px] text-neutral-400 leading-relaxed max-w-4xl">{lecture.description}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-neutral-400 bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-900">
                                  <span>📍 장소: <strong className="text-neutral-200">{lecture.location}</strong></span>
                                  <span>•</span>
                                  <span>👥 예정인원: <strong className="text-neutral-200">{lecture.attendees}명</strong></span>
                                  <span>•</span>
                                  <span>⏱️ 시간: <strong className="text-neutral-200">{lecture.duration || '3시간'}</strong></span>
                                  <span>•</span>
                                  <span>💰 총예산: <strong className="text-amber-400">₩{lecture.budget.toLocaleString()}</strong></span>
                                  <span>•</span>
                                  <span>🪙 마일리지: <strong className="text-emerald-400">{lecture.mileageRoyalty} M</strong></span>
                                </div>

                                {/* Extra info for assigned lecture */}
                                {(lecture.assignedName || lecture.assistantName) && (
                                  <div className="text-[11px] text-neutral-400 flex items-center gap-3">
                                    {lecture.assignedName && (
                                      <span>👤 주강사: <strong className="text-white">{lecture.assignedName}</strong></span>
                                    )}
                                    {lecture.assistantName && (
                                      <span>👥 보조강사: <strong className="text-white">{lecture.assistantName}</strong></span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Restricted / Lock Overlay */}
                              {isRestricted && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl p-4 text-center border border-neutral-900">
                                  <div className="h-10 w-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-2.5">
                                    <Lock className="w-4 h-4 text-amber-500 animate-pulse" />
                                  </div>
                                  <h4 className="text-xs font-bold text-[#D4AF37] tracking-tight">🔒 등급별 출강정보 접근제한 구역</h4>
                                  <p className="text-[10px] text-neutral-400 max-w-md mt-1.5 leading-relaxed">
                                    이 공고는 <span className="text-amber-400 font-bold">{lecture.targetTier}</span> 등급 전용 매칭 공고입니다.<br />
                                    로그인 후 승격 요건을 완수하여 등급 상향 시 전체 열람 및 즉시 지원이 가능합니다.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Bottom Interaction Controls */}
                            {!isRestricted && (
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-neutral-900/60">
                                {/* Left Actions / Info */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Certificate download triggers if matching active or completed */}
                                  {(lecture.status === 'assigned' || lecture.status === 'completed') && (currentUser?.isAdmin || isMainLecturer || isAssistantLecturer) && (
                                    <div className="flex gap-1.5">
                                      <button
                                        onClick={() => handleOpenCertificate(lecture, 'appointment')}
                                        className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-[#D4AF37] text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                      >
                                        <FileText className="w-3 h-3" />
                                        위임장 출력
                                      </button>
                                      <button
                                        onClick={() => handleOpenCertificate(lecture, 'matching')}
                                        className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-emerald-400 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                      >
                                        <FileText className="w-3 h-3" />
                                        매칭 확인서 출력
                                      </button>
                                    </div>
                                  )}

                                  {/* Mutual evaluation trigger for Main Lecturer on Assistant */}
                                  {lecture.status === 'completed' && isMainLecturer && lecture.assistantId && !lecture.assistantEvaluated && (
                                    <button
                                      onClick={() => {
                                        setEvaluationLectureId(lecture.id);
                                        setShowEvaluationModal(true);
                                      }}
                                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-neutral-950 text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 animate-bounce"
                                    >
                                      <Star className="w-3 h-3" />
                                      보조강사 평가 수행
                                    </button>
                                  )}
                                </div>

                                {/* Right Apply/Applicant Actions */}
                                <div className="flex items-center gap-4 ml-auto">
                                  {lecture.status === 'open' && (
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] text-neutral-400 font-medium">
                                        현재 지원 강사: <strong className="text-[#D4AF37]">{lecture.applicants.length}명</strong>
                                      </span>
                                      <button
                                        onClick={() => handleApplyLecture(lecture.id)}
                                        disabled={hasApplied}
                                        className={`px-4.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                          hasApplied 
                                            ? 'bg-neutral-800 text-neutral-500 border border-neutral-800 cursor-not-allowed'
                                            : 'bg-[#D4AF37] text-neutral-950 hover:brightness-110 shadow-lg shadow-amber-500/5'
                                        }`}
                                      >
                                        {hasApplied ? '✓ 지원 완료' : '출강 지원신청'}
                                      </button>
                                    </div>
                                  )}

                                  {lecture.status === 'assigned' && (
                                    <span className="text-[10px] text-blue-400 font-bold bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10">
                                      🤝 매칭 성사 배정완료 (위임장 확인 가능)
                                    </span>
                                  )}

                                  {lecture.status === 'completed' && (
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                                        💰 출강 정산 완료 (마일리지 지급 완료)
                                      </span>
                                      {lecture.lectureRating !== undefined && (
                                        <span className="text-[10px] text-amber-400 font-black flex items-center gap-0.5">
                                          ⭐ 만족도 평점: {lecture.lectureRating.toFixed(1)} / 5.0
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {filteredLectures.length === 0 && (
                        <div className="text-center py-12 text-neutral-500">
                          검색 조건에 맞는 출강 공고가 존재하지 않습니다.
                        </div>
                      )}
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-neutral-900/60 font-sans text-xs">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setLecturePage(prev => Math.max(1, prev - 1))}
                          className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white disabled:opacity-40 transition-all cursor-pointer"
                        >
                          이전
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                          <button
                            key={pageNum}
                            onClick={() => setLecturePage(pageNum)}
                            className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-amber-600 to-[#D4AF37] text-neutral-950 font-black'
                                : 'border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}

                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setLecturePage(prev => Math.min(totalPages, prev + 1))}
                          className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white disabled:opacity-40 transition-all cursor-pointer"
                        >
                          다음
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

          </div>
        )}

        {/* TAB 4: PROGRAMS CATALOG PANEL */}
        {activeTab === 'programs' && (
          <div className="space-y-8" id="programs-view">
            
            {/* Title & Register Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-neutral-900">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white">KPCIA 명품 자체 개발 교육 과정</h2>
                <p className="text-xs text-neutral-400 mt-1">소속 우수 강사들이 직접 기획/설계하고 협회가 공인한 명작 커리큘럼입니다.</p>
              </div>
              <div className="text-xs text-neutral-400">
                출강 시 프로그램 저작자에게 <strong className="text-[#D4AF37]">마일리지 로열티</strong> 지급
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-start">
              
              {/* Propose a Program Form (Left Side) */}
              <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 md:col-span-1" id="propose-program-form-container">
                <div className="flex items-center gap-2 text-white font-bold border-b border-neutral-800 pb-2">
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs">내 교육과정 카탈로그에 제안</span>
                </div>

                {currentUser && getTierRank(currentUser.tier) < 4 ? (
                  <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/10 space-y-3 text-center">
                    <span className="text-2xl block">🔒</span>
                    <h4 className="font-extrabold text-red-400 text-xs">교육과정 제안 권한 제한됨</h4>
                    <p className="text-[10px] text-neutral-400 leading-relaxed">
                      고품격 지식 지적재산(IP) 저작권 과정 등록은 최소 <strong className="text-amber-400">'Prestige Master'</strong> 등급 이상 소속 강사님만 가능합니다.
                    </p>
                    <div className="text-[9px] text-neutral-500 bg-neutral-950 p-2.5 rounded border border-neutral-900/80">
                      현재 회원님의 등급: <strong className="text-neutral-300">{currentUser.tier}</strong>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleProposeProgram} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">교육과정 명칭 (핵심 대주제)</label>
                      <input
                        type="text"
                        placeholder="예) 차세대 AI 생산성 극대화 워크숍"
                        value={newProgTitle}
                        onChange={(e) => setNewProgTitle(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">과정 핵심 개요 (목표 및 기대 효과)</label>
                      <textarea
                        placeholder="예) ChatGPT 실무 및 노코드 프롬프트를 도입하여 업무 효율을..."
                        value={newProgDesc}
                        onChange={(e) => setNewProgDesc(e.target.value)}
                        required
                        rows={3}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">주요 교육 대상</label>
                      <input
                        type="text"
                        placeholder="예) 대기업 실무진, 부서 기획자 등"
                        value={newProgAudience}
                        onChange={(e) => setNewProgAudience(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">주요 커리큘럼 세션 (엔터로 구분)</label>
                      <textarea
                        placeholder="예) 세션 1: 생성형 AI 개념 이해&#10;세션 2: 기업 맞춤형 실전 프롬프트&#10;세션 3: 노코드 활용 보고서 자동화"
                        value={newProgCurriculum}
                        onChange={(e) => setNewProgCurriculum(e.target.value)}
                        rows={3}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">희망 마일리지 로열티 (출강당 지급 M)</label>
                      <input
                        type="number"
                        value={newProgRoyalty}
                        onChange={(e) => setNewProgRoyalty(Number(e.target.value))}
                        className="w-full bg-[#09090B] border border-neutral-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-[#D4AF37] text-neutral-950 font-black text-center transition-all cursor-pointer"
                    >
                      🚀 정식 지식재산(IP) 등록신청
                    </button>
                  </form>
                )}
              </div>

              {/* Programs Catalog (Right Side - 2 Cols) */}
              <div className="md:col-span-2 space-y-6" id="programs-catalog-container">
                <div className="grid gap-6">
                  {programs.map(prog => (
                    <div 
                      key={prog.id}
                      className="p-6 rounded-2xl bg-[#121214] border border-neutral-900 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-base font-black text-white">{prog.title}</h3>
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 whitespace-nowrap">
                            로열티: {prog.royaltyRate} M / 회당
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-neutral-400 leading-relaxed">{prog.description}</p>
                        
                        <div className="text-[10px] text-neutral-500">
                          🎯 주 교육대상: <strong className="text-neutral-300">{prog.targetAudience}</strong>
                        </div>
                      </div>

                      {/* Curriculum sessions list */}
                      <div className="bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-800/60 space-y-1.5">
                        <div className="text-[10px] font-bold text-neutral-400 mb-1 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>정규 과정 커리큘럼</span>
                        </div>
                        {prog.curriculum.map((curr, idx) => (
                          <div key={idx} className="text-[11px] text-neutral-300 pl-4 relative before:content-['-'] before:absolute before:left-0 text-left">
                            {curr}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-neutral-500 pt-2 border-t border-neutral-900">
                        <span>프로그램 개발자: <strong className="text-neutral-300 font-bold">{prog.authorName} 강사</strong></span>
                        <button 
                          onClick={() => {
                            setActiveTab('partnership');
                            setPartTitle(`[프로그램 도입요청] ${prog.title}`);
                            setPartContent(`KPCIA 소속 ${prog.authorName} 강사님의 "${prog.title}" 과정을 사내 교육으로 도입하고 싶어 상세 견적과 세부 매칭 일정 상담을 의뢰합니다.`);
                          }}
                          className="text-[10px] text-[#D4AF37] font-bold hover:underline"
                        >
                          이 과정 사내 교육 도입 문의 &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: PARTNERSHIP INQUIRIES */}
        {activeTab === 'partnership' && (
          <div className="max-w-2xl mx-auto space-y-8" id="partnership-view">
            
            <div className="text-center space-y-2 pb-4 border-b border-neutral-900">
              <h2 className="text-2xl font-black text-white">KPCIA 기업 제휴 및 출강의뢰 접수처</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                임직원 대상의 사내 특강 의뢰, 고난도 맞춤형 기업 연수 프로그램 기획 매칭이 필요하신가요?<br />
                KPCIA 우수 강사 협회가 보증하는 최고 수준의 정형/비정형 교육 설계를 신속히 제공합니다.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
              <div className="flex items-center gap-2 text-white font-bold border-b border-neutral-800 pb-3 text-xs">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                <span>기업 출강 및 매칭 문의 작성</span>
              </div>

              <form onSubmit={handleAddProposal} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold block">의뢰 업체명 / 기관명</label>
                    <input
                      type="text"
                      placeholder="예) 삼성 인재개발원"
                      value={partCompany}
                      onChange={(e) => setPartCompany(e.target.value)}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold block">담당자 성함</label>
                    <input
                      type="text"
                      placeholder="예) 홍길동 대리"
                      value={partProposer}
                      onChange={(e) => setPartProposer(e.target.value)}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold block">연락 메일 주소</label>
                    <input
                      type="email"
                      placeholder="example@company.com"
                      value={partEmail}
                      onChange={(e) => setPartEmail(e.target.value)}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold block">담당자 연락처</label>
                    <input
                      type="tel"
                      placeholder="010-1234-5678"
                      value={partPhone}
                      onChange={(e) => setPartPhone(e.target.value)}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold block">의뢰 제목</label>
                  <input
                    type="text"
                    placeholder="예) 생성형 AI 워크숍 사내 출강 문의 건"
                    value={partTitle}
                    onChange={(e) => setPartTitle(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold block">상세 희망 교육 내용 / 요구 사안</label>
                  <textarea
                    placeholder="예) 희망 일시는 8월 초이며, 마케팅 부서 30명 가량을 대상으로 실습 포함한 3시간 특강 견적을 요청합니다..."
                    value={partContent}
                    onChange={(e) => setPartContent(e.target.value)}
                    required
                    rows={6}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-[#D4AF37] text-neutral-950 font-black text-center transition-all cursor-pointer text-xs"
                >
                  📧 공식 의뢰 및 파트너십 제휴 신청 전송
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 6: INSTRUCTOR MYPAGE */}
        {activeTab === 'mypage' && currentUser && (
          <div className="space-y-8" id="mypage-view">
            
            {/* Title & Tier Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-neutral-900">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white">KPCIA 강사 마이페이지</h2>
                <p className="text-xs text-neutral-400 mt-1">회원님의 자격 등급(Tier)과 획득한 마일리지, 디지털 배지를 실시간 모니터링합니다.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">지적 재산(IP) 소유자 계정</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Column: Personalized statistics */}
              <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6 md:col-span-1">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-16 w-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border-2 border-[#D4AF37]/40 font-black text-lg">
                    {currentUser.name.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{currentUser.name} 강사님</h3>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{currentUser.email}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-md ${getTierColor(currentUser.tier)}`}>
                    {currentUser.tier} 등급 회원
                  </span>
                </div>

                {/* Mileage counter */}
                <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-neutral-500 font-bold block">나의 교육 마일리지</span>
                    <span className="text-lg font-black text-[#D4AF37]">{currentUser.mileage.toLocaleString()} M</span>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#D4AF37]">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>

                {/* Active Digital Badge cabinet */}
                <div className="space-y-3">
                  <span className="text-[10px] text-neutral-400 font-bold block border-b border-neutral-800 pb-1">나의 획득 배지 캐비닛</span>
                  <div className="grid grid-cols-2 gap-2">
                    {currentUser.badges && currentUser.badges.map(badge => (
                      <div key={badge.id} className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center gap-2">
                        <span className="text-base">🎖️</span>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-neutral-200 font-bold block leading-none">{badge.title}</span>
                          <span className="text-[8px] text-neutral-500 font-normal block">수여일: {badge.dateGranted}</span>
                        </div>
                      </div>
                    ))}
                    {(!currentUser.badges || currentUser.badges.length === 0) && (
                      <div className="text-[10px] text-neutral-500 col-span-2 text-center py-2">획득한 협회 공식 배지가 없습니다.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic digital business card simulator (2 cols) */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Visual Business Card Wrapper */}
                <div className="space-y-2">
                  <label className="text-[11px] text-neutral-400 font-bold block">내 강사 디지털 명함 실시간 렌더링</label>
                  <div className={`p-8 rounded-3xl border ${getCardThemeClass(currentUser.profileCard.cardTheme)} relative overflow-hidden`}>
                    
                    {/* Watermark brand in background */}
                    <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none">
                      <span className="font-display font-black text-6xl tracking-tight uppercase">KPCIA</span>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                      <div className="space-y-4">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 text-xs font-bold backdrop-blur-md mb-2">
                            <span>{currentUser.tier}</span>
                          </div>
                          <h3 className="text-xl font-black">{currentUser.name}</h3>
                          <p className="text-xs text-neutral-400 font-medium mt-0.5">{currentUser.profileCard.title}</p>
                        </div>

                        <p className="text-xs leading-relaxed text-neutral-300 max-w-md italic font-normal">
                          &quot;{currentUser.profileCard.bio}&quot;
                        </p>
                      </div>

                      <div className="flex flex-col justify-between items-end gap-4 text-right">
                        <div className="h-14 w-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-black text-lg text-white">
                          {currentUser.name.substring(0, 2)}
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="text-[10px] text-neutral-400">📧 {currentUser.profileCard.contactEmail}</div>
                          <div className="text-[10px] text-neutral-400">📱 {currentUser.profileCard.contactPhone}</div>
                          <div className="text-[10px] text-neutral-400">📍 활동지역: {currentUser.profileCard.region || '서울'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Footer list of specialties */}
                    <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap gap-1.5 relative z-10">
                      {currentUser.profileCard.specialties.map((spec, idx) => (
                        <span key={idx} className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                          #{spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Edit Card Profile Simple Form */}
                <div className="p-6 rounded-2xl bg-[#121214] border border-neutral-900 space-y-4">
                  <h4 className="text-xs font-bold text-neutral-200 border-b border-neutral-950 pb-2">디지털 명함 정보 수정 (즉시 반영)</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">강사 공식 직함</label>
                      <input
                        type="text"
                        value={currentUser.profileCard.title}
                        onChange={async (e) => {
                          const updated = {
                            ...currentUser,
                            profileCard: { ...currentUser.profileCard, title: e.target.value }
                          };
                          setCurrentUser(updated);
                          await StorageService.saveUser(updated);
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">디지털 명함 디자인 테마</label>
                      <select
                        value={currentUser.profileCard.cardTheme}
                        onChange={async (e) => {
                          const updated = {
                            ...currentUser,
                            profileCard: { ...currentUser.profileCard, cardTheme: e.target.value as any }
                          };
                          setCurrentUser(updated);
                          await StorageService.saveUser(updated);
                          triggerToast("명함 테마 디자인이 고품격 스타일로 즉시 교체되었습니다!", "success");
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs cursor-pointer"
                      >
                        <option value="classic">🔳 클래식 그레이</option>
                        <option value="gold_luxury">✨ 안티크 골드 럭셔리</option>
                        <option value="midnight_sapphire">🌌 미드나잇 사파이어 블루</option>
                        <option value="elite_emerald">🌿 엘리트 에메랄드 그린</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">전문 강의 분야 (쉼표 구분)</label>
                      <input
                        type="text"
                        value={currentUser.profileCard.specialties.join(', ')}
                        onChange={async (e) => {
                          const specialties = e.target.value.split(',').map(s => s.trim());
                          const updated = {
                            ...currentUser,
                            profileCard: { ...currentUser.profileCard, specialties }
                          };
                          setCurrentUser(updated);
                          await StorageService.saveUser(updated);
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">주 활동 지역</label>
                      <input
                        type="text"
                        value={currentUser.profileCard.region || '서울'}
                        onChange={async (e) => {
                          const updated = {
                            ...currentUser,
                            profileCard: { ...currentUser.profileCard, region: e.target.value }
                          };
                          setCurrentUser(updated);
                          await StorageService.saveUser(updated);
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-neutral-400 font-semibold block">나의 다짐 및 인삿말 (Bio)</label>
                    <textarea
                      value={currentUser.profileCard.bio}
                      onChange={async (e) => {
                        const updated = {
                          ...currentUser,
                          profileCard: { ...currentUser.profileCard, bio: e.target.value }
                        };
                        setCurrentUser(updated);
                        await StorageService.saveUser(updated);
                      }}
                      rows={2}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                    />
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 7: ADMIN CONTROL MASTER PORTAL */}
        {activeTab === 'admin' && currentUser?.isAdmin && (
          <div className="space-y-8 animate-in fade-in duration-300" id="admin-master-view">
            
            {/* Title */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-neutral-900">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white">👑 KPCIA 마스터 관리자 지휘본부</h2>
                <p className="text-xs text-neutral-400 mt-1">강사 등급 통제, 제휴 의뢰 관리, 출강 공고 수탁 등록 및 실시간 정산을 모니터링합니다.</p>
              </div>
            </div>

            {/* 📊 Admin Dashboard Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="admin-stats-summary-row">
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-850 flex flex-col justify-between">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">총 수탁 출강 공고</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-white">{lectures.length}</span>
                  <span className="text-[10px] text-neutral-400 font-medium">건</span>
                </div>
                <div className="flex gap-2 text-[9px] text-neutral-500 mt-2 border-t border-neutral-850/60 pt-1.5">
                  <span>모집 {lectures.filter(l => l.status === 'open').length}</span>
                  <span>배정 {lectures.filter(l => l.status === 'assigned').length}</span>
                  <span>완료 {lectures.filter(l => l.status === 'completed').length}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-850 flex flex-col justify-between">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">소속 전문 강사단</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-[#D4AF37]">{users.length}</span>
                  <span className="text-[10px] text-neutral-400 font-medium">명</span>
                </div>
                <div className="flex gap-2 text-[9px] mt-2 border-t border-neutral-850/60 pt-1.5 justify-between">
                  <span className="text-emerald-500 font-semibold">정회원 {users.filter(u => u.isApproved).length}명</span>
                  <span className="text-amber-500 font-semibold animate-pulse">승인대기 {users.filter(u => !u.isApproved).length}명</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-850 flex flex-col justify-between">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">제휴 및 도입 의뢰</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-blue-400">{proposals.length}</span>
                  <span className="text-[10px] text-neutral-400 font-medium">건</span>
                </div>
                <div className="flex gap-2 text-[9px] mt-2 border-t border-neutral-850/60 pt-1.5 justify-between">
                  <span className="text-amber-400 font-semibold">검토대기 {proposals.filter(p => p.status === 'pending').length}건</span>
                  <span className="text-neutral-500 font-semibold">완료 {proposals.filter(p => p.status !== 'pending').length}건</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-850 flex flex-col justify-between">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">누적 정산 지급액</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-black text-emerald-400">
                    {transactions
                      .filter(t => t.type === 'lecture_payout' || t.type === 'royalty')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString()}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-semibold">M</span>
                </div>
                <div className="text-[9px] text-neutral-500 mt-2 border-t border-neutral-850/60 pt-1.5">
                  총 {transactions.filter(t => t.type === 'lecture_payout' || t.type === 'royalty').length}회 정산 트랜잭션 기록
                </div>
              </div>
            </div>

            {/* 📁 Sub-Tab Navigation Bar */}
            <div className="flex border-b border-neutral-900 gap-1 overflow-x-auto pb-px">
              <button
                onClick={() => setAdminSubTab('lectures')}
                className={`px-5 py-3 text-xs font-black transition-all border-b-2 shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  adminSubTab === 'lectures'
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-amber-500/5'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950/40'
                }`}
              >
                <span>📢 출강 통제 및 공고 발행</span>
                <span className="px-1.5 py-0.5 rounded-full bg-neutral-950 text-neutral-400 border border-neutral-850 text-[9px]">
                  {lectures.length}
                </span>
              </button>

              <button
                onClick={() => setAdminSubTab('instructors')}
                className={`px-5 py-3 text-xs font-black transition-all border-b-2 shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  adminSubTab === 'instructors'
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-amber-500/5'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950/40'
                }`}
              >
                <span>👥 소속 강사단 관리</span>
                {users.filter(u => !u.isApproved).length > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] animate-pulse font-bold">
                    승인대기 {users.filter(u => !u.isApproved).length}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full bg-neutral-950 text-neutral-400 border border-neutral-850 text-[9px]">
                    {users.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setAdminSubTab('proposals')}
                className={`px-5 py-3 text-xs font-black transition-all border-b-2 shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  adminSubTab === 'proposals'
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-amber-500/5'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950/40'
                }`}
              >
                <span>📧 외부 제휴 의뢰 수신함</span>
                {proposals.filter(p => p.status === 'pending').length > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold animate-pulse">
                    신규 {proposals.filter(p => p.status === 'pending').length}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full bg-neutral-950 text-neutral-400 border border-neutral-850 text-[9px]">
                    {proposals.length}
                  </span>
                )}
              </button>
            </div>

            {/* Admin Grid: Left Form, Right List */}
            {adminSubTab === 'lectures' && (
              <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
                
                {/* Left Column: Post a Lecture Request Form */}
                <div className="lg:col-span-1 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5" id="admin-create-lecture-form">
                  <div className="flex items-center gap-2 text-white font-bold border-b border-neutral-800 pb-2">
                    <Plus className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-black">강의 출강 요청서</span>
                  </div>

                  <form onSubmit={handleCreateLecture} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">출강 교육 명칭 (Title)</label>
                      <input
                        type="text"
                        placeholder="예) 인공지능 기반 마케팅 혁신 실전 특강"
                        value={newLecTitle}
                        onChange={(e) => setNewLecTitle(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">의뢰 기업명 (companyName)</label>
                      <input
                        type="text"
                        placeholder="예) 현대자동차 마케팅부"
                        value={newLecCompany}
                        onChange={(e) => setNewLecCompany(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">교육 내용 및 요구 사양 개요</label>
                      <textarea
                        placeholder="사내 마케터 대상으로 프롬프트 엔지니어링 및 자동화 교안을 기반으로 특강 진행..."
                        value={newLecDesc}
                        onChange={(e) => setNewLecDesc(e.target.value)}
                        required
                        rows={3}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">출강 지역 / 교육장 위치</label>
                      <input
                        type="text"
                        placeholder="예) 경기도 화성시 남양읍 현대연구소"
                        value={newLecLocation}
                        onChange={(e) => setNewLecLocation(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-neutral-400 font-semibold block">출강 일자</label>
                        <input
                          type="date"
                          value={newLecDate}
                          onChange={(e) => setNewLecDate(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400 font-semibold block">요구 강사 등급컷</label>
                        <select
                          value={newLecTier}
                          onChange={(e) => setNewLecTier(e.target.value as any)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs cursor-pointer"
                        >
                          <option value="Prestige Member">Prestige Member 이상</option>
                          <option value="Prestige Associate">Prestige Associate 이상</option>
                          <option value="Prestige Professional">Prestige Professional 이상</option>
                          <option value="Prestige Master">Prestige Master 이상</option>
                          <option value="Prestige Elite">Prestige Elite 전용</option>
                          <option value="Prestige Legend">Prestige Legend 전용</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-neutral-400 font-semibold block">강의 시간</label>
                        <input
                          type="number"
                          min={1}
                          value={newLecHours}
                          onChange={(e) => setNewLecHours(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400 font-semibold block">예정 인원</label>
                        <input
                          type="number"
                          min={1}
                          value={newLecAttendees}
                          onChange={(e) => setNewLecAttendees(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400 font-semibold block">인당 재료비</label>
                        <input
                          type="number"
                          min={0}
                          value={newLecMaterialCost}
                          onChange={(e) => setNewLecMaterialCost(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">지식 저작권 과정 연계 (선택)</label>
                      <select
                        value={newLecProgramId}
                        onChange={(e) => setNewLecProgramId(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs cursor-pointer"
                      >
                        <option value="">과정 선택 안함 (로열티 없음)</option>
                        {programs.map(p => (
                          <option key={p.id} value={p.id}>{p.title} (저작권자: {p.authorName})</option>
                        ))}
                      </select>
                    </div>

                    {/* Real-time Budget Calculation Live Preview Block */}
                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1.5 font-mono text-[10px]">
                      <div className="text-amber-500 font-bold border-b border-neutral-900 pb-1 flex justify-between">
                        <span>💰 실시간 강사료 예산 검산</span>
                        <span>100% 자동 산정</span>
                      </div>
                      <div className="flex justify-between text-neutral-400">
                        <span>• 주강사비:</span>
                        <span className="text-neutral-200">{newLecHours}시간 × 100,000원 = {(newLecHours * 100000).toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between text-neutral-400">
                        <span>• 보조강사비:</span>
                        <span className="text-neutral-200">
                          {newLecAttendees >= 20 ? `${newLecHours}시간 × 50,000원 = ${(newLecHours * 50000).toLocaleString()}원` : '0원 (20명 미만)'}
                        </span>
                      </div>
                      <div className="flex justify-between text-neutral-400">
                        <span>• 재료 소요비:</span>
                        <span className="text-neutral-200">{newLecAttendees}명 × {newLecMaterialCost.toLocaleString()}원 = {(newLecAttendees * newLecMaterialCost).toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between border-t border-neutral-900 pt-1.5 text-white font-extrabold text-[11px]">
                        <span>계산 총 예산:</span>
                        <span className="text-[#D4AF37]">
                          ₩{(newLecHours * 100000 + (newLecAttendees >= 20 ? newLecHours * 50000 : 0) + newLecAttendees * newLecMaterialCost).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#D4AF37] hover:brightness-110 text-neutral-950 font-black text-center transition-all cursor-pointer"
                    >
                      📢 공식 위임 출강 공고 수탁 발행
                    </button>
                  </form>
                </div>

                {/* Right Column: Registered Instructors Management & Partnership Inquiries (2 cols) */}
                <div className="lg:col-span-2 space-y-8" id="admin-management-lists">
                  
                  {/* 👑 KPCIA Lecture Assignment & Settlement Control Room */}
                  <div className="p-6 rounded-2xl bg-[#0e0e10] border border-neutral-800 space-y-4">
                    <h3 className="text-sm font-black text-white border-b border-neutral-800 pb-2.5 flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <span className="text-[#D4AF37]">👑</span> KPCIA 출강 수탁 배정 및 정산 통제실 ({lectures.length}건)
                      </span>
                      <span className="text-[10px] text-amber-500 font-bold">마스터 전용</span>
                    </h3>

                    <div className="space-y-4">
                      {lectures.map(lecture => {
                        return (
                          <div key={lecture.id} className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 space-y-3.5 text-[11px]">
                            <div className="flex justify-between items-start gap-3">
                              <div>
                                <span className="text-[10px] text-neutral-400 font-semibold block">{lecture.companyName}</span>
                                <strong className="text-white text-xs block mt-0.5">{lecture.title}</strong>
                                <span className="text-neutral-500 text-[10px] block mt-1">🗓️ {lecture.date} | ⏱️ {lecture.duration} | 📍 {lecture.location}</span>
                              </div>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                                lecture.status === 'open' 
                                  ? 'bg-amber-500/10 text-[#D4AF37] border border-[#D4AF37]/20' 
                                  : lecture.status === 'assigned'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {lecture.status === 'open' ? '모집 중' : lecture.status === 'assigned' ? '배정 완료' : '출강 완료'}
                              </span>
                            </div>

                            {/* Applicants List Preview */}
                            {lecture.status === 'open' && (
                              <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/50">
                                <span className="text-[10px] font-extrabold text-neutral-400 block mb-1">🙋 실시간 출강 신청 강사 ({lecture.applicants?.length || 0}명)</span>
                                {lecture.applicants && lecture.applicants.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {lecture.applicants.map(uid => {
                                      const appInst = users.find(u => u.uid === uid);
                                      return appInst ? (
                                        <span key={uid} className="px-2 py-0.5 rounded bg-neutral-900 text-white border border-neutral-800 font-semibold text-[10px]">
                                          👤 {appInst.name} 강사님 ({appInst.tier})
                                        </span>
                                      ) : null;
                                    })}
                                  </div>
                                ) : (
                                  <span className="text-neutral-500 text-[10px]">출강 신청자가 아직 없습니다.</span>
                                )}
                              </div>
                            )}

                            {/* Assignment & Complete Actions */}
                            {lecture.status === 'open' && (
                              <div className="flex flex-col md:flex-row gap-3 items-end pt-2 border-t border-neutral-800/60">
                                <div className="grid grid-cols-2 gap-3 w-full">
                                  <div className="space-y-1">
                                    <label className="text-[10px] text-neutral-400 font-semibold block">주강사 최종 배정 *</label>
                                    <select 
                                      id={`admin-assign-main-master-${lecture.id}`}
                                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-[11px] text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                                    >
                                      <option value="">주강사 선택...</option>
                                      {users.map(u => (
                                        <option key={u.uid} value={u.uid}>{u.name} 강사 ({u.tier})</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[10px] text-neutral-400 font-semibold block">보조강사 배정 (선택)</label>
                                    <select 
                                      id={`admin-assign-assist-master-${lecture.id}`}
                                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-[11px] text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                                    >
                                      <option value="">보조강사 선택...</option>
                                      {users.map(u => (
                                        <option key={u.uid} value={u.uid}>{u.name} 강사 ({u.tier})</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <button
                                  onClick={() => {
                                    const mainSelect = document.getElementById(`admin-assign-main-master-${lecture.id}`) as HTMLSelectElement;
                                    const assistSelect = document.getElementById(`admin-assign-assist-master-${lecture.id}`) as HTMLSelectElement;
                                    if (mainSelect && mainSelect.value) {
                                      handleAssignLecturers(lecture.id, mainSelect.value, assistSelect?.value);
                                    } else {
                                      triggerToast("주강사를 지정해 주세요.", "error");
                                    }
                                  }}
                                  className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:brightness-110 text-neutral-950 text-[11px] font-black transition-all cursor-pointer shrink-0"
                                >
                                  배정 승인 완료
                                </button>
                              </div>
                            )}

                            {lecture.status === 'assigned' && (
                              <div className="space-y-3 pt-2.5 border-t border-neutral-800/60">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-[11px] text-neutral-300">
                                  <div>
                                    배정 상태: <strong>{lecture.assignedName || '알 수 없음'}</strong> (주강사) / <strong>{lecture.assistantName || '없음'}</strong> (보조강사)
                                  </div>
                                  <div className="flex items-center gap-1.5 bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                                    <span className="text-amber-500 font-bold">⭐ 만족도 점수 입력:</span>
                                    <select
                                      value={adminLectureRatings[lecture.id] || 5.0}
                                      onChange={(e) => setAdminLectureRatings({
                                        ...adminLectureRatings,
                                        [lecture.id]: parseFloat(e.target.value)
                                      })}
                                      className="bg-neutral-900 text-white rounded px-1.5 py-0.5 border border-neutral-800 focus:outline-none focus:border-[#D4AF37] text-[10px]"
                                    >
                                      <option value="5.0">5.0 (최우수)</option>
                                      <option value="4.8">4.8 (우수)</option>
                                      <option value="4.5">4.5 (우수/양호)</option>
                                      <option value="4.0">4.0 (양호)</option>
                                      <option value="3.5">3.5 (보통)</option>
                                      <option value="3.0">3.0 (미흡)</option>
                                      <option value="2.0">2.0 (매우 미흡)</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => handleCompleteLectureAndSettle(lecture.id, adminLectureRatings[lecture.id] || 5.0)}
                                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black transition-all cursor-pointer text-xs flex items-center gap-1"
                                  >
                                    💰 만족도 등록 및 실시간 정산·출강 완료
                                  </button>
                                </div>
                              </div>
                            )}

                            {lecture.status === 'completed' && (
                              <div className="pt-2 border-t border-neutral-850 text-[10px] text-neutral-500 space-y-1">
                                <div>
                                  이 출강 건은 완전히 종료되었으며, 주강사 <strong>{lecture.assignedName}</strong> 및 보조강사 정산 지급이 완료되었습니다.
                                </div>
                                {lecture.lectureRating !== undefined && (
                                  <div className="text-amber-400 font-bold flex items-center gap-1">
                                    <span>⭐ 등록된 강의 만족도 평점:</span>
                                    <span className="bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px]">
                                      {lecture.lectureRating.toFixed(1)} / 5.0
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {lectures.length === 0 && (
                        <div className="text-neutral-500 text-center py-4">등록된 출강 건이 없습니다.</div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {adminSubTab === 'instructors' && (
              <div className="animate-in fade-in duration-200 space-y-6">
                
                {/* 1. Registered Instructors Controller */}
                <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                  <h3 className="text-sm font-black text-white border-b border-neutral-800 pb-2.5 flex justify-between items-center">
                    <span>👥 소속 강사단 자격 등급 및 활동 제어반 ({users.length}명)</span>
                    <span className="text-[10px] text-neutral-400 font-medium">상호 평가 및 정량 실적 기반 자동 업그레이드</span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-neutral-800 text-neutral-400">
                          <th className="py-2.5 font-bold">강사성명</th>
                          <th className="py-2.5 font-bold">현재 등급</th>
                          <th className="py-2.5 font-bold">출강 횟수</th>
                          <th className="py-2.5 font-bold">평균 만족도</th>
                          <th className="py-2.5 font-bold">마일리지</th>
                          <th className="py-2.5 font-bold">정회원 승인</th>
                          <th className="py-2.5 font-bold text-right">강사 관리 및 등급 제어</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/50 text-neutral-300">
                        {users.map(u => (
                          <tr key={u.uid} className="hover:bg-neutral-950/40">
                            <td className="py-3 font-bold text-white">
                              <div>{u.name}</div>
                              <div className="text-[9px] text-neutral-500 font-normal">{u.profileCard?.title || '소속 강사'}</div>
                            </td>
                            <td className="py-3">
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${getTierColor(u.tier)}`}>
                                {u.tier}
                              </span>
                            </td>
                            <td className="py-3 font-mono font-bold text-neutral-200">{u.lectureCount || 0}회</td>
                            <td className="py-3 font-mono font-bold text-amber-400">⭐ {u.averageRating || '4.50'}</td>
                            <td className="py-3 font-mono font-bold text-emerald-400">{u.mileage.toLocaleString()}M</td>
                            <td className="py-3">
                              <button
                                onClick={() => handleToggleUserApproval(u.uid)}
                                className={`px-2 py-1 rounded text-[10px] font-black border transition-all cursor-pointer ${
                                  u.isApproved 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 animate-pulse'
                                }`}
                              >
                                {u.isApproved ? '✅ 정회원 승인완료' : '⏳ 승인대기 (클릭승인)'}
                              </button>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingInstructor(u);
                                    setEditInstName(u.name);
                                    setEditInstTier(u.tier);
                                    setEditInstMileage(u.mileage);
                                    setEditInstTitle(u.profileCard?.title || '');
                                    setEditInstBio(u.profileCard?.bio || '');
                                    setEditInstSpecialties(u.profileCard?.specialties ? u.profileCard.specialties.join(', ') : '');
                                  }}
                                  className="px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 font-bold transition-all text-[9px] cursor-pointer"
                                >
                                  ✏️ 정보수정
                                </button>
                                <button
                                  onClick={() => handleAutoUpgradeUser(u.uid)}
                                  className="px-2 py-1 rounded bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/20 font-bold transition-all text-[9px] cursor-pointer"
                                >
                                  🔄 자동심사
                                </button>
                                <select
                                  value={u.tier}
                                  onChange={(e) => handleManualTierUpdate(u.uid, e.target.value as any)}
                                  className="bg-neutral-950 border border-neutral-800 text-[9px] font-bold text-neutral-400 rounded px-1 py-0.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                                >
                                  <option value="Prestige Member">Member</option>
                                  <option value="Prestige Associate">Associate</option>
                                  <option value="Prestige Professional">Professional</option>
                                  <option value="Prestige Master">Master</option>
                                  <option value="Prestige Elite">Elite</option>
                                  <option value="Prestige Legend">Legend</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {adminSubTab === 'proposals' && (
              <div className="animate-in fade-in duration-200 space-y-6">
                
                {/* 2. Partnership Inquiries Control Room */}
                <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                  <h3 className="text-sm font-black text-white border-b border-neutral-800 pb-2.5 flex justify-between items-center">
                    <span>📧 외부 기업 제휴 및 프로그램 도입 의뢰서 관리 ({proposals.length}건)</span>
                    <span className="text-[10px] text-neutral-400 font-medium">B2B 파트너십 실시간 접수 현황</span>
                  </h3>

                  <div className="space-y-4">
                    {proposals.map(prop => (
                      <div key={prop.id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5 text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-white text-xs">
                            🏢 {prop.companyName} <span className="font-normal text-neutral-400">({prop.proposerName} 담당자)</span>
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                            prop.status === 'accepted' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : prop.status === 'declined'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-[#D4AF37] border border-[#D4AF37]/20'
                          }`}>
                            {prop.status === 'accepted' ? '매칭성공/수락' : prop.status === 'declined' ? '종료/거절' : '검토대기'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-neutral-400">📧 {prop.email} | 📞 {prop.phone}</div>
                          <div className="font-black text-white mt-1">📌 {prop.title}</div>
                          <div className="text-neutral-400 whitespace-pre-wrap leading-relaxed mt-1 bg-neutral-900/60 p-2.5 rounded border border-neutral-900">{prop.content}</div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-neutral-900/60 text-[10px]">
                          <span className="text-neutral-500 font-bold">수신일자: {prop.createdAt.substring(0, 10)}</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleUpdateProposalStatus(prop.id, 'accepted')}
                              className="px-2 py-1 rounded bg-emerald-500 text-neutral-950 font-bold hover:brightness-110 transition-all cursor-pointer"
                            >
                              매칭수락
                            </button>
                            <button
                              onClick={() => handleUpdateProposalStatus(prop.id, 'declined')}
                              className="px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold hover:bg-red-500/20 transition-all cursor-pointer"
                            >
                              의뢰종료
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {proposals.length === 0 && (
                      <div className="text-neutral-500 text-center py-4">접수된 외부 제휴 및 의뢰서가 존재하지 않습니다.</div>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* 📄 1. KPCIA DIGITAL CERTIFICATE & APPOINTMENT DOWNLOAD MODAL */}
      {showCertificateModal && selectedCertificateLecture && (
        <div className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl space-y-6 p-6 my-auto flex flex-col items-center">
            
            <div className="w-full flex justify-between items-center border-b border-neutral-800 pb-3">
              <span className="text-xs text-[#D4AF37] font-black tracking-widest font-display">KPCIA DIGITAL LEGAL SEAL & CERTIFICATE</span>
              <button 
                onClick={() => {
                  setShowCertificateModal(false);
                  setSelectedCertificateLecture(null);
                }}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Print Block (ID: kpcia-certificate-print) */}
            <div className="overflow-auto max-w-full p-4 bg-neutral-950 rounded-2xl border border-neutral-800">
              <div 
                id="kpcia-certificate-print"
                className="w-[297mm] h-[210mm] relative bg-neutral-950 text-neutral-100 flex flex-col justify-between p-[20mm] border-[5px] border-double border-[#D4AF37] select-none shadow-2xl font-sans shrink-0 overflow-hidden"
                style={{ width: '297mm', height: '210mm', minWidth: '297mm', minHeight: '210mm', boxSizing: 'border-box' }}
              >
                {/* Luxury gold double border decoration */}
                <div className="absolute inset-[3mm] border border-[#D4AF37]/30 pointer-events-none"></div>

                {/* Watermark in background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <span className="font-display font-black text-[120px] uppercase tracking-widest">KPCIA</span>
                </div>

                {/* Top Title Section */}
                <div className="text-center space-y-2 mt-[10mm]">
                  <div className="text-[12px] text-[#D4AF37] font-bold tracking-[8px] uppercase">KOREA PRESTIGE INSTRUCTOR ASSOCIATION</div>
                  <h1 className="text-[42px] font-black text-white tracking-[24px] pl-[24px]">
                    {certificateType === 'appointment' ? '위 임 장' : '출강 매칭 증명서'}
                  </h1>
                  <div className="text-[11px] text-neutral-500 font-mono tracking-wider">
                    증서번호: KPCIA-CERT-2026-{selectedCertificateLecture.id.substring(5, 11).toUpperCase()}
                  </div>
                </div>

                {/* Body Content Section */}
                <div className="px-[15mm] text-left space-y-[8mm] my-auto">
                  <div className="grid grid-cols-5 gap-y-[4mm] text-[14px]">
                    <span className="text-neutral-400 col-span-1">성 명:</span>
                    <span className="text-white font-extrabold col-span-4 text-[16px]">
                      {certificateType === 'appointment' ? `${selectedCertificateLecture.assignedName || 'KPCIA 정회원'} 강사` : `${selectedCertificateLecture.assignedName || 'KPCIA'} 대표 강사단`}
                    </span>

                    <span className="text-neutral-400 col-span-1">수탁 기관:</span>
                    <span className="text-white font-bold col-span-4">{selectedCertificateLecture.companyName}</span>

                    <span className="text-neutral-400 col-span-1">위임 사항:</span>
                    <span className="text-neutral-100 font-extrabold col-span-4 text-[15px] underline decoration-[#D4AF37]/60 underline-offset-4">
                      {selectedCertificateLecture.title}
                    </span>

                    <span className="text-neutral-400 col-span-1">위임 기간:</span>
                    <span className="text-neutral-300 col-span-4">{selectedCertificateLecture.date} ({selectedCertificateLecture.time})</span>

                    <span className="text-neutral-400 col-span-1">정산 예산:</span>
                    <span className="text-amber-400 font-bold col-span-4">₩{selectedCertificateLecture.budget.toLocaleString()} (지적 IP 연계 필)</span>
                  </div>

                  <p className="text-[13px] text-neutral-300 leading-relaxed text-justify indent-[6px]">
                    {certificateType === 'appointment' 
                      ? "귀하는 사단법인 한국프레스티지기업강사협회의 정회원으로서, 본 협회가 수탁받은 상기 기업 교육 과정의 주강사 및 위임 전문가로 정식 위임되어 출강함을 승인하는 바, 본 위임장을 수여합니다."
                      : "상기 명시된 기업 교육 매칭 과정에 대하여 본 협회의 검증 사양서에 의거, 최종 출강 매칭 승인 및 수탁 계약이 투명하게 체결되어 출강 강사단이 정상 위임 배정되었음을 공식 증명합니다."
                    }
                  </p>
                </div>

                {/* Bottom Stamp and Date Section */}
                <div className="flex justify-between items-end px-[10mm] mb-[5mm]">
                  <div className="space-y-1 text-left">
                    <div className="text-[12px] text-neutral-400 font-semibold font-mono">발행일자: 2026년 07월 16일</div>
                    <div className="text-[10px] text-neutral-500 font-bold uppercase">KPCIA Verification Office Certified</div>
                  </div>

                  {/* President Seal Visual stamp */}
                  <div className="relative flex items-center justify-center">
                    <span className="text-[18px] font-black text-white tracking-[6px] relative z-10 mr-[25px]">
                      사단법인 한국프레스티지기업강사협회 회장
                    </span>
                    {/* Official red circular stamp */}
                    <div className="absolute right-0 w-[55px] h-[55px] rounded-full border-4 border-red-600/80 bg-transparent flex items-center justify-center -rotate-12 select-none pointer-events-none opacity-90 scale-105">
                      <span className="text-red-600 font-black text-[9px] leading-tight text-center">
                        한국강사<br />협회인
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-center w-full pt-2">
              <button
                onClick={handleDownloadCertificatePDF}
                className="px-6 py-3 rounded-xl bg-[#D4AF37] hover:brightness-110 text-neutral-950 font-black text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                고해상도 PDF 증명서 내려받기
              </button>
              <button
                onClick={() => {
                  setShowCertificateModal(false);
                  setSelectedCertificateLecture(null);
                }}
                className="px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-all cursor-pointer"
              >
                닫기
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ⭐ 2. MUTUAL SATISFACTION EVALUATION MODAL */}
      {showEvaluationModal && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative my-auto font-sans text-xs">
            
            <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
              <span className="font-bold text-xs text-amber-400 tracking-widest font-display">KPCIA 보조강사 상호성실성 평가</span>
              <button 
                onClick={() => setShowEvaluationModal(false)}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEvaluateAssistant} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-neutral-400 font-semibold block text-left">현장 출강 성실성 평점 (상호만족도)</label>
                <div className="flex gap-2.5 items-center py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEvaluationRating(star)}
                      className="text-2xl transition-all hover:scale-110 cursor-pointer animate-none bg-transparent border-none"
                    >
                      {star <= evaluationRating ? '⭐' : '☆'}
                    </button>
                  ))}
                  <span className="text-neutral-400 font-bold ml-2">({evaluationRating} / 5.0)</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold block text-left">상세 상호성실성 검증 의견 (동료 서면 피드백)</label>
                <textarea
                  placeholder="예) 강의 시간 준수, 보조교재 소독 배포, 교육생 실무 질의응답 대응에 우수한 성실성을 보여주셨습니다..."
                  value={evaluationComment}
                  onChange={(e) => setEvaluationComment(e.target.value)}
                  required
                  rows={4}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                />
              </div>

              <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 text-[10px] text-neutral-400 leading-relaxed text-left">
                📢 본 평가는 위임받은 주강사의 책임 평가로서, 제출 즉시 해당 보조강사님의 자격 요건 정량 점수에 반영되며 취소할 수 없습니다.
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowEvaluationModal(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:brightness-110 text-neutral-950 font-black cursor-pointer"
                >
                  ⭐ 상호평가 등록 제출
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 👑 Footer Corporate Design */}
      <footer className="border-t border-neutral-900 bg-[#09090B] py-12 text-xs text-neutral-500 mt-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-neutral-200 text-sm tracking-widest">KPCIA</span>
              <span className="text-[10px] text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-1.5 py-0.5 rounded font-bold">공식 인증 사무국</span>
            </div>
            <p className="leading-relaxed">
              한국프레스티지기업강사협회는 국내 명품 사외 강사들의 지적 재산 보호, 투명한 로열티 정산, 그리고 기업/기관 출강 매칭을 위해 설립된 공식 비영리 협력 기관입니다.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-neutral-300">협회 주요 운영 방침</h4>
            <ul className="space-y-1">
              <li>• 저작권법 제97조의5에 의거한 교안 지적 재산 보호</li>
              <li>• 출강 정량 평가 점수에 기인한 정직한 등급 승격</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-neutral-300">협회 대표 사무국 정보</h4>
            <ul className="space-y-1.5 text-neutral-400">
              <li>📍 <span className="text-neutral-500">주소:</span> 충청북도 충주시 성남동 365</li>
              <li>📞 <span className="text-neutral-500">연락처:</span> 010-6400-0924</li>
              <li>📧 <span className="text-neutral-500">이메일:</span> insight9edu@naver.com</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-neutral-900/60 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-[10px]">
          <span>© 2026 KPCIA 한국프레스티지기업강사협회. All Rights Reserved.</span>
          <div className="flex gap-4">
            <span className="hover:text-neutral-300 cursor-pointer">이용약관</span>
            <span className="hover:text-neutral-300 cursor-pointer">개인정보처리방침</span>
            <span className="hover:text-neutral-300 cursor-pointer">지적재산권 규정</span>
          </div>
        </div>
      </footer>

      {/* 🔐 AUTH LOGIN & REGISTER MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative my-auto font-sans">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
              <span className="font-bold text-xs text-[#D4AF37] tracking-widest font-display uppercase">KPCIA MEMBER PORTAL</span>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Selector */}
            <div className="grid grid-cols-2 border-b border-neutral-800 text-xs">
              <button
                onClick={() => setAuthMode('login')}
                className={`py-3 font-bold text-center transition-colors cursor-pointer ${
                  authMode === 'login' 
                    ? 'border-b-2 border-[#D4AF37] text-white bg-neutral-950/30' 
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                기존 강사 로그인
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`py-3 font-bold text-center transition-colors cursor-pointer ${
                  authMode === 'register' 
                    ? 'border-b-2 border-[#D4AF37] text-white bg-neutral-950/30' 
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                신규 협회 강사 등록
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 text-xs">
              
              {/* Mode A: Login */}
              {authMode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 text-[10px] text-neutral-400 leading-normal">
                    💡 <strong>테스트 체험 팁:</strong> 기본으로 탑재된 공식 자문 계정인 ID <strong>insight9lab</strong> / 비밀번호 <strong>400828</strong> 을 기입하시면 즉시 협회 포탈의 모든 권한을 체험하실 수 있습니다!
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold block">로그인 아이디 (Login ID)</label>
                    <input
                      type="text"
                      placeholder="아이디를 입력해 주세요"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold block">비밀번호 (Password)</label>
                    <input
                      type="password"
                      placeholder="비밀번호를 입력해 주세요"
                      value={loginPw}
                      onChange={(e) => setLoginPw(e.target.value)}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#D4AF37] hover:brightness-110 text-neutral-950 font-black text-center transition-all cursor-pointer"
                  >
                    로그인 완료
                  </button>
                </form>
              )}

              {/* Mode B: Register */}
              {authMode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  {/* Company / Institution / Workshop Name */}
                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold block">기업 / 기관 / 공방 이름 *</label>
                    <input
                      type="text"
                      placeholder="예) 도깨비 가죽공방, 인재개발원 등"
                      value={regOrgName}
                      onChange={(e) => setRegOrgName(e.target.value)}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-[11px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">강사 성함 *</label>
                      <input
                        type="text"
                        placeholder="김출강"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">연락 연락처 *</label>
                      <input
                        type="tel"
                        placeholder="010-0000-0000"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold block">공식 메일 주소 *</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="example@kpcia.or.kr"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        className="px-3 py-2 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold cursor-pointer whitespace-nowrap transition-all"
                      >
                        {isVerified ? "인증완료" : "인증코드 발송"}
                      </button>
                    </div>
                  </div>

                  {/* Verification Code Box (Visible when sent) */}
                  {sentVerificationCode && (
                    <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-neutral-400">🚨 본인 확인 보안 인증</span>
                        {isVerified ? (
                          <span className="text-[10px] text-emerald-400 font-black">✅ 완벽하게 인증됨</span>
                        ) : (
                          <span className="text-[9px] text-amber-500 font-semibold animate-pulse">코드를 전송했습니다 (인증 메일을 확인하세요)</span>
                        )}
                      </div>
                      {!isVerified && (
                        <div className="space-y-2 w-full">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="4자리 인증코드 입력"
                              value={regVerificationCode}
                              onChange={(e) => setRegVerificationCode(e.target.value)}
                              className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
                            />
                            <button
                              type="button"
                              onClick={handleConfirmVerificationCode}
                              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer shrink-0"
                            >
                              인증확인
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">희망 아이디 *</label>
                      <input
                        type="text"
                        placeholder="my_id"
                        value={regLoginId}
                        onChange={(e) => setRegLoginId(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">희망 비밀번호 *</label>
                      <input
                        type="password"
                        placeholder="••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">자격 등급 부여 *</label>
                      <div className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-[#D4AF37] font-bold text-[11px] select-none">
                        일반 회원 (member)
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">전문 키워드 (쉼표 구분)</label>
                      <input
                        type="text"
                        placeholder="AI 실무, 피드백 리더십"
                        value={regSpecialties}
                        onChange={(e) => setRegSpecialties(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-[11px]"
                      />
                    </div>
                  </div>

                  {/* SNS or Blog Link Field */}
                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold block">SNS 또는 블로그 링크</label>
                    <input
                      type="url"
                      placeholder="https://blog.naver.com/my-profile"
                      value={regSnsLink}
                      onChange={(e) => setRegSnsLink(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-[11px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold block">간략한 한줄 프로필 소개 (Bio)</label>
                    <textarea
                      placeholder="강사님의 강의 철학이나 주요 대표 교과목을 요약해 주세요."
                      value={regBio}
                      onChange={(e) => setRegBio(e.target.value)}
                      rows={2}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-[11px]"
                    />
                  </div>

                  {/* Terms & Conditions Acceptance Checkbox */}
                  <div className="flex items-start gap-2.5 bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-[10px] text-neutral-400 mt-2">
                    <input
                      type="checkbox"
                      id="regTermsAccepted"
                      checked={regTermsAccepted}
                      onChange={(e) => setRegTermsAccepted(e.target.checked)}
                      className="mt-0.5 cursor-pointer accent-[#D4AF37] w-3.5 h-3.5"
                    />
                    <label htmlFor="regTermsAccepted" className="cursor-pointer leading-normal select-none">
                      KPCIA 한국프레스티지기업강사협회 정회원 가입 약관 및 개인정보 수집·이용 동의 (필수)
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-[#D4AF37] text-neutral-950 font-black text-center transition-all cursor-pointer text-xs mt-2"
                  >
                    🎉 협회 강사 정식 등록신청 완료
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 👑 ADMIN ONLY: INSTRUCTOR PROFILE EDIT MODAL */}
      {editingInstructor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative my-auto font-sans">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
              <span className="font-bold text-xs text-[#D4AF37] tracking-widest font-display uppercase">강사 정보 관리 및 편집기</span>
              <button 
                onClick={() => setEditingInstructor(null)}
                className="text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveInstructorEdit} className="p-6 space-y-4 text-xs text-left">
              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold block">강사 성함 *</label>
                <input
                  type="text"
                  value={editInstName}
                  onChange={(e) => setEditInstName(e.target.value)}
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold block">자격 등급 *</label>
                  <select
                    value={editInstTier}
                    onChange={(e) => setEditInstTier(e.target.value as InstructorTier)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-[11px] cursor-pointer"
                  >
                    <option value="Prestige Member">Prestige Member</option>
                    <option value="Prestige Associate">Prestige Associate</option>
                    <option value="Prestige Professional">Prestige Professional</option>
                    <option value="Prestige Master">Prestige Master</option>
                    <option value="Prestige Elite">Prestige Elite</option>
                    <option value="Prestige Legend">Prestige Legend</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold block">마일리지 (M)</label>
                  <input
                    type="number"
                    value={editInstMileage}
                    onChange={(e) => setEditInstMileage(Number(e.target.value))}
                    min={0}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-[11px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold block">직함 및 전문 타이틀</label>
                <input
                  type="text"
                  value={editInstTitle}
                  onChange={(e) => setEditInstTitle(e.target.value)}
                  placeholder="예) 차세대 AI 실무 생산성 전문 강사"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold block">대표 키워드 (쉼표 구분)</label>
                <input
                  type="text"
                  value={editInstSpecialties}
                  onChange={(e) => setEditInstSpecialties(e.target.value)}
                  placeholder="예) AI 툴, 피드백 코칭, 중간 관리자"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold block">한줄 프로필 소개 (Bio)</label>
                <textarea
                  value={editInstBio}
                  onChange={(e) => setEditInstBio(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-[11px]"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingInstructor(null)}
                  className="w-1/3 py-2.5 rounded-xl border border-neutral-800 text-neutral-400 font-bold hover:bg-neutral-800 text-center transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-[#D4AF37] text-neutral-950 font-black text-center transition-all cursor-pointer"
                >
                  ✨ 수정 사항 영구 저장
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 🪪 INSTRUCTOR DETAIL MODAL (Digital Business Card view) */}
      {selectedInstructorCard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative my-auto font-sans">
            
            {/* Header */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#D4AF37] tracking-widest font-display">KPCIA PRESTIGE CARD</span>
                <span className="text-[10px] text-neutral-500">지적재산 공식 인증 프로필</span>
              </div>
              <button 
                onClick={() => setSelectedInstructorCard(null)}
                className="text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Business Card Luxury Theme Section */}
            <div className="p-6">
              <div className={`p-8 rounded-2xl border ${getCardThemeClass(selectedInstructorCard.profileCard.cardTheme)} relative overflow-hidden shadow-xl`}>
                
                <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none">
                  <span className="font-display font-black text-7xl tracking-tighter uppercase">KPCIA</span>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-6 relative z-10 text-left">
                  <div className="space-y-4">
                    <div>
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded ${getTierColor(selectedInstructorCard.tier)} mb-2 block w-max`}>
                        {selectedInstructorCard.tier}
                      </span>
                      <h3 className="text-xl font-black">{selectedInstructorCard.name}</h3>
                      <p className="text-xs text-neutral-400 font-medium mt-0.5">{selectedInstructorCard.profileCard.title}</p>
                    </div>

                    <p className="text-xs leading-relaxed text-neutral-300 italic">
                      &quot;{selectedInstructorCard.profileCard.bio}&quot;
                    </p>
                  </div>

                  <div className="flex flex-col justify-between items-end gap-4 text-right shrink-0">
                    <div className="h-14 w-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-black text-lg text-white">
                      {selectedInstructorCard.name.substring(0, 2)}
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="text-[10px] text-neutral-400">📧 {selectedInstructorCard.profileCard.contactEmail}</div>
                      <div className="text-[10px] text-neutral-400">📱 {selectedInstructorCard.profileCard.contactPhone}</div>
                      <div className="text-[10px] text-neutral-400">📍 활동지역: {selectedInstructorCard.profileCard.region || '서울'}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap gap-1.5 relative z-10">
                  {selectedInstructorCard.profileCard.specialties.map((spec, idx) => (
                    <span key={idx} className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                      #{spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Extra career & education detail listings */}
              <div className="mt-6 space-y-4 text-left text-xs">
                <div className="space-y-1">
                  <span className="text-neutral-400 font-bold block border-b border-neutral-800 pb-1 text-[11px]">🎓 학력 및 전문 자격 교육</span>
                  <div className="space-y-1 text-neutral-300 py-1.5 pl-1">
                    {selectedInstructorCard.profileCard.education && selectedInstructorCard.profileCard.education.map((edu, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-amber-500">•</span>
                        <span>{edu}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-neutral-400 font-bold block border-b border-neutral-800 pb-1 text-[11px]">💼 주요 대표 경력 사항</span>
                  <div className="space-y-1 text-neutral-300 py-1.5 pl-1">
                    {selectedInstructorCard.profileCard.career && selectedInstructorCard.profileCard.career.map((car, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-emerald-500">•</span>
                        <span>{car}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Direct Inquiry Action button inside card detail */}
              <button
                onClick={() => {
                  setSelectedInstructorCard(null);
                  setActiveTab('partnership');
                  setPartTitle(`[강사 지명매칭] ${selectedInstructorCard.name} 강사님 지명 출강의뢰`);
                  setPartContent(`KPCIA 소속 ${selectedInstructorCard.name} 강사님의 프로필 디지털 명함을 확인하고, 저희 사내 교육과정 강사로 전격 초청(지명매칭)하고자 일정 조율 및 출강비 산정 상세 의뢰를 요청합니다.`);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-[#D4AF37] text-neutral-950 font-black text-center text-xs transition-all cursor-pointer mt-6"
              >
                📞 {selectedInstructorCard.name} 강사 직접 지명출강 및 교육매칭 의뢰서 작성
              </button>
            </div>

          </div>
        </div>
      )}



    </div>
  );
}
