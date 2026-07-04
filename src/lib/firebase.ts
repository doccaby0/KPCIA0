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
import { UserProfile, LectureRequest, EducationalProgram, MileageTransaction, InstructorTier, DigitalBadge, PartnershipProposal } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase with exact applet database ID configuration
let app;
let db: any = null;
let useFirestore = false;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  // Pass firestoreDatabaseId explicitly so it connects to the assigned database
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  useFirestore = true;
  console.log("Firebase initialized successfully with database ID:", firebaseConfig.firestoreDatabaseId);
} catch (error) {
  console.warn("Firebase failed to initialize. Falling back to robust LocalStorage storage.", error);
  useFirestore = false;
}

// Default Seed Data for local storage fallback and initial database seeding
export const INITIAL_USERS: UserProfile[] = [
  {
    uid: "user_admin",
    email: "admin@kpcia.or.kr",
    name: "KPCIA 운영사무국",
    tier: "Prestige Elite",
    mileage: 500000,
    isAdmin: true,
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
        title: "Prestige Elite 배지",
        description: "KPCIA를 대표하는 최고의 명사 및 명예 이사 단원에게 수여되는 최고 권위의 배지입니다.",
        iconType: "emerald_crown",
        dateGranted: "2026-01-01"
      }
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  },
  {
    uid: "user_associate",
    email: "associate@kpcia.or.kr",
    name: "김도현 강사",
    tier: "Prestige Associate",
    mileage: 1200,
    profileCard: {
      title: "MZ세대 소통 전문 강사",
      bio: "조직 내 세대 갈등 해결과 유연한 소통 문화를 선도하는 신세대 전문 강사 김도현입니다.",
      specialties: ["MZ세대 소통법", "신입사원 비즈니스 매너", "리더십의 시작"],
      career: ["KPCIA 전임 소통 강사", "스타트업 사내 소통 자문역 (3년)"],
      education: ["고려대학교 경영학 학사"],
      contactEmail: "dh_kim@kpcia.or.kr",
      contactPhone: "010-1234-5678",
      cardTheme: "classic"
    },
    badges: [
      {
        id: "badge_associate_dh",
        tier: "Prestige Associate",
        title: "Prestige Associate 배지",
        description: "전문 강사로서 첫발을 내디딘 우수한 강사에게 발급되는 디지털 인증 배지입니다.",
        iconType: "bronze_medal",
        dateGranted: "2026-03-15"
      }
    ],
    lectureCount: 3,
    lectureRatings: [85, 90, 88],
    averageRating: 87.7,
    createdAt: "2026-03-15T12:00:00Z",
    updatedAt: "2026-03-15T12:00:00Z"
  },
  {
    uid: "user_professional",
    email: "professional@kpcia.or.kr",
    name: "이지은 강사",
    tier: "Prestige Professional",
    mileage: 15500,
    profileCard: {
      title: "기업 CS 및 커뮤니케이션 수석 강사",
      bio: "고객 가치 혁신과 설득력 있는 비즈니스 커뮤니케이션으로 기업의 브랜드 품격을 높입니다.",
      specialties: ["비즈니스 커뮤니케이션", "고객 경험(CX) 향상", "기업 CS 전문 솔루션"],
      career: ["S그룹 인재개발원 전임 CS 파트장", "기업체 출강 경력 10년 (누적 2,000시간)"],
      education: ["연세대학교 신문방송학 학사", "연세대학교 언론홍보대학원 석사"],
      contactEmail: "je_lee@kpcia.or.kr",
      contactPhone: "010-2345-6789",
      cardTheme: "midnight_sapphire"
    },
    badges: [
      {
        id: "badge_associate_je",
        tier: "Prestige Associate",
        title: "Prestige Associate 배지",
        description: "전문 강사로서 첫발을 내디딘 우수한 강사에게 발급되는 디지털 인증 배지입니다.",
        iconType: "bronze_medal",
        dateGranted: "2024-05-10"
      },
      {
        id: "badge_professional_je",
        tier: "Prestige Professional",
        title: "Prestige Professional 배지",
        description: "실전 비즈니스 및 고난도 커뮤니케이션 강의 역량이 검증된 실무 전문가 배지입니다.",
        iconType: "sapphire_shield",
        dateGranted: "2025-08-20"
      }
    ],
    lectureCount: 8,
    lectureRatings: [92, 94, 96, 95, 98],
    averageRating: 95.0,
    createdAt: "2024-05-10T09:00:00Z",
    updatedAt: "2025-08-20T17:00:00Z"
  },
  {
    uid: "user_master",
    email: "master@kpcia.or.kr",
    name: "박서준 강사",
    tier: "Prestige Master",
    mileage: 48000,
    profileCard: {
      title: "비즈니스 갈등 중재 & 마스터마인드 협상 가이드",
      bio: "기업의 난제를 해결하는 전략적 의사결정과 마스터마인드 협상술 프레임워크 설계자 박서준입니다.",
      specialties: ["마스터마인드 협상술", "갈등 관리 및 해결", "고위 경영진 전략 워크숍"],
      career: ["KPCIA 수석 교육설계자", "글로벌 컨설팅 펌 시니어 파트너 (12년)"],
      education: ["미국 Wharton School MBA 수료", "성균관대학교 심리학 박사"],
      contactEmail: "sj_park@kpcia.or.kr",
      contactPhone: "010-3456-7890",
      cardTheme: "gold_luxury"
    },
    badges: [
      {
        id: "badge_associate_sj",
        tier: "Prestige Associate",
        title: "Prestige Associate 배지",
        description: "전문 강사로서 첫발을 내디딘 우수한 강사에게 발급되는 디지털 인증 배지입니다.",
        iconType: "bronze_medal",
        dateGranted: "2021-02-11"
      },
      {
        id: "badge_professional_sj",
        tier: "Prestige Professional",
        title: "Prestige Professional 배지",
        description: "실전 비즈니스 및 고난도 커뮤니케이션 강의 역량이 검증된 실무 전문가 배지입니다.",
        iconType: "sapphire_shield",
        dateGranted: "2022-11-05"
      },
      {
        id: "badge_master_sj",
        tier: "Prestige Master",
        title: "Prestige Master 배지",
        description: "독창적인 교육 모델을 설계하고 대단위 강의를 이끄는 마스터 강사의 증표입니다.",
        iconType: "ruby_star",
        dateGranted: "2024-03-30"
      }
    ],
    lectureCount: 15,
    lectureRatings: [96, 98, 97, 99, 100],
    averageRating: 98.0,
    createdAt: "2021-02-11T10:00:00Z",
    updatedAt: "2024-03-30T15:00:00Z"
  },
  {
    uid: "user_elite",
    email: "elite@kpcia.or.kr",
    name: "최유진 강사",
    tier: "Prestige Elite",
    mileage: 120000,
    profileCard: {
      title: "초격차 기업가 정신 & 글로벌 마켓 전략 자문가",
      bio: "국내외 수많은 대기업 사내 연수원 대표 강사로서, 초격차 시대를 주도할 미래 기업가 정신을 교육합니다.",
      specialties: ["초격차 기업가 정신", "글로벌 리더십 트렌드", "ESG & 메가 트렌드 특강"],
      career: ["한국 프레스티지 기업 강사 협회(KPCIA) 이사 겸 명예 대표 강사", "H그룹 글로벌 인재전략 최고 자문위원"],
      education: ["서울대학교 경영대학원 경영학 박사"],
      contactEmail: "yj_choi@kpcia.or.kr",
      contactPhone: "010-4567-8901",
      cardTheme: "elite_emerald"
    },
    badges: [
      {
        id: "badge_associate_yj",
        tier: "Prestige Associate",
        title: "Prestige Associate 배지",
        description: "전문 강사로서 첫발을 내디딘 우수한 강사에게 발급되는 디지털 인증 배지입니다.",
        iconType: "bronze_medal",
        dateGranted: "2018-04-12"
      },
      {
        id: "badge_professional_yj",
        tier: "Prestige Professional",
        title: "Prestige Professional 배지",
        description: "실전 비즈니스 및 고난도 커뮤니케이션 강의 역량이 검증된 실무 전문가 배지입니다.",
        iconType: "sapphire_shield",
        dateGranted: "2020-09-18"
      },
      {
        id: "badge_master_yj",
        tier: "Prestige Master",
        title: "Prestige Master 배지",
        description: "독창적인 교육 모델을 설계하고 대단위 강의를 이끄는 마스터 강사의 증표입니다.",
        iconType: "ruby_star",
        dateGranted: "2022-07-22"
      },
      {
        id: "badge_elite_yj",
        tier: "Prestige Elite",
        title: "Prestige Elite 배지",
        description: "KPCIA를 대표하는 최고의 명사 및 명예 이사 단원에게 수여되는 최고 권위의 배지입니다.",
        iconType: "emerald_crown",
        dateGranted: "2025-01-10"
      }
    ],
    lectureCount: 32,
    lectureRatings: [99, 98, 100, 100, 99],
    averageRating: 99.4,
    createdAt: "2018-04-12T14:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z"
  }
];

