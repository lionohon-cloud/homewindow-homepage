import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { submitLead } from '@/lib/submitLead';
import { useConsultDetail } from '@/lib/useConsultDetail';
import { HoneypotField } from '@/lib/HoneypotField';
import { ENTRY_WHERE, temperedEntryForm } from '@/lib/entryForm';
import { ConsultRegionFieldModal } from '../ConsultRegionFieldModal';

/**
 * 강화유리 상세페이지 접수 폼.
 * 접수 흐름은 HeroConsultSection / BottomBar 와 동일하다
 * (submitLead → docId 있으면 2단계 팝업, 없으면 /thanks).
 * entryForm 만 다르게 찍어 이 페이지에서 들어온 건을 ERP 에서 구분한다.
 */
export function TemperedConsultForm() {
  const navigate = useNavigate();
  const detail = useConsultDetail();

  const [phone1, setPhone1] = useState('010');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const phone2Ref = useRef<HTMLInputElement>(null);
  const phone3Ref = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const inputCls =
    'w-0 flex-1 min-w-0 h-[52px] border-2 border-[#e0e0e0] rounded-xl text-center text-[16px] font-semibold text-[#2A2A2A] bg-white focus:border-[#D22727] outline-none transition-colors disabled:bg-[#f5f5f5]';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('개인정보 수집에 동의해주세요.');
      return;
    }
    if (phone1.length < 2 || phone2.length < 3 || phone3.length < 4) {
      setError('연락처를 정확히 입력해주세요.');
      return;
    }
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    const phone = `${phone1}-${phone2}-${phone3}`;
    try {
      const { ok, docId } = await submitLead({
        phone,
        entryForm: temperedEntryForm(ENTRY_WHERE.form),
        honeypot: honeypotRef.current?.value,
      });
      if (!ok) throw new Error();
      setPhone1('010');
      setPhone2('');
      setPhone3('');
      if (docId) detail.open(docId);
      else navigate('/thanks');
    } catch {
      setError('전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="border border-[#e5e5e5] rounded-2xl p-5 md:p-8 bg-[#fafbfc]">
        <h2 className="text-[20px] md:text-[24px] font-extrabold text-[#333] leading-[1.35] mb-2 break-keep">
          창을 새로 바꿀 때가 <span className="text-[#d22727]">추가 비용 없이</span> 강화유리로
          교체할 수 있는 때입니다
        </h2>
        <p className="text-[14px] md:text-[16px] text-[#999] leading-[22px] md:leading-[26px] mb-5 break-keep">
          연락처만 남겨 주시면 실측 일정과 적용 범위를 안내해 드립니다.
        </p>

        <ul className="grid gap-[7px] mb-[18px]">
          {[
            <>실측·견적 <b className="font-extrabold text-[#333]">무료</b></>,
            <>
              LX 창호 선택 시 강화유리 <b className="font-extrabold text-[#333]">무상 업그레이드</b>{' '}
              <i className="not-italic text-[#d22727] font-bold text-[12px]">(9월 한정)</i>
            </>,
            <>상담 후 결정하셔도 됩니다</>,
          ].map((item, i) => (
            <li
              key={i}
              className="relative pl-[22px] text-[13.5px] md:text-[14.5px] text-[#666] break-keep before:content-['✓'] before:absolute before:left-0 before:top-0 before:text-[#d22727] before:font-extrabold"
            >
              {item}
            </li>
          ))}
        </ul>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <HoneypotField ref={honeypotRef} />

          <div>
            <span className="block text-[12.5px] md:text-[13.5px] font-bold text-[#666] mb-1.5">
              연락처
            </span>
            <div className="flex items-center gap-1.5 md:gap-2 w-full overflow-hidden">
              <input
                type="tel"
                inputMode="numeric"
                value={phone1}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, '');
                  if (v.length <= 3) {
                    setPhone1(v);
                    if (v.length === 3) phone2Ref.current?.focus();
                  }
                }}
                maxLength={3}
                disabled={isSubmitting}
                className={inputCls}
              />
              <span className="text-[#ccc] text-[18px] font-light select-none">—</span>
              <input
                ref={phone2Ref}
                type="tel"
                inputMode="numeric"
                value={phone2}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, '');
                  if (v.length <= 4) {
                    setPhone2(v);
                    if (v.length === 4) phone3Ref.current?.focus();
                  }
                }}
                maxLength={4}
                disabled={isSubmitting}
                className={inputCls}
              />
              <span className="text-[#ccc] text-[18px] font-light select-none">—</span>
              <input
                ref={phone3Ref}
                type="tel"
                inputMode="numeric"
                value={phone3}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, '');
                  if (v.length <= 4) setPhone3(v);
                }}
                maxLength={4}
                disabled={isSubmitting}
                className={inputCls}
              />
            </div>
          </div>

          <label className="flex items-start gap-2 text-[12.5px] text-[#666] leading-[1.5]">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="shrink-0 w-[17px] h-[17px] mt-px accent-[#d22727]"
            />
            <span>
              상담을 위한 개인정보 수집·이용에 동의합니다.{' '}
              <i className="not-italic text-[#d22727] font-bold">(필수)</i>
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[52px] md:h-[56px] w-full bg-[#d22727] hover:bg-[#b02020] active:bg-[#a01d1d] text-white font-bold text-[16px] md:text-[17px] rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> 접수 중…
              </>
            ) : (
              '무료 실측 상담 신청'
            )}
          </button>

          <p className="text-[12.5px] font-bold text-center min-h-[18px] text-[#d22727]" role="status">
            {error}
          </p>
        </form>
      </div>

      <ConsultRegionFieldModal
        isOpen={detail.isOpen}
        onComplete={detail.onComplete}
        onSkip={detail.onSkip}
      />
    </>
  );
}
