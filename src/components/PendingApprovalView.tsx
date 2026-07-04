import React from 'react';
import { Clock, UserCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface PendingApprovalViewProps {
  currentUser: UserProfile | null;
  setActiveTab: (tab: string) => void;
}

export default function PendingApprovalView({ currentUser, setActiveTab }: PendingApprovalViewProps) {
  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-neutral-900 border border-kpcia-gold/30 rounded-2xl text-center space-y-6 relative overflow-hidden shadow-2xl animate-in fade-in" id="pending-approval-view">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-kpcia-gold to-amber-500 animate-pulse" />
      
      <div className="w-16 h-16 rounded-full bg-kpcia-gold/10 flex items-center justify-center text-kpcia-gold mx-auto border border-kpcia-gold/20">
        <Clock className="w-8 h-8 animate-pulse" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono tracking-widest font-bold text-kpcia-gold bg-kpcia-gold/10 px-2.5 py-1 rounded-full border border-kpcia-gold/25 uppercase inline-block">
          KPCIA 가입 승인 대기 중
        </span>
        <h2 className="text-xl font-bold text-neutral-100">운영사무국의 최종 승인을 기다리고 있습니다.</h2>
        <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
          안녕하세요, <strong className="text-kpcia-gold font-bold">{currentUser?.name}</strong> 강사님! <br />
          입력하신 메일 주소(<span className="text-neutral-300 underline">{currentUser?.email}</span>)에 대한 본인 소유 확인 및 소속 인증은 성공적으로 완료되었습니다. <br />
          현재 한국프레스티지기업강사협회 공식 데이터베이스 등록 및 출강 정보 승인 절차가 대기 상태입니다.
        </p>
      </div>

      <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-left space-y-2.5 max-w-md mx-auto font-sans shadow-inner">
        <div className="text-[11px] font-bold text-neutral-200 flex items-center gap-1">
          <span>💡 [가입 즉시 승인 및 테스트 가이드]</span>
        </div>
        <p className="text-[10px] text-neutral-400 leading-normal">
          본 플랫폼은 실시간 시뮬레이션 환경을 제공하고 있어, 관리자 시점으로 직접 전환해 가입 신청을 즉시 승인하고 모든 메뉴를 자유롭게 테스트해 보실 수 있습니다:
        </p>
        <ol className="text-[10px] text-neutral-400 space-y-2 list-decimal list-inside pl-1 leading-normal">
          <li>우측 상단 회원이름(<strong className="text-neutral-200">{currentUser?.name}</strong>)을 클릭하여 팝업 창을 엽니다.</li>
          <li>목록에서 <strong className="text-kpcia-gold">"KPCIA 운영사무국" (관리자 계정)</strong>을 마우스 클릭하여 계정을 전환합니다.</li>
          <li>상단 네비게이션 메뉴에서 새로 활성화된 <strong className="text-neutral-200">"협회 관리자실" (Admin)</strong> 탭을 선택합니다.</li>
          <li>강사 승인 목록에서 <strong className="text-neutral-200">{currentUser?.name}</strong> 강사님의 가입 요청을 확인하고 <strong className="text-emerald-400 font-bold">"가입 승인"</strong> 버튼을 누릅니다.</li>
          <li>승인 처리 후 다시 우측 상단 팝업에서 본인의 계정으로 복귀하면 모든 정식 메뉴가 즉각 활성화됩니다!</li>
        </ol>
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={() => setActiveTab('home')}
          className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-neutral-100 text-xs font-bold rounded-xl transition-all cursor-pointer hover:border-kpcia-gold/30"
        >
          협회 소개 홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