export const INITIAL_PROGRAMS: EducationalProgram[] = [
  {
    id: "prog_001",
    title: "초격차 기업가 정신 프로그램",
    description: "초불확실성 시대 속 기업들이 생존을 넘어 시장 판도를 뒤흔들 파괴적 혁신 DNA를 이식하는 고품격 최고경영자/임원 프로그램입니다. 리더의 도전 정신과 핵심 전략 프레임워크를 강의합니다.",
    authorId: "user_elite",
    authorName: "최유진 강사",
    royaltyRate: 8000,
    curriculum: [
      "1강: 초격차 경영의 시대정신과 파괴적 혁신",
      "2강: 메가트렌드 센싱 및 사내 벤처 전략 설계",
      "3강: 글로벌 시장 확장을 위한 리스크 테이킹",
      "4강: 리더십의 완성: 가치 중심의 ESG 경영"
    ],
    targetAudience: "대기업 및 중견기업 임원, 대표이사급 전문 경영인",
    isApproved: true,
    createdAt: "2026-01-15T10:00:00Z"
  },
  {
    id: "prog_002",
    title: "마스터마인드 협상술",
    description: "갈등을 승리로 바꾸는 실전 비즈니스 협상 프레임워크입니다. 행동과학적 접근법과 모의 시뮬레이션을 결합하여 상대의 의도를 정밀하게 읽고 윈-윈(Win-Win) 합의를 도출해내는 능력을 배양합니다.",
    authorId: "user_master",
    authorName: "박서준 강사",
    royaltyRate: 5000,
    curriculum: [
      "1강: 비즈니스 갈등 해결의 행동심리학적 접근",
      "2강: BATNA(최선의 대안) 구축과 가치 확대 전술",
      "3강: 극한 대립 상황에서의 앵커링과 양보 조율법",
      "4강: 계약 체결과 장기적 파트너십 구축 신뢰 자산"
    ],
    targetAudience: "전략제휴실, 구매팀, 신사업개발팀 및 영업 부서 총괄",
    isApproved: true,
    createdAt: "2026-02-10T11:00:00Z"
  },
  {
    id: "prog_003",
    title: "MZ세대 융합 스마트 소통법",
    description: "세대 간 불통과 오해로 저하되는 조직 생산성을 회복하기 위한 밀도 높은 실무 특강입니다. 상호 성장을 이끄는 긍정 피드백 루프와 업무 지시 시각화 기법을 제공합니다.",
    authorId: "user_associate",
    authorName: "김도현 강사",
    royaltyRate: 3000,
    curriculum: [
      "1강: 90년대생과 2000년대생이 원하는 진짜 회사생활",
      "2강: '왜요?'에 현명하게 답하는 마인드셋 & 업무 지시법",
      "3강: 사기를 충전하는 3분 성찰과 밀착 피드백 메커니즘",
      "4강: 소외감 없는 원 팀(One Team) 비주얼 커뮤니케이션"
    ],
    targetAudience: "기업 사내 중간 관리자, 팀장급, 실무 리더",
    isApproved: true,
    createdAt: "2026-03-20T09:30:00Z"
  }
];

