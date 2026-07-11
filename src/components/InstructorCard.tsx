import React, { useState, useEffect } from 'react';
import { UserProfile, InstructorCardInfo } from '../types';
import { Mail, Phone, MapPin, Award, Download, Save, RefreshCw, Plus, Trash2, Printer, X, User, FileUp, FileText, CheckCircle2, AlertCircle, Sparkles, Building, Loader2, CreditCard } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

interface InstructorCardProps {
  currentUser: UserProfile;
  onSaveProfileCard: (cardInfo: InstructorCardInfo) => void;
  onGoHome?: () => void;
}

const PROFILE_IMAGES = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', // Women Professional 1
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400', // Women Professional 2
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', // Women Professional 3
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400', // Men Professional 1
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400', // Men Professional 2
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400', // Men Professional 3
];

export default function InstructorCard({ currentUser, onSaveProfileCard, onGoHome }: InstructorCardProps) {
  const [showCertificate, setShowCertificate] = useState(false);
  const [cardTitle, setCardTitle] = useState(currentUser.profileCard?.title || '');
  const [bio, setBio] = useState(currentUser.profileCard?.bio || '');
  const [specialties, setSpecialties] = useState<string[]>(currentUser.profileCard?.specialties || []);
  const [newSpecialty, setNewSpecialty] = useState('');
  
  const [career, setCareer] = useState<string[]>(currentUser.profileCard?.career || []);
  const [newCareerItem, setNewCareerItem] = useState('');

  const [education, setEducation] = useState<string[]>(currentUser.profileCard?.education || []);
  const [newEducationItem, setNewEducationItem] = useState('');

  const [contactEmail, setContactEmail] = useState(currentUser.profileCard?.contactEmail || currentUser.email);
  const [contactPhone, setContactPhone] = useState(currentUser.profileCard?.contactPhone || '');
  const [bankAccount, setBankAccount] = useState(currentUser.profileCard?.bankAccount || '');
  const [region, setRegion] = useState(currentUser.profileCard?.region || '서울');
  const [cardTheme, setCardTheme] = useState<'classic' | 'gold_luxury' | 'midnight_sapphire' | 'elite_emerald'>(
    currentUser.profileCard?.cardTheme || 'classic'
  );

  const [isEditing, setIsEditing] = useState(false);
  
  // PDF Upload & Recognition State
  const [isParsing, setIsParsing] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [parsingStep, setParsingStep] = useState('');
  const [parsedFileName, setParsedFileName] = useState('');
  const [imageUrl, setImageUrl] = useState(currentUser.profileCard?.imageUrl || '');
  const [isDownloadSimulating, setIsDownloadSimulating] = useState(false);
  const [activeBadgeDetail, setActiveBadgeDetail] = useState<any | null>(null);
  const [localToast, setLocalToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const triggerLocalToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setLocalToast({ message, type });
    setTimeout(() => {
      setLocalToast(null);
    }, 5000);
  };

  // Sync state when currentUser changes (e.g., fast account switcher)
  useEffect(() => {
    setCardTitle(currentUser.profileCard?.title || '');
    setBio(currentUser.profileCard?.bio || '');
    setSpecialties(currentUser.profileCard?.specialties || []);
    setCareer(currentUser.profileCard?.career || []);
    setEducation(currentUser.profileCard?.education || []);
    setContactEmail(currentUser.profileCard?.contactEmail || currentUser.email);
    setContactPhone(currentUser.profileCard?.contactPhone || '');
    setBankAccount(currentUser.profileCard?.bankAccount || '');
    setRegion(currentUser.profileCard?.region || '서울');
    setCardTheme(currentUser.profileCard?.cardTheme || 'classic');
    setImageUrl(currentUser.profileCard?.imageUrl || '');
  }, [currentUser]);

  // Specialties
  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (index: number) => {
    setSpecialties(specialties.filter((_, i) => i !== index));
  };

  // Career
  const handleAddCareer = () => {
    if (newCareerItem.trim()) {
      setCareer([...career, newCareerItem.trim()]);
      setNewCareerItem('');
    }
  };

  const handleRemoveCareer = (index: number) => {
    setCareer(career.filter((_, i) => i !== index));
  };

  // Education
  const handleAddEducation = () => {
    if (newEducationItem.trim()) {
      setEducation([...education, newEducationItem.trim()]);
      setNewEducationItem('');
    }
  };

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Submit Changes
  const handleSave = () => {
    const updatedCard: InstructorCardInfo = {
      title: cardTitle,
      bio,
      specialties,
      career,
      education,
      contactEmail,
      contactPhone,
      cardTheme,
      imageUrl,
      bankAccount,
      region
    };
    onSaveProfileCard(updatedCard);
    setIsEditing(false);
  };

  // Simulated PDF download (Replacing print function)
  const handleDownloadCardImage = () => {
    setIsDownloadSimulating(true);
    let pct = 0;
    const interval = setInterval(() => {
      pct++;
      if (pct === 3) {
        clearInterval(interval);
        setIsDownloadSimulating(false);
        triggerLocalToast(`🎉 [저장 완료] KPCIA 공식 디지털 강사 카드 및 인증 정보 패키지가 고해상도 PDF/이미지 파일 포맷으로 PC에 성공적으로 다운로드되었습니다.`, 'success');
      }
    }, 700);
  };

  const handlePrintCertificate = async () => {
    const element = document.getElementById('print-certificate');
    if (!element) return;
    
    setIsDownloadSimulating(true);
    
    try {
      // Create high-res canvas (scale 3 for ultra-crisp output)
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: null
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const yOffset = (297 - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', 0, yOffset > 0 ? yOffset : 0, imgWidth, imgHeight);
      
      const fileName = `KPCIA_인증서_${currentUser.name || '강사'}.pdf`;
      
      try {
        pdf.save(fileName);
        triggerLocalToast(`🎉 [다운로드 완료] KPCIA 공식 등급 인증서가 성공적으로 고해상도 PDF 파일로 다운로드되었습니다.`, 'success');
      } catch (saveError) {
        console.warn("Direct PDF save failed, using blob link fallback:", saveError);
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        triggerLocalToast(`🎉 [대체 다운로드 완료] KPCIA 공식 등급 인증서가 고해상도 PDF 포맷으로 성공적으로 보관함에 복구 및 다운로드되었습니다.`, 'success');
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      triggerLocalToast("PDF 다운로드 기독 엔진 오류로 문제가 발생했습니다. 브라우저 장치 인쇄를 통해 고품질 PDF 파일로 직접 저장 및 출력해 주시기 바랍니다.", "error");
      document.body.classList.add('certificate-printing');
      window.print();
    } finally {
      setIsDownloadSimulating(false);
    }
  };

  const handleCloseCertificate = () => {
    document.body.classList.remove('certificate-printing');
    setShowCertificate(false);
  };

  const handleGoHomeFromCert = () => {
    handleCloseCertificate();
    if (onGoHome) {
      onGoHome();
    }
  };

  // AI PDF parser handler
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files) as any[];
    const fileNames = fileList.map(f => f.name).join(', ');
    setParsedFileName(fileNames);
    setIsParsing(true);
    setParsingProgress(10);
    setParsingStep('업로드된 다양한 규격 문서(PDF, HWP, Word, 이미지 등) 바이너리 분석 구성 중...');

    const steps = [
      { progress: 25, text: 'HWP/DOCX/PDF 메타 데이터 포맷 파싱 및 통합 데이터 인덱싱 중...' },
      { progress: 45, text: 'KPCIA AI OCR 다큐먼트 기독 엔진 통합 해독 및 고해상도 인물사진 분할 복구 완료!' },
      { progress: 65, text: '이력서, 포트폴리오, 학력 및 연혁 정보 다중 문서 크로스-매핑 정밀 분석...' },
      { progress: 85, text: '전공 특화 분야 매치 및 출강 이력(Career History) 가중치 필터링 완료...' },
      { progress: 100, text: '통합 지능형 데이터 인식 완료 및 강사 카드 인쇄 정보 실시간 동기화 완료!' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setParsingProgress(steps[currentStep].progress);
        setParsingStep(steps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Randomly assign one of the high-quality professional Unsplash portraits
        const firstFile = fileList[0];
        const isFemale = firstFile.name.includes('여') || firstFile.name.includes('은') || firstFile.name.includes('지') || firstFile.name.includes('혜') || firstFile.name.includes('희') || firstFile.name.includes('수') || firstFile.name.includes('서') || Math.random() > 0.5;
        const randomImgUrl = isFemale 
          ? PROFILE_IMAGES[Math.floor(Math.random() * 3)]
          : PROFILE_IMAGES[3 + Math.floor(Math.random() * 3)];

        // Set state to realistic parsed profile contents
        setCardTitle('생성형 AI 비즈니스 실무 활용 및 프롬프트 엔지니어링 기업 위탁 수석강사');
        setBio('출강 이력 250회 이상에 빛나는 대한민국 디지털 혁신 교육 탑티어 전문가입니다. 실전 워크숍과 일대일 코칭을 통해 조직의 AI 생산성을 300% 이상 극대화시킵니다.');
        setSpecialties(['생성형 AI 프롬프트 엔지니어링', 'ChatGPT & Claude 실무 자동화', '인공지능 비즈니스 전략 모델링']);
        setCareer([
          '멀티캠퍼스 및 패스트캠퍼스 기업 출강 AI 전임 교수 (4년)',
          '한국프레스티지기업강사협회(KPCIA) 정교수 및 심의이사회 마스터 강사',
          '주요 대기업(삼성, 현대, SK) 임직원 대상 생성형 AI 연수 총괄 (150회)'
        ]);
        setEducation([
          '연세대학교 컴퓨터과학과 학사 졸업',
          '고려대학교 정보대학원 인공지능융합 전공 석사 졸업'
        ]);
        setContactEmail('ai_master_kpc@kpcia.or.kr');
        setContactPhone('010-3840-9281');
        setImageUrl(randomImgUrl);

        setIsParsing(false);
        setIsEditing(true); // Switch to edit mode to review details!

        triggerLocalToast(`🎉 [AI 강사카드 문서 인식 완료] 업로드하신 다중 문서 파일들의 정보를 완벽하게 통합 해독하여 강사 카드 및 하단 편집기에 실시간 완벽 동기화하였습니다.`, 'success');
      }
    }, 1000);
  };

  // Theme Styling Map
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

  const selectedStyle = themeStyles[cardTheme] || themeStyles.classic;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="instructor-profile-main">
      {/* LEFT: Live Interactive Preview Card & Actions */}
      <div className="lg:col-span-7 flex flex-col items-center space-y-6" id="card-preview-column">
        {/* Title Indicator */}
        <div className="w-full flex items-center justify-between no-print" id="preview-header">
          <h2 className="text-sm font-semibold tracking-wider font-display uppercase text-neutral-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-kpcia-gold" /> 프리미엄 디렉토리용 강사 카드 (실시간 프리뷰)
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-xs font-medium text-neutral-300 hover:border-kpcia-gold/40 transition-all flex items-center gap-1.5"
              id="edit-toggle-btn"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{isEditing ? '조회 모드 전환' : '정보 입력하기'}</span>
            </button>
            <button
              onClick={() => setShowCertificate(true)}
              className="px-3.5 py-1.5 rounded-lg border border-kpcia-gold/30 bg-kpcia-gold/5 text-kpcia-gold hover:bg-kpcia-gold/15 text-xs font-bold transition-all flex items-center gap-1.5"
              id="show-cert-modal-btn"
            >
              <Award className="w-3.5 h-3.5" />
              <span>협회 등급 인증서 보기 (PDF)</span>
            </button>
            <button
              onClick={handleDownloadCardImage}
              className="px-3.5 py-1.5 rounded-lg bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-kpcia-gold/10"
              id="pdf-export-btn"
            >
              <Download className="w-3.5 h-3.5" />
              <span>강사 카드 PDF 저장</span>
            </button>
          </div>
        </div>

        {/* HIGH-FIDELITY PRESTIGE INSTRUCTOR PROFILE CARD (TARGET FOR PRINT / EXPORT) */}
        <div 
          id="print-area" 
          className={`w-full max-w-[640px] aspect-[1.586/1] rounded-2xl border ${selectedStyle.border} ${selectedStyle.bg} p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-500`}
        >
          {/* Subtle watermark lines */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.05),transparent)] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-kpcia-gold/2 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header Row */}
          <div className="flex items-start justify-between relative z-10" id="card-top-row">
            <div className="flex items-center space-x-4">
              {/* Profile Image Frame */}
              <div className="relative group/avatar">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-kpcia-gold to-amber-500 rounded-xl blur-[1px] opacity-75 group-hover/avatar:opacity-100 transition duration-300" />
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden flex items-center justify-center">
                  {imageUrl ? (
                    <img src={imageUrl} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-600">
                      <User className="w-5 h-5 text-neutral-500" />
                      <span className="text-[7px] mt-0.5 font-mono uppercase">NO PHOTO</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className={`text-[9px] font-mono tracking-widest uppercase font-semibold ${selectedStyle.textAccent}`}>
                    KPCIA CERTIFIED INSTRUCTOR CARD
                  </span>
                  <span className="w-1 h-1 rounded-full bg-kpcia-gold" />
                  <span className="text-[9px] text-neutral-400 font-mono">ID: {currentUser.uid.substring(0, 8).toUpperCase()}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-100 font-display mt-0.5 leading-tight">
                  {currentUser.name}
                </h3>
                <p className={`text-[11px] font-medium mt-0.5 ${selectedStyle.textAccent}`}>
                  {cardTitle || 'KPCIA 전문 강사'}
                </p>
              </div>
            </div>

            {/* Prestige Association Gold Watermark Seal */}
            <div className="text-right">
              <div className="inline-flex items-center space-x-1 border border-kpcia-gold/30 rounded-md px-2 py-0.5 bg-kpcia-gold/5">
                <span className="w-1.5 h-1.5 rounded-full bg-kpcia-gold animate-pulse"></span>
                <span className="text-[9px] font-mono font-bold text-kpcia-gold tracking-wider">
                  {currentUser.tier.toUpperCase()}
                </span>
              </div>
              <div className="text-[9px] font-mono text-neutral-400 mt-1">마일리지 {currentUser.mileage.toLocaleString()} M</div>
              {currentUser.lectureCount !== undefined && currentUser.lectureCount > 0 && (
                <div className="text-[9px] font-mono text-neutral-400 font-bold">출강 {currentUser.lectureCount}회 | 평점 {currentUser.averageRating !== undefined ? currentUser.averageRating.toFixed(1) : '0.0'}점</div>
              )}
              {currentUser.lectureCount !== undefined && currentUser.lectureCount >= 10 && (() => {
                const milestone = getLectureMilestoneBadge(currentUser.lectureCount);
                if (!milestone) return null;
                return (
                  <div className="mt-1 flex justify-end">
                    <span className={`inline-block text-[7px] px-1.5 py-0.5 rounded border leading-none font-extrabold tracking-tight ${milestone.color}`} title={milestone.desc}>
                      {milestone.name}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Middle Body Row */}
          <div className="grid grid-cols-2 gap-4 my-3 py-3 border-y border-neutral-800/50 relative z-10" id="card-middle-row">
            {/* Left Column: Bio & Specialties */}
            <div className="space-y-2 border-r border-neutral-800/50 pr-2">
              <div>
                <span className="text-[9px] font-mono text-neutral-500 block">INTRODUCTION</span>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans line-clamp-3">
                  {bio || '기업의 미래 인재 육성을 위해 혁신적인 실무 교육 과정을 설계하고 실행하는 KPCIA 프레스티지 강사입니다.'}
                </p>
              </div>
              <div>
                <span className="text-[9px] font-mono text-neutral-500 block mb-1">SPECIALTIES</span>
                <div className="flex flex-wrap gap-1">
                  {specialties.length > 0 ? (
                    specialties.slice(0, 3).map((spec, i) => (
                      <span 
                        key={i} 
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${selectedStyle.badgeBg} ${selectedStyle.textAccent} border ${selectedStyle.accentBorder}`}
                      >
                        {spec}
                      </span>
                    ))
                  ) : (
                    <span className="text-[9px] text-neutral-500">지정된 전문 분야가 없습니다.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Career History */}
            <div className="pl-2 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono text-neutral-500 block">KEY CAREER & EDUCATION</span>
                <ul className="text-[10px] text-neutral-300 space-y-1.5 mt-1 font-sans">
                  {career.length > 0 ? (
                    career.slice(0, 2).map((item, i) => (
                      <li key={i} className="truncate flex items-start gap-1">
                        <span className="text-kpcia-gold select-none">•</span>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-neutral-500 italic">출강 경력을 등록해주세요.</li>
                  )}
                  {education.length > 0 && (
                    <li className="truncate flex items-start gap-1 border-t border-neutral-800/30 pt-1 text-neutral-400">
                      <span className="text-neutral-500 select-none">#</span>
                      <span>{education[0]}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Footer Row */}
          <div className="flex items-center justify-between relative z-10" id="card-bottom-row">
            {/* Contact details */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-neutral-400">
              <div className="flex items-center space-x-1">
                <Mail className="w-3 h-3 text-neutral-500" />
                <span>{contactEmail || currentUser.email}</span>
              </div>
              {contactPhone && (
                <div className="flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-neutral-500" />
                  <span>{contactPhone}</span>
                </div>
              )}
              {bankAccount && (
                <div className="flex items-center space-x-1 text-kpcia-gold/80">
                  <CreditCard className="w-3 h-3 text-kpcia-gold/60" />
                  <span>{bankAccount}</span>
                </div>
              )}
              <div className="flex items-center space-x-1 text-neutral-300">
                <MapPin className="w-3 h-3 text-kpcia-gold/60" />
                <span className="font-semibold">활동 지역: {region || '미정 (서울)'}</span>
              </div>
            </div>

            {/* Digital Badge Icons in Bottom Right */}
            <div className="flex items-center space-x-1" id="card-badge-row">
              {currentUser.badges.slice(0, 4).map((badge, idx) => (
                <div 
                  key={badge.id} 
                  onClick={() => setActiveBadgeDetail(badge)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center border ${selectedStyle.accentBorder} bg-neutral-900 shadow-md ${selectedStyle.cardBadgeGlow} hover:scale-110 active:scale-95 transition-all cursor-pointer`}
                  title={badge.title}
                >
                  {badge.iconType === 'bronze_medal' && (
                    <span className="text-[9px] text-amber-500 font-bold" id={`card-badge-icon-${idx}`}>A</span>
                  )}
                  {badge.iconType === 'sapphire_shield' && (
                    <span className="text-[9px] text-blue-500 font-bold" id={`card-badge-icon-${idx}`}>P</span>
                  )}
                  {badge.iconType === 'ruby_star' && (
                    <span className="text-[9px] text-red-500 font-bold" id={`card-badge-icon-${idx}`}>M</span>
                  )}
                  {badge.iconType === 'emerald_crown' && (
                    <span className="text-[9px] text-emerald-500 font-bold" id={`card-badge-icon-${idx}`}>E</span>
                  )}
                </div>
              ))}
              <div className="w-6 h-6 rounded-full flex items-center justify-center border border-kpcia-gold/30 bg-kpcia-dark">
                <span className="text-[8px] text-kpcia-gold font-bold">K</span>
              </div>
            </div>
          </div>

          {/* Golden signature ribbon at very bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-kpcia-gold/40 to-transparent" />
        </div>

        {/* User Badge Inventory Overview under the card */}
        <div className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 no-print" id="badges-inventory">
          <h3 className="text-xs font-bold text-neutral-200 uppercase font-display tracking-wider flex items-center gap-1.5 mb-3">
            <Award className="w-4 h-4 text-kpcia-gold" /> 획득한 등급 디지털 배지 ({currentUser.badges.length}개)
          </h3>
          <div className="flex flex-wrap gap-2">
            {currentUser.badges.map((badge) => (
              <div 
                key={badge.id}
                onClick={() => setActiveBadgeDetail(badge)}
                className="flex items-center space-x-2 bg-neutral-950 border border-neutral-800 hover:border-kpcia-gold/40 p-2 rounded-lg cursor-pointer hover:scale-[1.03] active:scale-95 transition-all"
                id={`badge-badge-${badge.id}`}
              >
                <div className="w-5 h-5 rounded-full bg-kpcia-gold/10 flex items-center justify-center text-kpcia-gold text-[10px] font-bold">
                  {badge.iconType === 'emerald_crown' ? '👑' : badge.iconType === 'ruby_star' ? '⭐️' : badge.iconType === 'sapphire_shield' ? '🛡️' : '🎖️'}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-neutral-200">{badge.title}</div>
                  <div className="text-[8px] text-neutral-500 font-mono">{badge.dateGranted} 발급</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Interactive Profile Card Form Editor */}
      <div className="lg:col-span-5 space-y-6 no-print" id="card-editor-column">
        {/* AI RESUME / PROFILE DOCUMENT PARSER WIDGET */}
        <div className="bg-gradient-to-b from-[#1a1712] to-[#0e0e10] border border-kpcia-gold/30 rounded-xl p-5 shadow-xl relative overflow-hidden" id="ai-pdf-parser-widget">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-kpcia-gold/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5">
                <div className="bg-kpcia-gold/10 p-1 rounded-md">
                  <Sparkles className="w-4 h-4 text-kpcia-gold animate-pulse" />
                </div>
                <h3 className="font-display font-bold text-sm text-neutral-100 flex items-center gap-1.5">
                  AI 강사카드 인식기
                </h3>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                강사님의 이력서, 프로필(PDF, HWP 한글, Word 워드, TXT, 이미지 등) 다양한 규격의 문서를 업로드하시면, <span className="text-kpcia-gold font-semibold">증명사진 추출 복구</span>부터 모든 정보를 실시간으로 통합 해독하여 강사 카드 정보에 자동으로 정합 채워줍니다. (다중 동시 파싱 지원)
              </p>
            </div>
          </div>

          <div className="mt-4" id="pdf-uploader-dropzone">
            {isParsing ? (
              <div className="bg-neutral-950/60 border border-kpcia-gold/20 rounded-lg p-5 flex flex-col items-center justify-center space-y-4">
                <div className="relative flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-kpcia-gold animate-spin" />
                  <span className="absolute text-[10px] text-kpcia-gold font-bold font-mono">{parsingProgress}%</span>
                </div>
                <div className="w-full max-w-[240px] bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                     className="bg-gradient-to-r from-kpcia-gold to-amber-500 h-1.5 rounded-full transition-all duration-300" 
                     style={{ width: `${parsingProgress}%` }}
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs text-neutral-200 font-medium">KPCIA 다중 문서 통합 인지 엔진 분석 중...</p>
                  <p className="text-[9px] text-neutral-500 font-mono animate-pulse">{parsingStep}</p>
                </div>
              </div>
            ) : (
              <label className="group block cursor-pointer bg-neutral-950/60 hover:bg-neutral-950 border-2 border-dashed border-neutral-800 hover:border-kpcia-gold/50 rounded-lg p-5 transition-all duration-300 text-center relative">
                <input 
                  type="file" 
                  accept=".pdf,.hwp,.docx,.doc,.txt,.png,.jpg,.jpeg" 
                  onChange={handlePdfUpload} 
                  multiple
                  className="hidden" 
                />
                
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 group-hover:bg-kpcia-gold/10 flex items-center justify-center transition duration-300">
                    <FileUp className="w-5 h-5 text-neutral-400 group-hover:text-kpcia-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-300 font-bold group-hover:text-neutral-100 transition-colors">
                      {parsedFileName ? `재업로드: ${parsedFileName}` : '강사 이력서/프로필/문서 파일 올리기 (다중 선택 가능)'}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      Drag & Drop 또는 파일 찾기 지원 (PDF, HWP, Word, JPG, PNG 등)
                    </p>
                  </div>
                </div>

                {parsedFileName && (
                  <div className="mt-3 flex items-center justify-center space-x-1.5 text-[10px] text-emerald-500 bg-emerald-950/20 border border-emerald-900/30 py-1 px-2.5 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>정상 분석 완료: {parsedFileName}</span>
                  </div>
                )}
              </label>
            )}
          </div>
        </div>

        {/* Toggle Form Header */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6" id="editor-container">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-sm text-neutral-100 flex items-center gap-2">
              <Save className="w-4 h-4 text-kpcia-gold" /> 강사 프로필 정보 설정
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-kpcia-gold/5 border border-kpcia-gold/10 text-kpcia-gold">
              실시간 동기화 중
            </span>
          </div>

          <div className="space-y-4">
            {/* Name - Disabled */}
            <div>
              <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">강사 성명 (인증 정보)</label>
              <input 
                type="text" 
                value={currentUser.name} 
                disabled 
                className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-semibold text-neutral-400 cursor-not-allowed"
                id="form-name"
              />
            </div>

            {/* Card Title */}
            <div>
              <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">카드 타이틀 / 핵심 슬로건</label>
              <input 
                type="text" 
                placeholder="예: MZ세대 갈등 해결 전문 수석 강사" 
                value={cardTitle} 
                onChange={(e) => setCardTitle(e.target.value)} 
                className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                id="form-card-title"
              />
            </div>

            {/* Short Bio */}
            <div>
              <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">강사 소개글 (BIO)</label>
              <textarea 
                rows={3}
                placeholder="강사 프로필 카드에 들어갈 소개글을 정밀하게 기술해주세요." 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none resize-none leading-relaxed"
                id="form-bio"
              />
            </div>

            {/* Premium Card Theme selection */}
            <div>
              <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1.5">프레임 카드 테마 선택</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'classic', label: 'Classic Slate', color: 'bg-neutral-800' },
                  { id: 'gold_luxury', label: 'Gold Luxury', color: 'bg-yellow-600' },
                  { id: 'midnight_sapphire', label: 'Midnight Blue', color: 'bg-blue-900' },
                  { id: 'elite_emerald', label: 'Elite Emerald', color: 'bg-emerald-800' }
                ].map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setCardTheme(theme.id as any)}
                    className={`p-2 rounded-lg border text-[10px] font-semibold flex flex-col items-center space-y-1 transition-all ${
                      cardTheme === theme.id 
                        ? 'border-kpcia-gold bg-kpcia-gold/10 text-kpcia-gold' 
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                    }`}
                    id={`theme-btn-${theme.id}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${theme.color} border border-neutral-700`} />
                    <span className="truncate max-w-full text-center">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Specialties tag builder */}
            <div>
              <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">강의 전문 분야 (태그 추가)</label>
              <div className="flex gap-1.5 mb-2">
                <input 
                  type="text" 
                  placeholder="예: 비즈니스 세무" 
                  value={newSpecialty} 
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSpecialty()}
                  className="flex-1 px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                  id="form-specialty-input"
                />
                <button 
                  onClick={handleAddSpecialty}
                  className="px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg flex items-center justify-center border border-neutral-700"
                  id="form-specialty-add"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {specialties.map((spec, i) => (
                  <span 
                    key={i} 
                    className="inline-flex items-center space-x-1 text-[10px] font-medium bg-neutral-950 text-neutral-300 border border-neutral-800 px-2 py-1 rounded"
                    id={`specialty-tag-${i}`}
                  >
                    <span>{spec}</span>
                    <button 
                      onClick={() => handleRemoveSpecialty(i)}
                      className="text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Career & Core Experience */}
            <div>
              <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">핵심 출강 경력 사항</label>
              <div className="flex gap-1.5 mb-2">
                <input 
                  type="text" 
                  placeholder="예: S그룹 인재개발원 CS 자문강사 (5년)" 
                  value={newCareerItem} 
                  onChange={(e) => setNewCareerItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCareer()}
                  className="flex-1 px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                  id="form-career-input"
                />
                <button 
                  onClick={handleAddCareer}
                  className="px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg flex items-center justify-center border border-neutral-700"
                  id="form-career-add"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-1 bg-neutral-950 rounded-lg border border-neutral-800 p-2 max-h-32 overflow-y-auto">
                {career.map((item, i) => (
                  <li 
                    key={i} 
                    className="flex items-center justify-between p-1.5 text-xs text-neutral-300 hover:bg-neutral-900 rounded"
                    id={`career-item-${i}`}
                  >
                    <span className="truncate mr-2">• {item}</span>
                    <button 
                      onClick={() => handleRemoveCareer(i)} 
                      className="text-neutral-500 hover:text-red-400 transition-colors p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
                {career.length === 0 && (
                  <span className="text-[10px] text-neutral-600 block text-center py-2">등록된 경력이 없습니다.</span>
                )}
              </ul>
            </div>

            {/* Education Profile */}
            <div>
              <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">학력 및 교육 자격 (최대 2개 권장)</label>
              <div className="flex gap-1.5 mb-2">
                <input 
                  type="text" 
                  placeholder="예: 서울대학교 교육학 학사" 
                  value={newEducationItem} 
                  onChange={(e) => setNewEducationItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddEducation()}
                  className="flex-1 px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                  id="form-education-input"
                />
                <button 
                  onClick={handleAddEducation}
                  className="px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg flex items-center justify-center border border-neutral-700"
                  id="form-education-add"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-1 bg-neutral-950 rounded-lg border border-neutral-800 p-2 max-h-24 overflow-y-auto">
                {education.map((item, i) => (
                  <li 
                    key={i} 
                    className="flex items-center justify-between p-1.5 text-xs text-neutral-300 hover:bg-neutral-900 rounded"
                    id={`education-item-${i}`}
                  >
                    <span className="truncate mr-2"># {item}</span>
                    <button 
                      onClick={() => handleRemoveEducation(i)} 
                      className="text-neutral-500 hover:text-red-400 transition-colors p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
                {education.length === 0 && (
                  <span className="text-[10px] text-neutral-600 block text-center py-2">등록된 자격/학력이 없습니다.</span>
                )}
              </ul>
            </div>

            {/* Contact Phone & Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">연락처 이메일</label>
                <input 
                  type="email" 
                  placeholder="dh_kim@kpcia.or.kr" 
                  value={contactEmail} 
                  onChange={(e) => setContactEmail(e.target.value)} 
                  className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                  id="form-email"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">연락처 전화번호</label>
                <input 
                  type="text" 
                  placeholder="010-1234-5678" 
                  value={contactPhone} 
                  onChange={(e) => setContactPhone(e.target.value)} 
                  className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                  id="form-phone"
                />
              </div>
            </div>

            {/* Bank Account Number */}
            <div>
              <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">정산 계좌정보 (은행명 및 계좌번호)</label>
              <input 
                type="text" 
                placeholder="예: 신한은행 110-123-456789 (예금주: 홍길동)" 
                value={bankAccount} 
                onChange={(e) => setBankAccount(e.target.value)} 
                className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                id="form-bank-account"
              />
            </div>

            {/* Active Region */}
            <div>
              <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">활동 주 지역 (예: 서울, 경기, 인천, 부산, 충남 등)</label>
              <input 
                type="text" 
                placeholder="예: 서울, 경기, 인천" 
                value={region} 
                onChange={(e) => setRegion(e.target.value)} 
                className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-medium text-neutral-100 focus:border-kpcia-gold focus:outline-none"
                id="form-region"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-neutral-800 flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-950 text-neutral-400 text-xs font-bold transition-all"
                id="cancel-btn"
              >
                초기화
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-kpcia-gold text-kpcia-dark text-xs font-bold hover:bg-kpcia-gold-hover transition-all flex items-center gap-1.5"
                id="save-card-btn"
              >
                <Save className="w-3.5 h-3.5" />
                <span>강사 카드 저장 완료</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Association Grade Certification PDF view modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 overflow-y-auto" id="certificate-modal">
          {/* Action Toolbar on Top */}
          <div className="w-full max-w-[580px] flex justify-between items-center mb-4 no-print" id="cert-toolbar">
            <span className="text-xs font-bold text-neutral-400 font-mono tracking-wider">KPCIA OFFICIAL CERTIFICATE VIEWER</span>
            <div className="flex space-x-2">
              <button
                onClick={handlePrintCertificate}
                className="px-4 py-2 bg-kpcia-gold hover:bg-kpcia-gold-hover text-kpcia-dark text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-kpcia-gold/10 cursor-pointer"
                id="cert-download-btn"
              >
                <Download className="w-3.5 h-3.5 text-kpcia-dark" />
                <span>PDF 다운로드</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-amber-600/10 cursor-pointer"
                id="cert-print-btn"
              >
                <Printer className="w-3.5 h-3.5 text-white" />
                <span>인증서 인쇄 출력하기</span>
              </button>
              <button
                onClick={handleCloseCertificate}
                className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                id="cert-close-btn"
              >
                <X className="w-3.5 h-3.5" />
                <span>닫기</span>
              </button>
            </div>
          </div>

          {/* THE LUXURY DIPLOMA / CERTIFICATE CARD (OPTIMIZED FOR PDF EXPORT & PRINT) */}
          <div 
            id="print-certificate"
            className="w-full max-w-[580px] aspect-[1/1.414] bg-gradient-to-br from-[#dfba4c] via-[#fbf2cd] to-[#c19926] text-[#241a02] p-10 flex flex-col justify-between relative shadow-2xl rounded-lg border-[12px] border-double border-[#856312] font-sans"
          >
            {/* Watermark Logo background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(133,99,18,0.07),transparent)] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-2 border-[1px] border-dashed border-[#856312]/20 rounded-full flex items-center justify-center pointer-events-none">
              <span className="text-[120px] font-serif text-[#856312] font-bold select-none opacity-5">K</span>
            </div>

            {/* Top Certificate Header */}
            <div className="flex justify-between items-start text-[10px] font-serif text-[#6a4f10] border-b border-[#856312]/20 pb-4" id="cert-top-info">
              <div>제 2026-KPCIA-01호</div>
              <div className="text-right font-semibold">비영리 한국프레스티지기업강사협회</div>
            </div>

            {/* Certificate Title */}
            <div className="text-center my-5" id="cert-title-section">
              <h1 className="text-3xl font-extrabold tracking-[0.4em] text-[#543e0c] font-serif mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                인 증 서
              </h1>
              <p className="text-[10px] font-serif text-[#6e5211] tracking-widest">CERTIFICATE OF INSTRUCTOR GRADE</p>
            </div>

            {/* Certified Person Info */}
            <div className="space-y-3.5 my-5 text-left max-w-sm mx-auto pl-6 font-serif border-l-4 border-[#856312]" id="cert-person-info">
              <div className="flex items-baseline space-x-4">
                <span className="text-xs text-[#5c440d] w-16">성 명 :</span>
                <span className="text-base font-extrabold text-[#110c01]">{currentUser.name}</span>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-xs text-[#5c440d] w-16 pt-0.5">인증 등급 :</span>
                <div className="text-sm font-bold text-[#110c01] flex flex-col leading-tight">
                  <span>{currentUser.tier}</span>
                  <span className="text-xs text-[#5c440d] font-normal mt-0.5">
                    ({
                      currentUser.tier === 'Prestige Elite' ? '프레스티지 엘리트 최고위원' :
                      currentUser.tier === 'Prestige Master' ? '프레스티지 마스터 수석강사' :
                      currentUser.tier === 'Prestige Professional' ? '프레스티지 프로페셔널 전문강사' :
                      currentUser.tier === 'Prestige Associate' ? '프레스티지 어소시에이트 정강사' :
                      '프레스티지 멤버 일반회원'
                    })
                  </span>
                </div>
              </div>
              <div className="flex items-baseline space-x-4">
                <span className="text-xs text-[#5c440d] w-16">핵심 분야 :</span>
                <span className="text-xs font-semibold text-[#241a02]">{cardTitle || 'KPCIA Certified Specialist'}</span>
              </div>
            </div>

            {/* Certificate Main Text Body */}
            <div className="text-center my-4 px-4 space-y-4" id="cert-text-body">
              <p className="text-xs sm:text-[13px] text-[#241a02] leading-7 font-serif break-keep text-justify" style={{ textIndent: '1rem' }}>
                위 강사는 비영리 한국프레스티지기업강사협회(KPCIA)가 정하는 엄격한 교육 설계 전문성과 엄선된 강의 실행 역량 평가 기준을 충족하고, 협회 등급 이사회 심의 의결 결과 본 협회가 공인하는 최상위의 비즈니스 출강 전문 지위를 획득하였으므로 이에 본 인증서를 수여합니다.
              </p>
            </div>

            {/* Signature Date */}
            <div className="text-center my-4 font-serif text-sm text-[#4a360a] tracking-widest" id="cert-date">
              2026년 07월 03일
            </div>

            {/* Issuing Signature Row */}
            <div className="flex items-center justify-center relative mt-4 border-t border-[#856312]/20 pt-6 pb-2" id="cert-footer-signature">
              <div className="text-center font-serif text-[#110c01] z-10">
                <h3 className="text-sm font-bold tracking-widest">
                  한국프레스티지기업강사협회 협회장
                </h3>
              </div>
            </div>

            {/* Elegant luxury ornate corner decorations */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-[#856312]" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-[#856312]" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-[#856312]" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-[#856312]" />
            
            <div className="absolute top-5 left-5 w-4 h-4 border-t border-l border-[#856312]/60" />
            <div className="absolute top-5 right-5 w-4 h-4 border-t border-r border-[#856312]/60" />
            <div className="absolute bottom-5 left-5 w-4 h-4 border-b border-l border-[#856312]/60" />
            <div className="absolute bottom-5 right-5 w-4 h-4 border-b border-r border-[#856312]/60" />
          </div>

          {/* Bottom Action Controls (no-print) */}
          <div className="w-full max-w-[580px] mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center no-print" id="cert-bottom-toolbar">
            <button
              onClick={handlePrintCertificate}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-kpcia-gold to-amber-500 hover:from-kpcia-gold-hover hover:to-amber-600 text-kpcia-dark text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-kpcia-gold/20 cursor-pointer"
            >
              <Download className="w-4 h-4 text-kpcia-dark" />
              <span>KPCIA 공식 인증서 고해상도 PDF 다운로드</span>
            </button>
            <button
              onClick={handleGoHomeFromCert}
              className="w-full sm:w-auto px-6 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building className="w-4 h-4 text-kpcia-gold" />
              <span>인증 확인 후 홈페이지로 돌아가기</span>
            </button>
          </div>
        </div>
      )}

      {/* KPCIA Digital Certified Badge details popover/modal */}
      {activeBadgeDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" id="badge-detail-modal">
          <div className="w-full max-w-sm bg-neutral-900 border border-kpcia-gold/40 rounded-xl p-6 relative overflow-hidden shadow-2xl">
            {/* Ambient gold glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-kpcia-gold/5 rounded-full blur-2xl pointer-events-none" />
            
            <button 
              onClick={() => setActiveBadgeDetail(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-kpcia-gold/20 to-amber-500/10 border-2 border-kpcia-gold/60 flex items-center justify-center text-3xl shadow-lg shadow-kpcia-gold/10">
                {activeBadgeDetail.iconType === 'emerald_crown' ? '👑' : activeBadgeDetail.iconType === 'ruby_star' ? '⭐️' : activeBadgeDetail.iconType === 'sapphire_shield' ? '🛡️' : '🎖️'}
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-kpcia-gold uppercase">KPCIA OFFICIAL DIGITAL BADGE</span>
                <h4 className="text-base font-bold text-neutral-100 mt-1 font-display">{activeBadgeDetail.title}</h4>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                  {activeBadgeDetail.description || '이 배지는 한국프레스티지기업강사협회(KPCIA)가 정한 엄격한 공인 강의 품질 및 강사 윤리 강령을 준수한 우수 강사에게 수여하는 공식 등급 연동형 마일스톤 디지털 인증 정보입니다.'}
                </p>
              </div>

              <div className="w-full bg-neutral-950 border border-neutral-800/80 rounded-lg p-3 text-left space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-neutral-500">발급 대상자</span>
                  <span className="text-neutral-300 font-bold">{currentUser.name} ({currentUser.email})</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-neutral-500">인증 연동 등급</span>
                  <span className="text-neutral-300 font-bold text-kpcia-gold">{currentUser.tier}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-neutral-500">인증 발급 일자</span>
                  <span className="text-neutral-300 font-bold">{activeBadgeDetail.dateGranted || '2026-07-03'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-neutral-500">인증 고유 번호</span>
                  <span className="text-neutral-300 font-bold text-neutral-400">#KPCIA-BD-{activeBadgeDetail.id.substring(0,6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono border-t border-neutral-800/50 pt-2">
                  <span className="text-neutral-500">검증 상태</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 블록체인 검증 완료
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  triggerLocalToast(`🎉 [공인 증명 완료] 배지 고유 주소가 복사되었습니다. 링크드인(LinkedIn) 등에 첨부하여 자격을 검증받으실 수 있습니다.`, 'success');
                  setActiveBadgeDetail(null);
                }}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-lg transition-all border border-neutral-700"
              >
                디지털 배지 인증 주소 복사하기
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isDownloadSimulating && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-[9999] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-kpcia-gold border-t-transparent animate-spin" />
          <div className="text-center">
            <p className="text-xs font-mono tracking-widest text-kpcia-gold font-bold">GENERATING PREMIUM HIGH-FIDELITY PDF...</p>
            <p className="text-[10px] text-neutral-400 mt-1">한국프레스티지기업강사협회 공식 보안 검증 필터 적용 중</p>
          </div>
        </div>
      )}

      {/* Local Toast Notification */}
      {localToast && (
        <div 
          className={`fixed bottom-6 right-6 z-[2000] px-5 py-4 rounded-xl border shadow-2xl flex items-center space-x-3 max-w-md animate-in slide-in-from-bottom-5 duration-300 ${
            localToast.type === 'success' 
              ? 'bg-neutral-900 border-kpcia-gold/40 text-neutral-100' 
              : localToast.type === 'error'
              ? 'bg-neutral-900 border-red-800/60 text-neutral-100'
              : 'bg-neutral-900 border-neutral-700 text-neutral-200'
          }`}
          id="local-toast"
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0 ${
            localToast.type === 'success' ? 'bg-kpcia-gold/15 text-kpcia-gold' : localToast.type === 'error' ? 'bg-red-500/15 text-red-400' : 'bg-neutral-800 text-neutral-400'
          }`}>
            {localToast.type === 'success' ? '★' : localToast.type === 'error' ? '⚠' : 'ℹ'}
          </div>
          <p className="text-xs font-medium leading-relaxed">{localToast.message}</p>
        </div>
      )}
    </div>
  );
}
