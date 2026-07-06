import React, { useState, useEffect } from 'react';
import { UserProfile, LectureRequest, EducationalProgram, MileageTransaction, InstructorTier, DigitalBadge, PartnershipProposal } from './types';
import { StorageService, generateBadgeForTier, auth, useFirestore } from './lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { sanitizeString, sanitizePhone, checkRateLimit } from './utils/security';
import Header from './components/Header';
import InstructorCard from './components/InstructorCard';
import LectureBoard from './components/LectureBoard';
import ProgramBoard from './components/ProgramBoard';
import AdminPanel from './components/AdminPanel';
import AppSimulator from './components/AppSimulator';
import PendingApprovalView from './components/PendingApprovalView';
import BadgeCabinet from './components/BadgeCabinet';
import PartnershipProposalBoard from './components/PartnershipProposalBoard';
import KPCIALogo from './components/KPCIALogo';

import { Award, BookOpen, GraduationCap, CheckCircle, ShieldAlert, Sparkles, TrendingUp, Compass, ArrowRight, UserCheck, Plus, LogIn, X } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [lectures, setLectures] = useState<LectureRequest[]>([]);
  const [programs, setPrograms] = useState<EducationalProgram[]>([]);
  const [transactions, setTransactions] = useState<MileageTransaction[]>([]);
  const [proposals, setProposals] = useState<PartnershipProposal[]>([]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeMobileTab, setActiveMobileTab] = useState<string>('lectures');
  const [isMobileSimulated, setIsMobileSimulated] = useState<boolean>(false);

  // Gateway Registration States
  const [showGatewayRegister, setShowGatewayRegister] = useState<boolean>(false);
  const [gwName, setGwName] = useState<string>('');
  const [gwEmail, setGwEmail] = useState<string>('');
  const [gwTier, setGwTier] = useState<InstructorTier>('Prestige Member');
  const [gwTitle, setGwTitle] = useState<string>('');
  const [gwPhone, setGwPhone] = useState<string>('');
  const [gwLoginId, setGwLoginId] = useState<string>('');
  const [gwPassword, setGwPassword] = useState<string>('');
  const [verificationStep, setVerificationStep] = useState<'input' | 'verify'>('input');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [verificationError, setVerificationError] = useState<string>('');
  const [forceSimulationAuth, setForceSimulationAuth] = useState<boolean>(false);
  const [isOperationNotAllowedError, setIsOperationNotAllowedError] = useState<boolean>(false);

  // Login Form States
  const [loginId, setLoginId] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Auth Modal States
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  // Notification Toast alert
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Initial Data Sync on startup
  useEffect(() => {
    const syncData = async () => {
      // 1. Seed empty database
      await StorageService.seedDatabaseIfEmpty();

      // 2. Fetch all collections
      const loadedUsers = await StorageService.getUsers();
      const loadedLectures = await StorageService.getLectures();
      const loadedPrograms = await StorageService.getPrograms();
      const loadedTransactions = await StorageService.getTransactions();
      const loadedProposals = await StorageService.getProposals();

      setUsers(loadedUsers);
      setLectures(loadedLectures);
      setPrograms(loadedPrograms);
      setTransactions(loadedTransactions);
      setProposals(loadedProposals);

      // 3. Set default login state or load existing session from localStorage
      const savedUserUid = localStorage.getItem('kpcia_logged_in_uid');
      if (savedUserUid) {
        const savedUser = loadedUsers.find(u => u.uid === savedUserUid);
        if (savedUser) {
          setCurrentUser(savedUser);
          return;
        }
      }
      
      // On fresh start, require login by leaving currentUser as null
      setCurrentUser(null);
    };

    syncData();
  }, []);

  // Sync back currentUser updates to the general users list and storage
  const handleUpdateCurrentUser = async (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.uid === updatedUser.uid ? updatedUser : u));
    await StorageService.saveUser(updatedUser);
  };

  // Reset all modified records to default initial seed lists
  const handleResetData = async () => {
    await StorageService.resetDatabase();
    triggerToast('KPCIA 협회 데이터가 공고 당시의 초기 상태로 정교하게 초기화되었습니다.', 'success');
    
    // Reload and sync state
    const loadedUsers = await StorageService.getUsers();
    const loadedLectures = await StorageService.getLectures();
    const loadedPrograms = await StorageService.getPrograms();
    const loadedTransactions = await StorageService.getTransactions();
    const loadedProposals = await StorageService.getProposals();

    setUsers(loadedUsers);
    setLectures(loadedLectures);
    setPrograms(loadedPrograms);
    setTransactions(loadedTransactions);
    setProposals(loadedProposals);

    // Reset login session
    localStorage.removeItem('kpcia_logged_in_uid');
    setCurrentUser(null);
  };

  // Handlers
  // 1. Switch Active Testing Account Persona
  const handleUserChange = (userId: string) => {
    if (userId === 'guest') {
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
      setCurrentUser(guestUser);
      triggerToast('비회원 게스트 모드로 활성화되었습니다.', 'info');
      return;
    }
    const selected = users.find(u => u.uid === userId);
    if (selected) {
      setCurrentUser(selected);
      triggerToast(`${selected.name} [현재 등급: ${selected.tier}] 계정으로 성공적으로 전환되었습니다.`, 'info');
    }
  };

  const handleInstantApprove = async () => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, isApproved: true };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.uid === currentUser.uid ? updatedUser : u));
    await StorageService.saveUser(updatedUser);
    triggerToast('테스터 원클릭 자가 승인이 성공적으로 처리되었습니다! 이제 모든 메뉴를 자유롭게 조회하실 수 있습니다.', 'success');
  };

  // 2. Apply for Lecture Request
  const handleApplyLecture = async (lectureId: string) => {
    if (!currentUser) return;

    const lecture = lectures.find(l => l.id === lectureId);
    if (!lecture) return;

    if (lecture.applicants.includes(currentUser.uid)) {
      triggerToast('이미 본 강의에 출강을 신청하셨습니다.', 'info');
      return;
    }

    const updatedLecture: LectureRequest = {
      ...lecture,
      applicants: [...lecture.applicants, currentUser.uid]
    };

    const updatedLectures = lectures.map(l => l.id === lectureId ? updatedLecture : l);
    setLectures(updatedLectures);
    await StorageService.saveLecture(updatedLecture);

    triggerToast(`'${lecture.title}' 과정에 성공적으로 출강 신청이 접수되었습니다! 운영사무국의 배정 승인을 대기합니다.`);
  };

  // 3. Post a new lecture request (Admin Only)
  const handleAddLecture = async (lectureData: any) => {
    const sanitizedData = {
      ...lectureData,
      title: sanitizeString(lectureData.title),
      description: sanitizeString(lectureData.description),
      location: sanitizeString(lectureData.location),
      duration: sanitizeString(lectureData.duration),
      time: sanitizeString(lectureData.time),
      date: sanitizeString(lectureData.date)
    };
    const newId = `lect_00${lectures.length + 1}_${Date.now().toString().slice(-4)}`;
    const newLecture: LectureRequest = {
      ...sanitizedData,
      id: newId,
      status: 'open',
      applicants: [],
      createdAt: new Date().toISOString()
    };

    const updatedLectures = [...lectures, newLecture];
    setLectures(updatedLectures);
    await StorageService.saveLecture(newLecture);

    triggerToast(`신규 기업 출강 강의 공고 '${newLecture.title}'가 전체 위원회 게시판에 실시간으로 게시되었습니다.`);
  };

  // 4. Register a new custom Educational Program
  const handleRegisterProgram = async (programData: any) => {
    if (!currentUser) return;

    const sanitizedData = {
      ...programData,
      title: sanitizeString(programData.title),
      description: sanitizeString(programData.description),
      targetAudience: sanitizeString(programData.targetAudience),
      curriculum: Array.isArray(programData.curriculum) 
        ? programData.curriculum.map((item: string) => sanitizeString(item)) 
        : []
    };

    const newId = `prog_00${programs.length + 1}_${Date.now().toString().slice(-4)}`;
    const newProgram: EducationalProgram = {
      ...sanitizedData,
      id: newId,
      authorId: currentUser.uid,
      authorName: currentUser.name,
      createdAt: new Date().toISOString()
    };

    // 1. Save program
    const updatedPrograms = [...programs, newProgram];
    setPrograms(updatedPrograms);
    await StorageService.saveProgram(newProgram);

    // 2. Log mileage transaction for ledger records (but do NOT automatically update user.mileage)
    const newTx: MileageTransaction = {
      id: `tx_${Date.now()}`,
      userId: currentUser.uid,
      userName: currentUser.name,
      type: 'program_register',
      amount: 1000,
      description: `'${newProgram.title}' 독창적 명품 교육 프로그램 신규 등재 완료 (마일리지 수동 지급 승인 대기: +1,000 M)`,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [...prev, newTx]);
    await StorageService.addTransaction(newTx);

    triggerToast(`'${newProgram.title}' 과정 등재 성공! 등재 마일리지는 협회 관리자가 검토 후 수동 지급합니다.`);
  };

  // 5. Upgrade User Grade / Tier (Admin Only)
  const handleUpgradeUserTier = async (userId: string, targetTier: InstructorTier) => {
    const targetUser = users.find(u => u.uid === userId);
    if (!targetUser) return;

    if (targetUser.tier === targetTier) return;

    // Generate badge automatically for the upgraded tier!
    const newBadge = generateBadgeForTier(targetTier);
    
    // Merge existing badges, avoid duplicate of same tier
    const updatedBadges = [...targetUser.badges];
    if (!updatedBadges.some(b => b.tier === targetTier)) {
      updatedBadges.push(newBadge);
    }

    const updatedUser: UserProfile = {
      ...targetUser,
      tier: targetTier,
      badges: updatedBadges,
      updatedAt: new Date().toISOString()
    };

    // Sync back
    setUsers(prev => prev.map(u => u.uid === userId ? updatedUser : u));
    await StorageService.saveUser(updatedUser);

    // If upgraded user is current user, update local view immediately
    if (currentUser && currentUser.uid === userId) {
      setCurrentUser(updatedUser);
    }

    // Append Admin upgrade transaction
    const newTx: MileageTransaction = {
      id: `tx_up_${Date.now()}`,
      userId: targetUser.uid,
      userName: targetUser.name,
      type: 'admin_adjust',
      amount: 0,
      description: `강사 등급 공식 승격: ${targetUser.tier} → ${targetTier} [디지털 배지 ${newBadge.title} 자동 수여]`,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [...prev, newTx]);
    await StorageService.addTransaction(newTx);

    triggerToast(`${targetUser.name} 강사님의 등급이 '${targetTier}'로 정식 승격 및 디지털 영예 배지가 발송되었습니다!`, 'success');
  };

  // 6. Assign lecturer (Admin Only)
  const handleAssignLecturer = async (lectureId: string, userId: string, userName: string) => {
    const lecture = lectures.find(l => l.id === lectureId);
    if (!lecture) return;

    const updatedLecture: LectureRequest = {
      ...lecture,
      status: 'assigned',
      assignedTo: userId,
      assignedName: userName
    };

    setLectures(prev => prev.map(l => l.id === lectureId ? updatedLecture : l));
    await StorageService.saveLecture(updatedLecture);

    triggerToast(`'${lecture.title}' 공고에 ${userName} 강사님이 공식 배정되었습니다.`);
  };

  // 7. Complete Lecture & Pay Royalty to Creator & Lecturer Fee (Admin Only)
  const handleCompleteLecture = async (lectureId: string) => {
    const lecture = lectures.find(l => l.id === lectureId);
    if (!lecture || lecture.status !== 'assigned' || !lecture.assignedTo) return;

    // Mark as Completed
    const updatedLecture: LectureRequest = {
      ...lecture,
      status: 'completed'
    };

    setLectures(prev => prev.map(l => l.id === lectureId ? updatedLecture : l));
    await StorageService.saveLecture(updatedLecture);

    // Payout logic
    const lecturerId = lecture.assignedTo;
    const lecturer = users.find(u => u.uid === lecturerId);

    // Lecture completion reward: e.g. +3,000 M payout to lecturer (We log ledger tx but let admin edit manually)
    if (lecturer) {
      // Add payout transaction
      const lecturerTx: MileageTransaction = {
        id: `tx_pay_${Date.now()}`,
        userId: lecturerId,
        userName: lecturer.name,
        type: 'lecture_payout',
        amount: 3000,
        description: `'${lecture.title}' 출강 수행 완료에 따른 수동 정산 대기 (+3,000 M)`,
        createdAt: new Date().toISOString()
      };
      setTransactions(prev => [...prev, lecturerTx]);
      await StorageService.addTransaction(lecturerTx);
    }

    // ROYALTY LOGIC: Check if lecture was based on a registered program owned by ANOTHER instructor
    if (lecture.programId) {
      const associatedProgram = programs.find(p => p.id === lecture.programId);
      if (associatedProgram && associatedProgram.authorId !== lecturerId) {
        // Yes! Pay royalty to the program creator!
        const creatorId = associatedProgram.authorId;
        const creator = users.find(u => u.uid === creatorId);

        if (creator) {
          // Add royalty transaction log
          const royaltyTx: MileageTransaction = {
            id: `tx_royalty_${Date.now()}`,
            userId: creatorId,
            userName: creator.name,
            type: 'royalty',
            amount: associatedProgram.royaltyRate,
            description: `타 강사(${lecturer?.name || '협회강사'})가 '${associatedProgram.title}' 교안으로 출강 완료함에 따른 저작권 마일리지 누적 대기 (+${associatedProgram.royaltyRate.toLocaleString()} M)`,
            relatedId: lectureId,
            createdAt: new Date().toISOString()
          };
          setTransactions(prev => [...prev, royaltyTx]);
          await StorageService.addTransaction(royaltyTx);

          triggerToast(`출강 종료 승인 완료! 마일리지 자동 연동 대신 정산 명세가 트랜잭션 원장에 기록되었습니다. 관리자가 확인 후 수동으로 지급합니다.`);
          return;
        }
      }
    }

    triggerToast(`'${lecture.title}' 출강 종료 승인이 완료되었습니다. 마일리지 명세가 트랜잭션 원장에 기록되었습니다. (관리자 수동 정산 대기)`);
  };

  // 8. Manual Mileage Adjustment (Admin Only)
  const handleAdjustMileage = async (userId: string, amount: number, description: string) => {
    const targetUser = users.find(u => u.uid === userId);
    if (!targetUser) return;

    const updatedUser: UserProfile = {
      ...targetUser,
      mileage: Math.max(0, targetUser.mileage + amount)
    };

    setUsers(prev => prev.map(u => u.uid === userId ? updatedUser : u));
    await StorageService.saveUser(updatedUser);

    if (currentUser && currentUser.uid === userId) {
      setCurrentUser(updatedUser);
    }

    // Add transaction log
    const newTx: MileageTransaction = {
      id: `tx_adj_${Date.now()}`,
      userId: targetUser.uid,
      userName: targetUser.name,
      type: 'admin_adjust',
      amount,
      description,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [...prev, newTx]);
    await StorageService.addTransaction(newTx);

    triggerToast(`${targetUser.name} 강사님의 마일리지가 수동으로 ${amount >= 0 ? `+${amount}` : amount} M 조정 완료되었습니다.`);
  };

  // 8.05. Update Instructor Lecture Count & Satisfaction Ratings (Admin Only)
  const handleUpdateUserPerformance = async (userId: string, lectureCount: number, ratings: number[]) => {
    const targetUser = users.find(u => u.uid === userId);
    if (!targetUser) return;

    const avg = ratings.length > 0 
      ? Number((ratings.reduce((sum, val) => sum + val, 0) / ratings.length).toFixed(1)) 
      : 0;

    const updatedUser: UserProfile = {
      ...targetUser,
      lectureCount,
      lectureRatings: ratings,
      averageRating: avg,
      updatedAt: new Date().toISOString()
    };

    setUsers(prev => prev.map(u => u.uid === userId ? updatedUser : u));
    await StorageService.saveUser(updatedUser);

    if (currentUser && currentUser.uid === userId) {
      setCurrentUser(updatedUser);
    }

    triggerToast(`${targetUser.name} 강사님의 출강 실적(출강 횟수 ${lectureCount}회, 평균 만족도 ${avg}점)이 성공적으로 저장되었습니다!`);
  };

  // 8.1. Register Partnership Proposal
  const handleRegisterProposal = async (proposalData: any) => {
    if (!checkRateLimit('proposal_submit', 3000)) {
      triggerToast('제휴 제안이 너무 빈번하게 시도되었습니다. 잠시 후 다시 전송해 주세요.', 'info');
      return;
    }

    const sanitizedData = {
      companyName: sanitizeString(proposalData.companyName),
      proposerName: sanitizeString(proposalData.proposerName),
      email: sanitizeString(proposalData.email),
      phone: sanitizePhone(proposalData.phone),
      title: sanitizeString(proposalData.title),
      content: sanitizeString(proposalData.content)
    };

    const newId = `prop_${Date.now()}`;
    const newProposal: PartnershipProposal = {
      ...sanitizedData,
      id: newId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setProposals(prev => [...prev, newProposal]);
    await StorageService.saveProposal(newProposal);
    triggerToast(`'${newProposal.companyName}'의 공식 제휴 제안서가 등록 접수되었습니다. 최대 3영업일 내로 검토 회신이 전달됩니다.`);
  };

  // 8.2. Update Partnership Proposal Status (Admin Only)
  const handleUpdateProposalStatus = async (proposalId: string, status: 'pending' | 'reviewed' | 'accepted' | 'declined') => {
    const targetProp = proposals.find(p => p.id === proposalId);
    if (!targetProp) return;
    const updatedProp: PartnershipProposal = { ...targetProp, status };
    setProposals(prev => prev.map(p => p.id === proposalId ? updatedProp : p));
    await StorageService.saveProposal(updatedProp);
    triggerToast(`제휴 제안서 상태가 '${status === 'accepted' ? '승인 완료' : status === 'declined' ? '반려' : '검토중'}' 상태로 변경되었습니다.`);
  };

  // 8.3. Update Educational Program Royalty Rate (Admin Only)
  const handleUpdateProgramRoyalty = async (programId: string, newRoyalty: number) => {
    const targetProg = programs.find(p => p.id === programId);
    if (!targetProg) return;
    const updatedProg: EducationalProgram = { ...targetProg, royaltyRate: newRoyalty };
    setPrograms(prev => prev.map(p => p.id === programId ? updatedProg : p));
    await StorageService.saveProgram(updatedProg);
    triggerToast(`'${targetProg.title}' 교육 과정의 저작권 마일리지 누적이 ${newRoyalty.toLocaleString()} M 으로 조정되었습니다.`);
  };

  // 8.4. Approve Registered User (Admin Only)
  const handleApproveUser = async (userId: string) => {
    const targetUser = users.find(u => u.uid === userId);
    if (!targetUser) return;
    const updatedUser: UserProfile = { ...targetUser, isApproved: true };
    setUsers(prev => prev.map(u => u.uid === userId ? updatedUser : u));
    await StorageService.saveUser(updatedUser);
    triggerToast(`'${targetUser.name}' 강사님의 KPCIA 정식 가입 신청이 최종 승인되었습니다!`);
  };

  // 8.5. Reject/Delete Registered User (Admin Only)
  const handleRejectUser = async (userId: string) => {
    const targetUser = users.find(u => u.uid === userId);
    if (!targetUser) return;
    setUsers(prev => prev.filter(u => u.uid !== userId));
    await StorageService.deleteUser(userId);
    triggerToast(`'${targetUser.name}' 강사님의 가입 신청이 거절 및 파기 처리되었습니다.`, 'info');
  };

  // 8.5.1. Delete Approved User (Admin Only)
  const handleDeleteUser = async (userId: string) => {
    const targetUser = users.find(u => u.uid === userId);
    if (!targetUser) return;
    setUsers(prev => prev.filter(u => u.uid !== userId));
    await StorageService.deleteUser(userId);
    triggerToast(`'${targetUser.name}' 강사님이 협회 회원에서 영구 탈퇴 처리되었습니다.`, 'info');
  };

  // 8.5.2. Delete Educational Program (Admin Only)
  const handleDeleteProgram = async (programId: string) => {
    const targetProg = programs.find(p => p.id === programId);
    if (!targetProg) return;
    setPrograms(prev => prev.filter(p => p.id !== programId));
    await StorageService.deleteProgram(programId);
    triggerToast(`'${targetProg.title}' 교육 콘텐츠가 영구 삭제 처리되었습니다.`, 'info');
  };

  // 8.6. Approve and finalize Educational Program Copyright (Admin Only)
  const handleApproveProgram = async (programId: string, updatedProgram: EducationalProgram) => {
    // Save program to state & storage
    setPrograms(prev => prev.map(p => p.id === programId ? updatedProgram : p));
    await StorageService.saveProgram(updatedProgram);

    // Give the author the +1,000 M copyright registration bonus
    const authorId = updatedProgram.authorId;
    const authorUser = users.find(u => u.uid === authorId);
    if (authorUser) {
      const updatedAuthor: UserProfile = {
        ...authorUser,
        mileage: authorUser.mileage + 1000
      };
      setUsers(prev => prev.map(u => u.uid === authorId ? updatedAuthor : u));
      await StorageService.saveUser(updatedAuthor);

      if (currentUser && currentUser.uid === authorId) {
        setCurrentUser(updatedAuthor);
      }

      // Add Mileage Transaction
      const bonusTx: MileageTransaction = {
        id: `tx_prog_app_${Date.now()}`,
        userId: authorId,
        userName: authorUser.name,
        type: 'program_register',
        amount: 1000,
        description: `'${updatedProgram.title}' 교육 콘텐츠 독창적 저작권 최종 공인 승격 축하 마일리지 지급 (+1,000 M)`,
        createdAt: new Date().toISOString()
      };
      setTransactions(prev => [...prev, bonusTx]);
      await StorageService.addTransaction(bonusTx);
    }

    triggerToast(`'${updatedProgram.title}' 교육 과정의 저작권 심사·보완이 완료되어 정식 협회 명품 과정으로 최종 확정 및 등재되었습니다!`);
  };

  // 9. Instructor card save handler
  const handleSaveProfileCard = async (cardInfo: any) => {
    if (!currentUser) return;

    const sanitizedCard = {
      ...cardInfo,
      title: sanitizeString(cardInfo.title),
      bio: sanitizeString(cardInfo.bio),
      contactEmail: sanitizeString(cardInfo.contactEmail),
      contactPhone: sanitizePhone(cardInfo.contactPhone),
      imageUrl: cardInfo.imageUrl ? sanitizeString(cardInfo.imageUrl) : undefined,
      pdfUrl: cardInfo.pdfUrl ? sanitizeString(cardInfo.pdfUrl) : undefined,
      bankAccount: cardInfo.bankAccount ? sanitizeString(cardInfo.bankAccount) : undefined,
      specialties: Array.isArray(cardInfo.specialties) 
        ? cardInfo.specialties.map((s: string) => sanitizeString(s)) 
        : [],
      career: Array.isArray(cardInfo.career) 
        ? cardInfo.career.map((c: string) => sanitizeString(c)) 
        : [],
      education: Array.isArray(cardInfo.education) 
        ? cardInfo.education.map((e: string) => sanitizeString(e)) 
        : []
    };

    const updatedUser: UserProfile = {
      ...currentUser,
      profileCard: sanitizedCard,
      updatedAt: new Date().toISOString()
    };
    await handleUpdateCurrentUser(updatedUser);
    triggerToast('강사 프로필 카드 및 인쇄용 템플릿 정보가 안전하게 실시간 저장되었습니다.');
  };

  // 10. Register / Sign Up New Instructor Profile
  const handleRegisterUser = async (name: string, email: string, tier: InstructorTier, title: string, phone: string, loginId?: string, password?: string, firebaseUid?: string, emailVerified?: boolean) => {
    if (!checkRateLimit('user_register', 3000)) {
      triggerToast('가입 요청이 너무 빈번합니다. 잠시 후 다시 시도해 주세요.', 'info');
      return;
    }

    const sName = sanitizeString(name);
    const sEmail = sanitizeString(email);
    const sTitle = sanitizeString(title);
    const sPhone = sanitizePhone(phone);
    const sLoginId = loginId ? sanitizeString(loginId) : undefined;
    const sPassword = password ? sanitizeString(password) : undefined;

    const newUid = firebaseUid || `user_${Date.now()}`;
    const initialBadge = generateBadgeForTier(tier);
    
    const isVerified = emailVerified ?? (firebaseUid ? false : true);

    const newUser: UserProfile = {
      uid: newUid,
      email: sEmail,
      name: sName,
      tier: tier,
      mileage: 0, // Welcome signup bonus removed as requested
      isApproved: false, // Default to false; must be approved by Administration (운영사무국)
      emailVerified: isVerified,
      loginId: sLoginId,
      password: sPassword,
      profileCard: {
        title: sTitle || 'KPCIA 공인 전문 강사',
        bio: `안녕하세요, KPCIA 정식 인증 강사 ${sName}입니다. 신규 교육 기획 및 맞춤형 대기업 특강을 진행합니다.`,
        specialties: [sTitle || '전문 강의 기획', '직무 역량 교육'],
        career: [`KPCIA 정식 강사 등록 (2026년 7월)`],
        education: [`대학 졸업 및 실무 교육 이수 완료`],
        contactEmail: sEmail,
        contactPhone: sPhone || '010-0000-0000',
        cardTheme: 'classic'
      },
      badges: [initialBadge],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // State Updates
    setUsers(prev => [...prev, newUser]);
    
    if (isVerified) {
      setCurrentUser(newUser);
      triggerToast(`'${name}' 강사님, KPCIA 프레스티지 가입이 신청되었습니다! 운영사무국 승인을 대기합니다.`, 'success');
      setActiveTab('home'); // Route to home tab, which will show the pending screen!
    } else {
      triggerToast(`'${name}' 강사님, KPCIA 프레스티지 회원가입 신청이 임시 접수되었습니다. 이메일 인증 완료 후 최종 승인 심사가 시작됩니다.`, 'success');
    }

    // DB / LocalStorage Persistence
    await StorageService.saveUser(newUser);
  };

  // 11. Logout current user
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('home');
    localStorage.removeItem('kpcia_logged_in_uid');
    triggerToast('성공적으로 로그아웃되었습니다. 다른 강사 계정으로 로그인하거나 신규 가입을 진행해 주세요.', 'info');
  };

  // 12. Main website login submit handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedId = loginId.trim();
    const trimmedPw = loginPassword.trim();

    if (!trimmedId || !trimmedPw) {
      setLoginError('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    // 1. Check main operator / office admin credentials
    if (trimmedId === 'insight9lab' && trimmedPw === '400828') {
      const adminUser = users.find(u => u.isAdmin);
      if (adminUser) {
        setCurrentUser(adminUser);
        localStorage.setItem('kpcia_logged_in_uid', adminUser.uid);
        triggerToast('KPCIA 운영사무국 메인 관리자 계정으로 로그인되었습니다.', 'success');
        setLoginId('');
        setLoginPassword('');
        setShowAuthModal(false);
        return;
      }
    }

    // 2. Try Firebase Auth if active and id looks like email or matches a known user
    if (auth && useFirestore) {
      const matchedUser = users.find(u => 
        (u.loginId && u.loginId.toLowerCase() === trimmedId.toLowerCase()) ||
        (!u.loginId && (u.email.toLowerCase() === trimmedId.toLowerCase() || u.name === trimmedId || u.uid === trimmedId))
      );
      const loginEmail = matchedUser ? matchedUser.email : (trimmedId.includes('@') ? trimmedId : '');
      if (loginEmail) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, loginEmail, trimmedPw);
          const fbUser = userCredential.user;
          
          if (!fbUser.emailVerified) {
            setLoginError('이메일 인증이 아직 완료되지 않았습니다. 메일함의 인증 링크를 클릭한 후 로그인해 주세요.');
            return;
          }

          const actualUser = users.find(u => u.uid === fbUser.uid) || matchedUser;
          if (actualUser) {
            setCurrentUser(actualUser);
            localStorage.setItem('kpcia_logged_in_uid', actualUser.uid);
            triggerToast(`${actualUser.name} 강사님 계정으로 로그인되었습니다.`, 'success');
            setLoginId('');
            setLoginPassword('');
            setShowAuthModal(false);
            return;
          }
        } catch (firebaseErr: any) {
          console.warn("Firebase Auth login failed, checking fallback:", firebaseErr);
          // Only show specific firebase error if password looks wrong, otherwise allow fallback (for mock/local users)
          if (firebaseErr.code === 'auth/wrong-password' || firebaseErr.code === 'auth/invalid-credential') {
            setLoginError('비밀번호가 일치하지 않거나 유효하지 않은 자격 증명입니다.');
            return;
          }
        }
      }
    }

    // 3. Fallback database check
    const matchedUserFallback = users.find(u => 
      (u.loginId && u.loginId.toLowerCase() === trimmedId.toLowerCase()) ||
      (!u.loginId && (u.email.toLowerCase() === trimmedId.toLowerCase() || u.name === trimmedId || u.uid === trimmedId))
    );

    if (matchedUserFallback) {
      if (matchedUserFallback.password && matchedUserFallback.password !== trimmedPw) {
        setLoginError('비밀번호가 일치하지 않습니다.');
        return;
      }

      setCurrentUser(matchedUserFallback);
      localStorage.setItem('kpcia_logged_in_uid', matchedUserFallback.uid);
      triggerToast(`${matchedUserFallback.name} 강사님 계정으로 로그인되었습니다.`, 'success');
      setLoginId('');
      setLoginPassword('');
      setShowAuthModal(false);
      return;
    }

    setLoginError('아이디 또는 비밀번호가 일치하지 않습니다.');
  };

  // Global Register Modal Renderer with Interactive Email Verification Wizard
  const renderRegisterModal = () => {
    return null;
  };

  const _disabledRegisterModal = () => {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-start justify-center p-4 overflow-y-auto font-sans" id="gateway-register-modal">
        <div className="bg-neutral-900 border-2 border-kpcia-gold/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative my-auto" id="gateway-register-container">
          <div className="p-5 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5">
                <LogIn className="w-4 h-4 text-kpcia-gold" />
                <span>KPCIA 신규 강사 회원가입</span>
              </h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {verificationStep === 'input' 
                  ? '협회 공식 명부에 등록하기 위해 필수 정보를 입력해 주세요.' 
                  : '입력하신 이메일의 소유 여부를 확인합니다.'}
              </p>
            </div>
            <button 
              onClick={() => {
                setShowGatewayRegister(false);
                setGwName('');
                setGwEmail('');
                setGwTitle('');
                setGwPhone('');
                setGwLoginId('');
                setGwPassword('');
                setVerificationStep('input');
                setVerificationCode('');
                setGeneratedCode('');
                setVerificationError('');
              }}
              className="text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {verificationStep === 'input' ? (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!gwName.trim() || !gwEmail.trim()) return;

                const trimmedId = gwLoginId.trim();
                const trimmedPw = gwPassword.trim();

                if (!trimmedId || !trimmedPw) {
                  setVerificationError('로그인용 아이디와 비밀번호를 모두 입력해 주세요.');
                  return;
                }

                if (trimmedId.length < 3) {
                  setVerificationError('아이디는 최소 3글자 이상이어야 합니다.');
                  return;
                }
                
                // Simple email check
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(gwEmail.trim())) {
                  setVerificationError('유효한 이메일 형식이 아닙니다.');
                  return;
                }

                // Generate 6 digit simulated verification code
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                setGeneratedCode(code);
                setVerificationStep('verify');
                setVerificationCode('');
                setVerificationError('');
                triggerToast('이메일 주소로 인증코드가 발송되었습니다. (하단 시뮬레이션 창을 확인하세요!)', 'info');
              }} 
              className="p-5 space-y-4 text-left font-sans"
            >
              {verificationError && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-900/50 text-[11px] text-red-400 font-medium">
                  {verificationError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide">성명 <span className="text-kpcia-gold">*</span></label>
                <input
                  type="text"
                  required
                  value={gwName}
                  onChange={(e) => setGwName(e.target.value)}
                  placeholder="예: 김성우 강사"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:border-kpcia-gold/50 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide">로그인용 아이디 <span className="text-kpcia-gold">*</span></label>
                  <input
                    type="text"
                    required
                    value={gwLoginId}
                    onChange={(e) => setGwLoginId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                    placeholder="아이디 (영문/숫자)"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:border-kpcia-gold/50 outline-none animate-in fade-in"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide">비밀번호 <span className="text-kpcia-gold">*</span></label>
                  <input
                    type="password"
                    required
                    value={gwPassword}
                    onChange={(e) => setGwPassword(e.target.value)}
                    placeholder="비밀번호"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:border-kpcia-gold/50 outline-none animate-in fade-in"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide">이메일 주소 <span className="text-kpcia-gold">*</span></label>
                <input
                  type="email"
                  required
                  value={gwEmail}
                  onChange={(e) => setGwEmail(e.target.value)}
                  placeholder="sungwoo@kpcia.or.kr"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:border-kpcia-gold/50 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide">연락처 (휴대폰)</label>
                <input
                  type="tel"
                  value={gwPhone}
                  onChange={(e) => setGwPhone(e.target.value)}
                  placeholder="010-9999-8888"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:border-kpcia-gold/50 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide">핵심 강의 전문 분야</label>
                <input
                  type="text"
                  value={gwTitle}
                  onChange={(e) => setGwTitle(e.target.value)}
                  placeholder="예: HRD 조직문화 및 리더십 혁신"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:border-kpcia-gold/50 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide">인증 등급 (회원 정책 고정)</label>
                <div className="w-full px-3 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-lg text-xs text-neutral-300 font-mono flex justify-between items-center">
                  <span>Prestige Member (일반 회원)</span>
                  <span className="text-[10px] text-kpcia-gold bg-kpcia-gold/10 px-2 py-0.5 rounded border border-kpcia-gold/25 font-sans font-bold">기본 적용</span>
                </div>
                <p className="text-[9px] text-neutral-500 font-sans mt-1">
                  ※ KPCIA 정관에 의거, 신규 가입 강사는 최초 Prestige Member(일반 회원) 등급으로 자동 등록되며, 출강 이력 만족도 산정에 의해 순차적으로 등급 승격 자격이 부여됩니다.
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800/60 flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowGatewayRegister(false);
                    setGwName('');
                    setGwEmail('');
                    setGwTitle('');
                    setGwPhone('');
                    setVerificationError('');
                  }}
                  className="flex-1 py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-bold rounded-lg transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-extrabold rounded-lg transition-all shadow-md shadow-kpcia-gold/10"
                >
                  이메일 인증 요청
                </button>
              </div>
            </form>
          ) : (
            <div className="p-5 space-y-4 text-left font-sans">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-kpcia-gold uppercase tracking-wider block">STEP 2: 이메일 검증 진행 중</span>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  입력하신 이메일 주소 <strong className="text-neutral-100">{gwEmail}</strong>의 실제 소유주 확인을 위해 모의 전송된 6자리 코드를 아래에 기입해 주세요.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide">6자리 인증코드 입력</label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="XXXXXX"
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-lg text-center tracking-widest font-mono text-kpcia-gold focus:border-kpcia-gold outline-none"
                />
                {verificationError && (
                  <p className="text-[10px] text-red-400 font-medium mt-1">※ {verificationError}</p>
                )}
              </div>

              {/* Simulated Mailbox Widget for Developer preview and testing */}
              <div className="bg-neutral-950/80 border border-neutral-800 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500">
                  <span className="text-kpcia-gold font-bold">✉ KPCIA 모의 이메일 전송 수신함</span>
                  <span className="bg-kpcia-gold/10 text-kpcia-gold px-1.5 rounded">SIMULATOR ACTIVE</span>
                </div>
                <div className="text-[11px] font-mono space-y-1 text-neutral-300 border-t border-neutral-900 pt-1.5">
                  <div><strong>수신:</strong> {gwEmail}</div>
                  <div><strong>제목:</strong> KPCIA 강사 회원 검증용 인증 코드</div>
                  <div className="mt-2 text-center p-2 bg-neutral-900 border border-neutral-800 text-base font-bold tracking-widest text-kpcia-gold select-all">
                    {generatedCode}
                  </div>
                </div>
                <p className="text-[9px] text-neutral-500 font-sans leading-normal">
                  ※ 실제 가입을 시험해볼 수 있도록 시스템에서 가상의 메일함으로 코드를 실시간 발송해 시각화한 모듈입니다. 위 숫자를 클릭해 복사하여 상단 칸에 입력하세요.
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800/60 flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationStep('input');
                    setVerificationError('');
                  }}
                  className="flex-1 py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-bold rounded-lg transition-all"
                >
                  이전 단계로
                </button>
                <button
                  onClick={() => {
                    if (verificationCode === generatedCode) {
                      handleRegisterUser(gwName.trim(), gwEmail.trim(), gwTier, gwTitle.trim(), gwPhone.trim(), gwLoginId.trim(), gwPassword.trim());
                      
                      // Reset and Close
                      setShowGatewayRegister(false);
                      setGwName('');
                      setGwEmail('');
                      setGwTitle('');
                      setGwPhone('');
                      setGwLoginId('');
                      setGwPassword('');
                      setVerificationStep('input');
                      setVerificationCode('');
                      setGeneratedCode('');
                      setVerificationError('');
                    } else {
                      setVerificationError('인증코드가 일치하지 않습니다. 시뮬레이터 수신함에 적힌 코드를 입력해 주세요.');
                    }
                  }}
                  className="flex-1 py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-extrabold rounded-lg transition-all shadow-md shadow-kpcia-gold/10"
                >
                  인증 완료 및 가입
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleMobileLogin = async (emailOrName: string, password?: string): Promise<boolean> => {
    const trimmedId = emailOrName.trim();
    const trimmedPw = password ? password.trim() : '';

    if (!trimmedId) {
      triggerToast('아이디 또는 이메일을 입력해 주세요.', 'info');
      return false;
    }

    // 1. Check main operator / office admin credentials
    if (trimmedId === 'insight9lab' && trimmedPw === '400828') {
      const adminUser = users.find(u => u.isAdmin);
      if (adminUser) {
        setCurrentUser(adminUser);
        localStorage.setItem('kpcia_logged_in_uid', adminUser.uid);
        triggerToast('KPCIA 운영사무국 메인 관리자 계정으로 로그인되었습니다.', 'success');
        return true;
      }
    }

    // 2. Try Firebase Auth if active
    if (auth && useFirestore) {
      const matchedUser = users.find(u => 
        (u.loginId && u.loginId.toLowerCase() === trimmedId.toLowerCase()) ||
        (!u.loginId && (u.email.toLowerCase() === trimmedId.toLowerCase() || u.name === trimmedId || u.uid === trimmedId))
      );
      const loginEmail = matchedUser ? matchedUser.email : (trimmedId.includes('@') ? trimmedId : '');
      if (loginEmail) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, loginEmail, trimmedPw);
          const fbUser = userCredential.user;
          
          if (!fbUser.emailVerified) {
            triggerToast('이메일 인증이 완료되지 않았습니다.', 'info');
            return false;
          }

          const actualUser = users.find(u => u.uid === fbUser.uid) || matchedUser;
          if (actualUser) {
            setCurrentUser(actualUser);
            localStorage.setItem('kpcia_logged_in_uid', actualUser.uid);
            triggerToast(`${actualUser.name} 강사님 계정으로 로그인되었습니다.`, 'success');
            return true;
          }
        } catch (firebaseErr: any) {
          console.warn("Mobile Firebase Auth login failed, checking fallback:", firebaseErr);
        }
      }
    }

    // 3. Check general instructor login
    const matchedUser = users.find(u => 
      (u.loginId && u.loginId.toLowerCase() === trimmedId.toLowerCase()) ||
      (!u.loginId && (u.email.toLowerCase() === trimmedId.toLowerCase() || u.name === trimmedId || u.uid === trimmedId))
    );

    if (matchedUser) {
      if (matchedUser.password && matchedUser.password !== trimmedPw) {
        triggerToast('비밀번호가 일치하지 않습니다.', 'info');
        return false;
      }
      setCurrentUser(matchedUser);
      localStorage.setItem('kpcia_logged_in_uid', matchedUser.uid);
      triggerToast(`${matchedUser.name} 강사님 계정으로 로그인되었습니다.`, 'success');
      return true;
    }

    triggerToast('아이디 또는 비밀번호가 일치하지 않습니다.', 'info');
    return false;
  };

  const isPendingApproval = currentUser && currentUser.uid !== 'guest' && !currentUser.isAdmin && currentUser.isApproved === false;

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-kpcia-dark text-neutral-400">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-kpcia-gold border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-mono tracking-wider">KPCIA PRESTIGE PLATFORM INITIALIZING...</p>
        </div>
      </div>
    );
  }

  // Login wall removed - users can now view the home corporate website first and login/signup via popup modal as requested.

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 selection:bg-kpcia-gold selection:text-kpcia-dark" id="app-root">
      
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-xl border shadow-2xl flex items-center space-x-3 max-w-md animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'success' 
              ? 'bg-neutral-900 border-kpcia-gold/40 text-neutral-100' 
              : 'bg-neutral-900 border-neutral-700 text-neutral-200'
          }`}
          id="global-toast"
        >
          <div className="w-6 h-6 rounded-full bg-kpcia-gold/15 flex items-center justify-center text-kpcia-gold shrink-0">
            ★
          </div>
          <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
        </div>
      )}

      {/* 🔐 Unified Authentication Modal (Popup) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans animate-in fade-in duration-200" id="auth-modal-overlay">
          <div className="bg-neutral-900 border-2 border-kpcia-gold/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative my-auto" id="auth-modal-card">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center" id="auth-modal-header">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm text-kpcia-gold tracking-widest bg-kpcia-gold/10 px-2.5 py-1 rounded-lg border border-kpcia-gold/20">KPCIA</span>
                <span className="text-xs font-semibold text-neutral-300">인증 허브</span>
              </div>
              <button 
                onClick={() => {
                  setShowAuthModal(false);
                  setLoginError('');
                  setVerificationError('');
                }}
                className="text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                id="close-auth-modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="grid grid-cols-2 border-b border-neutral-800 bg-neutral-950/20" id="auth-modal-tabs">
              <button
                onClick={() => setAuthModalTab('login')}
                className={`py-3 text-xs font-bold transition-all text-center border-b-2 cursor-pointer ${
                  authModalTab === 'login'
                    ? 'text-kpcia-gold border-kpcia-gold bg-kpcia-gold/5'
                    : 'text-neutral-500 border-transparent hover:text-neutral-300'
                }`}
                id="auth-tab-login"
              >
                로그인 (Login)
              </button>
              <button
                onClick={() => setAuthModalTab('register')}
                className={`py-3 text-xs font-bold transition-all text-center border-b-2 cursor-pointer ${
                  authModalTab === 'register'
                    ? 'text-kpcia-gold border-kpcia-gold bg-kpcia-gold/5'
                    : 'text-neutral-500 border-transparent hover:text-neutral-300'
                }`}
                id="auth-tab-register"
              >
                신규 강사 가입 (Sign Up)
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto max-h-[80vh]" id="auth-modal-content">
              {authModalTab === 'login' ? (
                /* ================= LOGIN FORM ================= */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono tracking-widest font-extrabold text-kpcia-gold uppercase bg-kpcia-gold/15 border border-kpcia-gold/30 px-2 py-0.5 rounded inline-block">
                      강사용 프레스티지 포털
                    </span>
                    <h3 className="text-sm font-bold text-neutral-100 font-display text-left">
                      한국 프레스티지기업강사협회
                    </h3>
                  </div>

                  {loginError && (
                    <div className="p-2.5 bg-red-950/50 border border-red-800/60 rounded-xl text-red-200 text-xs font-sans leading-relaxed text-left" id="modal-login-error">
                      ⚠ {loginError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 text-left">
                        아이디 또는 이메일
                      </label>
                      <input
                        type="text"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder="ID (예: kindom) 또는 이메일 주소"
                        className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 hover:border-kpcia-gold/40 focus:border-kpcia-gold focus:ring-1 focus:ring-kpcia-gold text-neutral-100 rounded-xl text-xs font-sans outline-none transition-all placeholder:text-neutral-600 font-medium"
                        id="modal-login-id"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 text-left">
                        비밀번호 (PASSWORD)
                      </label>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                        className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 hover:border-kpcia-gold/40 focus:border-kpcia-gold focus:ring-1 focus:ring-kpcia-gold text-neutral-100 rounded-xl text-xs font-sans outline-none transition-all placeholder:text-neutral-600 font-medium"
                        id="modal-login-pw"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark hover:scale-[1.01] active:scale-[0.99] font-black text-xs rounded-xl transition-all duration-300 shadow-xl shadow-kpcia-gold/15 flex items-center justify-center gap-1.5 cursor-pointer mt-5 uppercase"
                    id="modal-login-btn"
                  >
                    <LogIn className="w-3.5 h-3.5 text-kpcia-dark" />
                    <span>KPCIA 로그인</span>
                  </button>
                </form>
              ) : (
                /* ================= REGISTER FORM (WIZARD) ================= */
                verificationStep === 'input' ? (
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setVerificationError('');
                      
                      const nameStr = gwName.trim();
                      const emailStr = gwEmail.trim();
                      const trimmedId = gwLoginId.trim();
                      const trimmedPw = gwPassword.trim();

                      if (!nameStr || !emailStr || !trimmedId || !trimmedPw) {
                        setVerificationError('모든 필수 항목(*)을 작성해 주세요.');
                        return;
                      }

                      if (trimmedId.length < 3) {
                        setVerificationError('아이디는 최소 3글자 이상이어야 합니다.');
                        return;
                      }
                      
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(emailStr)) {
                        setVerificationError('유효한 이메일 형식이 아닙니다.');
                        return;
                      }

                      // Try registering via Firebase Auth
                      if (auth && useFirestore && !forceSimulationAuth) {
                        try {
                          // Create the auth user
                          const userCredential = await createUserWithEmailAndPassword(auth, emailStr, trimmedPw);
                          // Send email verification
                          await sendEmailVerification(userCredential.user);
                          
                          setVerificationStep('verify');
                          setVerificationError('');
                          setIsOperationNotAllowedError(false);
                          triggerToast('Firebase Auth 인증 메일이 발송되었습니다. 가입하신 메일 수신함을 확인해 주세요.', 'success');
                        } catch (err: any) {
                          console.error("Firebase registration failed:", err);
                          let errorMsg = err.message;
                          if (err.code === 'auth/email-already-in-use') {
                            errorMsg = '이미 가입된 이메일 주소입니다. 다른 이메일 주소를 입력하거나 로그인을 진행해 주세요.';
                          } else if (err.code === 'auth/weak-password') {
                            errorMsg = '비밀번호가 너무 취약합니다. 최소 6자리 이상의 비밀번호를 설정해 주세요.';
                          } else if (err.code === 'auth/invalid-email') {
                            errorMsg = '올바르지 않은 이메일 형식입니다.';
                          } else if (err.code === 'auth/operation-not-allowed' || err.message?.includes('Operation-not-allowed')) {
                            errorMsg = 'Firebase 가입 오류: Firebase 콘솔의 Authentication -> Sign-in method에서 이메일/비밀번호(Email/Password) 로그인이 활성화되어 있지 않습니다.';
                            setIsOperationNotAllowedError(true);
                          } else {
                            errorMsg = `Firebase 가입 오류: ${err.message}. (Firebase Console의 Email/Password 활성화 상태를 점검해 보세요.)`;
                          }
                          setVerificationError(errorMsg);
                        }
                      } else {
                        // Fallback to simulation if Firebase is not connected or bypass is on
                        const code = Math.floor(100000 + Math.random() * 900000).toString();
                        setGeneratedCode(code);
                        setVerificationStep('verify');
                        setVerificationCode('');
                        setVerificationError('');
                        setIsOperationNotAllowedError(false);
                        triggerToast('시뮬레이션 인증 코드가 발송되었습니다. (하단 시뮬레이션 창을 확인하세요!)', 'info');
                      }
                    }} 
                    className="space-y-4 text-left"
                  >
                    {verificationError && (
                      <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-900/50 text-[11px] text-red-400 font-medium">
                        {verificationError}
                      </div>
                    )}

                    {isOperationNotAllowedError && (
                      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-900/40 text-xs text-amber-300 space-y-2.5">
                        <p className="font-bold">💡 Firebase 이메일/비밀번호 기능이 비활성화 상태입니다.</p>
                        <p className="text-[11px] text-neutral-300 leading-relaxed">
                          원활한 배포 및 테스트를 위해 아래 버튼을 클릭하여 즉시 <strong>가상 이메일 시뮬레이션 모드</strong>로 가입을 시도해 보세요. (실제 Firebase 연결을 건너뛰고 가상 인증번호로 빠른 가입이 가능합니다!)
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setForceSimulationAuth(true);
                            setIsOperationNotAllowedError(false);
                            // Trigger simulation registration sequence immediately
                            const code = Math.floor(100000 + Math.random() * 900000).toString();
                            setGeneratedCode(code);
                            setVerificationStep('verify');
                            setVerificationCode('');
                            setVerificationError('');
                            triggerToast('가상 이메일 시뮬레이션 인증 코드가 발송되었습니다.', 'info');
                          }}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-[11px] rounded-lg transition-all cursor-pointer text-center"
                        >
                          시뮬레이션 가입 모드로 즉시 우회하기
                        </button>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide">성명 <span className="text-kpcia-gold">*</span></label>
                      <input
                        type="text"
                        required
                        value={gwName}
                        onChange={(e) => setGwName(e.target.value)}
                        placeholder="예: 김성우 강사"
                        className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:border-kpcia-gold/50 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide">로그인용 아이디 <span className="text-kpcia-gold">*</span></label>
                        <input
                          type="text"
                          required
                          value={gwLoginId}
                          onChange={(e) => setGwLoginId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                          placeholder="아이디 (영문/숫자)"
                          className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:border-kpcia-gold/50 outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide">비밀번호 <span className="text-kpcia-gold">*</span></label>
                        <input
                          type="password"
                          required
                          value={gwPassword}
                          onChange={(e) => setGwPassword(e.target.value)}
                          placeholder="비밀번호"
                          className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:border-kpcia-gold/50 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide">이메일 주소 <span className="text-kpcia-gold">*</span></label>
                      <input
                        type="email"
                        required
                        value={gwEmail}
                        onChange={(e) => setGwEmail(e.target.value)}
                        placeholder="sungwoo@kpcia.or.kr"
                        className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:border-kpcia-gold/50 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide">연락처 (휴대폰)</label>
                      <input
                        type="tel"
                        value={gwPhone}
                        onChange={(e) => setGwPhone(e.target.value)}
                        placeholder="010-9999-8888"
                        className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:border-kpcia-gold/50 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide">핵심 강의 전문 분야</label>
                      <input
                        type="text"
                        value={gwTitle}
                        onChange={(e) => setGwTitle(e.target.value)}
                        placeholder="예: HRD 조직문화 및 리더십 혁신"
                        className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:border-kpcia-gold/50 outline-none"
                      />
                    </div>

                    <div className="pt-3 border-t border-neutral-800/60 flex space-x-2">
                      <button
                        type="submit"
                        className="w-full py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-extrabold rounded-lg transition-all shadow-md shadow-kpcia-gold/10"
                      >
                        이메일 인증 요청
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 text-left animate-in fade-in">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-kpcia-gold uppercase tracking-wider block">STEP 2: 이메일 인증 진행 중</span>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        이메일 <strong className="text-neutral-100">{gwEmail}</strong>의 실제 소유주 확인을 완료해 주세요.
                      </p>
                    </div>

                    {auth && useFirestore && !forceSimulationAuth ? (
                      /* Real Firebase Auth instructions */
                      <div className="space-y-3">
                        <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                          <p className="text-[11px] text-neutral-350 leading-relaxed">
                            입력하신 메일 수신함으로 <strong>Firebase 인증 링크</strong>가 발송되었습니다. 수신된 메일에서 인증 링크를 클릭한 후, 아래 <strong className="text-kpcia-gold">"이메일 인증 완료 확인 및 가입"</strong> 버튼을 눌러주세요.
                          </p>
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  if (auth.currentUser) {
                                    await sendEmailVerification(auth.currentUser);
                                    triggerToast('인증 이메일을 다시 발송하였습니다.', 'success');
                                  } else {
                                    triggerToast('세션이 만료되었습니다. 이전 단계로 돌아가 주세요.', 'info');
                                  }
                                } catch (err: any) {
                                  triggerToast('메일 재전송 실패: ' + err.message, 'info');
                                }
                              }}
                              className="text-[9px] text-neutral-400 hover:text-kpcia-gold underline"
                            >
                              인증 메일 다시 보내기
                            </button>
                          </div>
                        </div>

                        {verificationError && (
                          <p className="text-[10px] text-red-400 font-medium">⚠ {verificationError}</p>
                        )}

                        <div className="pt-3 border-t border-neutral-800/60 flex space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setVerificationStep('input');
                              setVerificationError('');
                            }}
                            className="flex-1 py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-bold rounded-lg transition-all"
                          >
                            이전 단계로
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setVerificationError('');
                              try {
                                const fbUser = auth.currentUser;
                                if (fbUser) {
                                  await fbUser.reload();
                                  if (fbUser.emailVerified) {
                                    await handleRegisterUser(gwName.trim(), gwEmail.trim(), gwTier, gwTitle.trim(), gwPhone.trim(), gwLoginId.trim(), gwPassword.trim(), fbUser.uid, true);
                                    setShowAuthModal(false);
                                    
                                    // Reset state
                                    setGwName('');
                                    setGwEmail('');
                                    setGwTitle('');
                                    setGwPhone('');
                                    setGwLoginId('');
                                    setGwPassword('');
                                    setVerificationStep('input');
                                    setVerificationCode('');
                                    setGeneratedCode('');
                                  } else {
                                    setVerificationError('아직 이메일 인증이 완료되지 않았습니다. 메일 수신함의 링크를 클릭한 후 다시 시도해 주세요.');
                                  }
                                } else {
                                  setVerificationError('인증 세션이 유효하지 않습니다. 다시 가입 단계를 진행해 주세요.');
                                }
                              } catch (err: any) {
                                setVerificationError('인증 상태 확인 중 오류 발생: ' + err.message);
                              }
                            }}
                            className="flex-1 py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-extrabold rounded-lg transition-all shadow-md shadow-kpcia-gold/10"
                          >
                            이메일 인증 완료 확인 및 가입
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Fallback simulator instructions if offline/localStorage mode */
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide">6자리 인증코드 입력</label>
                          <input
                            type="text"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="XXXXXX"
                            className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-lg text-center tracking-widest font-mono text-kpcia-gold focus:border-kpcia-gold outline-none"
                          />
                          {verificationError && (
                            <p className="text-[10px] text-red-400 font-medium mt-1">⚠ {verificationError}</p>
                          )}
                        </div>

                        <div className="bg-neutral-950/80 border border-neutral-800 p-3 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500">
                            <span className="text-kpcia-gold font-bold">✉ KPCIA 모의 이메일 수신함</span>
                            <span className="bg-kpcia-gold/10 text-kpcia-gold px-1.5 rounded">SIMULATOR ACTIVE</span>
                          </div>
                          <div className="text-[11px] font-mono space-y-1 text-neutral-300 border-t border-neutral-900 pt-1.5">
                            <div><strong>수신:</strong> {gwEmail}</div>
                            <div><strong>제목:</strong> KPCIA 강사 인증 코드</div>
                            <div className="mt-2 text-center p-1.5 bg-neutral-900 border border-neutral-800 text-sm font-bold tracking-widest text-kpcia-gold select-all">
                              {generatedCode}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-neutral-800/60 flex space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setVerificationStep('input');
                              setVerificationError('');
                            }}
                            className="flex-1 py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-bold rounded-lg transition-all"
                          >
                            이전 단계로
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (verificationCode === generatedCode) {
                                await handleRegisterUser(gwName.trim(), gwEmail.trim(), gwTier, gwTitle.trim(), gwPhone.trim(), gwLoginId.trim(), gwPassword.trim());
                                setShowAuthModal(false);
                                
                                // Reset state
                                setGwName('');
                                setGwEmail('');
                                setGwTitle('');
                                setGwPhone('');
                                setGwLoginId('');
                                setGwPassword('');
                                setVerificationStep('input');
                                setVerificationCode('');
                                setGeneratedCode('');
                                setVerificationError('');
                              } else {
                                setVerificationError('인증코드가 일치하지 않습니다.');
                              }
                            }}
                            className="flex-1 py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-extrabold rounded-lg transition-all shadow-md shadow-kpcia-gold/10"
                          >
                            인증 완료 및 가입
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header component with User switcher - hidden in mobile simulated mode */}
      {!isMobileSimulated && (
        <Header
          currentUser={currentUser}
          allUsers={users}
          onUserChange={handleUserChange}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsMobileSimulated(false); // Disable simulator preview when navigating desktop tabs
          }}
          isMobileSimulated={isMobileSimulated}
          onToggleSimulator={() => setIsMobileSimulated(!isMobileSimulated)}
          onOpenRegister={() => {
            setAuthModalTab('register');
            setShowAuthModal(true);
          }}
          onOpenAuthModal={(tab) => {
            setAuthModalTab(tab);
            setShowAuthModal(true);
          }}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-8 no-print" id="main-content">
        {isMobileSimulated ? (
          /* Centered mobile phone simulator with all instructional text removed */
          <div className="flex flex-col items-center justify-center min-h-[740px] py-4" id="simulator-view">
            <AppSimulator
              currentUser={currentUser}
              allUsers={users}
              onUserChange={handleUserChange}
              onLogout={handleLogout}
              onLogin={handleMobileLogin}
              lectures={lectures}
              programs={programs}
              activeMobileTab={activeMobileTab}
              onMobileTabChange={setActiveMobileTab}
              onApplyLecture={handleApplyLecture}
              onInstantApprove={handleInstantApprove}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setIsMobileSimulated(false); // Back to homepage / specific portal tab
              }}
            />
          </div>
        ) : (
          /* Desktop Corporate Website view based on tabs */
          <div className="space-y-8" id="desktop-portal">
            {/* Tab 1: Home (협회 소개 및 웰컴 포털) */}
            {activeTab === 'home' && (
              <div className="space-y-12 animate-in fade-in duration-500" id="portal-home">
                {/* Hero section */}
                <div className="text-center max-w-3xl mx-auto space-y-5 py-6">
                  {/* Reconstructed Association Logo */}
                  <div className="flex justify-center mb-2">
                    <div className="max-w-md w-full bg-neutral-950/40 p-4 rounded-2xl border border-neutral-800/40 backdrop-blur-xs">
                      <KPCIALogo variant="hero" theme="dark" />
                    </div>
                  </div>

                  <div className="inline-flex items-center space-x-2 border border-kpcia-gold/30 rounded-full px-3.5 py-1 bg-kpcia-gold/5 shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-kpcia-gold animate-ping" />
                    <span className="text-[10px] font-mono tracking-widest font-bold text-kpcia-gold uppercase">KPCIA PRESTIGE FORUM</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-100 font-display">
                    대한민국 최고의 기업 교육 명가 <br />
                    <span className="text-gradient bg-gradient-to-r from-kpcia-gold via-amber-200 to-kpcia-gold bg-clip-text text-transparent">한국프레스티지기업강사협회</span>
                  </h2>
                  <p className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-400">
                    KOREA PRESTIGE CORPORATE INSTRUCTOR ASSOCIATION
                  </p>
                  <p className="text-sm sm:text-base text-neutral-400 font-sans max-w-2xl mx-auto leading-relaxed">
                    KPCIA는 검증된 교육 설계 역량과 독창적 마일리지 저작권 공유 모델을 결합하여, 최고 권위의 기업 출강을 리드하는 기업 파견 전문 강사 공식 인증 협회입니다.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                    <button
                      onClick={() => setActiveTab('lectures')}
                      className="px-6 py-2.5 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark font-bold text-xs rounded-xl transition-all shadow-lg shadow-kpcia-gold/15 flex items-center gap-2"
                      id="hero-go-lectures"
                    >
                      <span>출강 매칭 공고 보기</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Features bento-style highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="home-bento">
                  <div 
                    onClick={() => document.getElementById('tier-guide-block')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-neutral-900/65 border border-neutral-800/80 p-6 rounded-xl space-y-3 cursor-pointer hover-premium transition-all group shadow-md"
                  >
                    <div className="w-9 h-9 rounded-lg bg-kpcia-gold/10 border border-kpcia-gold/20 flex items-center justify-center text-kpcia-gold group-hover:bg-kpcia-gold/25 transition-colors">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-sm text-neutral-200 flex items-center gap-1.5 group-hover:text-kpcia-gold transition-colors">
                      <span>5단계 프리미엄 등급제</span>
                      <span className="text-[9px] font-sans text-neutral-500 font-normal group-hover:translate-x-0.5 transition-transform">→</span>
                    </h3>
                    <p className="text-xs text-neutral-200 leading-relaxed font-sans font-medium">
                      Prestige 멤버(일반회원)부터 정교한 공인 어소시에이트 및 대표급 엘리트까지 검증된 실무 전문가 코스를 상세 조회합니다. (클릭 시 이동)
                    </p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('programs')}
                    className="bg-neutral-900/65 border border-neutral-800/80 p-6 rounded-xl space-y-3 cursor-pointer hover-premium transition-all group shadow-md"
                  >
                    <div className="w-9 h-9 rounded-lg bg-kpcia-gold/10 border border-kpcia-gold/20 flex items-center justify-center text-kpcia-gold group-hover:bg-kpcia-gold/25 transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-sm text-neutral-200 flex items-center gap-1.5 group-hover:text-kpcia-gold transition-colors">
                      <span>기획 교안 저작권 마일리지 누적</span>
                      <span className="text-[9px] font-sans text-neutral-500 font-normal group-hover:translate-x-0.5 transition-transform">→</span>
                    </h3>
                    <p className="text-xs text-neutral-200 leading-relaxed font-sans font-medium">
                      자신만의 시그니처 프로그램을 협회에 등재하고, 타 강사가 해당 교안으로 외부 강의 완료 시 기획 저작자에게 자동으로 마일리지가 분배 보장됩니다.
                    </p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('profile')}
                    className="bg-neutral-900/65 border border-neutral-800/80 p-6 rounded-xl space-y-3 cursor-pointer hover-premium transition-all group shadow-md"
                  >
                    <div className="w-9 h-9 rounded-lg bg-kpcia-gold/10 border border-kpcia-gold/20 flex items-center justify-center text-kpcia-gold group-hover:bg-kpcia-gold/25 transition-colors">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-sm text-neutral-200 flex items-center gap-1.5 group-hover:text-kpcia-gold transition-colors">
                      <span>PDF 출력형 강사 정보 카드</span>
                      <span className="text-[9px] font-sans text-neutral-500 font-normal group-hover:translate-x-0.5 transition-transform">→</span>
                    </h3>
                    <p className="text-xs text-neutral-200 leading-relaxed font-sans font-medium">
                      회원 본인의 출강 약력, 이력, 자격 증명 및 획득 디지털 배지를 한 장의 럭셔리 실물 프리미엄 카드로 렌더링하고, PDF 저장 및 출력을 지원합니다.
                    </p>
                  </div>
                </div>

                {/* Prestige Tier Guideline Display */}
                <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 space-y-6" id="tier-guide-block">
                  <div className="text-center max-w-xl mx-auto space-y-1.5">
                    <h3 className="font-display font-bold text-sm text-kpcia-gold uppercase tracking-wider">PRESTIGE MEMBERSHIP GRADATION</h3>
                    <h4 className="font-display font-bold text-lg text-neutral-200">KPCIA 공식 강사 등급 기준표</h4>
                    <p className="text-xs text-neutral-400 font-sans">협회 등급 위원회 심사를 거쳐 등급이 자동으로 변경되며, 등급 상향 즉시 전용 훈장이 발송됩니다.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="tiers-showcase">
                    {[
                      { title: 'Prestige Member', kor: '프레스티지 멤버', desc: '일반 회원 (초기 가입 단계)', badge: '🎖️ Member' },
                      { title: 'Prestige Associate', kor: '프레스티지 어소시에이트', desc: '10강의 출강 & 누적 만족도 4.5 이상 / 5.0 만점', badge: '🥉 Bronze' },
                      { title: 'Prestige Professional', kor: '프레스티지 프로페셔널', desc: '100강의 출강 & 누적 만족도 4.6 이상 / 5.0 만점', badge: '🥈 Silver' },
                      { title: 'Prestige Master', kor: '프레스티지 마스터', desc: '1000강의 출강 & 누적 만족도 4.8 이상 / 5.0 만점', badge: '🥇 Ruby' },
                      { title: 'Prestige Elite', kor: '프레스티지 엘리트', desc: '10000강의 출강 & 누적 만족도 4.9 이상 / 5.0 만점', badge: '👑 Emerald' }
                    ].map((t) => (
                      <div key={t.title} className="p-5 rounded-xl border border-neutral-800 bg-neutral-950/80 space-y-2 text-center flex flex-col justify-between hover-premium transition-all duration-300" id={`tier-showcase-${t.title.replace(' ', '')}`}>
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-kpcia-gold font-mono">{t.badge}</div>
                          <h5 className="font-display font-bold text-[11px] text-neutral-200">{t.title}</h5>
                          <p className="text-[10px] text-neutral-350 font-sans font-semibold">{t.kor}</p>
                        </div>
                        <p className="text-[10px] text-neutral-300 leading-normal font-sans pt-1.5 border-t border-neutral-900 mt-2 font-medium">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Lectures (강의 요청 게시판) */}
            {activeTab === 'lectures' && (
              isPendingApproval ? (
                <PendingApprovalView currentUser={currentUser} setActiveTab={setActiveTab} onInstantApprove={handleInstantApprove} />
              ) : (
                <LectureBoard
                  currentUser={currentUser}
                  lectures={lectures}
                  onApplyLecture={handleApplyLecture}
                  onOpenAuthModal={(tab) => {
                    setAuthModalTab(tab);
                    setShowAuthModal(true);
                  }}
                />
              )
            )}

            {/* Tab 3: Programs (프로그램 공유 게시판) */}
            {activeTab === 'programs' && (
              isPendingApproval ? (
                <PendingApprovalView currentUser={currentUser} setActiveTab={setActiveTab} onInstantApprove={handleInstantApprove} />
              ) : (
                <ProgramBoard
                  currentUser={currentUser}
                  programs={programs}
                  onRegisterProgram={handleRegisterProgram}
                />
              )
            )}

            {/* Tab 4: Profile / Resume Card Generator */}
            {activeTab === 'profile' && (
              isPendingApproval ? (
                <PendingApprovalView currentUser={currentUser} setActiveTab={setActiveTab} onInstantApprove={handleInstantApprove} />
              ) : (
                <InstructorCard
                  currentUser={currentUser}
                  onSaveProfileCard={handleSaveProfileCard}
                  onGoHome={() => setActiveTab('home')}
                />
              )
            )}

            {/* Tab 4.5: Partnership Proposal Tab */}
            {activeTab === 'proposal' && (
              <PartnershipProposalBoard
                currentUser={currentUser}
                proposals={proposals}
                onSubmitProposal={handleRegisterProposal}
              />
            )}

            {/* Tab 5: Admin Panel Control Room */}
            {activeTab === 'admin' && currentUser?.isAdmin && (
              <AdminPanel
                users={users}
                lectures={lectures}
                transactions={transactions}
                programs={programs}
                proposals={proposals}
                onUpgradeUserTier={handleUpgradeUserTier}
                onAssignLecturer={handleAssignLecturer}
                onCompleteLecture={handleCompleteLecture}
                onAdjustMileage={handleAdjustMileage}
                onUpdateProgramRoyalty={handleUpdateProgramRoyalty}
                onUpdateProposalStatus={handleUpdateProposalStatus}
                onApproveUser={handleApproveUser}
                onRejectUser={handleRejectUser}
                onApproveProgram={handleApproveProgram}
                onAddLecture={handleAddLecture}
                onUpdateUserPerformance={handleUpdateUserPerformance}
                onDeleteUser={handleDeleteUser}
                onDeleteProgram={handleDeleteProgram}
                onResetDatabase={handleResetData}
              />
            )}
          </div>
        )}
      </main>

      {/* Corporate Footprint Footer */}
      <footer className="mt-auto border-t border-neutral-900 bg-kpcia-dark py-8 text-xs text-neutral-500 no-print" id="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4" id="footer-container">
          <div className="space-y-1.5 text-center md:text-left" id="footer-branding">
            <p className="font-display font-bold text-neutral-400">
              KPCIA 한국프레스티지기업강사협회 (비영리 협회)
            </p>
            <p className="text-[9px] font-mono tracking-wider text-neutral-500 font-bold uppercase leading-none">
              KOREA PRESTIGE CORPORATE INSTRUCTOR ASSOCIATION
            </p>
            <p className="text-[10px] font-sans">
              충청북도 충주시 성남동 365번지 | 연락처: 010-6400-0924
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-mono text-neutral-400" id="footer-specs">
            <span>© 2026 KPCIA. All Rights Reserved.</span>
            <span className="w-1.5 h-1.5 rounded-full bg-kpcia-gold" />
            <span>v1.0</span>
          </div>
        </div>
      </footer>

      {/* Global Registration Modal for logged-in users too */}
      {renderRegisterModal()}
    </div>
  );
}
