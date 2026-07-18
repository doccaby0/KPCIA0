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
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { StorageService, generateBadgeForTier, INITIAL_LECTURES } from './lib/firebase';
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
  Home,
  Leaf,
  Wind,
  Palette,
  Calendar,
  Clock,
  Download,
  MapPin,
  Users,
  Building,
  QrCode,
  ExternalLink,
  Edit,
  FileSpreadsheet
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

  // Helper: Check if a user has registered a curriculum in KPCIA Premium Self-Developed Training Process
  const hasRegisteredCurriculum = (userId: string) => {
    return programs.some(p => p.authorId === userId);
  };
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
  const [newProgRoyalty, setNewProgRoyalty] = useState<number>(5);

  // Partnership Proposal Form States
  const [partCompany, setPartCompany] = useState<string>('');
  const [partProposer, setPartProposer] = useState<string>('');
  const [partEmail, setPartEmail] = useState<string>('');
  const [partPhone, setPartPhone] = useState<string>('');
  const [partTitle, setPartTitle] = useState<string>('');
  const [partContent, setPartContent] = useState<string>('');

  // Lecture Creation Form (Admin Only - Auto Calculating)
  const [lectureRegMode, setLectureRegMode] = useState<'single' | 'bulk'>('single');
  const [newLecTitle, setNewLecTitle] = useState<string>('');
  const [newLecCompany, setNewLecCompany] = useState<string>('');
  const [newLecPartner, setNewLecPartner] = useState<string>('');
  const [newLecDesc, setNewLecDesc] = useState<string>('');
  const [newLecTier, setNewLecTier] = useState<InstructorTier>('Prestige Member');
  const [newLecDate, setNewLecDate] = useState<string>('2026-07-20');
  const [newLecStartTime, setNewLecStartTime] = useState<string>('10:00');
  const [newLecEndTime, setNewLecEndTime] = useState<string>('12:00');
  const [newLecLocation, setNewLecLocation] = useState<string>('');
  const [newLecManagerName, setNewLecManagerName] = useState<string>('');
  const [newLecManagerPhone, setNewLecManagerPhone] = useState<string>('');
  const [newLecAttendees, setNewLecAttendees] = useState<number>(25);
  const [newLecHours, setNewLecHours] = useState<number>(3);
  const [newLecMaterialCost, setNewLecMaterialCost] = useState<number>(10000);
  const [newLecProgramId, setNewLecProgramId] = useState<string>('');
  const [newLecSurveyUrl, setNewLecSurveyUrl] = useState<string>('');

  // Certificate Modal States
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [selectedCertificateLecture, setSelectedCertificateLecture] = useState<LectureRequest | null>(null);
  const [certificateType, setCertificateType] = useState<'appointment' | 'matching'>('appointment');

  // Evaluation Modal States
  const [showEvaluationModal, setShowEvaluationModal] = useState<boolean>(false);
  const [evaluationLectureId, setEvaluationLectureId] = useState<string>('');
  const [evaluationRating, setEvaluationRating] = useState<number>(5);
  const [evaluationComment, setEvaluationComment] = useState<string>('');
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [showFooterTermsModal, setShowFooterTermsModal] = useState<boolean>(false);
  const [showFooterPrivacyModal, setShowFooterPrivacyModal] = useState<boolean>(false);
  const [showFooterIPModal, setShowFooterIPModal] = useState<boolean>(false);

  // Admin Lecture Ratings Map (lectureId -> rating value)
  const [adminLectureRatings, setAdminLectureRatings] = useState<Record<string, number>>({});

  // Admin Sub-tab (lectures, instructors, proposals, programs)
  const [adminSubTab, setAdminSubTab] = useState<'lectures' | 'instructors' | 'proposals' | 'programs'>('lectures');
  const [adminProgRoyalties, setAdminProgRoyalties] = useState<Record<string, number>>({});

  // Instructor Profile Editing (Admin Only)
  const [editingInstructor, setEditingInstructor] = useState<UserProfile | null>(null);
  const [editInstName, setEditInstName] = useState<string>('');
  const [editInstTier, setEditInstTier] = useState<InstructorTier>('Prestige Member');
  const [editInstMileage, setEditInstMileage] = useState<number>(0);
  const [editInstTitle, setEditInstTitle] = useState<string>('');
  const [editInstBio, setEditInstBio] = useState<string>('');
  const [editInstSpecialties, setEditInstSpecialties] = useState<string>('');

  // New Admin-Only Instructor Detail View & Inline Edit States
  const [viewingInstructorDetail, setViewingInstructorDetail] = useState<UserProfile | null>(null);
  const [isEditingDetail, setIsEditingDetail] = useState<boolean>(false);
  const [editInstOrgName, setEditInstOrgName] = useState<string>('');
  const [editInstPhone, setEditInstPhone] = useState<string>('');
  const [editInstEmail, setEditInstEmail] = useState<string>('');
  const [editInstPassword, setEditInstPassword] = useState<string>('');
  const [editInstRegion, setEditInstRegion] = useState<string>('');
  const [editInstBankAccount, setEditInstBankAccount] = useState<string>('');
  const [editInstSnsLink, setEditInstSnsLink] = useState<string>('');

  // Admin Lecture Editing states
  const [editingLecture, setEditingLecture] = useState<LectureRequest | null>(null);
  const [editLecTitle, setEditLecTitle] = useState<string>('');
  const [editLecCompany, setEditLecCompany] = useState<string>('');
  const [editLecPartner, setEditLecPartner] = useState<string>('');
  const [editLecDesc, setEditLecDesc] = useState<string>('');
  
  // Control Room filters
  const [controlRoomSearch, setControlRoomSearch] = useState<string>('');
  const [controlRoomStatus, setControlRoomStatus] = useState<string>('all');
  const [controlRoomSort, setControlRoomSort] = useState<string>('recent');
  const [editLecTier, setEditLecTier] = useState<InstructorTier>('Prestige Member');
  const [editLecDate, setEditLecDate] = useState<string>('');
  const [editLecTime, setEditLecTime] = useState<string>('');
  const [editLecDuration, setEditLecDuration] = useState<string>('');
  const [editLecLocation, setEditLecLocation] = useState<string>('');
  const [editLecAttendees, setEditLecAttendees] = useState<number>(0);
  const [editLecBudget, setEditLecBudget] = useState<number>(0);
  const [editLecMileage, setEditLecMileage] = useState<number>(0);
  const [editLecSurveyUrl, setEditLecSurveyUrl] = useState<string>('');
  const [editLecStatus, setEditLecStatus] = useState<'open' | 'assigned' | 'completed'>('open');
  const [editLecManagerName, setEditLecManagerName] = useState<string>('');
  const [editLecManagerPhone, setEditLecManagerPhone] = useState<string>('');

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

  // Automatically calculate lecture hours (newLecHours) based on newLecStartTime and newLecEndTime
  useEffect(() => {
    if (!newLecStartTime || !newLecEndTime) return;
    const [startH, startM] = newLecStartTime.split(':').map(Number);
    const [endH, endM] = newLecEndTime.split(':').map(Number);
    if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      const diffMinutes = endMinutes - startMinutes;
      if (diffMinutes > 0) {
        const calculatedHours = Math.max(1, Math.round((diffMinutes / 60) * 10) / 10);
        setNewLecHours(calculatedHours);
      }
    }
  }, [newLecStartTime, newLecEndTime]);

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
      royaltyRate: 0, // Admin/master will determine and set this upon approval
      curriculum: cleanCurr.length > 0 ? cleanCurr : ["과정 오리엔테이션", "이론 및 핵심 역량 실습", "종합 워크숍 및 질의응답"],
      targetAudience: cleanAudience || "전사 임직원 및 기업 실무 교육 대상자",
      createdAt: new Date().toISOString(),
      isApproved: false // Requires admin master room approval!
    };

    const updatedProgs = [...programs, newProg];
    setPrograms(updatedProgs);
    await StorageService.saveProgram(newProg);

    triggerToast("🚀 설계하신 교육 과정 제안서가 성공적으로 임시 등록되었습니다! 마스터실 승인 및 마일리지 로열티 비율 결정 후 정식 카탈로그에 최종 반영됩니다.", "success");
    
    // Clear Form & close modal or navigate
    setNewProgTitle('');
    setNewProgDesc('');
    setNewProgAudience('');
    setNewProgCurriculum('');
    setNewProgRoyalty(5);
  };

  // Feature: Approve proposed Educational Program with decided royaltyRate (Admin Only)
  const handleApproveProgram = async (programId: string, royaltyRate: number) => {
    const prog = programs.find(p => p.id === programId);
    if (!prog) return;

    const updatedProg: EducationalProgram = {
      ...prog,
      royaltyRate: Number(royaltyRate) || 0,
      isApproved: true
    };

    const updatedProgs = programs.map(p => p.id === programId ? updatedProg : p);
    setPrograms(updatedProgs);
    await StorageService.saveProgram(updatedProg);

    triggerToast(`💎 "${prog.title}" 과정이 정식 승인되어 카탈로그에 등록되었습니다! (지정 로열티 비율: 총 예산의 ${royaltyRate}%)`, "success");
  };

  // Feature: Reject or Delete proposed Educational Program (Admin Only)
  const handleRejectProgram = async (programId: string) => {
    const prog = programs.find(p => p.id === programId);
    if (!prog) return;

    const updatedProgs = programs.filter(p => p.id !== programId);
    setPrograms(updatedProgs);
    await StorageService.deleteProgram(programId);

    triggerToast(`❌ "${prog.title}" 과정이 반려 및 목록에서 제외되었습니다.`, "info");
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
    const cleanPartner = sanitizeString(newLecPartner);
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
    const computedRoyalty = assocProgram ? Math.round((computedBudget * (assocProgram.royaltyRate || 0)) / 100) : 0;

    const newLec: LectureRequest = {
      id: `lect_${Date.now()}`,
      title: cleanTitle,
      companyName: cleanCompany,
      partnerCompany: cleanPartner || undefined,
      description: cleanDesc,
      targetTier: newLecTier,
      budget: computedBudget,
      mileageRoyalty: computedRoyalty,
      programId: newLecProgramId || undefined,
      programTitle: assocProgram ? assocProgram.title : undefined,
      date: newLecDate,
      time: `${newLecStartTime}~${newLecEndTime}`,
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
      materialCost: newLecMaterialCost,
      surveyUrl: newLecSurveyUrl || undefined
    };

    const updatedLectures = [newLec, ...lectures];
    setLectures(updatedLectures);
    await StorageService.saveLecture(newLec);

    triggerToast("📢 신규 기업 출강 요청 공고가 메인 보드에 즉시 게시되었습니다!", "success");

    // Clear Form
    setNewLecTitle('');
    setNewLecCompany('');
    setNewLecPartner('');
    setNewLecDesc('');
    setNewLecLocation('');
    setNewLecManagerName('');
    setNewLecManagerPhone('');
    setNewLecProgramId('');
    setNewLecSurveyUrl('');
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const headers = [
      "출강 교육 명칭 *", "의뢰 기업명 *", "협력사명 (선택)", "상세 교육내용 *", 
      "지원자격 등급 *", "출강일자 (YYYY-MM-DD) *", "시작시간 (HH:MM) *", "종료시간 (HH:MM) *", 
      "교육장소 *", "예정인원 (숫자) *", "강의시간수 (숫자) *", "인당재료비 (숫자) *"
    ];
    
    const sampleRows = [
      [
        "생성형 AI 기반 마케터 초격차 실무 역량 특강", 
        "현대카드 브랜드실", 
        "인사이트나인랩", 
        "마케터 실무 업무에서의 LLM 적용 및 프롬프트 고도화 설계 실무 실습 특강 위임 교육입니다.", 
        "Prestige Master", 
        "2026-08-10", 
        "13:00", 
        "17:00", 
        "서울특별시 영등포구 현대카드 본사 교육장", 
        "25", 
        "4", 
        "15000"
      ],
      [
        "MZ 세대 리더십 밸류체인 코칭 워크숍", 
        "SK이노베이션 HR팀", 
        "", 
        "중간 관리자들의 팀원 동기부여와 긍정적 피드백 수립 기획 강좌입니다.", 
        "Prestige Member", 
        "2026-08-15", 
        "10:00", 
        "12:00", 
        "경기도 이천시 SKMS 연구소", 
        "18", 
        "2", 
        "5000"
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    const cols = [
      { wch: 35 }, { wch: 20 }, { wch: 18 }, { wch: 45 },
      { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
      { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
    ];
    ws['!cols'] = cols;
    XLSX.utils.book_append_sheet(wb, ws, "출강_대량등록_양식");

    XLSX.writeFile(wb, "KPCIA_출강등록_대량양식.xlsx");
    triggerToast("📥 대량 등록 엑셀 양식이 다운로드 폴더에 생성되었습니다.", "success");
  };

  const handleBulkUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) return;

        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
        if (rows.length <= 1) {
          triggerToast("등록할 강의 내역이 엑셀 파일 내에 보이지 않습니다.", "error");
          return;
        }

        const dataRows = rows.slice(1);
        const importedLectures: LectureRequest[] = [];

        for (let i = 0; i < dataRows.length; i++) {
          const r = dataRows[i];
          if (!r || r.length === 0 || !r[0]) continue;

          const title = String(r[0] || '').trim();
          const companyName = String(r[1] || '').trim();
          const partnerCompany = String(r[2] || '').trim();
          const description = String(r[3] || '').trim();
          const targetTierInput = String(r[4] || '').trim();
          const date = String(r[5] || '').trim();
          const startTime = String(r[6] || '').trim();
          const endTime = String(r[7] || '').trim();
          const location = String(r[8] || '').trim();
          const attendees = Math.max(1, Number(r[9] || 25));
          const hours = Math.max(1, Number(r[10] || 3));
          const materialCost = Math.max(0, Number(r[11] || 0));

          if (!title || !companyName || !description) {
            continue;
          }

          let finalTier: InstructorTier = 'Prestige Member';
          const validTiers: InstructorTier[] = [
            'Prestige Member', 'Prestige Associate', 'Prestige Professional', 
            'Prestige Master', 'Prestige Elite', 'Prestige Legend'
          ];
          const matchedTier = validTiers.find(t => t.toLowerCase().includes(targetTierInput.toLowerCase()));
          if (matchedTier) {
            finalTier = matchedTier;
          }

          const mainFee = hours * 100000;
          const assistantFee = attendees >= 20 ? hours * 50000 : 0;
          const materialFee = attendees * materialCost;
          const computedBudget = mainFee + assistantFee + materialFee;

          const matchedProgram = programs.find(p => title.includes(p.title) || p.title.includes(title));
          const computedRoyalty = matchedProgram ? Math.round((computedBudget * (matchedProgram.royaltyRate || 0)) / 100) : 0;

          const newLec: LectureRequest = {
            id: `lect_bulk_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}`,
            title,
            companyName,
            partnerCompany: partnerCompany || undefined,
            description,
            targetTier: finalTier,
            budget: computedBudget,
            mileageRoyalty: computedRoyalty,
            programId: matchedProgram ? matchedProgram.id : undefined,
            programTitle: matchedProgram ? matchedProgram.title : undefined,
            date: date || new Date().toISOString().substring(0, 10),
            time: startTime && endTime ? `${startTime}~${endTime}` : "13:00~16:00",
            duration: `${hours}시간`,
            location: location || "기업 연수원 혹은 사내 교육장",
            attendees,
            managerName: "인재개발원 담당자",
            managerPhone: "010-0000-0000",
            status: 'open',
            applicants: [],
            createdAt: new Date().toISOString(),
            mainHours: hours,
            assistantHours: attendees >= 20 ? hours : 0,
            materialCost
          };

          importedLectures.push(newLec);
        }

        if (importedLectures.length === 0) {
          triggerToast("유효한 대량 강의 정보가 엑셀 시트에 존재하지 않습니다.", "error");
          return;
        }

        for (const lec of importedLectures) {
          await StorageService.saveLecture(lec);
        }

        setLectures(prev => [...importedLectures, ...prev]);
        triggerToast(`📊 총 ${importedLectures.length}건의 대량 강의 출강 공고가 일괄 등록 처리되었습니다!`, "success");
        
        if (e.target) {
          e.target.value = '';
        }
      } catch (err) {
        console.error("Bulk upload excel error:", err);
        triggerToast("엑셀 파일을 파싱하는 데 실패했습니다. 양식을 확인해 주세요.", "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  const getNextMonthLastDay = (dateStr: string): string => {
    if (!dateStr) return "-";
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return "-";
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const date = new Date(year, month + 1, 0);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    } catch (e) {
      return "-";
    }
  };

  const handleDownloadSettledLecturesExcel = () => {
    const list = lectures.filter(l => l.status === 'completed' && l.settlementStatus === 'completed');
    if (list.length === 0) {
      triggerToast("정산 완료된 강의 내역이 없습니다.", "error");
      return;
    }

    const wb = XLSX.utils.book_new();
    const headers = [
      "순번", "출강일자", "의뢰 기업명", "협력사명", "출강 교육 명칭", 
      "강사 등급", "주강사", "보조강사", "강의 시간수", "예정 인원", 
      "인당 재료비(원)", "마일리지 로열티(M)", "정산 총 예산(원)", "만족도 평점", "예정 정산 기한 (익월 말일)", "정산 상태"
    ];

    const rows = list.map((l, index) => [
      index + 1,
      l.date,
      l.companyName || "익명 기업",
      l.partnerCompany || "없음",
      l.title,
      l.targetTier,
      l.assignedName || "없음",
      l.assistantName || "없음",
      l.mainHours || 0,
      l.attendees || 0,
      l.materialCost || 0,
      l.mileageRoyalty || 0,
      l.budget,
      l.lectureRating || 5.0,
      getNextMonthLastDay(l.date),
      "정산 완료"
    ]);

    const totalHours = list.reduce((sum, l) => sum + (l.mainHours || 0), 0);
    const totalAttendees = list.reduce((sum, l) => sum + (l.attendees || 0), 0);
    const totalRoyalty = list.reduce((sum, l) => sum + (l.mileageRoyalty || 0), 0);
    const totalBudget = list.reduce((sum, l) => sum + l.budget, 0);
    const averageRating = list.length > 0 
      ? Number((list.reduce((sum, l) => sum + (l.lectureRating || 5.0), 0) / list.length).toFixed(2))
      : 5.0;

    const sumRow = [
      "합계 (SUM)", "", "", "", "", 
      "", "", "", totalHours, totalAttendees, 
      "", totalRoyalty, totalBudget, averageRating, "", ""
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows, sumRow]);
    const cols = [
      { wch: 8 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 30 },
      { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
      { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 25 }, { wch: 15 }
    ];
    ws['!cols'] = cols;
    XLSX.utils.book_append_sheet(wb, ws, "정산_완료_강의_내역");

    const fileName = `KPCIA_정산완료_강의내역_${new Date().toISOString().substring(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    triggerToast("📊 정산 완료된 강의 내역 엑셀 다운로드 완료!", "success");
  };

  const handleDownloadPendingSettlementLecturesExcel = () => {
    const list = lectures.filter(l => l.status === 'completed' && (l.settlementStatus === 'pending' || !l.settlementStatus));
    if (list.length === 0) {
      triggerToast("강의 완료 후 정산 대기 중인 내역이 없습니다.", "error");
      return;
    }

    const wb = XLSX.utils.book_new();
    const headers = [
      "순번", "출강일자", "의뢰 기업명", "협력사명", "출강 교육 명칭", 
      "강사 등급", "주강사", "보조강사", "강의 시간수", "예정 인원", 
      "인당 재료비(원)", "마일리지 로열티(M)", "정산 총 예산(원)", "만족도 평점", "예정 정산 기한 (익월 말일)", "정산 상태"
    ];

    const rows = list.map((l, index) => [
      index + 1,
      l.date,
      l.companyName || "익명 기업",
      l.partnerCompany || "없음",
      l.title,
      l.targetTier,
      l.assignedName || "없음",
      l.assistantName || "없음",
      l.mainHours || 0,
      l.attendees || 0,
      l.materialCost || 0,
      l.mileageRoyalty || 0,
      l.budget,
      l.lectureRating || 5.0,
      getNextMonthLastDay(l.date),
      "정산 대기"
    ]);

    const totalHours = list.reduce((sum, l) => sum + (l.mainHours || 0), 0);
    const totalAttendees = list.reduce((sum, l) => sum + (l.attendees || 0), 0);
    const totalRoyalty = list.reduce((sum, l) => sum + (l.mileageRoyalty || 0), 0);
    const totalBudget = list.reduce((sum, l) => sum + l.budget, 0);
    const averageRating = list.length > 0 
      ? Number((list.reduce((sum, l) => sum + (l.lectureRating || 5.0), 0) / list.length).toFixed(2))
      : 5.0;

    const sumRow = [
      "합계 (SUM)", "", "", "", "", 
      "", "", "", totalHours, totalAttendees, 
      "", totalRoyalty, totalBudget, averageRating, "", ""
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows, sumRow]);
    const cols = [
      { wch: 8 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 30 },
      { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
      { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 25 }, { wch: 15 }
    ];
    ws['!cols'] = cols;
    XLSX.utils.book_append_sheet(wb, ws, "정산_대기_강의_내역");

    const fileName = `KPCIA_정산대기_강의내역_${new Date().toISOString().substring(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    triggerToast("📊 강의 완료 후 정산 이전 내역 엑셀 다운로드 완료!", "success");
  };

  const handleDownloadCompletedLecturesExcel = () => {
    const completedList = lectures.filter(l => l.status === 'completed');
    if (completedList.length === 0) {
      triggerToast("출강이 완료된 내역이 없습니다.", "error");
      return;
    }

    const wb = XLSX.utils.book_new();
    const headers = [
      "순번", "출강일자", "의뢰 기업명", "협력사명", "출강 교육 명칭", 
      "강사 등급", "주강사", "보조강사", "강의 시간수", "예정 인원", 
      "인당 재료비(원)", "마일리지 로열티(M)", "정산 총 예산(원)", "만족도 평점", "예정 정산일(익월 말일)", "정산 상태"
    ];

    const rows = completedList.map((l, index) => [
      index + 1,
      l.date,
      l.companyName || "익명 기업",
      l.partnerCompany || "없음",
      l.title,
      l.targetTier,
      l.assignedName || "없음",
      l.assistantName || "없음",
      l.mainHours || 0,
      l.attendees || 0,
      l.materialCost || 0,
      l.mileageRoyalty || 0,
      l.budget,
      l.lectureRating || 5.0,
      getNextMonthLastDay(l.date),
      l.settlementStatus === 'completed' ? "정산 완료" : "정산 대기"
    ]);

    const totalHours = completedList.reduce((sum, l) => sum + (l.mainHours || 0), 0);
    const totalAttendees = completedList.reduce((sum, l) => sum + (l.attendees || 0), 0);
    const totalRoyalty = completedList.reduce((sum, l) => sum + (l.mileageRoyalty || 0), 0);
    const totalBudget = completedList.reduce((sum, l) => sum + l.budget, 0);
    const averageRating = completedList.length > 0 
      ? Number((completedList.reduce((sum, l) => sum + (l.lectureRating || 5.0), 0) / completedList.length).toFixed(2))
      : 5.0;

    const sumRow = [
      "합계 (SUM)", "", "", "", "", 
      "", "", "", totalHours, totalAttendees, 
      "", totalRoyalty, totalBudget, averageRating, "", ""
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows, sumRow]);
    const cols = [
      { wch: 8 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 30 },
      { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
      { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 25 }, { wch: 15 }
    ];
    ws['!cols'] = cols;
    XLSX.utils.book_append_sheet(wb, ws, "출강_완료_정산_마스터대장");

    const fileName = `KPCIA_출강완료_정산마스터대장_${new Date().toISOString().substring(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    triggerToast("📊 출강 완료 정산 마스터 대장 엑셀 파일 다운로드 완료!", "success");
  };

  const startEditLecture = (lecture: LectureRequest) => {
    setEditingLecture(lecture);
    setEditLecTitle(lecture.title);
    setEditLecCompany(lecture.companyName || '');
    setEditLecPartner(lecture.partnerCompany || '');
    setEditLecDesc(lecture.description || '');
    setEditLecTier(lecture.targetTier);
    setEditLecDate(lecture.date);
    setEditLecTime(lecture.time || '');
    setEditLecDuration(lecture.duration);
    setEditLecLocation(lecture.location);
    setEditLecAttendees(lecture.attendees || 0);
    setEditLecBudget(lecture.budget);
    setEditLecMileage(lecture.mileageRoyalty || 0);
    setEditLecSurveyUrl(lecture.surveyUrl || '');
    setEditLecStatus(lecture.status);
    setEditLecManagerName(lecture.managerName || '');
    setEditLecManagerPhone(lecture.managerPhone || '');
  };

  const handleSaveEditedLecture = async () => {
    if (!editingLecture) return;
    if (!editLecTitle.trim()) {
      triggerToast("강의명을 입력해 주세요.", "error");
      return;
    }
    const updated: LectureRequest = {
      ...editingLecture,
      title: editLecTitle,
      companyName: editLecCompany,
      partnerCompany: editLecPartner,
      description: editLecDesc,
      targetTier: editLecTier,
      date: editLecDate,
      time: editLecTime,
      duration: editLecDuration,
      location: editLecLocation,
      attendees: editLecAttendees,
      budget: editLecBudget,
      mileageRoyalty: editLecMileage,
      surveyUrl: editLecSurveyUrl,
      status: editLecStatus,
      managerName: editLecManagerName,
      managerPhone: editLecManagerPhone
    };

    try {
      await StorageService.saveLecture(updated);
      setLectures(prev => prev.map(l => l.id === updated.id ? updated : l));
      triggerToast("출강 공고 및 정산 상세 내용이 성공적으로 수정 보완되었습니다.", "success");
      setEditingLecture(null);
    } catch (error) {
      console.error("Error editing lecture:", error);
      triggerToast("출강 내용 수정 중 오류가 발생했습니다.", "error");
    }
  };

  const handleDeleteLecture = async (lectureId: string) => {
    const confirmDel = window.confirm("정말로 이 출강 수탁 공고를 영구 삭제하시겠습니까? 삭제된 수탁 건은 복구할 수 없습니다.");
    if (!confirmDel) return;

    try {
      await StorageService.deleteLecture(lectureId);
      setLectures(prev => prev.filter(l => l.id !== lectureId));
      triggerToast("출강 수탁 공고가 안전하게 영구 삭제되었습니다.", "success");
    } catch (error) {
      console.error("Error deleting lecture:", error);
      triggerToast("출강 수탁 공고 삭제 중 오류가 발생했습니다.", "error");
    }
  };

  const handleDownloadQR = async (lecture: LectureRequest) => {
    const isMainLecturer = currentUser && lecture.assignedTo === currentUser.uid;
    const isAssistantLecturer = currentUser && lecture.assistantId === currentUser.uid;
    if (!currentUser?.isAdmin && !isMainLecturer && !isAssistantLecturer) {
      triggerToast("🔒 KPCIA 마스터실의 승인을 거쳐 최종 배정 완료된 강사님만 만족도 QR 다운로드가 가능합니다.", "error");
      return;
    }

    const surveyUrl = lecture.surveyUrl || "https://docs.google.com/forms/d/e/1FAIpQLSdWC4rgAa5hQi2G1wcMnCWlwYCA8rfRkHurHG3e7JeiR24V1A/viewform?usp=sharing&ouid=108376898401719889630";
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(surveyUrl)}`;
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KPCIA_만족도조사_QR_${lecture.companyName || '공고'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerToast("📷 만족도 조사 QR코드가 이미지 파일로 다운로드되었습니다.", "success");
    } catch (error) {
      console.error("QR download error", error);
      window.open(qrUrl, '_blank');
    }
  };

  const handleDownloadExcel = async (lecture?: LectureRequest) => {
    // If a specific lecture is provided, check if the currentUser is assigned or is admin
    if (lecture) {
      const isMainLecturer = currentUser && lecture.assignedTo === currentUser.uid;
      const isAssistantLecturer = currentUser && lecture.assistantId === currentUser.uid;
      if (!currentUser?.isAdmin && !isMainLecturer && !isAssistantLecturer) {
        triggerToast("🔒 KPCIA 마스터실의 승인을 거쳐 최종 배정 완료된 강사님만 상세 엑셀 다운로드가 가능합니다.", "error");
        return;
      }
    }

    if (lecture) {
      try {
        const todayStr = new Date().toISOString().substring(0, 10);
        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet('출강파견안내서');
        
        // Page setup for single page fit
        ws.pageSetup = {
          orientation: 'portrait',
          paperSize: 9, // A4
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 1,
          margins: {
            left: 0.4, right: 0.4,
            top: 0.4, bottom: 0.4,
            header: 0.2, footer: 0.2
          }
        };

        ws.views = [{ showGridLines: true }];

        // Set Column Widths (total ~160)
        ws.columns = [
          { width: 16 }, // A
          { width: 16 }, // B
          { width: 22 }, // C
          { width: 14 }, // D
          { width: 16 }, // E
          { width: 14 }, // F
          { width: 22 }, // G
          { width: 42 }  // H
        ];

        // Helper function to set values, merges, and styles
        const mergeAndStyle = (
          range: string, 
          value: any, 
          style: {
            bold?: boolean;
            size?: number;
            color?: string; // ARGB
            fill?: string;  // ARGB
            align?: 'left' | 'center' | 'right';
            border?: 'thin' | 'double' | 'none';
            wrapText?: boolean;
            numFormat?: string;
          } = {}
        ) => {
          ws.mergeCells(range);
          const [start, end] = range.split(':');
          
          const startCol = start.charCodeAt(0) - 65 + 1;
          const startRow = parseInt(start.substring(1));
          const endCol = end.charCodeAt(0) - 65 + 1;
          const endRow = parseInt(end.substring(1));

          for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
              const cell = ws.getCell(r, c);
              cell.font = {
                name: 'Malgun Gothic',
                size: style.size || 10,
                bold: style.bold || false,
                color: style.color ? { argb: style.color } : { argb: 'FF1E293B' }
              };
              if (style.fill) {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: style.fill }
                };
              } else {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFFFF' }
                };
              }
              cell.alignment = {
                vertical: 'middle',
                horizontal: style.align || 'left',
                wrapText: style.wrapText !== undefined ? style.wrapText : true
              };
              if (style.numFormat) {
                cell.numFmt = style.numFormat;
              }
              if (style.border !== 'none') {
                const borderStyle = style.border === 'double' ? 'double' : 'thin';
                cell.border = {
                  top: { style: borderStyle, color: { argb: 'FFCBD5E1' } },
                  left: { style: borderStyle, color: { argb: 'FFCBD5E1' } },
                  bottom: { style: borderStyle, color: { argb: 'FFCBD5E1' } },
                  right: { style: borderStyle, color: { argb: 'FFCBD5E1' } }
                };
              } else {
                cell.border = {
                  top: null, left: null, bottom: null, right: null
                };
              }
            }
          }

          const startCell = ws.getCell(start);
          startCell.value = value;
        };

        const cell = (
          ref: string, 
          value: any, 
          style: {
            bold?: boolean;
            size?: number;
            color?: string;
            fill?: string;
            align?: 'left' | 'center' | 'right';
            border?: 'thin' | 'double' | 'none';
            wrapText?: boolean;
            numFormat?: string;
          } = {}
        ) => {
          const range = ref.includes(':') ? ref : `${ref}:${ref}`;
          mergeAndStyle(range, value, { border: 'thin', ...style });
        };

        // Set Row heights
        const rowHeights: Record<number, number> = {
          1: 38,  // Title Banner
          2: 24,  // Sub Banner
          3: 20,  // Code & Date
          4: 12,  // spacer
          5: 25,  // Sec 1 title
          6: 22,  // 주제
          7: 22,  // 기관/협력사
          8: 22,  // 일정/시간
          9: 22,  // 장소
          10: 22, // 담당자
          11: 22, // 배정 강사
          12: 12, // spacer
          13: 25, // Sec 2 title
          14: 22, // Settlement Table Header
          15: 22, // 주강사료
          16: 22, // 보조강사료
          17: 22, // 재료비
          18: 24, // 총 합계
          19: 12, // spacer
          20: 25, // Sec 3 title
          21: 22, // Timeline Header
          22: 40, // 사전준비
          23: 40, // 진행
          24: 40, // 정리
          25: 40, // 행정보고
          26: 12, // spacer
          27: 25, // Sec 4 title
          28: 22, // 지출증빙
          29: 22, // 현금영수증
          30: 22, // 추가문의
          31: 12, // spacer
          32: 25, // Sec 5 title
          33: 22, // 강령 1
          34: 22, // 강령 2
          35: 22, // 강령 3
          36: 22, // 강령 4
          37: 12, // spacer
          38: 34, // 서약서 문구
          39: 28  // 발행처 서명
        };

        Object.entries(rowHeights).forEach(([r, h]) => {
          ws.getRow(parseInt(r)).height = h;
        });

        // Write content row by row with beautiful colors
        // [Banner Area]
        cell('A1:H1', '📋 [KPCIA] 공식 출강 강의 파견 안내서', { size: 14, bold: true, color: 'FFFFFFFF', fill: 'FF0F172A', align: 'center' });
        cell('A2:H2', '인사이트9교육연구소 × KPCIA 한국 프레스티지 기업 강사 협회', { size: 10, bold: true, color: 'FFF59E0B', fill: 'FF1E293B', align: 'center' });
        cell('A3:H3', `발행일자: ${todayStr}   |   강의 배정상태: 최종 배정 승인 완료 (Assigned)   |   안내서 고유번호: KPCIA-L-${lecture.id.substring(0, 6).toUpperCase()}`, { size: 9, color: 'FF475569', fill: 'FFF8FAFC', align: 'center' });
        cell('A4:H4', '', { border: 'none' });

        // [Section 1: 기본 정보]
        cell('A5:H5', ' ▶ 1. 출강 기본 정보 (Basic Lecture Information)', { size: 11, bold: true, color: 'FFFFFFFF', fill: 'FF1E3A8A' }); // Royal Blue header
        cell('A6:B6', '[교육 주제]', { bold: true, fill: 'FFF1F5F9', align: 'center' });
        cell('C6:H6', lecture.title, { bold: true, align: 'left' });

        cell('A7:B7', '[매칭 기업/기관]', { bold: true, fill: 'FFF1F5F9', align: 'center' });
        cell('C7:H7', lecture.companyName || "익명 기업 / 기관", { align: 'left' });

        cell('A8:B8', '[출강 일자]', { bold: true, fill: 'FFF1F5F9', align: 'center' });
        cell('C8:D8', lecture.date, { align: 'left' });
        cell('E8:F8', '[교육 시간]', { bold: true, fill: 'FFF1F5F9', align: 'center' });
        cell('G8:H8', `${lecture.time} (총 ${lecture.duration || '3시간'})`, { align: 'left' });

        cell('A9:B9', '[출강 장소]', { bold: true, fill: 'FFF1F5F9', align: 'center' });
        cell('C9:H9', lecture.location || "지정 교육장", { align: 'left' });

        cell('A10:B10', '[현장 담당자]', { bold: true, fill: 'FFF1F5F9', align: 'center' });
        cell('C10:D10', lecture.managerName || "인재개발원 담당자", { align: 'left' });
        cell('E10:F10', '[담당 연락처]', { bold: true, fill: 'FFF1F5F9', align: 'center' });
        cell('G10:H10', lecture.managerPhone || "010-0000-0000", { align: 'left' });

        cell('A11:B11', '[배정 주강사]', { bold: true, fill: 'FFE2E8F0', align: 'center' });
        cell('C11:D11', `${lecture.assignedName || '미배정'} 강사`, { bold: true, color: 'FF1D4ED8', align: 'left' });
        cell('E11:F11', '[배정 보조강사]', { bold: true, fill: 'FFE2E8F0', align: 'center' });
        cell('G11:H11', lecture.assistantName ? `${lecture.assistantName} 강사` : '배정 없음', { bold: true, color: 'FF0F766E', align: 'left' });

        cell('A12:H12', '', { border: 'none' });

        // [Section 2: 정산 정보]
        cell('A13:H13', ' ▶ 2. 강사료 및 재료비 정산 세부 안내 (Settlement & Fee)', { size: 11, bold: true, color: 'FFFFFFFF', fill: 'FF1E3A8A' });
        
        cell('A14:B14', '구분 항목', { bold: true, fill: 'FFE2E8F0', align: 'center' });
        cell('C14:D14', '지급 금액', { bold: true, fill: 'FFE2E8F0', align: 'center' });
        cell('E14:F14', '계산 기준', { bold: true, fill: 'FFE2E8F0', align: 'center' });
        cell('G14:H14', '세부 정산 및 지급 비고', { bold: true, fill: 'FFE2E8F0', align: 'center' });

        const mainFee = (lecture.mainHours || 3) * 100000;
        cell('A15:B15', '주강사료', { fill: 'FFF8FAFC', align: 'center' });
        cell('C15:D15', `${mainFee.toLocaleString()}원`, { bold: true, align: 'right' });
        cell('E15:F15', `${lecture.mainHours || 3}시간`, { align: 'center' });
        cell('G15:H15', '시간당 100,000원 기준 (주강사 수당 포함)', { align: 'left' });

        const assistantFee = (lecture.assistantHours || 0) * 50000;
        cell('A16:B16', '보조강사료', { fill: 'FFF8FAFC', align: 'center' });
        cell('C16:D16', `${assistantFee.toLocaleString()}원`, { align: 'right' });
        cell('E16:F16', lecture.assistantHours ? `${lecture.assistantHours}시간` : '-', { align: 'center' });
        cell('G16:H16', lecture.assistantHours ? '시간당 50,000원 기준 (KPCIA 보조 수당)' : '보조강사 매칭 없음', { align: 'left' });

        const materialFee = (lecture.attendees || 0) * (lecture.materialCost || 0);
        cell('A17:B17', '교구재 재료비', { fill: 'FFF8FAFC', align: 'center' });
        cell('C17:D17', `${materialFee.toLocaleString()}원`, { align: 'right' });
        cell('E17:F17', `${(lecture.materialCost || 0).toLocaleString()}원 × ${lecture.attendees || 0}명`, { align: 'center' });
        cell('G17:H17', '정원 패키지 수량 기준 제공 (현장 잔여재료 소진 필수)', { align: 'left' });

        cell('A18:B18', '총 정산 합계', { bold: true, fill: 'FEF3C7', align: 'center' }); // Light amber background
        cell('C18:D18', `${lecture.budget.toLocaleString()}원`, { bold: true, color: 'FFB45309', fill: 'FEF3C7', align: 'right' });
        cell('E18:F18', '총 예산 금액', { bold: true, fill: 'FEF3C7', align: 'center' });
        cell('G18:H18', `정산기준: 익월 말일 (${getNextMonthLastDay(lecture.date)} 예정)`, { size: 8.5, bold: true, color: 'FFB45309', fill: 'FEF3C7', align: 'center' });

        cell('A19:H19', '', { border: 'none' });

        // [Section 3: 진행 플로우]
        cell('A20:H20', ' ▶ 3. 출강 현장 표준 타임라인 & 강사 행동 요령 (Protocol)', { size: 11, bold: true, color: 'FFFFFFFF', fill: 'FF1E3A8A' });
        
        cell('A21:B21', '단계', { bold: true, fill: 'FFE2E8F0', align: 'center' });
        cell('C21:D21', '행동 타이밍', { bold: true, fill: 'FFE2E8F0', align: 'center' });
        cell('E21:G21', '주요 현장 대응 지침 및 사진 촬영 가이드', { bold: true, fill: 'FFE2E8F0', align: 'center' });
        cell('H21:H21', '현장 확인', { bold: true, fill: 'FFE2E8F0', align: 'center' });

        cell('A22:B22', '① 사전 준비', { bold: true, fill: 'FFF8FAFC', align: 'center' });
        cell('C22:D22', '강의 시작 30분 전', { align: 'center' });
        cell('E22:G22', '• 현장 도착 완료 후 강의장 환기 및 교구 재료 테이블 정렬 세팅\n• 정렬 완료 후 \'세팅 완료 전경 사진\' 1장 이상 촬영 필수', { align: 'left' });
        cell('H22:H22', '[  ] 완료', { bold: true, color: 'FF64748B', align: 'center' });

        cell('A23:B23', '② 과정 진행', { bold: true, fill: 'FFF8FAFC', align: 'center' });
        cell('C23:D23', '강의 시간 중', { align: 'center' });
        cell('E23:G23', '• 수강생 집중도 체크 및 친절하고 활기찬 공예/원예 교육 선사\n• 과정 도중 자연스러운 교육 활동 스케치 사진 2장 이상 촬영', { align: 'left' });
        cell('H23:H23', '[  ] 완료', { bold: true, color: 'FF64748B', align: 'center' });

        cell('A24:B24', '③ 정리 및 완료', { bold: true, fill: 'FFF8FAFC', align: 'center' });
        cell('C24:D24', '종료 10분 전', { align: 'center' });
        cell('E24:G24', '• 완성된 모든 교육생 작품들을 가지런히 모아 단체 결과물 컷 촬영\n• 협회 전용 만족도 조사 QR을 안내하여 즉시 응답 참여 유도', { align: 'left' });
        cell('H24:H24', '[  ] 완료', { bold: true, color: 'FF64748B', align: 'center' });

        cell('A25:B25', '④ 행정 및 보고', { bold: true, fill: 'FFF8FAFC', align: 'center' });
        cell('C25:D25', '종료 직후 즉시', { align: 'center' });
        cell('E25:G25', '• 촬영 완료된 고화질 사진 3종 세트를 대표님 카톡으로 즉시 전송\n• 뒷정리 확인 및 현장 담당자에게 퇴실 완료 안내 실시', { align: 'left' });
        cell('H25:H25', '[  ] 완료', { bold: true, color: 'FF64748B', align: 'center' });

        cell('A26:H26', '', { border: 'none' });

        // [Section 4: 비상 대응]
        cell('A27:H27', ' ▶ 4. 출강 후 행정 증빙 및 현장 비상 대응 매뉴얼 (FAQ)', { size: 11, bold: true, color: 'FFFFFFFF', fill: 'FF1E3A8A' });
        cell('A28:B28', '[지출 증빙 제출]', { bold: true, fill: 'FFF1F5F9', align: 'center' });
        cell('C28:H28', `출강 예산 지출 증빙 영수증은 사진 촬영 후 이메일(insight9edu@naver.com) 또는 카카오톡 발송 (정산기한: 익월 말일인 ${getNextMonthLastDay(lecture.date)} 일괄 정산)`, { align: 'left' });
        cell('A29:B29', '[현금영수증 발행]', { bold: true, fill: 'FFF1F5F9', align: 'center' });
        cell('C29:H29', '사업자 번호: 702-41-00899 인사이트9교육연구소 / 대표: 구교준', { align: 'left' });
        cell('A30:B30', '[추가 계약 문의]', { bold: true, fill: 'FFF1F5F9', align: 'center' });
        cell('C30:H30', '현장 담당자의 프로그램 추가/예산 문의 시 주최측에 문의 하시라고 해야 함', { align: 'left' });

        cell('A31:H31', '', { border: 'none' });

        // [Section 5: 주의 및 서약]
        cell('A32:H32', ' ▶ 5. 협회 강사 행동 강령 및 서약 사항 (Required)', { size: 11, bold: true, color: 'FFFFFFFF', fill: 'FF1E3A8A' });
        cell('A33:H33', '• [소속 공지] 담당자 자기소개 시 반드시 "인사이트9교육연구소 파트너 강사"로 소개합니다.', { size: 9.5, fill: 'FFFBFBFE', align: 'left' });
        cell('A34:H34', '• [사전 체크] 출강 2~3일 전 담당자와 전화 연결하여 강의 환경(마이크, PPT 사용 여부, 조별 구성 가능 여부, 주차 등등의 컨디션 체크', { size: 9.5, fill: 'FFFBFBFE', align: 'left' });
        cell('A35:H35', '• [임의 변경 불가] 현장에서 인원 임의 추가 요구 시, "협의된 전용 교구가 배정 수량만큼만 제작되었다"고 친절히 거절합니다.', { size: 9.5, fill: 'FFFBFBFE', align: 'left' });
        cell('A36:H36', '• [SNS 후기 PR] 개인 SNS, 블로그 후기 작성 시 반드시 "인사이트9교육연구소 협업 출강" 키워드를 포함하여 기재합니다.', { size: 9.5, fill: 'FFFBFBFE', align: 'left' });

        cell('A37:H37', '', { border: 'none' });

        cell('A38:H38', '상기 명시된 출강 강의 정보를 모두 정확히 인지하였으며, KPCIA 정회원으로서 최고의 품격을 갖춘 강의 품질을 바탕으로 출강 계약상의 업무를 성실히 수행할 것을 서약합니다.', { size: 9.5, bold: true, color: 'FF374151', fill: 'FFF1F5F9', align: 'center' });
        cell('A39:H39', '발행처: KPCIA 한국 프레스티지 기업 강사 협회 × 인사이트9교육연구소   [ 직인생략 ]', { size: 10.5, bold: true, color: 'FF111827', align: 'center' });

        // Save styled workbook using Blob and buffer
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `KPCIA_출강_파견안내서_${lecture.companyName || "공고"}_${lecture.id}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        triggerToast("📊 프리미엄 출강 파견 안내서가 성공적으로 생성되어 저장되었습니다!", "success");
      } catch (error) {
        console.error("Excel generation error:", error);
        triggerToast("❌ 엑셀 파일 생성 중 오류가 발생했습니다.", "error");
      }
    } else {
      const wb = XLSX.utils.book_new();
      // 2. All lectures: Generate a consolidated overview list
      const headers = [
        "공고번호", "출강기업/기관명", "출강 교육명칭", "요구 강사등급", 
        "출강 일자", "강의 시간 범위", "총 시간", "교육 장소", "예정 인원", 
        "총 정산예산(원)", "마일리지 로열티(M)", "현장 담당자", "담당자 연락처", "매칭 상태"
      ];
      const rows = lectures.map(l => [
        l.id,
        l.companyName || "익명 기업",
        l.title,
        l.targetTier,
        l.date,
        l.time,
        l.duration || `${l.mainHours || 0}시간`,
        l.location || "",
        l.attendees || 0,
        l.budget,
        l.mileageRoyalty || 0,
        l.managerName || "",
        l.managerPhone || "",
        l.status === 'completed' ? '출강 완료' : l.status === 'assigned' ? '배정 완료' : '모집 중'
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const cols = [
        { wch: 10 }, { wch: 20 }, { wch: 30 }, { wch: 18 },
        { wch: 12 }, { wch: 18 }, { wch: 10 }, { wch: 25 }, { wch: 10 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 12 }
      ];
      ws['!cols'] = cols;
      XLSX.utils.book_append_sheet(wb, ws, "출강공고_전체목록");

      const fileName = `KPCIA_실시간출강공고_전체목록_${new Date().toISOString().substring(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      triggerToast("📊 엑셀 저장 완료! 다운로드 폴더를 확인해 주세요.", "success");
    }
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
      if (prog && prog.isApproved) {
        const author = users.find(u => u.uid === prog.authorId);
        if (author) {
          // Calculate actual royalty payout: (budget * royaltyRate%)
          const actualRoyaltyPayout = lect.mileageRoyalty || Math.round((lect.budget * (prog.royaltyRate || 0)) / 100);

          const royaltyTx: MileageTransaction = {
            id: `tx_royalty_${Date.now()}_3`,
            userId: author.uid,
            userName: author.name,
            type: 'royalty',
            amount: actualRoyaltyPayout,
            description: `[KPCIA 지식저작권] 제안 과정 '${prog.title}' 출강 활용에 따른 로열티 마일리지 지급 (총 예산의 ${prog.royaltyRate}%)`,
            relatedId: prog.id,
            createdAt: new Date().toISOString()
          };

          const updatedAuthor: UserProfile = {
            ...author,
            mileage: author.mileage + actualRoyaltyPayout,
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

  // 2.1 Complete Lecture Only without Distributing Mileage (Admin - Pending Settlement)
  const handleCompleteLectureOnly = async (lectureId: string, rating: number = 5.0) => {
    const lect = lectures.find(l => l.id === lectureId);
    if (!lect) return;

    if (lect.status !== 'assigned') {
      triggerToast("강사 배정이 완료된 상태에서만 출강 완료 처리가 가능합니다.", "error");
      return;
    }

    const completedLec: LectureRequest = {
      ...lect,
      status: 'completed',
      settlementStatus: 'pending',
      lectureRating: rating
    };

    const updatedLectures = lectures.map(l => l.id === lectureId ? completedLec : l);
    setLectures(updatedLectures);
    await StorageService.saveLecture(completedLec);
    triggerToast(`✓ 출강 완료 처리되었습니다! (현재 정산 대기 상태 - 익월 말일인 ${getNextMonthLastDay(lect.date)}까지 정산 예정)`, "success");
  };

  // 2.2 Execute Settlement and Distribute Mileage & Royalties (Admin)
  const handleExecuteSettlementOnly = async (lectureId: string) => {
    const lect = lectures.find(l => l.id === lectureId);
    if (!lect) return;

    if (lect.status !== 'completed') {
      triggerToast("출강이 완료된 상태에서만 정산 처리가 가능합니다.", "error");
      return;
    }

    if (lect.settlementStatus === 'completed') {
      triggerToast("이미 정산 처리가 완료된 출강 건입니다.", "error");
      return;
    }

    const mainId = lect.assignedTo!;
    const assistantId = lect.assistantId;

    const mainInst = users.find(u => u.uid === mainId);
    const assistantInst = assistantId ? users.find(u => u.uid === assistantId) : null;

    if (!mainInst) {
      triggerToast("배정된 주강사의 정보가 존재하지 않아 정산을 진행할 수 없습니다.", "error");
      return;
    }

    const rating = lect.lectureRating || 5.0;
    const mainHours = lect.mainHours || 3;
    const mainPayout = mainHours * 100; // 100 M per hour

    const assistantHours = lect.assistantHours || 0;
    const assistantPayout = assistantHours * 50; // 50 M per hour

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

    const mainRatings = mainInst.lectureRatings || [];
    const updatedMainRatings = [...mainRatings, rating];
    const avgMainRating = Number((updatedMainRatings.reduce((a, b) => a + b, 0) / updatedMainRatings.length).toFixed(2));

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

    // Assistant payout
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

    // Program royalty payout
    if (lect.programId) {
      const prog = programs.find(p => p.id === lect.programId);
      if (prog && prog.isApproved) {
        const author = users.find(u => u.uid === prog.authorId);
        if (author) {
          const actualRoyaltyPayout = lect.mileageRoyalty || Math.round((lect.budget * (prog.royaltyRate || 0)) / 100);

          const royaltyTx: MileageTransaction = {
            id: `tx_royalty_${Date.now()}_3`,
            userId: author.uid,
            userName: author.name,
            type: 'royalty',
            amount: actualRoyaltyPayout,
            description: `[KPCIA 지식저작권] 제안 과정 '${prog.title}' 출강 활용에 따른 로열티 마일리지 지급 (총 예산의 ${prog.royaltyRate}%)`,
            relatedId: prog.id,
            createdAt: new Date().toISOString()
          };

          const updatedAuthor: UserProfile = {
            ...author,
            mileage: author.mileage + actualRoyaltyPayout,
            updatedAt: new Date().toISOString()
          };

          updatedUsersList = updatedUsersList.map(u => u.uid === author.uid ? updatedAuthor : u);

          await StorageService.saveUser(updatedAuthor);
          await StorageService.addTransaction(royaltyTx);
        }
      }
    }

    setUsers(updatedUsersList);

    const completedLec: LectureRequest = {
      ...lect,
      settlementStatus: 'completed'
    };

    const updatedLectures = lectures.map(l => l.id === lectureId ? completedLec : l);
    setLectures(updatedLectures);
    await StorageService.saveLecture(completedLec);

    if (currentUser) {
      const updatedMe = updatedUsersList.find(u => u.uid === currentUser.uid);
      if (updatedMe) {
        setCurrentUser(updatedMe);
      }
    }

    triggerToast(`💰 실시간 정산 및 마일리지 지급이 최종 승인되었습니다!`, "success");
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

    triggerToast("📄 고해상도 PDF 위임장을 생성하여 내려받는 중입니다. 잠시만 기다려 주세요...", "info");
    
    html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#0d0d0e"
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 portrait width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`KPCIA_Appointment_${Date.now()}.pdf`);
      triggerToast("✅ 디지털 위임장이 PDF로 성공적으로 다운로드되었습니다!", "success");
    }).catch((err) => {
      console.error("PDF download failure:", err);
      triggerToast("위임장 생성 중 오류가 발생했습니다. 다시 시도해 주세요.", "error");
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

  // 8.7. Admin Force Delete / Withdraw User (Admin)
  const handleAdminDeleteUser = async (userId: string) => {
    const user = users.find(u => u.uid === userId);
    if (!user) return;

    if (currentUser?.uid === userId) {
      triggerToast("본인 계정은 이곳에서 탈퇴시킬 수 없습니다. 우측 상단 프로필의 '회원탈퇴' 메뉴를 이용해 주세요.", "error");
      return;
    }

    const confirmDelete = window.confirm(`⚠️ [경고] 정말로 '${user.name}' 강사님을 협회에서 강제 탈퇴시키겠습니까?\n\n이 작업은 즉시 해당 회원의 가입 정보, 이력서, 누적 마일리지를 영구적으로 파기하며 이 작업은 되돌릴 수 없습니다.`);
    if (!confirmDelete) return;

    try {
      const updatedUsers = users.filter(u => u.uid !== userId);
      setUsers(updatedUsers);
      await StorageService.deleteUser(userId);
      triggerToast(`👤 ${user.name} 강사님이 협회 강사 명단에서 영구 탈퇴/삭제 처리되었습니다.`, "success");
      
      // If the admin was viewing this instructor's details, close or clean up
      if (viewingInstructorDetail?.uid === userId) {
        setViewingInstructorDetail(null);
      }
    } catch (err) {
      console.error(err);
      triggerToast("강사 강제 탈퇴 처리 중 오류가 발생했습니다.", "error");
    }
  };

  // 8.8. Reset Lecture Data to Empty (Admin)
  const handleResetLectureData = async () => {
    const confirmReset = window.confirm("⚠️ [경고] 정말로 모든 출강 요청 공고 및 매칭 데이터를 초기화(전체 삭제)하시겠습니까?\n\n이 작업은 삼성전자, 네이버, SKT 기본 공고를 포함한 모든 데이터를 완전히 삭제하며, 이 작업은 되돌릴 수 없습니다.");
    if (!confirmReset) return;

    try {
      // Set cleared flag first to block subscriptions and seeding
      await StorageService.setLecturesCleared(true);

      // Delete existing lectures in state and database
      for (const lec of lectures) {
        await StorageService.deleteLecture(lec.id);
      }

      // Sync state to empty
      setLectures([]);
      triggerToast("📢 실시간 출강 요청 매칭 공고 데이터가 완전히 초기화(삭제)되었습니다.", "success");
    } catch (err) {
      console.error(err);
      triggerToast("출강 데이터 초기화 중 오류가 발생했습니다.", "error");
    }
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

  // 9b. View & Save Instructor Full Registration Details (Admin Portal)
  const handleViewInstructorFullDetails = (u: UserProfile) => {
    setViewingInstructorDetail(u);
    setIsEditingDetail(false);
    // Initialize all edit states with user's current values
    setEditInstName(u.name || '');
    setEditInstTier(u.tier || 'Prestige Member');
    setEditInstMileage(u.mileage || 0);
    setEditInstTitle(u.profileCard?.title || '');
    setEditInstBio(u.profileCard?.bio || '');
    setEditInstSpecialties(u.profileCard?.specialties ? u.profileCard.specialties.join(', ') : '');
    setEditInstOrgName(u.organizationName || '');
    setEditInstPhone(u.profileCard?.contactPhone || '');
    setEditInstEmail(u.email || '');
    setEditInstPassword(u.password || '');
    setEditInstRegion(u.profileCard?.region || '');
    setEditInstBankAccount(u.profileCard?.bankAccount || '');
    setEditInstSnsLink(u.profileCard?.websiteUrl || '');
  };

  const handleSaveInstructorFullDetailEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingInstructorDetail) return;

    const cleanName = sanitizeString(editInstName);
    const cleanTitle = sanitizeString(editInstTitle);
    const cleanBio = sanitizeString(editInstBio);
    const cleanSpecialties = sanitizeString(editInstSpecialties).split(',').map(s => s.trim()).filter(Boolean);
    const cleanOrgName = sanitizeString(editInstOrgName);
    const cleanPhone = sanitizeString(editInstPhone);
    const cleanEmail = sanitizeString(editInstEmail);
    const cleanPassword = sanitizeString(editInstPassword);
    const cleanRegion = sanitizeString(editInstRegion);
    const cleanBankAccount = sanitizeString(editInstBankAccount);
    const cleanSnsLink = sanitizeString(editInstSnsLink);

    if (!cleanName) {
      triggerToast("강사 성함을 입력해 주세요.", "error");
      return;
    }

    const updatedUser: UserProfile = {
      ...viewingInstructorDetail,
      name: cleanName,
      tier: editInstTier,
      mileage: editInstMileage,
      email: cleanEmail,
      password: cleanPassword,
      organizationName: cleanOrgName,
      profileCard: {
        ...viewingInstructorDetail.profileCard,
        title: cleanTitle || `${editInstTier} 소속 프로 강사`,
        bio: cleanBio,
        specialties: cleanSpecialties,
        contactPhone: cleanPhone,
        contactEmail: cleanEmail,
        region: cleanRegion,
        bankAccount: cleanBankAccount,
        websiteUrl: cleanSnsLink
      },
      updatedAt: new Date().toISOString()
    };

    const updatedUsers = users.map(u => u.uid === viewingInstructorDetail.uid ? updatedUser : u);
    setUsers(updatedUsers);
    await StorageService.saveUser(updatedUser);

    if (currentUser?.uid === viewingInstructorDetail.uid) {
      setCurrentUser(updatedUser);
    }

    triggerToast(`✨ ${cleanName} 강사님의 회원 정보가 성공적으로 업데이트되었습니다.`, "success");
    setViewingInstructorDetail(updatedUser); // Update modal view state
    setIsEditingDetail(false);
  };

  // Sub-navigation: Render dynamic components of page
  return (
    <div className="min-h-screen bg-[#09090B] text-neutral-100 font-sans antialiased selection:bg-amber-500/20 selection:text-amber-300 pb-20 md:pb-0">
      
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
              <div className="flex items-baseline gap-2">
                <span className="text-xl md:text-2xl font-black tracking-widest bg-gradient-to-r from-[#F3CD5F] via-[#D4AF37] to-[#C5A02B] bg-clip-text text-transparent font-display">KPCIA</span>
                <span className="text-base md:text-lg font-bold text-amber-300 font-cursive italic select-none" style={{ fontFamily: "'Dancing Script', cursive" }}>Prestige</span>
              </div>
              <h1 className="text-[9px] md:text-[10px] font-bold text-neutral-400 tracking-wider">한국프레스티지기업강사협회</h1>
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
                  {hasRegisteredCurriculum(currentUser.uid) && (
                    <span className="text-[9px] bg-amber-500/10 text-[#D4AF37] px-1.5 py-0.5 rounded-full border border-amber-500/20">
                      {currentUser.mileage.toLocaleString()} M
                    </span>
                  )}
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



      {/* 🚀 MAIN HERO AREA (Only on Home Tab) */}
      {activeTab === 'home' && (
        <section className="relative overflow-hidden pt-12 pb-24 border-b border-neutral-900" id="hero-panel">
          {/* Ambient golden glow gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Core Value Statements */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold tracking-widest uppercase">
                <Sparkles className="w-3 h-3 animate-pulse" />
                <span>Premium Mind Wellness & ESG Therapy</span>
              </div>
              
              <div className="space-y-4">
                <span className="text-xs md:text-sm text-amber-400 font-extrabold tracking-wide block">
                  "식물의 생명력, 향기의 치유력, 손끝의 창조력으로 기업 교육의 격을 높입니다."
                </span>
                <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight text-white font-sans animate-fade-in">
                  대한민국 대기업 및 공공기관의 <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-400">
                    프리미엄 교육 파트너, KPCIA
                  </span>
                </h2>
              </div>

              <div className="text-neutral-400 text-xs md:text-sm leading-relaxed space-y-3 max-w-lg font-medium">
                <p>
                  한국 프레스티지 기업 강사 협회는 대한민국 대기업 및 공공기관의 ESG 경영, 임직원 소양, 마인드 웰니스를 선도하는 프리미엄 교육 파트너입니다.
                </p>
                <p>
                  우리는 정형화된 이론 교육을 넘어, 자연과 감각을 깨우는 3대 시그니처 테라피 프로그램을 통해 조직에 건강한 활력과 지속 가능한 변화를 불어넣습니다.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
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
              <h3 className="text-xs font-extrabold text-[#D4AF37] uppercase tracking-widest font-display border-b border-neutral-800/80 pb-3 flex items-center gap-1.5">
                <span>🌱</span> <span>3대 시그니처 테라피 솔루션</span>
              </h3>
              
              <div className="flex gap-4">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-400 h-11 w-11 shrink-0 flex items-center justify-center">
                  <Wind className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-100 flex flex-wrap items-center gap-1.5">
                    <span>아로마 테라피 (Aroma Therapy)</span>
                    <span className="text-[10px] text-amber-500/80 font-normal">| 감각의 치유</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    천연 에센셜 오일을 통해 스트레스를 완화하고, 지친 임직원의 마음을 과학적으로 치유하여 업무 몰입도를 극대화합니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-emerald-400 h-11 w-11 shrink-0 flex items-center justify-center">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-100 flex flex-wrap items-center gap-1.5">
                    <span>원예 테라피 (Horticultural Therapy)</span>
                    <span className="text-[10px] text-emerald-500/80 font-normal">| 생명과 ESG</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    살아있는 식물을 만지며 생명의 소중함을 배우고, 탄소중립과 환경(E)을 생각하는 친환경 ESG 가치를 일상에서 체득합니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-orange-400 h-11 w-11 shrink-0 flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-100 flex flex-wrap items-center gap-1.5">
                    <span>공예 테라피 (Craft Therapy)</span>
                    <span className="text-[10px] text-orange-500/80 font-normal">| 몰입과 창조</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    캘리, 드로잉, 팝아트 등 감성 친화적 예술 도구와 소재를 활용해 손끝으로 아름다운 작품을 완성해 나가는 과정에서 깊은 성취감과 창의적 영감을 얻습니다.
                  </p>
                  <button 
                    onClick={() => {
                      if (currentUser && currentUser.isApproved) {
                        setActiveTab('programs');
                      } else {
                        setActiveTab('lectures');
                        triggerToast("ℹ️ 출강 정보센터에서 관련 매칭 공고를 즉시 확인하실 수 있습니다. (정회원 승인 후 고품격 교육과정 전체 열람 가능)", "info");
                      }
                    }}
                    className="mt-2.5 text-[#D4AF37] hover:text-amber-300 font-black text-[10px] inline-flex items-center gap-1 transition-all cursor-pointer group/btn"
                  >
                    <span>🎨 공예/캘리/팝아트 교육과정 더보기</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                  </button>
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
                  <span className="text-2xl">🌸</span>
                  <h4 className="text-xs font-bold text-neutral-100">스트레스 해소 및 마인드 웰니스</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    임직원들의 지친 마음을 과학적인 천연 향기 테라피로 치유하고, 긍정적인 정서 조절을 통해 업무 몰입도를 극대화합니다.
                  </p>
                </div>
                <button onClick={() => setActiveTab('programs')} className="text-[10px] text-[#D4AF37] font-bold mt-4 flex items-center gap-1 hover:underline">
                  교육과정 더보기 <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-[#121214] border border-neutral-900 hover:border-neutral-800 transition-all flex flex-col justify-between" id="card-feat-2">
                <div className="space-y-3">
                  <span className="text-2xl">🌿</span>
                  <h4 className="text-xs font-bold text-neutral-100">생명 존중과 탄소중립 ESG 가치</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    살아있는 식물과 소통하며 생명의 소중함을 배우고, 조직 내에 탄소중립과 환경(E)을 생각하는 ESG 상생 가치를 전파합니다.
                  </p>
                </div>
                <button onClick={() => setActiveTab('programs')} className="text-[10px] text-[#D4AF37] font-bold mt-4 flex items-center gap-1 hover:underline">
                  교육과정 더보기 <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-[#121214] border border-neutral-900 hover:border-neutral-800 transition-all flex flex-col justify-between" id="card-feat-3">
                <div className="space-y-3">
                  <span className="text-2xl">🎨</span>
                  <h4 className="text-xs font-bold text-neutral-100">깊은 몰입과 성취의 공예 창조</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    캘리그라피, 드로잉, 팝아트 등 감성 친화적 도구와 소재를 활용해 무언가를 완성해 나가는 과정에서 깊은 성취감과 창의적 영감을 얻습니다.
                  </p>
                </div>
                <button onClick={() => setActiveTab('programs')} className="text-[10px] text-[#D4AF37] font-bold mt-4 flex items-center gap-1 hover:underline cursor-pointer">
                  교육과정 더보기 <ArrowRight className="w-3 h-3" />
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
              <div className="flex flex-wrap items-center gap-3">
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
                const filteredLectures = lectures
                  .filter(l => {
                    const queryText = searchLecture.toLowerCase();
                    const titleMatch = l.title.toLowerCase().includes(queryText) || (l.companyName && l.companyName.toLowerCase().includes(queryText));
                    const tierMatch = filterLecTier === 'all' || l.targetTier === filterLecTier;
                    return titleMatch && tierMatch;
                  })
                  .sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                  });
                
                const itemsPerPage = 6;
                const totalPages = Math.ceil(filteredLectures.length / itemsPerPage) || 1;
                const currentPage = Math.min(lecturePage, totalPages);
                const paginatedLectures = filteredLectures.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                return (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                            className="p-5 sm:p-6 rounded-2xl bg-[#121214] border border-neutral-900/80 hover:border-neutral-800/80 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 relative overflow-hidden flex flex-col gap-4 sm:gap-5 text-left"
                          >
                            {/* Top Header Row - Responsive wrapping */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900 pb-3.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-850 rounded-lg px-2.5 py-1 text-[10px] text-neutral-400 font-bold">
                                  <Building className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                                  <span>{lecture.companyName || "익명 기업"}</span>
                                </div>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${getTierColor(lecture.targetTier)}`}>
                                  지원 자격: {lecture.targetTier}
                                </span>
                              </div>
                              <div className="shrink-0">
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                                  lecture.status === 'completed' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : lecture.status === 'assigned'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-amber-500/10 text-[#D4AF37] border border-[#D4AF37]/20'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    lecture.status === 'completed' 
                                      ? 'bg-emerald-400' 
                                      : lecture.status === 'assigned'
                                      ? 'bg-blue-400'
                                      : 'bg-amber-400 animate-pulse'
                                  }`} />
                                  {lecture.status === 'completed' ? '출강 완료(정산완료)' : lecture.status === 'assigned' ? '강사배정 완료' : '강사모집 중'}
                                </span>
                              </div>
                            </div>

                            {/* Content Area: Blurred if restricted */}
                            <div className="relative flex-1 flex flex-col gap-4">
                              <div className={`space-y-4 flex-1 flex flex-col justify-between ${isRestricted ? 'blur-md select-none pointer-events-none' : ''}`}>
                                <div className="space-y-3">
                                  {/* Associated Program Information with beautiful accent */}
                                  {lecture.programTitle && (
                                    <div className="flex items-center gap-2 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl px-3 py-2 text-xs text-neutral-300">
                                      <span className="shrink-0 bg-amber-500/10 text-[#D4AF37] font-extrabold text-[9px] px-1.5 py-0.5 rounded-md border border-amber-500/20 tracking-wider">
                                        지식 IP 연계 과정
                                      </span>
                                      <span className="font-extrabold truncate text-neutral-200">
                                        {lecture.programTitle}
                                      </span>
                                    </div>
                                  )}

                                  <h3 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight hover:text-[#D4AF37] transition-colors">
                                    {lecture.title}
                                  </h3>
                                  
                                  <p className="text-xs text-neutral-400 leading-relaxed whitespace-pre-wrap bg-neutral-950/30 p-3 rounded-xl border border-neutral-900/50">
                                    {lecture.description}
                                  </p>
                                </div>

                                {/* Premium Parameter Bento Box Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                                  {/* Section 1: 일정 및 장소 정보 */}
                                  <div className="p-3 bg-neutral-950/40 rounded-xl border border-neutral-900/60 space-y-2">
                                    <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-wider pb-1 border-b border-neutral-900/40 flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                                      <span>출강 일정 및 장소</span>
                                    </h4>
                                    <div className="space-y-1.5 text-xs text-neutral-300 font-medium">
                                      <div className="flex items-center gap-2">
                                        <span className="text-neutral-500 w-12 text-[10px] font-bold">일정</span>
                                        <span className="text-white font-extrabold">{lecture.date}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-neutral-500 w-12 text-[10px] font-bold">시간</span>
                                        <span className="text-emerald-400 font-extrabold">{lecture.time} <span className="text-neutral-500 font-medium">({lecture.duration || '3시간'})</span></span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-neutral-500 w-12 text-[10px] font-bold">장소</span>
                                        <span className="text-neutral-200 truncate" title={lecture.location}>{lecture.location}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-neutral-500 w-12 text-[10px] font-bold">인원</span>
                                        <span className="text-neutral-200 font-extrabold">{lecture.attendees || 30}명 예정</span>
                                      </div>
                                      </div>
                                    </div>

                                  {/* Section 2: 정산 및 로열티 정보 */}
                                  <div className="p-3 bg-amber-500/[0.01] rounded-xl border border-neutral-900/60 space-y-2 flex flex-col justify-between">
                                    <div className="space-y-2">
                                      <h4 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-wider pb-1 border-b border-neutral-900/40 flex items-center gap-1.5">
                                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                                        <span>정산 및 저작권 수익</span>
                                      </h4>
                                      <div className="space-y-1.5 text-xs font-medium">
                                        <div className="flex items-center justify-between">
                                          <span className="text-neutral-500 text-[10px] font-bold">출강 총 예산</span>
                                          <span className="text-white font-black text-sm">₩{lecture.budget.toLocaleString()} 원</span>
                                        </div>
                                        {lecture.programId && programs.find(p => p.id === lecture.programId)?.isApproved ? (
                                          <div className="flex items-center justify-between pt-1 border-t border-neutral-900/20">
                                            <span className="text-[#D4AF37] text-[10px] font-extrabold flex items-center gap-1">
                                              <Sparkles className="w-3 h-3 text-[#D4AF37] animate-pulse" />
                                              <span>지식 IP 로열티 ({programs.find(p => p.id === lecture.programId)?.royaltyRate || 5}%)</span>
                                            </span>
                                            <span className="text-amber-400 font-black text-sm">
                                              {(lecture.mileageRoyalty || 0).toLocaleString()} M
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-between pt-1 border-t border-neutral-900/20">
                                            <span className="text-neutral-500 text-[10px] font-semibold flex items-center gap-1">
                                              <span>지식 IP 로열티 (미적용)</span>
                                            </span>
                                            <span className="text-neutral-500 font-bold text-sm">
                                              0 M
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-[9px] text-neutral-500 font-semibold text-right mt-1 leading-normal">
                                      {lecture.programId && programs.find(p => p.id === lecture.programId)?.isApproved 
                                        ? "출강 매칭 완료 시 저작권자에게 즉시 적립 (1 M = ₩1 상당)" 
                                        : "일반 출강 건으로 지식 IP 로열티 정산 대상에서 제외됩니다."}
                                    </div>
                                  </div>

                                  {/* Section 3: 만족도 조사 및 실시간 QR코드 */}
                                  <div className="p-3 bg-neutral-950/40 rounded-xl border border-neutral-900/60 col-span-1 md:col-span-2">
                                    <div className="space-y-2 text-left w-full">
                                      <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <QrCode className="w-3.5 h-3.5 text-amber-500" />
                                        <span>강의 만족도 조사 QR코드</span>
                                      </h4>
                                      <p className="text-[10px] text-neutral-400 leading-normal">
                                        출강 완료 후 피교육생분들이 스캔하여 즉시 만족도 조사를 제출할 수 있는 전용 실시간 QR코드입니다.
                                      </p>
                                      <div className="text-[9px] font-bold text-neutral-500 font-mono break-all line-clamp-1 opacity-70" title={lecture.surveyUrl || "https://docs.google.com/forms/d/e/1FAIpQLSdWC4rgAa5hQi2G1wcMnCWlwYCA8rfRkHurHG3e7JeiR24V1A/viewform?usp=sharing&ouid=108376898401719889630"}>
                                        {lecture.surveyUrl || "https://docs.google.com/forms/d/e/1FAIpQLSdWC4rgAa5hQi2G1wcMnCWlwYCA8rfRkHurHG3e7JeiR24V1A/viewform?usp=sharing&ouid=108376898401719889630"}
                                      </div>

                                      {/* Side-by-side Download Buttons */}
                                      <div className="pt-1 flex flex-wrap gap-2">
                                        {isMainLecturer || isAssistantLecturer || currentUser?.isAdmin ? (
                                          <>
                                            <button
                                              onClick={() => handleDownloadExcel(lecture)}
                                              className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                            >
                                              <Download className="w-3 h-3 text-emerald-400" />
                                              <span>강의 상세 엑셀 다운로드</span>
                                            </button>
                                            <button
                                              onClick={() => handleDownloadQR(lecture)}
                                              className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-400 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                            >
                                              <QrCode className="w-3 h-3 text-amber-400" />
                                              <span>만족도 QR 다운로드</span>
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            <button
                                              onClick={() => triggerToast("🔒 KPCIA 마스터실의 승인을 거쳐 최종 배정 완료된 강사님만 상세 엑셀 다운로드가 가능합니다.", "error")}
                                              className="px-2.5 py-1 rounded bg-neutral-950/40 border border-neutral-900 text-neutral-500 text-[10px] font-bold cursor-pointer flex items-center gap-1.5"
                                              title="배정 완료 강사님 전용 다운로드"
                                            >
                                              <Lock className="w-3 h-3 text-neutral-600" />
                                              <span>강의상세 (배정자 전용)</span>
                                            </button>
                                            <button
                                              onClick={() => triggerToast("🔒 KPCIA 마스터실의 승인을 거쳐 최종 배정 완료된 강사님만 만족도 QR 다운로드가 가능합니다.", "error")}
                                              className="px-2.5 py-1 rounded bg-neutral-950/40 border border-neutral-900 text-neutral-500 text-[10px] font-bold cursor-pointer flex items-center gap-1.5"
                                              title="배정 완료 강사님 전용 다운로드"
                                            >
                                              <Lock className="w-3 h-3 text-neutral-600" />
                                              <span>만족도 QR (배정자 전용)</span>
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Extra info for assigned lecture */}
                                {(lecture.assignedName || lecture.assistantName) && (
                                  <div className="text-[10px] sm:text-[11px] text-neutral-400 flex flex-wrap gap-x-4 gap-y-1.5 bg-neutral-950/30 p-3 rounded-xl border border-neutral-900/50">
                                    {lecture.assignedName && (
                                      <span className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-bold bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-wider">주강사</span>
                                        <strong className="text-white font-extrabold">{lecture.assignedName}</strong>
                                      </span>
                                    )}
                                    {lecture.assistantName && (
                                      <span className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-bold bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded uppercase tracking-wider">보조강사</span>
                                        <strong className="text-white font-extrabold">{lecture.assistantName}</strong>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Restricted / Lock Overlay */}
                              {isRestricted && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-2xl p-4 text-center border border-neutral-900">
                                  <div className="h-10 w-10 rounded-full bg-neutral-950 border border-neutral-850 flex items-center justify-center mb-3 shadow-lg shadow-black/40">
                                    <Lock className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                                  </div>
                                  <h4 className="text-xs sm:text-sm font-black text-[#D4AF37] tracking-tight flex items-center gap-1.5">
                                    <span>🔒 등급별 출강정보 접근제한 구역</span>
                                  </h4>
                                  <p className="text-[10px] sm:text-xs text-neutral-400 max-w-sm mt-2 leading-relaxed">
                                    본 매칭 공고는 <span className="text-amber-400 font-extrabold">{lecture.targetTier}</span> 등급 전용 특별 매칭입니다.<br />
                                    활동 실적 정산을 통해 등급을 충족하시면 즉시 열람 및 매칭 지원이 가능합니다.
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
                출강 시 프로그램 저작자에게 <strong className="text-[#D4AF37]">지식 IP 로열티 (총 예산의 % 비율)</strong> 지급
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
                  {programs.filter(prog => prog.isApproved).map(prog => (
                    <div 
                      key={prog.id}
                      className="p-6 rounded-2xl bg-[#121214] border border-neutral-900 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-base font-black text-white">{prog.title}</h3>
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 whitespace-nowrap">
                            로열티: 총 예산의 {prog.royaltyRate}%
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
                {hasRegisteredCurriculum(currentUser.uid) ? (
                  <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 flex justify-between items-center">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-neutral-500 font-bold block">나의 교육 마일리지</span>
                      <span className="text-lg font-black text-[#D4AF37]">{currentUser.mileage.toLocaleString()} M</span>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#D4AF37]">
                      <Coins className="w-5 h-5" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-neutral-950/40 p-4 rounded-xl border border-neutral-900 text-center">
                    <span className="text-[10px] text-neutral-500 font-bold block">나의 교육 마일리지</span>
                    <span className="text-xs text-neutral-400 block mt-1.5 font-medium">교안 미등록 회원은 마일리지가 공개되지 않습니다.</span>
                  </div>
                )}

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

              <button
                onClick={() => setAdminSubTab('programs')}
                className={`px-5 py-3 text-xs font-black transition-all border-b-2 shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  adminSubTab === 'programs'
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-amber-500/5'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950/40'
                }`}
              >
                <span>💎 명품 교육과정 승인대기</span>
                {programs.filter(p => !p.isApproved).length > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold animate-pulse">
                    대기 {programs.filter(p => !p.isApproved).length}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full bg-neutral-950 text-neutral-400 border border-neutral-850 text-[9px]">
                    {programs.length}
                  </span>
                )}
              </button>
            </div>

            {/* Admin Grid: Left Form, Right List */}
            {adminSubTab === 'lectures' && (
              <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
                
                {/* Left Column: Post a Lecture Request Form */}
                <div className="lg:col-span-1 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4" id="admin-create-lecture-form">
                  <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
                    <div className="flex items-center gap-1.5 text-white font-bold">
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-xs font-black">강의 출강 요청서</span>
                    </div>
                    <div className="flex bg-neutral-950 p-0.5 rounded-lg border border-neutral-850">
                      <button
                        type="button"
                        onClick={() => setLectureRegMode('single')}
                        className={`px-2 py-1 rounded text-[9px] font-extrabold transition-all cursor-pointer ${
                          lectureRegMode === 'single'
                            ? 'bg-amber-500/10 text-[#D4AF37] border border-amber-500/20'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                      >
                        개별 등록
                      </button>
                      <button
                        type="button"
                        onClick={() => setLectureRegMode('bulk')}
                        className={`px-2 py-1 rounded text-[9px] font-extrabold transition-all cursor-pointer ${
                          lectureRegMode === 'bulk'
                            ? 'bg-[#217346]/10 text-[#217346] border border-[#217346]/20'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                      >
                        대량 등록
                      </button>
                    </div>
                  </div>

                  {lectureRegMode === 'single' ? (
                    <form onSubmit={handleCreateLecture} className="space-y-4 text-xs animate-in fade-in duration-200">
                      <div className="space-y-1">
                        <label className="text-neutral-400 font-semibold block">출강 교육 명칭 (Title) *</label>
                        <input
                          type="text"
                          placeholder="예) 인공지능 기반 마케팅 혁신 실전 특강"
                          value={newLecTitle}
                          onChange={(e) => setNewLecTitle(e.target.value)}
                          required
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-neutral-400 font-semibold block">의뢰 기업명 *</label>
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
                          <label className="text-neutral-400 font-semibold block">지정 협력사 (선택)</label>
                          <input
                            type="text"
                            placeholder="예) 파트너사명 기입"
                            value={newLecPartner}
                            onChange={(e) => setNewLecPartner(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400 font-semibold block">교육 내용 및 요구 사양 개요 *</label>
                        <textarea
                          placeholder="사내 마케터 대상으로 프롬프트 엔지니어링 및 자동화 교안을 기반으로 특강 진행..."
                          value={newLecDesc}
                          onChange={(e) => setNewLecDesc(e.target.value)}
                          required
                          rows={3}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs leading-normal"
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

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-neutral-400 font-semibold block">현장 담당자 성함</label>
                          <input
                            type="text"
                            placeholder="예) 김성진"
                            value={newLecManagerName}
                            onChange={(e) => setNewLecManagerName(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-neutral-400 font-semibold block">현장 담당자 연락처</label>
                          <input
                            type="tel"
                            placeholder="예) 010-5259-7458"
                            value={newLecManagerPhone}
                            onChange={(e) => setNewLecManagerPhone(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-850">
                        <div className="space-y-3.5">
                          <div className="space-y-1.5">
                            <label className="text-neutral-400 font-bold flex items-center gap-1.5 text-xs">
                              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>출강 일자 *</span>
                            </label>
                            <input
                              type="date"
                              value={newLecDate}
                              onChange={(e) => setNewLecDate(e.target.value)}
                              required
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-neutral-400 font-bold flex items-center gap-1.5 text-xs">
                              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>강의 시간 (시작 ~ 종료) *</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={newLecStartTime}
                                onChange={(e) => setNewLecStartTime(e.target.value)}
                                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold text-center"
                              />
                              <span className="text-neutral-600 font-black shrink-0">~</span>
                              <input
                                type="time"
                                value={newLecEndTime}
                                onChange={(e) => setNewLecEndTime(e.target.value)}
                                className="flex-1 bg-[#09090b] border border-neutral-800 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold text-center"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3.5 pt-1.5">
                          <div className="space-y-1.5">
                            <label className="text-neutral-400 font-semibold block text-xs">요구 강사 등급컷 *</label>
                            <select
                              value={newLecTier}
                              onChange={(e) => setNewLecTier(e.target.value as any)}
                              className="w-full bg-[#09090b] border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs cursor-pointer font-medium"
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
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-neutral-400 font-semibold block">강의 시간</label>
                          <input
                            type="number"
                            min={1}
                            value={newLecHours}
                            onChange={(e) => setNewLecHours(Math.max(1, Number(e.target.value)))}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold text-center"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-neutral-400 font-semibold block">예정 인원</label>
                          <input
                            type="number"
                            min={1}
                            value={newLecAttendees}
                            onChange={(e) => setNewLecAttendees(Math.max(1, Number(e.target.value)))}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold text-center"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-neutral-400 font-semibold block">인당 재료비</label>
                          <input
                            type="number"
                            min={0}
                            value={newLecMaterialCost}
                            onChange={(e) => setNewLecMaterialCost(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold text-center"
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
                          {programs.filter(p => p.isApproved).map(p => (
                            <option key={p.id} value={p.id}>{p.title} (저작권자: {p.authorName})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400 font-semibold block">만족도 조사 링크 (선택)</label>
                        <input
                          type="url"
                          placeholder="예) https://forms.gle/abcdef123"
                          value={newLecSurveyUrl}
                          onChange={(e) => setNewLecSurveyUrl(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-medium"
                        />
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
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                      <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 border-dashed text-center space-y-3">
                        <div className="mx-auto w-10 h-10 rounded-full bg-[#217346]/10 flex items-center justify-center border border-[#217346]/20 text-[#217346]">
                          <FileSpreadsheet className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Excel 대량 등록 파일 첨부</p>
                          <p className="text-[10px] text-neutral-500 mt-1">.xlsx 또는 .xls 확장자 양식을 업로드 해주세요.</p>
                        </div>
                        <label className="inline-block px-3.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 font-bold text-[10px] transition-colors cursor-pointer">
                          파일 찾아보기...
                          <input 
                            type="file" 
                            accept=".xlsx, .xls" 
                            onChange={handleBulkUploadExcel} 
                            className="hidden" 
                          />
                        </label>
                      </div>

                      <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/60 space-y-2 text-[10px] leading-relaxed">
                        <div className="text-amber-500 font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>대량 등록 안내 및 사용 팁</span>
                        </div>
                        <ul className="list-disc pl-4 text-neutral-400 space-y-1">
                          <li>반드시 <strong>공식 엑셀 대량 양식</strong>을 다운로드하여 작성하십시오.</li>
                          <li>별표 (*) 표시된 열은 필수 입력 항목입니다.</li>
                          <li>등록 시 주강사료, 보조강사료(20명 이상), 재료비 등은 <strong>KPCIA 규정에 따라 자동으로 산정 및 마스터 동기화</strong>됩니다.</li>
                        </ul>
                        <button
                          type="button"
                          onClick={handleDownloadTemplate}
                          className="w-full mt-2 py-2 rounded-lg bg-[#217346] hover:bg-[#1e663e] text-white font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>대량 등록용 엑셀 양식 다운로드</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Registered Instructors Management & Partnership Inquiries (2 cols) */}
                <div className="lg:col-span-2 space-y-8" id="admin-management-lists">
                  
                  {/* 👑 KPCIA Lecture Assignment & Settlement Control Room */}
                  <div className="p-6 rounded-2xl bg-[#0e0e10] border border-neutral-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-850 pb-3">
                      <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                        <span className="text-[#D4AF37]">👑</span> KPCIA 출강 수탁 배정 및 정산 통제실 ({lectures.length}건)
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleResetLectureData}
                          className="px-2.5 py-1 text-[9px] text-red-400 hover:text-red-300 font-bold rounded-lg bg-red-950/30 hover:bg-red-900/40 border border-red-900/30 cursor-pointer transition-all duration-200"
                          title="출강 매칭 공고 데이터를 초기 상태로 복원합니다."
                        >
                          🔄 출강 데이터 초기화
                        </button>
                        <span className="text-[10px] text-amber-500 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 select-none shrink-0 self-start sm:self-auto">마스터 전용 관제실</span>
                      </div>
                    </div>

                    {/* Filter & Sorting Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                      {/* Search */}
                      <div className="md:col-span-5 relative">
                        <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          placeholder="강의명, 의뢰처, 협력사명, 지역 검색..."
                          value={controlRoomSearch}
                          onChange={(e) => setControlRoomSearch(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-2.5 py-1.5 text-white text-[11px] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      
                      {/* Sort */}
                      <div className="md:col-span-3">
                        <select
                          value={controlRoomSort}
                          onChange={(e) => setControlRoomSort(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white text-[11px] focus:outline-none focus:border-[#D4AF37] cursor-pointer font-bold"
                        >
                          <option value="recent">최근 등록순</option>
                          <option value="date">출강 일정순</option>
                          <option value="budget">총 예산 높은순</option>
                        </select>
                      </div>

                      {/* Status Tabs */}
                      <div className="md:col-span-4 flex bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 self-center">
                        <button
                          type="button"
                          onClick={() => setControlRoomStatus('all')}
                          className={`flex-1 text-center py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                            controlRoomStatus === 'all' ? 'bg-neutral-850 text-white' : 'text-neutral-500 hover:text-neutral-300'
                          }`}
                        >
                          전체({lectures.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setControlRoomStatus('open')}
                          className={`flex-1 text-center py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                            controlRoomStatus === 'open' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' : 'text-neutral-500 hover:text-neutral-300'
                          }`}
                        >
                          모집({lectures.filter(l => l.status === 'open').length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setControlRoomStatus('assigned')}
                          className={`flex-1 text-center py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                            controlRoomStatus === 'assigned' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10' : 'text-neutral-500 hover:text-neutral-300'
                          }`}
                        >
                          배정({lectures.filter(l => l.status === 'assigned').length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setControlRoomStatus('completed')}
                          className={`flex-1 text-center py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                            controlRoomStatus === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'text-neutral-500 hover:text-neutral-300'
                          }`}
                        >
                          완료({lectures.filter(l => l.status === 'completed').length})
                        </button>
                      </div>
                    </div>

                    {/* Compact Scrollable List (Prevent vertical bloat) */}
                    <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1.5 custom-scrollbar">
                      {(() => {
                        const filtered = lectures.filter(l => {
                          if (controlRoomStatus !== 'all' && l.status !== controlRoomStatus) return false;
                          if (controlRoomSearch.trim()) {
                            const q = controlRoomSearch.toLowerCase();
                            return l.title.toLowerCase().includes(q) || 
                                   (l.companyName || '').toLowerCase().includes(q) || 
                                   (l.partnerCompany || '').toLowerCase().includes(q) || 
                                   (l.location || '').toLowerCase().includes(q);
                          }
                          return true;
                        });

                        const sorted = [...filtered].sort((a, b) => {
                          if (controlRoomSort === 'date') return a.date.localeCompare(b.date);
                          if (controlRoomSort === 'budget') return b.budget - a.budget;
                          return b.createdAt ? b.createdAt.localeCompare(a.createdAt || '') : b.id.localeCompare(a.id);
                        });

                        if (sorted.length === 0) {
                          return (
                            <div className="text-neutral-500 text-center py-12 text-xs font-semibold bg-neutral-950/20 rounded-xl border border-neutral-850/50">
                              조건에 합치하는 출강 요청 내역이 없습니다.
                            </div>
                          );
                        }

                        return sorted.map(lecture => {
                          return (
                            <div key={lecture.id} className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 space-y-3 text-[11px] hover:border-neutral-700/80 transition-colors">
                              <div className="flex justify-between items-start gap-3">
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] text-neutral-400 font-extrabold">{lecture.companyName}</span>
                                    {lecture.partnerCompany && (
                                      <span className="text-[9px] text-[#D4AF37] border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-1 rounded font-extrabold flex items-center gap-0.5">
                                        🤝 협력사: {lecture.partnerCompany}
                                      </span>
                                    )}
                                  </div>
                                  <strong className="text-white text-xs block mt-1 leading-snug">{lecture.title}</strong>
                                  <span className="text-neutral-500 text-[9px] block mt-1 font-mono">
                                    🗓️ {lecture.date} | ⏱️ {lecture.duration} | 📍 {lecture.location}
                                  </span>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                    lecture.status === 'open' 
                                      ? 'bg-amber-500/10 text-[#D4AF37] border border-[#D4AF37]/20' 
                                      : lecture.status === 'assigned'
                                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse'
                                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  }`}>
                                    {lecture.status === 'open' ? '모집 중' : lecture.status === 'assigned' ? '배정 완료' : '출강 완료'}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => startEditLecture(lecture)}
                                      className="p-1 rounded bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer border border-neutral-800"
                                      title="수정/보완"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteLecture(lecture.id)}
                                      className="p-1 rounded bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer border border-neutral-800"
                                      title="삭제"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
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
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer font-bold"
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
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
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
                                    className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:brightness-110 text-neutral-950 text-[11px] font-black transition-all cursor-pointer shrink-0"
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
                                  <div className="flex justify-end gap-2 flex-wrap">
                                    <button
                                      onClick={() => handleCompleteLectureOnly(lecture.id, adminLectureRatings[lecture.id] || 5.0)}
                                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all cursor-pointer text-xs flex items-center gap-1"
                                    >
                                      ✓ 만족도 등록 및 출강 완료 (정산 대기)
                                    </button>
                                    <button
                                      onClick={() => handleCompleteLectureAndSettle(lecture.id, adminLectureRatings[lecture.id] || 5.0)}
                                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black transition-all cursor-pointer text-xs flex items-center gap-1"
                                    >
                                      💰 즉시 정산 및 완료 처리 (마일리 즉시 지급)
                                    </button>
                                  </div>
                                </div>
                              )}

                              {lecture.status === 'completed' && (
                                <div className="pt-2 border-t border-neutral-850 text-[10px] text-neutral-500 space-y-2">
                                  {lecture.settlementStatus === 'completed' ? (
                                    <div className="text-emerald-400 font-bold">
                                      ✓ 이 출강 건의 주강사 <strong>{lecture.assignedName}</strong> 및 보조강사/로열티 정산 지급이 완전히 완료되었습니다.
                                    </div>
                                  ) : (
                                    <div className="space-y-2 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg text-amber-500">
                                      <div className="font-bold flex items-center gap-1">
                                        <span>⌛ 정산 대기 상태</span>
                                        <span>(예정 정산일: {getNextMonthLastDay(lecture.date)})</span>
                                      </div>
                                      <p className="text-[9px] text-neutral-400">강의가 완료되었으나 아직 정산이 실행되지 않았습니다. 규정에 따라 익월 말일까지 정산이 완료되어야 합니다.</p>
                                      <div className="flex justify-end">
                                        <button
                                          onClick={() => handleExecuteSettlementOnly(lecture.id)}
                                          className="px-2.5 py-1 rounded bg-[#D4AF37] hover:brightness-110 text-neutral-950 font-black text-[10px] transition-all cursor-pointer"
                                        >
                                          💰 실시간 정산 즉시 승인 (마일리지 지급)
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  {lecture.lectureRating !== undefined && (
                                    <div className="text-amber-400 font-bold flex items-center gap-1 mt-1">
                                      <span>⭐ 등록된 강의 만족도 평점:</span>
                                      <span className="bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px]">
                                        {lecture.lectureRating.toFixed(1)} / 5.0
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {(lecture.status === 'assigned' || lecture.status === 'completed') && (
                                <div className="pt-2.5 border-t border-neutral-800/60 flex flex-wrap gap-2">
                                  <button
                                    onClick={() => handleDownloadExcel(lecture)}
                                    className="px-2.5 py-1 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Download className="w-3 h-3 text-emerald-400" />
                                    <span>강의 상세 엑셀 다운로드</span>
                                  </button>
                                  <button
                                    onClick={() => handleDownloadQR(lecture)}
                                    className="px-2.5 py-1 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-amber-400 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    <QrCode className="w-3 h-3 text-amber-400" />
                                    <span>만족도 QR 다운로드</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Beautiful Completed Lecture Excel Sheet & Download Section */}
            {adminSubTab === 'lectures' && (
              <div className="mt-8 animate-in fade-in duration-300">
                <div className="p-6 rounded-2xl bg-[#0d0d0f] border border-neutral-800 space-y-5" id="master-completed-excel-sheet">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <span className="p-1 rounded bg-[#217346]/10 text-[#217346] border border-[#217346]/20">
                          <FileSpreadsheet className="w-4 h-4" />
                        </span>
                        <span>📊 KPCIA 출강 완료 및 실시간 정산 마스터 대장 (Excel Live Sheet)</span>
                      </h3>
                      <p className="text-[10px] text-neutral-400">
                        출강 요청 강의 전체 리스트와 실시간 정산 현황 및 정산 기한을 모니터링하는 마스터 회계 대장입니다.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleDownloadSettledLecturesExcel}
                        className="px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 border border-emerald-600/30 text-white text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="정산이 완료된 강의 내역만 엑셀로 다운로드합니다."
                      >
                        <Download className="w-3 h-3 text-emerald-300" />
                        <span>1. 정산 완료 내역 (.xlsx)</span>
                      </button>
                      <button
                        onClick={handleDownloadPendingSettlementLecturesExcel}
                        className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 border border-amber-500/30 text-white text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="강의가 완료되었으나 정산 이전 상태인 강의 내역을 다운로드합니다."
                      >
                        <Download className="w-3 h-3 text-amber-300" />
                        <span>2. 정산 대기 내역 (.xlsx)</span>
                      </button>
                      <button
                        onClick={handleDownloadCompletedLecturesExcel}
                        className="px-3 py-2 rounded-lg bg-[#217346] hover:bg-[#1e663e] text-white text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="전체 출강 완료 목록을 다운로드합니다."
                      >
                        <Download className="w-3.5 h-3.5 text-green-300" />
                        <span>전체 마스터 대장 (.xlsx)</span>
                      </button>
                    </div>
                  </div>

                  {/* Real Excel Grid Simulation */}
                  {lectures.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-neutral-800">
                      <table className="w-full border-collapse text-[10px] text-neutral-300 font-mono">
                        {/* Excel Header row with letters */}
                        <thead>
                          <tr className="bg-neutral-900 border-b border-neutral-800">
                            <th className="p-1.5 border-r border-neutral-800 text-neutral-500 font-bold text-center select-none w-10"></th>
                            <th className="p-1.5 border-r border-neutral-800 text-neutral-500 text-center uppercase font-bold w-12">A</th>
                            <th className="p-1.5 border-r border-neutral-800 text-neutral-500 text-center uppercase font-bold w-24">B</th>
                            <th className="p-1.5 border-r border-neutral-800 text-neutral-500 text-center uppercase font-bold w-32">C</th>
                            <th className="p-1.5 border-r border-neutral-800 text-neutral-500 text-center uppercase font-bold w-28">D</th>
                            <th className="p-1.5 border-r border-neutral-800 text-neutral-500 text-center uppercase font-bold min-w-[150px]">E</th>
                            <th className="p-1.5 border-r border-neutral-800 text-neutral-500 text-center uppercase font-bold w-32">F</th>
                            <th className="p-1.5 border-r border-neutral-800 text-neutral-500 text-center uppercase font-bold w-20">G</th>
                            <th className="p-1.5 border-r border-neutral-800 text-neutral-500 text-center uppercase font-bold w-20">H</th>
                            <th className="p-1.5 border-r border-neutral-800 text-neutral-500 text-center uppercase font-bold w-16">I</th>
                            <th className="p-1.5 border-r border-neutral-800 text-neutral-500 text-center uppercase font-bold w-16">J</th>
                            <th className="p-1.5 border-r border-neutral-800 text-neutral-500 text-center uppercase font-bold w-20">K</th>
                            <th className="p-1.5 border-r border-neutral-800 text-neutral-500 text-center uppercase font-bold w-20">L</th>
                            <th className="p-1.5 border-r border-neutral-800 text-neutral-500 text-center uppercase font-bold w-24">M</th>
                            <th className="p-1.5 border-r border-neutral-800 text-neutral-500 text-center uppercase font-bold w-16">N</th>
                            <th className="p-1.5 border-r border-neutral-800 text-neutral-500 text-center uppercase font-bold w-24">O</th>
                            <th className="p-1.5 text-neutral-500 text-center uppercase font-bold w-24">P</th>
                          </tr>
                          <tr className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 font-sans">
                            <th className="p-1.5 border-r border-neutral-800 text-center text-[9px] select-none text-neutral-600 font-bold">#</th>
                            <th className="p-1.5 border-r border-neutral-800 text-center font-bold">순번</th>
                            <th className="p-1.5 border-r border-neutral-800 text-center font-bold">출강일자</th>
                            <th className="p-1.5 border-r border-neutral-800 text-left font-bold pl-3">의뢰 기업명</th>
                            <th className="p-1.5 border-r border-neutral-800 text-left font-bold pl-3">지정 협력사</th>
                            <th className="p-1.5 border-r border-neutral-800 text-left font-bold pl-3">출강 교육 명칭</th>
                            <th className="p-1.5 border-r border-neutral-800 text-center font-bold">지원자격</th>
                            <th className="p-1.5 border-r border-neutral-800 text-center font-bold">배정 주강사</th>
                            <th className="p-1.5 border-r border-neutral-800 text-center font-bold">배정 보조강사</th>
                            <th className="p-1.5 border-r border-neutral-800 text-center font-bold">강의 시간</th>
                            <th className="p-1.5 border-r border-neutral-800 text-center font-bold">예정 인원</th>
                            <th className="p-1.5 border-r border-neutral-800 text-right font-bold pr-3">인당 재료비</th>
                            <th className="p-1.5 border-r border-neutral-800 text-right font-bold pr-3">로열티(M)</th>
                            <th className="p-1.5 border-r border-neutral-800 text-right font-bold pr-3">정산 총 예산</th>
                            <th className="p-1.5 border-r border-neutral-800 text-center font-bold">만족도 평점</th>
                            <th className="p-1.5 border-r border-neutral-800 text-center font-bold">출강 현황</th>
                            <th className="p-1.5 text-center font-bold">예정 정산일 (익월 말일)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lectures.map((lecture, idx) => {
                            let statusText = "모집 중";
                            let statusClass = "text-amber-500 font-bold";
                            if (lecture.status === 'assigned') {
                              statusText = "배정 완료";
                              statusClass = "text-blue-400 font-bold";
                            } else if (lecture.status === 'completed') {
                              if (lecture.settlementStatus === 'completed') {
                                statusText = "✓ 정산 완료";
                                statusClass = "text-emerald-400 font-extrabold";
                              } else {
                                statusText = "⌛ 정산 대기";
                                statusClass = "text-amber-400 font-extrabold";
                              }
                            }

                            return (
                              <tr 
                                key={lecture.id} 
                                className="border-b border-neutral-850 hover:bg-neutral-900/40 transition-colors text-neutral-300 font-mono"
                              >
                                <td className="p-1.5 bg-neutral-900 border-r border-neutral-800 text-neutral-500 text-center font-bold select-none">{idx + 1}</td>
                                <td className="p-1.5 border-r border-neutral-800 text-center font-bold text-amber-500">{idx + 1}</td>
                                <td className="p-1.5 border-r border-neutral-800 text-center">{lecture.date}</td>
                                <td className="p-1.5 border-r border-neutral-800 text-left pl-3 font-sans text-white">{lecture.companyName || '익명 기업'}</td>
                                <td className="p-1.5 border-r border-neutral-800 text-left pl-3 font-sans text-neutral-400">{lecture.partnerCompany || '-'}</td>
                                <td className="p-1.5 border-r border-neutral-800 text-left pl-3 font-sans text-white font-medium truncate max-w-[220px]" title={lecture.title}>{lecture.title}</td>
                                <td className="p-1.5 border-r border-neutral-800 text-center font-sans">
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-400">
                                    {lecture.targetTier.replace('Prestige ', '')}
                                  </span>
                                </td>
                                <td className="p-1.5 border-r border-neutral-800 text-center font-sans text-white font-bold">{lecture.assignedName || '-'}</td>
                                <td className="p-1.5 border-r border-neutral-800 text-center font-sans text-neutral-400">{lecture.assistantName || '-'}</td>
                                <td className="p-1.5 border-r border-neutral-800 text-center text-emerald-400 font-bold">{lecture.mainHours || 0}시간</td>
                                <td className="p-1.5 border-r border-neutral-800 text-center">{lecture.attendees || 0}명</td>
                                <td className="p-1.5 border-r border-neutral-800 text-right pr-3">₩{(lecture.materialCost || 0).toLocaleString()}</td>
                                <td className="p-1.5 border-r border-neutral-800 text-right pr-3 text-amber-400 font-bold">{(lecture.mileageRoyalty || 0).toLocaleString()} M</td>
                                <td className="p-1.5 border-r border-neutral-800 text-right pr-3 text-white font-black">₩{lecture.budget.toLocaleString()}</td>
                                <td className="p-1.5 border-r border-neutral-800 text-center text-amber-400 font-bold">
                                  {lecture.lectureRating !== undefined ? `⭐ ${lecture.lectureRating.toFixed(1)}` : '-'}
                                </td>
                                <td className={`p-1.5 border-r border-neutral-800 text-center font-sans ${statusClass}`}>{statusText}</td>
                                <td className="p-1.5 text-center text-neutral-400">{getNextMonthLastDay(lecture.date)}</td>
                              </tr>
                            );
                          })}

                          {/* Sum total row */}
                          {(() => {
                            const completed = lectures.filter(l => l.status === 'completed');
                            const totHours = lectures.reduce((sum, l) => sum + (l.mainHours || 0), 0);
                            const totAttendees = lectures.reduce((sum, l) => sum + (l.attendees || 0), 0);
                            const totRoyalty = lectures.reduce((sum, l) => sum + (l.mileageRoyalty || 0), 0);
                            const totBudget = lectures.reduce((sum, l) => sum + l.budget, 0);
                            const avgRating = completed.length > 0 
                              ? (completed.reduce((sum, l) => sum + (l.lectureRating || 5.0), 0) / completed.length)
                              : 5.0;

                            return (
                              <tr className="bg-[#217346]/5 border-b border-neutral-800 text-white font-bold">
                                <td className="p-1.5 bg-neutral-900 border-r border-neutral-800 text-neutral-500 text-center font-bold select-none">∑</td>
                                <td className="p-1.5 border-r border-neutral-800 text-center font-sans text-neutral-400" colSpan={7}>합계 (SUM / AVERAGE)</td>
                                <td className="p-1.5 border-r border-neutral-800 text-center"></td>
                                <td className="p-1.5 border-r border-neutral-800 text-center text-[#217346]">{totHours}시간</td>
                                <td className="p-1.5 border-r border-neutral-800 text-center">{totAttendees}명</td>
                                <td className="p-1.5 border-r border-neutral-800 text-right pr-3 text-neutral-500">-</td>
                                <td className="p-1.5 border-r border-neutral-800 text-right pr-3 text-amber-400">{totRoyalty.toLocaleString()} M</td>
                                <td className="p-1.5 border-r border-neutral-800 text-right pr-3 text-[#217346]">₩{totBudget.toLocaleString()}</td>
                                <td className="p-1.5 border-r border-neutral-800 text-center text-amber-500 font-mono">⭐ {avgRating.toFixed(2)}</td>
                                <td className="p-1.5 border-r border-neutral-800 text-center text-neutral-500">-</td>
                                <td className="p-1.5 text-center text-neutral-500">-</td>
                              </tr>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl bg-neutral-950/40 border border-neutral-850 text-center text-neutral-500 text-xs font-semibold">
                      등록된 출강 요청 강의 공고 내역이 없습니다.
                    </div>
                  )}
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
                            <td 
                              className="py-3 font-bold text-white cursor-pointer hover:text-[#D4AF37] group transition-colors"
                              onClick={() => handleViewInstructorFullDetails(u)}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="group-hover:translate-x-0.5 transition-transform">👤</span>
                                <span className="underline decoration-[#D4AF37]/30 underline-offset-4 group-hover:decoration-[#D4AF37]">{u.name}</span>
                              </div>
                              <div className="text-[9px] text-neutral-500 font-normal mt-0.5">{u.profileCard?.title || '소속 강사'}</div>
                            </td>
                            <td className="py-3">
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${getTierColor(u.tier)}`}>
                                {u.tier}
                              </span>
                            </td>
                            <td className="py-3 font-mono font-bold text-neutral-200">{u.lectureCount || 0}회</td>
                            <td className="py-3 font-mono font-bold text-amber-400">⭐ {u.averageRating || '4.50'}</td>
                            <td className="py-3 font-mono font-bold text-emerald-400">
                              {hasRegisteredCurriculum(u.uid) ? `${u.mileage.toLocaleString()} M` : '비공개'}
                            </td>
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
                                <button
                                  onClick={() => handleAdminDeleteUser(u.uid)}
                                  className="px-2 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-900/30 font-bold transition-all text-[9px] cursor-pointer"
                                  title="강사 영구 탈퇴 처리"
                                >
                                  ❌ 강제탈퇴
                                </button>
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

            {adminSubTab === 'programs' && (
              <div className="animate-in fade-in duration-200 space-y-6">
                
                {/* Premium Curriculum Approval Room */}
                <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                  <h3 className="text-sm font-black text-white border-b border-neutral-800 pb-2.5 flex justify-between items-center">
                    <span>💎 KPCIA 명품 자체 개발 교육 과정 승인 심사대</span>
                    <span className="text-[10px] text-neutral-400 font-medium">소속 강사가 제안한 지식재산(IP) 교육과정 승인 관리</span>
                  </h3>

                  <div className="space-y-4">
                    {programs.map(prog => {
                      const royaltyValue = adminProgRoyalties[prog.id] ?? prog.royaltyRate;
                      return (
                        <div key={prog.id} className="p-5 rounded-xl bg-neutral-950 border border-neutral-850 space-y-3.5 text-xs text-left">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-900 pb-2.5">
                            <div>
                              <h4 className="font-extrabold text-white text-sm">{prog.title}</h4>
                              <span className="text-[10px] text-neutral-400 mt-1 block">
                                제안자: <strong className="text-[#D4AF37]">{prog.authorName}</strong> | 등록일자: {prog.createdAt && !isNaN(new Date(prog.createdAt).getTime()) ? new Date(prog.createdAt).toLocaleDateString() : '미지정'}
                              </span>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                              prog.isApproved 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-amber-500/10 text-[#D4AF37] border border-[#D4AF37]/20 animate-pulse'
                            }`}>
                              {prog.isApproved ? '✅ 정식승인 완료' : '⏳ 승인 대기중'}
                            </span>
                          </div>

                          <div className="space-y-2 text-neutral-300">
                            <p className="text-neutral-400 leading-relaxed text-[11px]">{prog.description}</p>
                            <div className="text-[10px] text-neutral-500">
                              🎯 주 교육대상: <span className="text-neutral-300 font-bold">{prog.targetAudience}</span>
                            </div>
                            
                            <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-850 space-y-1 mt-1">
                              <span className="text-[9px] text-neutral-500 font-bold uppercase block mb-1">📖 제안 커리큘럼</span>
                              {prog.curriculum.map((curr, idx) => (
                                <div key={idx} className="text-[10.5px] text-neutral-300 pl-3 relative before:content-['•'] before:absolute before:left-0">
                                  {curr}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Approval and Royalty Rate Controls */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3.5 border-t border-neutral-900/60">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <label className="text-neutral-400 font-bold text-[10px] shrink-0">🪙 지식 IP 로열티 요율 결정 (총 예산의 % 비율):</label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  placeholder="예) 10"
                                  value={royaltyValue}
                                  onChange={(e) => setAdminProgRoyalties({
                                    ...adminProgRoyalties,
                                    [prog.id]: Number(e.target.value)
                                  })}
                                  className="w-16 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-white font-extrabold text-center focus:outline-none focus:border-[#D4AF37]"
                                />
                                <span className="text-white font-black text-xs">%</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                              {!prog.isApproved ? (
                                <>
                                  <button
                                    onClick={() => handleRejectProgram(prog.id)}
                                    className="px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold transition-all cursor-pointer text-[11px]"
                                  >
                                    반려/삭제
                                  </button>
                                  <button
                                    onClick={() => handleApproveProgram(prog.id, royaltyValue)}
                                    className="px-4.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-[#D4AF37] text-neutral-950 font-black hover:brightness-110 shadow-lg shadow-amber-500/10 transition-all cursor-pointer text-[11px]"
                                  >
                                    설정 적용 및 과정 승인
                                  </button>
                                </>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleApproveProgram(prog.id, royaltyValue)}
                                    className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-bold transition-all cursor-pointer text-[11px]"
                                  >
                                    로열티 비율만 수정
                                  </button>
                                  <button
                                    onClick={() => handleRejectProgram(prog.id)}
                                    className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 text-neutral-500 hover:text-red-400 transition-all cursor-pointer text-[11px]"
                                  >
                                    과정 취소
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {programs.length === 0 && (
                      <div className="text-neutral-500 text-center py-4">제안된 명품 교육 과정이 존재하지 않습니다.</div>
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
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black tracking-widest bg-gradient-to-r from-[#F3CD5F] via-[#D4AF37] to-[#C5A02B] bg-clip-text text-transparent font-display">KPCIA</span>
                <span className="text-xs font-bold text-amber-300 font-cursive italic select-none" style={{ fontFamily: "'Dancing Script', cursive" }}>Prestige</span>
                <span className="text-[9px] text-[#D4AF37] border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-1.5 py-0.5 rounded ml-1.5 font-bold uppercase tracking-wider">Digital Seal & Certificate</span>
              </div>
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
                className="w-[210mm] h-[297mm] relative bg-gradient-to-br from-[#FDFBF7] via-[#F5EAD2] to-[#DFCA9F] text-neutral-900 flex flex-col justify-between p-[18mm] border-[6px] border-double border-[#8C6B1A] select-none shadow-2xl font-sans shrink-0 overflow-hidden"
                style={{ width: '210mm', height: '297mm', minWidth: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}
              >
                {/* Luxury gold double border decoration */}
                <div className="absolute inset-[3mm] border border-[#8C6B1A]/40 pointer-events-none"></div>

                {/* Watermark in background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none">
                  <span className="font-display font-black text-[100px] uppercase tracking-widest rotate-[-12deg] text-[#8C6B1A]">KPCIA</span>
                </div>

                {/* Top Title Section */}
                <div className="text-center space-y-3 mt-[10mm]">
                  <div className="text-[10px] text-[#8C6B1A] font-bold tracking-[6px] uppercase">KOREA PRESTIGE INSTRUCTOR ASSOCIATION</div>
                  <h1 className="text-[38px] font-black text-neutral-950 tracking-[24px] pl-[24px] pt-1">위 임 장</h1>
                  <div className="text-[10px] text-neutral-600 font-mono tracking-wider pt-1">
                    증서번호: KPCIA-CERT-2026-{selectedCertificateLecture.id.substring(5, 11).toUpperCase()}
                  </div>
                </div>

                {/* Body Content Section */}
                <div className="px-[10mm] text-left space-y-[8mm] my-auto">
                  <div className="grid grid-cols-5 gap-y-[5mm] text-[13.5px] border-t border-b border-[#8C6B1A]/30 py-[8mm]">
                    <span className="text-[#6B5A3E] col-span-1 font-semibold">성 명:</span>
                    <span className="text-neutral-950 font-black col-span-4 text-[16px]">
                      {selectedCertificateLecture.assignedName || 'KPCIA 정회원'} 강사
                    </span>

                    <span className="text-[#6B5A3E] col-span-1 font-semibold">수탁 기관:</span>
                    <span className="text-neutral-900 font-bold col-span-4 text-[14.5px]">{selectedCertificateLecture.companyName}</span>

                    <span className="text-[#6B5A3E] col-span-1 font-semibold">위임 사항:</span>
                    <span className="text-neutral-950 font-black col-span-4 text-[14.5px] underline decoration-[#8C6B1A]/80 underline-offset-4">
                      {selectedCertificateLecture.title}
                    </span>

                    <span className="text-[#6B5A3E] col-span-1 font-semibold">위임 기간:</span>
                    <span className="text-neutral-800 col-span-4">{selectedCertificateLecture.date} ({selectedCertificateLecture.time})</span>

                    <span className="text-[#6B5A3E] col-span-1 font-semibold">정산 예산:</span>
                    <span className="text-[#8C1D1D] font-black col-span-4 text-[14.5px]">₩{selectedCertificateLecture.budget.toLocaleString()} (지적 IP 연계 필)</span>
                  </div>

                  <p className="text-[13.5px] text-neutral-800 font-medium leading-relaxed text-justify indent-[8px] pt-[2mm]">
                    귀하는 비영리 법인 한국프레스티지기업강사협회의 정회원으로서, 본 협회가 수탁받은 상기 기업 교육 과정의 주강사 및 위임 전문가로 정식 위임되어 출강함을 승인하는 바, 본 위임장을 수여합니다.
                  </p>
                </div>

                {/* Bottom Stamp and Date Section */}
                <div className="flex flex-col items-center space-y-6 mb-[10mm] text-center w-full">
                  <div className="space-y-1">
                    <div className="text-[12px] text-neutral-600 font-semibold font-mono">발행일자: 2026년 07월 16일</div>
                    <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">KPCIA Verification Office Certified</div>
                  </div>

                  {/* President Seal Visual stamp */}
                  <div className="relative flex items-center justify-center pt-2">
                    <span className="text-[17px] font-black text-neutral-950 tracking-[4px] relative z-10 mr-[20px]">
                      비영리 법인 한국프레스티지기업강사협회 회장
                    </span>
                    {/* Official red square seal (사용인감) */}
                    <div className="absolute right-[-20px] w-[60px] h-[60px] rounded-sm border-[3px] border-[#C22727] bg-transparent flex items-center justify-center rotate-3 select-none pointer-events-none opacity-95">
                      <span className="text-[#C22727] font-sans font-black text-[9.5px] leading-[1.1] text-center tracking-tighter">
                        한국프레<br />스티지기<br />업강사협<br />회인장
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
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black tracking-widest bg-gradient-to-r from-[#F3CD5F] via-[#D4AF37] to-[#C5A02B] bg-clip-text text-transparent font-display">KPCIA</span>
                <span className="text-xs font-bold text-amber-300 font-cursive italic select-none" style={{ fontFamily: "'Dancing Script', cursive" }}>Prestige</span>
                <span className="text-[9px] text-[#D4AF37] border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-1.5 py-0.5 rounded ml-1.5 font-black uppercase tracking-wider">상호성실성 평가</span>
              </div>
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
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black tracking-widest bg-gradient-to-r from-[#F3CD5F] via-[#D4AF37] to-[#C5A02B] bg-clip-text text-transparent font-display">KPCIA</span>
              <span className="text-xs font-bold text-amber-300 font-cursive italic select-none" style={{ fontFamily: "'Dancing Script', cursive" }}>Prestige</span>
              <span className="text-[9px] text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-1.5 py-0.5 rounded font-bold ml-1.5">공식 인증 사무국</span>
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
            <h4 className="font-bold text-neutral-300 font-sans">협회 대표 사무국 정보</h4>
            <ul className="space-y-1.5 text-neutral-400 font-sans">
              <li>📍 <span className="text-neutral-500">주소:</span> 충청북도 충주시 성남동 365</li>
              <li>📞 <span className="text-neutral-500">연락처:</span> 010-6400-0924</li>
              <li>📧 <span className="text-neutral-500">이메일:</span> insight9edu@naver.com</li>
              <li className="pt-1 border-t border-neutral-900 text-[11px] text-neutral-500 leading-relaxed">
                대표자: 구교준 | 고유번호: 702-82-02115 (비영리법인)<br />
                개인정보보호책임자: 구교준 | 협력 운영: 인사이트9교육연구소
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-neutral-900/60 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-[10px]">
          <span>© 2026 KPCIA 한국프레스티지기업강사협회. All Rights Reserved.</span>
          <div className="flex gap-4">
            <span onClick={() => setShowFooterTermsModal(true)} className="hover:text-neutral-300 cursor-pointer transition-colors">이용약관</span>
            <span onClick={() => setShowFooterPrivacyModal(true)} className="hover:text-amber-400 text-neutral-300 font-bold cursor-pointer transition-colors underline decoration-amber-400/30 underline-offset-4">개인정보처리방침</span>
            <span onClick={() => setShowFooterIPModal(true)} className="hover:text-neutral-300 cursor-pointer transition-colors">지적재산권 규정</span>
          </div>
        </div>
      </footer>

      {/* 📜 FOOTER LEGAL MODAL: 이용약관 */}
      {showFooterTermsModal && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-auto font-sans p-6 text-left">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span className="text-amber-400">📜</span>
                <span>KPCIA 한국프레스티지기업강사협회 이용약관</span>
              </h3>
              <button 
                onClick={() => setShowFooterTermsModal(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="h-96 overflow-y-auto bg-neutral-950 p-4 rounded-xl border border-neutral-850 text-xs text-neutral-300 space-y-4 leading-relaxed">
              <p className="font-extrabold text-[#D4AF37] text-sm">제1장 총칙</p>
              <p><strong>제1조 (목적)</strong><br />본 약관은 비영리 법인 한국프레스티지기업강사협회(이하 &apos;협회&apos;)가 제공하는 매칭 플랫폼, 출강 위임장 디지털 발행, 저작권 교육과정 공유 및 마일리지 누적 정산 시스템 등의 서비스 이용과 관련하여 협회와 소속 강사 회원 간의 권리, 의무, 자격 심사 및 서비스 이용에 관한 제반 사항을 규정함을 목적으로 합니다.</p>
              <p><strong>제2조 (용어의 정의)</strong><br />1. &apos;서비스&apos;라 함은 협회가 홈페이지를 통해 정회원들에게 제공하는 강사 프로필 노출, 기업 출강 매칭 제안, 디지털 위임장 발급, 마일리지 정산 등을 포함하는 제반 시스템을 의미합니다.<br />2. &apos;강사 회원(또는 정회원)&apos;이라 함은 본 약관 및 개인정보 동의를 거쳐 가입을 신청하고 협회 마스터실의 공식 승인 절차를 거쳐 강의 권리를 위임받은 명품 사외 강사를 의미합니다.</p>
              
              <p className="font-extrabold text-[#D4AF37] text-sm pt-2">제2장 서비스 이용 계약 및 가입</p>
              <p><strong>제3조 (이용 신청 및 승인)</strong><br />1. 가입 희망자는 협회가 요구하는 기본 프로필, 학력, 이력 사항, 전문 분야를 충실히 기입하고 약관에 동의하여 가입을 신청합니다.<br />2. 가입은 단순 기입만으로 완료되지 않으며, 협회 마스터실의 엄격한 이력 심사 후 최종 승인(Approved)을 득해야 정회원의 법적 자격을 위임받고 활동할 수 있습니다.</p>
              <p><strong>제4조 (회원의 의무 및 도덕율)</strong><br />1. 회원은 출강 확정 시 최고의 강사 품격을 유지하며 성실하게 강의를 진행해야 합니다.<br />2. 현장 담당자가 추가 강의/예산 문의 시, 협회와 긴밀히 조율할 수 있도록 안내해야 하며, 임의로 사적 계약을 유치해서는 안 됩니다.</p>
              
              <p className="font-extrabold text-[#D4AF37] text-sm pt-2">제3장 저작권 및 마일리지</p>
              <p><strong>제5조 (지식 저작권 교육과정 및 로열티)</strong><br />1. 회원은 자신의 창작물인 독창적 강의안 및 과정을 카탈로그에 등록 요청할 수 있습니다.<br />2. 승인된 저작권 교과목에 연계하여 출강이 이루어질 경우 협회 규정에 의거한 로열티 마일리지가 정상 누적 정산됩니다.</p>
            </div>
            <div className="mt-5 text-right">
              <button 
                onClick={() => setShowFooterTermsModal(false)}
                className="px-5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white font-bold transition-all cursor-pointer text-xs"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📜 FOOTER LEGAL MODAL: 개인정보처리방침 (Strict Compliance) */}
      {showFooterPrivacyModal && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-auto font-sans p-6 text-left">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span className="text-emerald-400">🛡️</span>
                <span>KPCIA 한국프레스티지기업강사협회 개인정보처리방침</span>
              </h3>
              <button 
                onClick={() => setShowFooterPrivacyModal(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="h-96 overflow-y-auto bg-neutral-950 p-4 rounded-xl border border-neutral-850 text-xs text-neutral-300 space-y-4 leading-relaxed">
              <p className="text-neutral-400 leading-relaxed bg-neutral-900 p-3 rounded-lg border border-neutral-850">
                본 방침은 개인정보 보호법 제30조에 따라 이용자의 개인정보를 보호하고 관련 고충을 신속하게 처리할 수 있도록 하기 위하여 수립·공개하는 공식 개인정보처리방침입니다.
              </p>
              
              <p className="font-extrabold text-amber-400 text-sm">1. 수집하는 개인정보의 항목 및 수집 방법</p>
              <p>협회는 최초 강사 정회원 등록 신청 시 원활한 매칭 지원을 위해 아래와 같은 필수/선택 항목을 수집합니다.<br />
              - <strong>필수 항목:</strong> 성명, 로그인ID, 비밀번호, 성별, 생년월일, 휴대전화번호, 이메일 주소, 학력/강의 이력, 주요 대표 전문분야, 한줄소개<br />
              - <strong>선택 항목:</strong> 블로그/SNS 웹사이트 주소, 정비 포트폴리오 자료 등</p>

              <p className="font-extrabold text-amber-400 text-sm pt-2">2. 개인정보의 수집 및 이용 목적</p>
              <p>- <strong>정회원 신원 확인:</strong> 이력 적격성 심사 및 강사 등급 승격 처리<br />
              - <strong>출강 매칭 및 증서 발행:</strong> 출강 공고 추천, 매칭 시 디지털 위임장 발급 및 주최측 전송<br />
              - <strong>정산 및 리워드 관리:</strong> 로열티 마일리지 적립, 누적 출강료 정산금 지급 대행</p>

              <p className="font-extrabold text-amber-400 text-sm pt-2">3. 개인정보의 제3자 제공에 관한 사항 (중요)</p>
              <p className="p-3 bg-neutral-900/60 rounded border border-neutral-800">
                협회는 원활한 기업 출강 연계를 위해 수집한 개인정보 중 일부를 제3자(출강을 신청한 기업 및 주최 교육기관)에게 제공합니다.<br />
                - <strong>제공받는 자:</strong> 실시간 출강 공고를 게시하고 강사 선발을 의뢰한 위탁 기업 및 기관<br />
                - <strong>제공하는 항목:</strong> 성명, 소속 전문 등급, 강의 이력서, 전문 키워드, 대표 소개글 (배정이 최종 확정된 경우 연락처 제공)<br />
                - <strong>제공 목적:</strong> 적격성 심사 및 강사 배정 승인, 원활한 강의 조율<br />
                - <strong>보유 및 이용기간:</strong> 강의 매칭 목적 달성 후 즉시 파기
              </p>

              <p className="font-extrabold text-amber-400 text-sm pt-2">4. 개인정보의 보유 및 이용 기간</p>
              <p>협회는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 회원 탈퇴 시까지 보관을 원칙으로 하며 법령의 규정에 따라 보존할 필요가 있는 경우 관련 법령이 정한 기간 동안 개인정보를 보관합니다.</p>

              <p className="font-extrabold text-amber-400 text-sm pt-2">5. 정보주체의 권리·의무 및 행사방법</p>
              <p>정보주체는 언제든지 등록되어 있는 자신의 개인정보를 열람하거나 수정할 수 있으며, 가입 해지(동의 철회)를 요구할 수 있습니다.</p>

              <p className="font-extrabold text-amber-400 text-sm pt-2">6. 개인정보 보호책임자 지정</p>
              <p>이용자의 개인정보를 보호하고 개인정보와 관련한 고충을 처리하기 위하여 다음과 같이 개인정보 보호책임자를 지정하고 있습니다.<br />
              - <strong>개인정보 보호책임자:</strong> 구교준 대표<br />
              - <strong>연락처:</strong> 010-6400-0924 | insight9edu@naver.com</p>
            </div>
            <div className="mt-5 text-right">
              <button 
                onClick={() => setShowFooterPrivacyModal(false)}
                className="px-5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white font-bold transition-all cursor-pointer text-xs"
              >
                동의 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📜 FOOTER LEGAL MODAL: 지적재산권 규정 */}
      {showFooterIPModal && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-auto font-sans p-6 text-left">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span className="text-amber-400">💡</span>
                <span>KPCIA 지식 저작권 보호 및 지식 IP 로열티 운영 규정</span>
              </h3>
              <button 
                onClick={() => setShowFooterIPModal(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="h-96 overflow-y-auto bg-neutral-950 p-4 rounded-xl border border-neutral-850 text-xs text-neutral-300 space-y-4 leading-relaxed">
              <p className="text-neutral-400 leading-relaxed">
                KPCIA 한국프레스티지기업강사협회는 우수 강사진이 독자적으로 연구·개발한 교육 프로그램과 지적 재산(IP)의 침해를 방지하고, 이를 통한 공정하고 투명한 로열티 누적 정산 문화를 확립하는 것을 최우선 가치로 삼습니다.
              </p>
              
              <p className="font-extrabold text-[#D4AF37] text-sm">제1조 (교육 프로그램 저작권의 귀속)</p>
              <p>1. 정회원이 자체 기획·설계하여 협회 카탈로그에 등록한 교육과정의 저작권 및 지적재산권은 전적으로 최초 개발한 정회원에게 귀속됩니다.<br />
              2. 협회는 본 매칭 플랫폼을 통해 해당 프로그램을 대외 홍보하고 기업 출강으로 연계할 수 있는 비독점적 라이선스 권한만을 위임받습니다.</p>

              <p className="font-extrabold text-[#D4AF37] text-sm pt-2">제2조 (저작권의 침해 금지)</p>
              <p>1. 협회 회원 및 제휴 기관은 타 회원이 카탈로그에 공유한 강의 계획서, 교안 디자인, 교육 가이드라인을 무단으로 모방하거나 허가 없이 타 출강에 유용해서는 안 됩니다.<br />
              2. 무단 복제 및 상업적 무단 도용 적발 시 저작권법 제136조 등에 의거하여 민·형사상의 상응하는 법적 책임 조치가 전제됩니다.</p>

              <p className="font-extrabold text-[#D4AF37] text-sm pt-2">제3조 (지식 IP 로열티 마일리지 지급 구조)</p>
              <p>1. 회원이 자체 설계한 교육 프로그램이 다른 강사에 의해 기업 출강 매칭 시 연결되는 경우, 승인 시점에 확정된 지식 IP 로열티 비율(총 정산 예산의 % 비율)에 해당하는 로열티 마일리지가 자동 누계 정산됩니다.<br />
              2. 적립된 저작권료 마일리지는 마스터실의 누적 통계에 의거하여 지급 신청 시 현금으로 정상 정산 지급됩니다.</p>
            </div>
            <div className="mt-5 text-right">
              <button 
                onClick={() => setShowFooterIPModal(false)}
                className="px-5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white font-bold transition-all cursor-pointer text-xs"
              >
                규정 확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔐 AUTH LOGIN & REGISTER MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative my-auto font-sans">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black tracking-widest bg-gradient-to-r from-[#F3CD5F] via-[#D4AF37] to-[#C5A02B] bg-clip-text text-transparent font-display">KPCIA</span>
                <span className="text-xs font-bold text-amber-300 font-cursive italic select-none" style={{ fontFamily: "'Dancing Script', cursive" }}>Prestige</span>
                <span className="text-[8px] text-[#D4AF37] border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-1 rounded ml-1.5 font-bold uppercase tracking-wider">PORTAL</span>
              </div>
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
                      onChange={(e) => {
                        if (e.target.checked) {
                          setShowTermsModal(true);
                        } else {
                          setRegTermsAccepted(false);
                        }
                      }}
                      className="mt-0.5 cursor-pointer accent-[#D4AF37] w-3.5 h-3.5"
                    />
                    <label 
                      onClick={() => setShowTermsModal(true)}
                      className="cursor-pointer leading-normal select-none text-neutral-300 hover:text-white transition-all font-bold"
                    >
                      KPCIA 한국프레스티지기업강사협회 정회원 가입 약관 및 개인정보 수집·이용 동의 (필수 - 클릭하여 약관 보기)
                    </label>
                  </div>

                  {/* Terms Modal Popup */}
                  {showTermsModal && (
                    <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4 text-left shadow-2xl">
                        <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
                          <span>📜 KPCIA 한국프레스티지기업강사협회 정회원 약관</span>
                        </h3>
                        
                        <div className="h-64 overflow-y-auto bg-neutral-950 p-4 rounded-xl border border-neutral-850 text-[11px] text-neutral-300 space-y-3 leading-relaxed">
                          <p className="font-extrabold text-[#D4AF37] text-xs">【 한국프레스티지기업강사협회 정회원 가입 약관 】</p>
                          
                          <div className="space-y-2">
                            <p><strong>제 1 조 (목적)</strong><br />본 약관은 KPCIA 한국프레스티지기업강사협회(이하 &apos;협회&apos;)가 제공하는 명품 기업 강사 매칭, 디지털 출강 위임장 발행, 지식 저작권 교육과정 공유 및 마일리지 정산 시스템 등의 서비스 이용과 관련하여 협회와 소속 강사 회원 간의 권리, 의무 및 제반 절차를 규정함을 목적으로 합니다.</p>
                            <p><strong>제 2 조 (정회원 가입 신청 및 승인)</strong><br />1. 모든 강사 회원은 본 약관 및 개인정보 수집·이용에 동의한 후 회원 가입을 신청할 수 있습니다.<br />2. 가입 신청 후 관리자(마스터실)의 이력 검토 및 소속 자격 심사 후 최종 승인(isApproved)이 완료되어야 정회원 혜택과 실시간 출강 요청 지원이 공식 활성화됩니다.</p>
                            <p><strong>제 3 조 (자체 개발 교육과정 및 지식 IP 로열티)</strong><br />1. 정회원은 자신의 교육 창의력과 공예, 캘리, 팝아트 등 자연 친화적 지식재산을 활용해 설계한 자체 교육과정을 제안할 수 있습니다.<br />2. 제안된 교육과정은 마스터실의 승인 및 지정 로열티 비율(총 예산의 % 비율) 확정 후 정식 카탈로그에 노출되며, 해당 과정에 연계되어 다른 기업 출강 매칭 시 지정된 비율에 따른 로열티 마일리지가 지급됩니다.</p>
                          </div>

                          <p className="font-extrabold text-[#D4AF37] text-xs pt-1">【 개인정보 수집 및 이용 동의 (필수) 】</p>
                          <div className="space-y-2 text-neutral-400">
                            <p>1. 수집 항목: 성명, 아이디, 비밀번호, 성별, 생년월일, 연락처, 이메일, 전문 분야, 학력/이력 사항, SNS/블로그 링크, 프로필 한줄 소개 등<br />
                            2. 수집 목적: 정회원 신원 확인, 등급 부여, 출강 공고 추천, 매칭 시 위임장/확약서 디지털 증서 발행, 마일리지 누적 및 정산 서비스 제공<br />
                            3. 보유 기간: 회원 탈퇴 시까지 또는 법정 의무 보유 기간까지 보관합니다.</p>
                          </div>

                          <p className="font-extrabold text-[#D4AF37] text-xs pt-1">【 개인정보 제3자 제공 동의 (필수) 】</p>
                          <div className="space-y-2 text-neutral-400">
                            <p>1. 제공받는 자: 실시간 출강 공고를 등록하고 강사를 매칭받고자 하는 기업 및 주최 교육 기관<br />
                            2. 제공하는 항목: 성명, 전문 강사 등급, 이력/학력 사항, 대표 전문 분야 및 소개글, 대표 전문 키워드, 연락처(강의 최종 배정 승인 완료 시에 한함)<br />
                            3. 제공받는 자의 이용 목적: 출강 강사단 적격성 검토 및 최종 강의 승인, 디지털 위임장 발급 및 출강 수강 조율<br />
                            4. 제공받는 자의 보유 및 이용 기간: 교육 목적 달성 및 출강 계약 완료 시 즉시 파기</p>
                          </div>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setRegTermsAccepted(false);
                              setShowTermsModal(false);
                            }}
                            className="flex-1 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white text-xs font-bold transition-all cursor-pointer text-center"
                          >
                            동의하지 않음
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRegTermsAccepted(true);
                              setShowTermsModal(false);
                              triggerToast("📜 약관 및 개인정보 동의가 수락되었습니다.", "success");
                            }}
                            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-[#D4AF37] text-neutral-950 font-black text-xs transition-all cursor-pointer text-center"
                          >
                            동의 및 수락함
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

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

      {/* 👑 ADMIN ONLY: MEMBER REGISTRATION DETAIL VIEW & EDIT MODAL */}
      {viewingInstructorDetail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-auto font-sans">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-800 bg-neutral-950/60 flex justify-between items-center">
              <div className="text-left">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-black tracking-widest bg-gradient-to-r from-[#F3CD5F] via-[#D4AF37] to-[#C5A02B] bg-clip-text text-transparent font-display">KPCIA</span>
                  <span className="text-xs font-bold text-amber-300 font-cursive italic select-none" style={{ fontFamily: "'Dancing Script', cursive" }}>Prestige</span>
                  <span className="text-[9px] text-[#D4AF37] border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-1.5 py-0.5 rounded ml-1.5 font-bold uppercase tracking-wider">강사 관리</span>
                </div>
                <h3 className="text-sm font-bold text-neutral-200 mt-1">
                  👤 {viewingInstructorDetail.name} 강사의 가입 정보 및 자격 조절
                </h3>
              </div>
              <button 
                onClick={() => {
                  setViewingInstructorDetail(null);
                  setIsEditingDetail(false);
                }}
                className="text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs text-left">
              
              {!isEditingDetail ? (
                // VIEW MODE: Show all registration details
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400 font-bold">승인 현황:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        viewingInstructorDetail.isApproved 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {viewingInstructorDetail.isApproved ? '정회원 승인 완료' : '가입 승인 대기'}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      가입 일자: {viewingInstructorDetail.createdAt && !isNaN(new Date(viewingInstructorDetail.createdAt).getTime()) ? new Date(viewingInstructorDetail.createdAt).toLocaleDateString() : '미지정'}
                    </div>
                  </div>

                  {/* Primary Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1 bg-neutral-950/50 p-3 rounded-xl border border-neutral-850">
                      <span className="text-neutral-500 text-[10px] font-bold block">강사 성함</span>
                      <span className="text-neutral-200 font-extrabold text-xs">{viewingInstructorDetail.name}</span>
                    </div>
                    <div className="space-y-1 bg-neutral-950/50 p-3 rounded-xl border border-neutral-850">
                      <span className="text-neutral-500 text-[10px] font-bold block">로그인 ID</span>
                      <span className="text-neutral-300 font-mono font-bold text-xs">{viewingInstructorDetail.loginId || '미지정'}</span>
                    </div>
                    <div className="space-y-1 bg-neutral-950/50 p-3 rounded-xl border border-neutral-850">
                      <span className="text-neutral-500 text-[10px] font-bold block">로그인 비밀번호</span>
                      <span className="text-neutral-300 font-mono text-xs">{viewingInstructorDetail.password || '••••'}</span>
                    </div>
                    <div className="space-y-1 bg-neutral-950/50 p-3 rounded-xl border border-neutral-850">
                      <span className="text-neutral-500 text-[10px] font-bold block">소속 기관/기업/공방</span>
                      <span className="text-neutral-200 font-bold text-xs">{viewingInstructorDetail.organizationName || '개인 자격'}</span>
                    </div>
                    <div className="space-y-1 bg-neutral-950/50 p-3 rounded-xl border border-neutral-850">
                      <span className="text-neutral-500 text-[10px] font-bold block">연락처</span>
                      <span className="text-neutral-200 font-bold text-xs">{viewingInstructorDetail.profileCard?.contactPhone || '미지정'}</span>
                    </div>
                    <div className="space-y-1 bg-neutral-950/50 p-3 rounded-xl border border-neutral-850">
                      <span className="text-neutral-500 text-[10px] font-bold block">공식 이메일</span>
                      <span className="text-neutral-200 font-bold text-xs">{viewingInstructorDetail.email}</span>
                    </div>
                  </div>

                  {/* Association Milestones / Balance */}
                  <div className="p-4 rounded-xl bg-[#0e0e10] border border-neutral-850 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <span className="text-neutral-500 text-[10px] font-bold block">자격 등급</span>
                      <span className={`inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded ${getTierColor(viewingInstructorDetail.tier)}`}>
                        {viewingInstructorDetail.tier}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[10px] font-bold block">출강 실적</span>
                      <span className="text-neutral-200 font-mono font-black text-xs block mt-1">{viewingInstructorDetail.lectureCount || 0}회</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[10px] font-bold block">마일리지</span>
                      <span className="text-emerald-400 font-mono font-black text-xs block mt-1">{(viewingInstructorDetail.mileage || 0).toLocaleString()} M</span>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-neutral-400 border-b border-neutral-800 pb-1 flex items-center gap-1.5">
                      <span>🪪 프로필 프리젠테이션 정보</span>
                    </h4>
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-850 space-y-1">
                          <span className="text-neutral-500 text-[9px] font-bold block">직함 및 전문 타이틀</span>
                          <span className="text-neutral-200 font-bold text-xs block">{viewingInstructorDetail.profileCard?.title || '미지정'}</span>
                        </div>
                        <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-850 space-y-1">
                          <span className="text-neutral-500 text-[9px] font-bold block">활동 지역 및 계좌</span>
                          <div className="text-neutral-200 font-bold text-xs space-y-0.5">
                            <div>📍 지역: {viewingInstructorDetail.profileCard?.region || '미지정'}</div>
                            <div>💳 계좌: {viewingInstructorDetail.profileCard?.bankAccount || '미등록'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-850 space-y-1">
                        <span className="text-neutral-500 text-[9px] font-bold block">대표 전문 키워드</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {viewingInstructorDetail.profileCard?.specialties && viewingInstructorDetail.profileCard.specialties.length > 0 ? (
                            viewingInstructorDetail.profileCard.specialties.map((spec, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] font-semibold">
                                #{spec}
                              </span>
                            ))
                          ) : (
                            <span className="text-neutral-500">등록된 키워드가 없습니다.</span>
                          )}
                        </div>
                      </div>

                      <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-850 space-y-1">
                        <span className="text-neutral-500 text-[9px] font-bold block">간략 프로필 소개 (Bio)</span>
                        <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">{viewingInstructorDetail.profileCard?.bio || '한줄 소개가 존재하지 않습니다.'}</p>
                      </div>

                      <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-850 space-y-1">
                        <span className="text-neutral-500 text-[9px] font-bold block">SNS 및 포트폴리오 블로그 링크</span>
                        {viewingInstructorDetail.profileCard?.websiteUrl ? (
                          <a 
                            href={viewingInstructorDetail.profileCard.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[#D4AF37] hover:underline font-bold break-all flex items-center gap-1.5"
                          >
                            <span>🔗 {viewingInstructorDetail.profileCard.websiteUrl}</span>
                          </a>
                        ) : (
                          <span className="text-neutral-500">등록된 외부 포트폴리오 채널이 없습니다.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="flex gap-3 pt-4 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => handleToggleUserApproval(viewingInstructorDetail.uid)}
                      className={`flex-1 py-2.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                        viewingInstructorDetail.isApproved
                          ? 'border-red-950 bg-red-500/5 hover:bg-red-500/10 text-red-400'
                          : 'border-emerald-950 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {viewingInstructorDetail.isApproved ? '⏳ 정회원 승인 취소하기' : '✅ 즉시 정회원 가입 승인'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingDetail(true)}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-center transition-all cursor-pointer text-[11px] flex items-center justify-center gap-1.5"
                    >
                      <span>✏️ 이 회원 정보 수정하기</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdminDeleteUser(viewingInstructorDetail.uid)}
                      className="py-2.5 px-3 rounded-xl border border-red-900 bg-red-950/40 hover:bg-red-900/60 text-red-400 font-bold text-center transition-all cursor-pointer text-[11px] flex items-center justify-center gap-1"
                      title="강사 영구 탈퇴 처리"
                    >
                      <span>❌ 강제탈퇴</span>
                    </button>
                  </div>
                </div>
              ) : (
                // EDIT MODE: Form to update everything
                <form onSubmit={handleSaveInstructorFullDetailEdit} className="space-y-4">
                  <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 text-[10px] text-neutral-400 leading-normal mb-2">
                    💡 <strong>실시간 프로필 마스터 편집실:</strong> 해당 강사의 가입 계정 정보 및 프로필 카드 사양을 직접 교정합니다. 저장 시 즉시 데이터베이스에 반영됩니다.
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 text-left">
                      <label className="text-neutral-400 font-semibold block">강사 성함 *</label>
                      <input
                        type="text"
                        value={editInstName}
                        onChange={(e) => setEditInstName(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-neutral-400 font-semibold block">소속 기관/공방 이름</label>
                      <input
                        type="text"
                        value={editInstOrgName}
                        onChange={(e) => setEditInstOrgName(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 text-left">
                      <label className="text-neutral-400 font-semibold block">가입 로그인 ID</label>
                      <div className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-2.5 py-2 text-neutral-500 font-mono text-xs select-none">
                        {viewingInstructorDetail.loginId || '미설정'} (아이디 변경 불가)
                      </div>
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-neutral-400 font-semibold block">비밀번호 재설정</label>
                      <input
                        type="text"
                        value={editInstPassword}
                        onChange={(e) => setEditInstPassword(e.target.value)}
                        placeholder="새로운 비밀번호"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 text-left">
                      <label className="text-neutral-400 font-semibold block">연락처 *</label>
                      <input
                        type="text"
                        value={editInstPhone}
                        onChange={(e) => setEditInstPhone(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-neutral-400 font-semibold block">공식 이메일 주소 *</label>
                      <input
                        type="email"
                        value={editInstEmail}
                        onChange={(e) => setEditInstEmail(e.target.value)}
                        required
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 text-left">
                      <label className="text-neutral-400 font-semibold block">강사 자격 등급 *</label>
                      <select
                        value={editInstTier}
                        onChange={(e) => setEditInstTier(e.target.value as InstructorTier)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs cursor-pointer font-bold text-[#D4AF37]"
                      >
                        <option value="Prestige Member">Prestige Member</option>
                        <option value="Prestige Associate">Prestige Associate</option>
                        <option value="Prestige Professional">Prestige Professional</option>
                        <option value="Prestige Master">Prestige Master</option>
                        <option value="Prestige Elite">Prestige Elite</option>
                        <option value="Prestige Legend">Prestige Legend</option>
                      </select>
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-neutral-400 font-semibold block">보유 마일리지 잔액 (M)</label>
                      <input
                        type="number"
                        value={editInstMileage}
                        onChange={(e) => setEditInstMileage(Number(e.target.value))}
                        min={0}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 text-left">
                      <label className="text-neutral-400 font-semibold block">활동 주요 지형/지역</label>
                      <input
                        type="text"
                        value={editInstRegion}
                        onChange={(e) => setEditInstRegion(e.target.value)}
                        placeholder="예) 서울, 경기, 대전 등"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-neutral-400 font-semibold block">정산 계좌 정보</label>
                      <input
                        type="text"
                        value={editInstBankAccount}
                        onChange={(e) => setEditInstBankAccount(e.target.value)}
                        placeholder="예) 신한은행 110-234-567890"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-neutral-400 font-semibold block">직함 및 전문 타이틀</label>
                    <input
                      type="text"
                      value={editInstTitle}
                      onChange={(e) => setEditInstTitle(e.target.value)}
                      placeholder="예) 웰니스 감성 힐링 테라피 전문 전임강사"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-neutral-400 font-semibold block">대표 키워드 (쉼표 구분)</label>
                    <input
                      type="text"
                      value={editInstSpecialties}
                      onChange={(e) => setEditInstSpecialties(e.target.value)}
                      placeholder="예) 원예치료, 아로마힐링, 팝아트"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-neutral-400 font-semibold block">SNS 또는 블로그 포트폴리오 URL</label>
                    <input
                      type="url"
                      value={editInstSnsLink}
                      onChange={(e) => setEditInstSnsLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-neutral-400 font-semibold block">한줄 프로필 소개 (Bio)</label>
                    <textarea
                      value={editInstBio}
                      onChange={(e) => setEditInstBio(e.target.value)}
                      rows={3}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs leading-normal"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingDetail(false)}
                      className="w-1/3 py-2.5 rounded-xl border border-neutral-800 text-neutral-400 font-bold hover:bg-neutral-800 text-center transition-all cursor-pointer text-xs"
                    >
                      돌아가기
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-[#D4AF37] text-neutral-950 font-black text-center transition-all cursor-pointer text-xs"
                    >
                      💾 모든 회원 정보 저장 완료
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 🪪 INSTRUCTOR DETAIL MODAL (Digital Business Card view) */}
      {selectedInstructorCard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative my-auto font-sans">
            
            {/* Header */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black tracking-widest bg-gradient-to-r from-[#F3CD5F] via-[#D4AF37] to-[#C5A02B] bg-clip-text text-transparent font-display">KPCIA</span>
                <span className="text-xs font-bold text-amber-300 font-cursive italic select-none" style={{ fontFamily: "'Dancing Script', cursive" }}>Prestige Card</span>
                <span className="text-[9px] text-[#D4AF37] border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-1.5 py-0.5 rounded ml-1.5 font-bold uppercase tracking-wider">공식 프로필</span>
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


      {/* 👑 KPCIA LECTURE EDIT & REFINEMENT MODAL */}
      {editingLecture && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-auto font-sans text-xs">
            
            {/* Header */}
            <div className="p-5 border-b border-neutral-800 bg-neutral-950/60 flex justify-between items-center">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black tracking-widest bg-gradient-to-r from-[#F3CD5F] via-[#D4AF37] to-[#C5A02B] bg-clip-text text-transparent font-display">KPCIA</span>
                <span className="text-xs font-bold text-amber-300 font-cursive italic select-none" style={{ fontFamily: "'Dancing Script', cursive" }}>Prestige</span>
                <span className="text-[9px] text-[#D4AF37] border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-1.5 py-0.5 rounded ml-1.5 font-bold uppercase tracking-wider">출강 정보 수정 및 보완</span>
              </div>
              <button 
                onClick={() => setEditingLecture(null)}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Edit Form */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1 text-left">
                  <label className="text-neutral-400 font-semibold block">강의 명칭 *</label>
                  <input
                    type="text"
                    value={editLecTitle}
                    onChange={(e) => setEditLecTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-neutral-400 font-semibold block">출강 대상 기업/기관 *</label>
                  <input
                    type="text"
                    value={editLecCompany}
                    onChange={(e) => setEditLecCompany(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-neutral-400 font-semibold block">지정 협력사 (선택)</label>
                  <input
                    type="text"
                    value={editLecPartner}
                    onChange={(e) => setEditLecPartner(e.target.value)}
                    placeholder="공동 주관하는 협력사명을 기입하세요"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1 text-left md:col-span-2">
                  <label className="text-neutral-400 font-semibold block">상세 교육 개요 및 위임 가이드 *</label>
                  <textarea
                    value={editLecDesc}
                    onChange={(e) => setEditLecDesc(e.target.value)}
                    rows={4}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] leading-normal"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-neutral-400 font-semibold block">출강 지원 자격 등급 제한 *</label>
                  <select
                    value={editLecTier}
                    onChange={(e) => setEditLecTier(e.target.value as InstructorTier)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                  >
                    <option value="Prestige Member">Prestige Member (일반)</option>
                    <option value="Prestige Master">Prestige Master (우수)</option>
                    <option value="Prestige Royal">Prestige Royal (수석)</option>
                    <option value="Prestige Black">Prestige Black (명예/최우수)</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-neutral-400 font-semibold block">출강 일자 *</label>
                  <input
                    type="date"
                    value={editLecDate}
                    onChange={(e) => setEditLecDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-neutral-400 font-semibold block">상세 시간 가이드 *</label>
                  <input
                    type="text"
                    value={editLecTime}
                    onChange={(e) => setEditLecTime(e.target.value)}
                    placeholder="예) 10:00~13:00"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-neutral-400 font-semibold block">강의 총 시간 *</label>
                  <input
                    type="text"
                    value={editLecDuration}
                    onChange={(e) => setEditLecDuration(e.target.value)}
                    placeholder="예) 3시간"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1 text-left md:col-span-2">
                  <label className="text-neutral-400 font-semibold block">출강 상세 장소 *</label>
                  <input
                    type="text"
                    value={editLecLocation}
                    onChange={(e) => setEditLecLocation(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-neutral-400 font-semibold block">현장 담당자 성함</label>
                  <input
                    type="text"
                    value={editLecManagerName}
                    onChange={(e) => setEditLecManagerName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    placeholder="예) 김성진"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-neutral-400 font-semibold block">현장 담당자 연락처</label>
                  <input
                    type="tel"
                    value={editLecManagerPhone}
                    onChange={(e) => setEditLecManagerPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    placeholder="예) 010-5259-7458"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-neutral-400 font-semibold block">피교육 정원 (명) *</label>
                  <input
                    type="number"
                    value={editLecAttendees}
                    onChange={(e) => setEditLecAttendees(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-neutral-400 font-semibold block">예산 산정 총액 (₩) *</label>
                  <input
                    type="number"
                    value={editLecBudget}
                    onChange={(e) => setEditLecBudget(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-neutral-400 font-semibold block">저작권 마일리지 로열티 (M) *</label>
                  <input
                    type="number"
                    value={editLecMileage}
                    onChange={(e) => setEditLecMileage(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-neutral-400 font-semibold block">만족도 조사 폼 링크 (URL)</label>
                  <input
                    type="url"
                    value={editLecSurveyUrl}
                    onChange={(e) => setEditLecSurveyUrl(e.target.value)}
                    placeholder="예) https://forms.gle/..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1 text-left md:col-span-2">
                  <label className="text-neutral-400 font-semibold block">수동 매칭 진행 상태 제어</label>
                  <select
                    value={editLecStatus}
                    onChange={(e) => setEditLecStatus(e.target.value as 'open' | 'assigned' | 'completed')}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer font-bold text-amber-400"
                  >
                    <option value="open">🟢 강사모집 중 (Open)</option>
                    <option value="assigned">🔵 강사배정 완료 (Assigned)</option>
                    <option value="completed">⚫ 출강 완료 / 정산완료 (Completed)</option>
                  </select>
                </div>

              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingLecture(null)}
                  className="w-1/3 py-2.5 rounded-xl border border-neutral-800 text-neutral-400 font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  취소하기
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedLecture}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-[#D4AF37] text-neutral-950 font-black transition-colors cursor-pointer"
                >
                  💾 수정 및 보완사항 영구 저장
                </button>
              </div>
            </div>

          </div>
        </div>
      )}



      {/* 📱 Elegant Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090B]/95 backdrop-blur-md border-t border-neutral-900/60 h-16 flex items-center justify-around px-2 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        {[
          { id: 'home', label: '협회소개', icon: <Home className="w-5 h-5" />, action: () => setActiveTab('home') },
          { id: 'lectures', label: '출강정보', icon: <FileText className="w-5 h-5" />, action: () => setActiveTab('lectures') },
          ...(currentUser && currentUser.isApproved 
            ? [{ id: 'programs', label: '고품격교육', icon: <BookOpen className="w-5 h-5" />, action: () => setActiveTab('programs') }]
            : [{ id: 'partnership', label: '제휴의뢰', icon: <Send className="w-5 h-5" />, action: () => setActiveTab('partnership') }]
          ),
          ...(currentUser?.isAdmin 
            ? [{ id: 'admin', label: '마스터실', icon: <Settings className="w-5 h-5 text-[#D4AF37]" />, action: () => setActiveTab('admin') }]
            : []
          ),
          ...(currentUser 
            ? [{ id: 'mypage', label: '마이페이지', icon: <User className="w-5 h-5" />, action: () => setActiveTab('mypage') }]
            : [{ id: 'login', label: '로그인', icon: <LogIn className="w-5 h-5" />, action: () => { setAuthMode('login'); setShowAuthModal(true); } }]
          )
        ].map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold transition-all relative ${
                isActive 
                  ? 'text-[#D4AF37]' 
                  : 'text-neutral-400 active:text-[#D4AF37]'
              }`}
            >
              <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-amber-500/10 text-[#D4AF37]' : ''}`}>
                {item.icon}
              </div>
              <span className="mt-0.5 scale-90 origin-center tracking-tighter">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-amber-500 to-[#D4AF37] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