export const INITIAL_LECTURES: LectureRequest[] = [
  {
    id: "lect_001",
    title: "삼성 HRD 핵심인재 리더십 포럼",
    description: "삼성그룹 미래 리더 육성을 위해 개설되는 1박 2일 워크숍의 키노트 특강입니다. 고위직 비즈니스 협상 프레임워크를 전문 교육 프로그램인 '마스터마인드 협상술'을 기반으로 출강해주실 전문 강사님을 초빙합니다.",
    targetTier: "Prestige Professional",
    budget: 1500000,
    mileageRoyalty: 5000,
    programId: "prog_002",
    programTitle: "마스터마인드 협상술",
    date: "2026-07-15",
    time: "14:00 - 17:00",
    duration: "3 hours",
    location: "경기도 용인시 삼성인력개발원 창조관 대강당",
    attendees: 30,
    status: "open",
    applicants: ["user_professional", "user_master"],
    createdAt: "2026-07-01T09:00:00Z"
  },
  {
    id: "lect_002",
    title: "현대자동차 차세대 신사업본부 미래 기업가정신 특강",
    description: "글로벌 자동차 산업 메가트렌드 격변기를 극복할 사내 핵심 연구원 및 임원진 80명 대상 특강입니다. 최고 완성도의 '초격차 기업가 정신 프로그램' 교안을 정식 라이선스로 활용해 출강하는 자리입니다. 교안 및 슬라이드는 원작자의 승인 하에 전면 제공됩니다.",
    targetTier: "Prestige Elite",
    budget: 3500000,
    mileageRoyalty: 8000,
    programId: "prog_001",
    programTitle: "초격차 기업가 정신 프로그램",
    date: "2026-07-28",
    time: "13:00 - 16:00",
    duration: "3 hours",
    location: "서울시 서초구 현대자동차 본사 컨퍼런스홀",
    attendees: 80,
    status: "open",
    applicants: [],
    createdAt: "2026-07-02T10:15:00Z"
  },
  {
    id: "lect_003",
    title: "SK하이닉스 신입사원 소통 & 조직 적응 워크숍",
    description: "새로 입사한 반도체 엔지니어 핵심 인재들이 조직에 부드럽게 연착륙할 수 있도록 돕는 실질 소통 워크숍입니다. KPCIA의 공식 연수 모듈을 기반으로 유연하게 교육해주실 강사님을 모집합니다.",
    targetTier: "Prestige Associate",
    budget: 800000,
    mileageRoyalty: 3000,
    programId: "prog_003",
    programTitle: "MZ세대 융합 스마트 소통법",
    date: "2026-07-10",
    time: "10:00 - 12:00",
    duration: "2 hours",
    location: "경기도 이천시 SK하이닉스 인재개발원 201호",
    attendees: 50,
    status: "assigned",
    assignedTo: "user_associate",
    assignedName: "김도현 강사",
    applicants: ["user_associate"],
    createdAt: "2026-06-25T14:00:00Z"
  },
  {
    id: "lect_004",
    title: "롯데쇼핑 신임 점장 리더십 & CS 역량 강화 세미나",
    description: "전국 롯데쇼핑 신임 점장님들을 모시고 고객 경험 극대화와 소통 리더십을 강의합니다. 현장감 있는 실제 고객 응대 사례 위주로 강의를 풀어주실 강사님을 초빙합니다.",
    targetTier: "Prestige Professional",
    budget: 1200000,
    mileageRoyalty: 0,
    date: "2026-07-20",
    time: "15:00 - 17:00",
    duration: "2 hours",
    location: "서울 잠실 롯데월드타워 본사 31층 대강당",
    attendees: 45,
    status: "open",
    applicants: [],
    createdAt: "2026-07-02T16:00:00Z"
  }
];

