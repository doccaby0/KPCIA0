import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { UserProfile, LectureRequest, EducationalProgram, MileageTransaction, InstructorTier, DigitalBadge, PartnershipProposal } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase with exact applet database ID configuration
let app;
let db: any = null;
let auth: any = null;
let useFirestore = false;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  // Pass firestoreDatabaseId explicitly so it connects to the assigned database
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
  useFirestore = true;
  console.log("Firebase initialized successfully with database ID:", firebaseConfig.firestoreDatabaseId);
} catch (error) {
  console.warn("Firebase failed to initialize. Falling back to robust LocalStorage storage.", error);
  useFirestore = false;
}

export { db, auth, useFirestore };

// Default Seed Data for local storage fallback and initial database seeding
export const INITIAL_USERS: UserProfile[] = [
  {
    uid: "user_admin",
    email: "admin@kpcia.or.kr",
    name: "KPCIA 운영사무국",
    tier: "Prestige Elite",
    mileage: 500000,
    isAdmin: true,
    loginId: "insight9lab",
    password: "400828",
    isApproved: true,
    emailVerified: true,
    profileCard: {
      title: "KPCIA 협회 운영사무국장",
      bio: "한국 프레스티지 기업 강사 협회 공식 운영 계정입니다. 강의 공고 및 마일리지 누적 정산을 담당합니다.",
      specialties: ["협회 운영", "강사 매칭", "기업 교육 설계"],
      career: ["한국 프레스티지 기업 강사 협회 설립자", "대기업 HRD 연수원 총괄 자문"],
      education: ["서울대학교 교육공학 석사"],
      contactEmail: "admin@kpcia.or.kr",
      contactPhone: "02-1234-5678",
      cardTheme: "gold_luxury"
    },
    badges: [
      {
        id: "badge_elite_admin",
        tier: "Prestige Elite",
        title: "KPCIA 운영사무국",
        description: "KPCIA 공식 운영사무국 인증 마스터 계정입니다.",
        iconType: "emerald_crown",
        dateGranted: "2026-01-01"
      }
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  }
];

export const INITIAL_PROGRAMS: EducationalProgram[] = [
  {
    id: "prog_ai_innovation",
    title: "대기업 생성형 AI 워크플로우 생산성 혁신 솔루션",
    description: "ChatGPT, Claude, Midjourney 등 주요 Generative AI 도구를 실무 워크플로우에 결합하여 200% 생산성을 도출하는 올인원 마스터 커리큘럼입니다.",
    authorId: "user_admin",
    authorName: "KPCIA 운영사무국",
    royaltyRate: 150,
    curriculum: [
      "세션 1: 생성형 AI 기본 원리 및 프롬프트 고도화 엔지니어링",
      "세션 2: 주요 비즈니스 보고서 및 PPT 슬라이드 초안 실시간 생성 실습",
      "세션 3: 노코드 AI 에이전트 설계 및 사내 업무 자동화 파이프라인 구축"
    ],
    targetAudience: "대기업 임직원, 마케팅 및 기획 부서 실무자",
    createdAt: "2026-07-01T10:00:00Z",
    isApproved: true
  },
  {
    id: "prog_mz_leadership",
    title: "MZ 세대 소통 및 피드백 기반 성과 극대화 리더십",
    description: "신세대 직원들의 동기부여 요소 및 심리적 안전감을 분석하고, 실전 롤플레잉을 통해 갈등을 성과로 승화시키는 코칭 프로그램입니다.",
    authorId: "user_admin",
    authorName: "KPCIA 운영사무국",
    royaltyRate: 100,
    curriculum: [
      "세션 1: 최신 직업 가치관 분석 및 심리적 안전감(Psychological Safety)의 이해",
      "세션 2: 성과 촉진을 위한 건설적인 피드백(Constructive Feedback) 5단계 모델",
      "세션 3: 실전 갈등 해결 워크숍 및 상황별 커뮤니케이션 모의 시뮬레이션"
    ],
    targetAudience: "기업체 중간 관리자, 팀장급 임직원",
    createdAt: "2026-07-02T11:00:00Z",
    isApproved: true
  }
];

export const INITIAL_LECTURES: LectureRequest[] = [
  {
    id: "lect_samsung_ai",
    title: "삼성전자 DS부문 초격차 AI 반도체 트렌드 특강",
    description: "반도체 연구소 임직원을 대상으로 하는 초격차 생성형 AI 및 첨단 패키징 트렌드 명품 특강 출강입니다.",
    targetTier: "Prestige Elite",
    budget: 2500000,
    mileageRoyalty: 250,
    programId: "prog_ai_innovation",
    programTitle: "대기업 생성형 AI 워크플로우 생산성 혁신 솔루션",
    date: "2026-07-20",
    time: "13:00 - 16:00",
    duration: "3시간",
    location: "경기도 용인시 삼성인력개발원",
    attendees: 120,
    managerName: "박준영 수석연구원",
    managerPhone: "010-4321-8765",
    status: "open",
    applicants: [],
    createdAt: "2026-07-01T12:00:00Z"
  },
  {
    id: "lect_naver_prompt",
    title: "네이버 클라우드 부트캠프 생성형 AI 프롬프트 엔지니어링",
    description: "네이버 제휴 파트너사 임직원 대상의 AI 기술 활용 업무 생산성 극대화 및 노코드 툴 실습 교육 매칭 공고입니다.",
    targetTier: "Prestige Professional",
    budget: 1200000,
    mileageRoyalty: 120,
    programId: "prog_ai_innovation",
    programTitle: "대기업 생성형 AI 워크플로우 생산성 혁신 솔루션",
    date: "2026-07-25",
    time: "14:00 - 17:00",
    duration: "3시간",
    location: "경기도 성남시 네이버 1784 사옥",
    attendees: 45,
    managerName: "이서연 매니저",
    managerPhone: "010-8765-4321",
    status: "open",
    applicants: [],
    createdAt: "2026-07-02T13:00:00Z"
  },
  {
    id: "lect_skt_leadership",
    title: "SK텔레콤 팀장급 글로벌 리더십 역량 강화 워크숍",
    description: "글로벌 비즈니스 매너, 다문화 팀 빌딩 및 AI 기반 협업 의사결정 시뮬레이션 기획 특강 출강입니다.",
    targetTier: "Prestige Associate",
    budget: 800000,
    mileageRoyalty: 80,
    programId: "prog_mz_leadership",
    programTitle: "MZ 세대 소통 및 피드백 기반 성과 극대화 리더십",
    date: "2026-07-18",
    time: "10:00 - 12:00",
    duration: "2시간",
    location: "서울특별시 중구 SKT T-타워",
    attendees: 30,
    managerName: "정우진 부장",
    managerPhone: "010-5678-1234",
    status: "open",
    applicants: [],
    createdAt: "2026-07-03T14:00:00Z"
  }
];

export const INITIAL_TRANSACTIONS: MileageTransaction[] = [];

export const INITIAL_PROPOSALS: PartnershipProposal[] = [];

// Helper to grant badges automatically based on tier
export function generateBadgeForTier(tier: InstructorTier, dateGranted?: string): DigitalBadge {
  const dateStr = dateGranted || new Date().toISOString().split('T')[0];
  switch (tier) {
    case 'Prestige Associate':
      return {
        id: `badge_associate_${Date.now()}`,
        tier,
        title: "Prestige Associate 배지",
        description: "KPCIA 전문 강사로서 위대한 첫걸음을 인증하는 디지털 청동 훈장입니다.",
        iconType: "bronze_medal",
        dateGranted: dateStr
      };
    case 'Prestige Professional':
      return {
        id: `badge_professional_${Date.now()}`,
        tier,
        title: "Prestige Professional 배지",
        description: "실전 비즈니스 및 고난도 커뮤니케이션 역량이 검증된 실무 전문가 사파이어 방패 배지입니다.",
        iconType: "sapphire_shield",
        dateGranted: dateStr
      };
    case 'Prestige Master':
      return {
        id: `badge_master_${Date.now()}`,
        tier,
        title: "Prestige Master 배지",
        description: "자체 교육 과정을 완벽하게 설계하고 대단위 강의를 장악하는 마스터 강사의 루비 별 배지입니다.",
        iconType: "ruby_star",
        dateGranted: dateStr
      };
    case 'Prestige Elite':
      return {
        id: `badge_elite_${Date.now()}`,
        tier,
        title: "Prestige Elite 배지",
        description: "협회를 대표하며 선구자적 인사이트를 전파하는 최고 영예의 에메랄드 왕관 배지입니다.",
        iconType: "emerald_crown",
        dateGranted: dateStr
      };
    default:
      return {
        id: `badge_member_${Date.now()}`,
        tier: 'Prestige Member',
        title: "KPCIA Prestige Member 배지",
        description: "한국 프레스티지 기업 강사 협회 공식 가입 회원 인증 배지입니다.",
        iconType: "bronze_medal",
        dateGranted: dateStr
      };
  }
}

// Global Sync State Wrapper
// Connects to Firestore collections dynamically if Firestore is connected.
// If Firestore throws permission errors or missing collections, it transparently synchronizes with localStorage.
// This guarantees smooth UX and live changes!
export class StorageService {
  private static getLocal<T>(key: string, fallback: T): T {
    const saved = localStorage.getItem(`kpcia_${key}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return fallback; }
    }
    localStorage.setItem(`kpcia_${key}`, JSON.stringify(fallback));
    return fallback;
  }

  private static setLocal(key: string, data: any) {
    localStorage.setItem(`kpcia_${key}`, JSON.stringify(data));
  }

  // Robust helper to execute Firestore operations with a fast timeout fallback
  private static async runWithTimeout<T>(op: () => Promise<T>, fallback: T, timeoutMs: number = 1500): Promise<T> {
    if (!useFirestore || !db) return fallback;
    try {
      return await Promise.race([
        op(),
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs))
      ]);
    } catch (e) {
      console.warn("Firestore connection timed out or failed. Dynamically fallback to robust LocalStorage/LocalState.", e);
      // If a timeout occurs, disable future Firestore requests to make transitions instant and zero-latency
      if (e instanceof Error && e.message === "Timeout") {
        console.warn("Disabling Firestore queries for this session to ensure responsive UI experience.");
        useFirestore = false;
      }
      return fallback;
    }
  }

  // Seeding Firestore helper
  static async seedDatabaseIfEmpty() {
    if (!useFirestore || !db) return;
    try {
      await Promise.race([
        (async () => {
          const usersSnap = await getDocs(collection(db, 'users'));
          if (usersSnap.empty) {
            console.log("Seeding Firestore with initial values...");
            // Seed users
            for (const u of INITIAL_USERS) {
              await setDoc(doc(db, 'users', u.uid), u);
            }
            // Seed lectures
            for (const l of INITIAL_LECTURES) {
              await setDoc(doc(db, 'lectures', l.id), l);
            }
            // Seed programs
            for (const p of INITIAL_PROGRAMS) {
              await setDoc(doc(db, 'programs', p.id), p);
            }
            // Seed transactions
            for (const tx of INITIAL_TRANSACTIONS) {
              await setDoc(doc(db, 'transactions', tx.id), tx);
            }
            // Seed proposals
            for (const p of INITIAL_PROPOSALS) {
              await setDoc(doc(db, 'proposals', p.id), p);
            }
            console.log("Firestore successfully seeded!");
          }
        })(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500))
      ]);
    } catch (e) {
      console.warn("Could not seed Firestore due to permissions/connection/timeout. Standard operation continues via local state.", e);
      if (e instanceof Error && e.message === "Timeout") {
        useFirestore = false;
      }
    }
  }

  // Users Operations
  static async getUsers(): Promise<UserProfile[]> {
    const localData = this.getLocal<UserProfile[]>('users', INITIAL_USERS);
    const rawList = await this.runWithTimeout(async () => {
      const snap = await getDocs(collection(db, 'users'));
      if (!snap.empty) {
        const list: UserProfile[] = [];
        snap.forEach(d => list.push(d.data() as UserProfile));
        return list;
      }
      return localData;
    }, localData);

    return rawList.map(u => ({
      ...u,
      isApproved: u.isApproved !== undefined ? u.isApproved : true,
      emailVerified: u.emailVerified !== undefined ? u.emailVerified : true,
      lectureCount: u.lectureCount !== undefined ? u.lectureCount : 0,
      lectureRatings: u.lectureRatings || [],
      averageRating: u.averageRating !== undefined ? u.averageRating : 0,
    }));
  }

  static async saveUser(user: UserProfile): Promise<void> {
    const current = await this.getUsers();
    const updated = current.map(u => u.uid === user.uid ? user : u);
    if (!updated.some(u => u.uid === user.uid)) {
      updated.push(user);
    }
    this.setLocal('users', updated);

    await this.runWithTimeout(async () => {
      await setDoc(doc(db, 'users', user.uid), user);
    }, null);
  }

  // Lectures Operations
  static async getLectures(): Promise<LectureRequest[]> {
    const localData = this.getLocal<LectureRequest[]>('lectures', INITIAL_LECTURES);
    return this.runWithTimeout(async () => {
      const snap = await getDocs(collection(db, 'lectures'));
      if (!snap.empty) {
        const list: LectureRequest[] = [];
        snap.forEach(d => list.push(d.data() as LectureRequest));
        return list;
      }
      return localData;
    }, localData);
  }

  static async saveLecture(lecture: LectureRequest): Promise<void> {
    const current = await this.getLectures();
    const updated = current.map(l => l.id === lecture.id ? lecture : l);
    if (!updated.some(l => l.id === lecture.id)) {
      updated.push(lecture);
    }
    this.setLocal('lectures', updated);

    await this.runWithTimeout(async () => {
      await setDoc(doc(db, 'lectures', lecture.id), lecture);
    }, null);
  }

  // Programs Operations
  static async getPrograms(): Promise<EducationalProgram[]> {
    const localData = this.getLocal<EducationalProgram[]>('programs', INITIAL_PROGRAMS);
    const rawList = await this.runWithTimeout(async () => {
      const snap = await getDocs(collection(db, 'programs'));
      if (!snap.empty) {
        const list: EducationalProgram[] = [];
        snap.forEach(d => list.push(d.data() as EducationalProgram));
        return list;
      }
      return localData;
    }, localData);

    return rawList.map(p => ({
      ...p,
      isApproved: p.isApproved !== undefined ? p.isApproved : true
    }));
  }

  static async saveProgram(program: EducationalProgram): Promise<void> {
    const current = await this.getPrograms();
    const updated = current.map(p => p.id === program.id ? program : p);
    if (!updated.some(p => p.id === program.id)) {
      updated.push(program);
    }
    this.setLocal('programs', updated);

    await this.runWithTimeout(async () => {
      await setDoc(doc(db, 'programs', program.id), program);
    }, null);
  }

  static async deleteProgram(programId: string): Promise<void> {
    const current = await this.getPrograms();
    const updated = current.filter(p => p.id !== programId);
    this.setLocal('programs', updated);

    await this.runWithTimeout(async () => {
      await deleteDoc(doc(db, 'programs', programId));
    }, null);
  }

  // Transactions Operations
  static async getTransactions(): Promise<MileageTransaction[]> {
    const localData = this.getLocal<MileageTransaction[]>('transactions', INITIAL_TRANSACTIONS);
    return this.runWithTimeout(async () => {
      const snap = await getDocs(collection(db, 'transactions'));
      if (!snap.empty) {
        const list: MileageTransaction[] = [];
        snap.forEach(d => list.push(d.data() as MileageTransaction));
        return list;
      }
      return localData;
    }, localData);
  }

  static async addTransaction(tx: MileageTransaction): Promise<void> {
    const current = await this.getTransactions();
    current.push(tx);
    this.setLocal('transactions', current);

    await this.runWithTimeout(async () => {
      await setDoc(doc(db, 'transactions', tx.id), tx);
    }, null);
  }

  // Partnership Proposals Operations
  static async getProposals(): Promise<PartnershipProposal[]> {
    const localData = this.getLocal<PartnershipProposal[]>('proposals', INITIAL_PROPOSALS);
    return this.runWithTimeout(async () => {
      const snap = await getDocs(collection(db, 'proposals'));
      if (!snap.empty) {
        const list: PartnershipProposal[] = [];
        snap.forEach(d => list.push(d.data() as PartnershipProposal));
        return list;
      }
      return localData;
    }, localData);
  }

  static async saveProposal(proposal: PartnershipProposal): Promise<void> {
    const current = await this.getProposals();
    const updated = current.map(p => p.id === proposal.id ? proposal : p);
    if (!updated.some(p => p.id === proposal.id)) {
      updated.push(proposal);
    }
    this.setLocal('proposals', updated);

    await this.runWithTimeout(async () => {
      await setDoc(doc(db, 'proposals', proposal.id), proposal);
    }, null);
  }

  static async deleteUser(userId: string): Promise<void> {
    const current = await this.getUsers();
    const updated = current.filter(u => u.uid !== userId);
    this.setLocal('users', updated);

    await this.runWithTimeout(async () => {
      await deleteDoc(doc(db, 'users', userId));
    }, null);
  }

  // Clear local storage and Firestore data and restore default state
  static async resetDatabase(): Promise<void> {
    localStorage.removeItem('kpcia_users');
    localStorage.removeItem('kpcia_lectures');
    localStorage.removeItem('kpcia_programs');
    localStorage.removeItem('kpcia_transactions');
    localStorage.removeItem('kpcia_proposals');

    if (useFirestore && db) {
      try {
        const collections = ['users', 'lectures', 'programs', 'transactions', 'proposals'];
        for (const colName of collections) {
          const snap = await getDocs(collection(db, colName));
          for (const d of snap.docs) {
            await deleteDoc(doc(db, colName, d.id));
          }
        }
        // Seed initial users
        for (const u of INITIAL_USERS) {
          await setDoc(doc(db, 'users', u.uid), u);
        }
        // Seed initial lectures
        for (const l of INITIAL_LECTURES) {
          await setDoc(doc(db, 'lectures', l.id), l);
        }
        // Seed initial programs
        for (const p of INITIAL_PROGRAMS) {
          await setDoc(doc(db, 'programs', p.id), p);
        }
        // Seed initial transactions
        for (const tx of INITIAL_TRANSACTIONS) {
          await setDoc(doc(db, 'transactions', tx.id), tx);
        }
        // Seed initial proposals
        for (const p of INITIAL_PROPOSALS) {
          await setDoc(doc(db, 'proposals', p.id), p);
        }
      } catch (e) {
        console.warn("Firestore collection delete/reseed failed, fallback to local cache reset.", e);
      }
    }
  }
}
