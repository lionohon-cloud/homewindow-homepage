import { useState } from 'react';
import { useNavigate } from 'react-router';
import { submitLeadDetail } from './submitLead';
import type { ConsultDetailResult } from '@/app/components/ConsultRegionFieldModal';

/**
 * 2단계 접수 팝업(ConsultRegionFieldModal) 공용 훅 — 시군구 개편 (2026-07-10).
 *
 * 기존엔 leadDocId·showDetailModal state 와 handleDetailComplete/Skip 이 4개 진입 폼
 * (HeroConsultSection / ConsultationModal / BottomBar / EstimateForm)에 동일 복붙되어 있어
 * 시그니처 변경 시 한 곳 누락 사고 위험 → 공용 훅으로 통합.
 *
 * 사용:
 *   const detail = useConsultDetail();
 *   // 접수(Call1) 후: docId 있으면 detail.open(docId), 없으면 navigate('/thanks')
 *   <ConsultRegionFieldModal isOpen={detail.isOpen} onComplete={detail.onComplete} onSkip={detail.onSkip} />
 */
export function useConsultDetail() {
  const navigate = useNavigate();
  const [leadDocId, setLeadDocId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = (docId: string) => {
    setLeadDocId(docId);
    setIsOpen(true);
  };

  const onComplete = async ({ region, consultField, consultFieldText }: ConsultDetailResult) => {
    setIsOpen(false);
    if (leadDocId) {
      await submitLeadDetail(leadDocId, region, consultField, consultFieldText);
    }
    navigate('/thanks');
  };

  const onSkip = () => {
    setIsOpen(false);
    navigate('/thanks');
  };

  // X·바깥 클릭 — 모달만 닫기 (사장님 지시 2026-07-10). leadDocId 는 유지 → 재오픈 가능.
  const onClose = () => {
    setIsOpen(false);
  };

  return { isOpen, open, onComplete, onSkip, onClose, leadDocId };
}