export const INITIAL_TRANSACTIONS: MileageTransaction[] = [
  {
    id: "tx_001",
    userId: "user_master",
    userName: "박서준 강사",
    type: "program_register",
    amount: 10000,
    description: "'마스터마인드 협상술' 정식 교육 프로그램 개발 및 협회 등재 축하 축의 마일리지",
    createdAt: "2026-02-10T11:05:00Z"
  },
  {
    id: "tx_002",
    userId: "user_elite",
    userName: "최유진 강사",
    type: "program_register",
    amount: 15000,
    description: "'초격차 기업가 정신 프로그램' 정식 교육 프로그램 개발 및 협회 등재 축하 축의 마일리지",
    createdAt: "2026-01-15T10:10:00Z"
  },
  {
    id: "tx_003",
    userId: "user_associate",
    userName: "김도현 강사",
    type: "lecture_payout",
    amount: 3000,
    description: "SK하이닉스 신입사원 워크숍 출강 성공 마일리지 정산 및 원작자 마일리지 누적 대기",
    createdAt: "2026-06-25T18:00:00Z"
  }
];

export const INITIAL_PROPOSALS: PartnershipProposal[] = [
  {
    id: 'prop_01',
    companyName: '삼성전자 상생협력센터',
    proposerName: '이동훈 파트장',
    email: 'dh.lee@samsung.com',
    phone: '010-1234-5678',
    title: '신임 부서장 대상 프리미엄 조직문화 교육과정 정기 위탁 계약 제안',
    content: 'KPCIA 소속의 프레스티지 등급 강사 분들을 매 분기 당사의 리더십 강연자로 초빙하고자 제안 드립니다. 협회 강사분들의 교육 역량이 매우 뛰어나다고 들었습니다. 2026년 하반기 시범 운영 후 정식 MOU 체결을 검토 중입니다.',
    status: 'pending',
    createdAt: '2026-07-01T10:00:00.000Z'
  },
  {
    id: 'prop_02',
    companyName: '충주시 인재개발원',
    proposerName: '김민아 사무관',
    email: 'minak@korea.kr',
    phone: '010-8765-4321',
    title: '지자체 핵심 공직자 대상 실전 비즈니스 소통 및 갈등 해결 특강 요청',
    content: '지역사회 발전을 위해 애쓰시는 공직자들의 역량 강화를 위해 협회 소속 전문 강사님의 출강을 적극적으로 제안합니다. 특히 갈등 관리 및 적극 행정 마인드셋 강의를 희망합니다.',
    status: 'accepted',
    createdAt: '2026-06-25T14:30:00.000Z'
  }
];

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
}
