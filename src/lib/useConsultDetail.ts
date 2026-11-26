import { useRef, useState } from 'react';
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
 *   submitLead({ ..., onSending: detail.openEarly })   // 인증 직후 지역 창을 바로 띄운다
 *   → 결과가 오면 detail.settle(docId)  /  실패(catch)면 detail.abort()
 *   <ConsultRegionFieldModal isOpen={detail.isOpen} onComplete={detail.onComplete} onSkip={detail.onSkip} />
 *
 * 261126 — 인증 뒤 ERP 접수 응답(3초 안팎)을 기다리느라 화면이 멈춰 보였다(상담 방법 팝업이 없어지면서 드러남).
 *   지역 창을 먼저 띄우고 ERP 는 뒤에서 기다린다. 지역을 고르면 그때 docId 를 기다렸다가 반영(Call2)한다.
 */
export function useConsultDetail() {
  const navigate = useNavigate();
  const [leadDocId, setLeadDocId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  // ERP 응답(docId)을 기다리는 약속 — openEarly 로 지역 창을 먼저 띄웠을 때만 쓴다
  const docWait = useRef<Promise<string | null> | null>(null);
  const docResolve = useRef<((id: string | null) => void) | null>(null);

  const open = (docId: string) => {
    setLeadDocId(docId);
    docWait.current = Promise.resolve(docId);
    setIsOpen(true);
  };

  /** 번호 인증이 끝나 접수를 보내는 순간 — ERP 응답 전에 지역 창부터 띄운다 */
  const openEarly = () => {
    docWait.current = new Promise((res) => {
      docResolve.current = res;
    });
    setLeadDocId(null);
    setIsOpen(true);
  };

  /** 접수 결과가 왔다. 지역 창을 먼저 띄웠으면 기다리던 쪽에 넘기고, 아니면 예전 흐름(열기 / 감사 페이지) */
  const settle = (docId: string | null) => {
    if (docResolve.current) {
      docResolve.current(docId);
      docResolve.current = null;
      if (docId) setLeadDocId(docId);
      return;
    }
    if (docId) open(docId);
    else navigate('/thanks');
  };

  /** 접수 자체가 실패했다(오류 안내를 띄울 자리) — 먼저 띄운 지역 창을 닫는다 */
  const abort = () => {
    if (docResolve.current) {
      docResolve.current(null);
      docResolve.current = null;
    }
    docWait.current = null;
    setIsOpen(false);
  };

  const onComplete = async ({
    region,
    consultField,
    consultFieldText,
    meshReferralRequested,
    replacementTiming,
  }: ConsultDetailResult) => {
    setIsOpen(false);
    // 지역을 ERP 응답보다 먼저 골랐으면 여기서 docId 를 기다린다
    const docId = leadDocId ?? (docWait.current ? await docWait.current : null);
    if (docId) {
      await submitLeadDetail(
        docId,
        region,
        consultField,
        consultFieldText,
        meshReferralRequested,
        replacementTiming,
      );
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

  return { isOpen, open, openEarly, settle, abort, onComplete, onSkip, onClose, leadDocId };
}
