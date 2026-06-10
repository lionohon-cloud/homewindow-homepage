import { useState } from 'react';
import { useNavigate } from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { getUtmData } from '@/lib/utm';

interface ApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PartnersApplicationModal({ open, onOpenChange }: ApplicationModalProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'success'>('error');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [showTermsDetail, setShowTermsDetail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setAlertType('error');
      setAlertMessage('성함을 입력해주세요.');
      setShowAlert(true);
      return;
    }

    if (!formData.phone.trim()) {
      setAlertType('error');
      setAlertMessage('전화번호를 입력해주세요.');
      setShowAlert(true);
      return;
    }

    if (!formData.location.trim()) {
      setAlertType('error');
      setAlertMessage('거주지를 입력해주세요.');
      setShowAlert(true);
      return;
    }

    if (!agreedToTerms) {
      setAlertType('error');
      setAlertMessage('개인정보 수집 및 이용에 동의해주세요.');
      setShowAlert(true);
      return;
    }

    // Submit to Google Apps Script
    setIsSubmitting(true);
    try {
      // 랜딩 시 initUtm()이 sessionStorage에 저장해둔 UTM 데이터
      const utm = getUtmData();
      await fetch(
        'https://script.google.com/macros/s/AKfycbxI-XPoJSUEZiRmiQk9njsItmy6UBeQhvyU1qHXTH4NFqRYVW9OV23YwJVfGuY6Zh-v/exec',
        {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            residence: formData.location,
            utm_source: utm.utm_source,
            utm_medium: utm.utm_medium,
            utm_campaign: utm.utm_campaign,
            utm_content: utm.utm_content,
            utm_term: utm.utm_term,
            landing_path: utm.landing_path,
            referrer: utm.referrer,
          }),
        }
      );

      // no-cors 모드에서는 응답을 읽을 수 없으므로 요청이 나가면 성공으로 처리
      // PartnersThanksPage 가드용 플래그 + /partners/thanks 라우트로 이동
      sessionStorage.setItem('hw_partners_just_submitted', '1');
      setFormData({ name: '', phone: '', location: '' });
      setAgreedToTerms(true);
      setShowTermsDetail(false);
      onOpenChange(false);
      navigate('/partners/thanks');
      return;
    } catch (error) {
      setAlertType('error');
      setAlertMessage('전송 중 오류가 발생했습니다.\n다시 시도해주세요.');
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 w-[90%] max-w-md z-[101] shadow-2xl">
          {/* Close Button */}
          <Dialog.Close className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#f4f7fb] transition-colors cursor-pointer">
            <X className="w-6 h-6 text-[#666]" strokeWidth={2.5} />
          </Dialog.Close>

          {/* Title */}
          <Dialog.Title className="font-['Pretendard',sans-serif] font-extrabold text-2xl text-black mb-3">
            파트너 신청하기
          </Dialog.Title>

          <Dialog.Description className="font-['Pretendard',sans-serif] font-medium text-base leading-[1.6] text-[#666] mb-8">
            빠른 파트너 협약을 위해<br />
            최소한의 정보만 받고 있어요.
          </Dialog.Description>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="font-['Pretendard',sans-serif] font-bold text-sm text-black mb-2 block">
                성함
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="이름을 입력해주세요"
                required
                className="w-full px-4 py-3 border border-[#e4eaf2] rounded-xl font-['Pretendard',sans-serif] font-medium text-base text-black placeholder:text-[#999] focus:outline-none focus:border-[#1f6fff] focus:ring-2 focus:ring-[#1f6fff]/20 transition-all"
              />
            </div>

            {/* Phone Input */}
            <div>
              <label className="font-['Pretendard',sans-serif] font-bold text-sm text-black mb-2 block">
                전화번호
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010-0000-0000"
                required
                className="w-full px-4 py-3 border border-[#e4eaf2] rounded-xl font-['Pretendard',sans-serif] font-medium text-base text-black placeholder:text-[#999] focus:outline-none focus:border-[#1f6fff] focus:ring-2 focus:ring-[#1f6fff]/20 transition-all"
              />
            </div>

            {/* Location Input */}
            <div>
              <label className="font-['Pretendard',sans-serif] font-bold text-sm text-black mb-2 block">
                거주지
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="예: 서울시 강남구"
                required
                className="w-full px-4 py-3 border border-[#e4eaf2] rounded-xl font-['Pretendard',sans-serif] font-medium text-base text-black placeholder:text-[#999] focus:outline-none focus:border-[#1f6fff] focus:ring-2 focus:ring-[#1f6fff]/20 transition-all"
              />
            </div>

            {/* Terms Agreement */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#1f6fff] cursor-pointer bg-white border border-[#e4eaf2] rounded"
                />
                <span className="font-['Pretendard',sans-serif] font-medium text-sm text-[#333] flex-1">
                  상담을 위한 정보 수집에 동의합니다.{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsDetail(!showTermsDetail)}
                    className="text-[#1f6fff] underline cursor-pointer"
                  >
                    [내용보기]
                  </button>
                </span>
              </label>

              {/* Terms Detail */}
              {showTermsDetail && (
                <div className="mt-3 p-4 bg-[#f4f7fb] rounded-xl border border-[#e4eaf2] max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#d0d0d0] [&::-webkit-scrollbar-thumb]:rounded-full">
                  <div className="font-['Pretendard',sans-serif] text-xs leading-[1.6] text-[#666] space-y-3">
                    <p className="font-bold text-black">
                      - 본 동의서는 청암홈윈도우가 개인정보처리자로서 수집 · 이용합니다.
                    </p>

                    <div>
                      <p className="font-bold text-black mb-1">1. 수집 · 이용에 관한 사항</p>

                      <p className="font-bold text-black mt-2">수집 · 이용목적</p>
                      <p>
                        청암홈윈도우 파트너 모집 상담 진행 및 관련 안내 제공 / 청암홈윈도우 파트너 활동 정보 및 신청 방법 등 안내 제공 / 상담 후 추가적인 안내 및 관련 서비스에 대한 안내 제공
                      </p>

                      <p className="font-bold text-black mt-2">수집 · 이용 항목</p>
                      <p>개인(신용)정보 : 성명, 거주지, 전화번호</p>

                      <p className="font-bold text-black mt-2">보유 및 이용기간</p>
                      <p>
                        본 동의서에 따라 수집된 개인정보는 수집일로부터 1년간 보관되며, 이후 안전하게 폐기됩니다.
                      </p>

                      <p className="font-bold text-black mt-2">거부 권리 및 불이익</p>
                      <p>
                        귀하는 아래 개인(신용)정보 수집 · 이용에 관한 동의를 거부하실 수 있습니다. 동의 거부 시 불이익은 없으나 청암홈윈도우의 파트너 모집 상담 서비스는 제공되지 않습니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1f6fff] text-white font-['Pretendard',sans-serif] font-bold text-lg py-4 rounded-xl hover:bg-[#1557d6] transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? '제출 중...' : '신청완료'}
            </button>
          </form>

          {/* Loading Overlay */}
          {isSubmitting && !showAlert && (
            <div className="absolute inset-0 bg-white/95 rounded-3xl flex items-center justify-center z-10">
              <div className="text-center px-8">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="w-16 h-16 border-4 border-[#e4eaf2] border-t-[#1f6fff] rounded-full animate-spin"></div>
                </div>
                <p className="font-['Pretendard',sans-serif] font-bold text-lg text-black">
                  파트너 접수중입니다
                </p>
              </div>
            </div>
          )}

          {/* Alert Overlay */}
          {showAlert && (
            <div className="absolute inset-0 bg-white/95 rounded-3xl flex items-center justify-center z-10">
              <div className="text-center px-8">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  alertType === 'success' ? 'bg-[#1f6fff]' : 'bg-red-500'
                }`}>
                  {alertType === 'success' ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <p className="font-['Pretendard',sans-serif] font-bold text-lg text-black whitespace-pre-line">
                  {alertMessage}
                </p>
                {alertType === 'error' && (
                  <button
                    onClick={() => setShowAlert(false)}
                    className="mt-6 px-8 py-3 bg-[#1f6fff] text-white font-['Pretendard',sans-serif] font-bold rounded-xl hover:bg-[#1557d6] transition-colors cursor-pointer"
                  >
                    확인
                  </button>
                )}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
