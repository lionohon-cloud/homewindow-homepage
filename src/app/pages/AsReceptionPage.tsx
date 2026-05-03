import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Camera, X, Phone, MapPin, Mail, MessageSquare, User } from 'lucide-react';
import { HoneypotField } from '@/lib/HoneypotField';

export function Component() {
  const navigate = useNavigate();
  const [contractorName, setContractorName] = useState('');
  const [phone1, setPhone1] = useState('010');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const phone2Ref = useRef<HTMLInputElement>(null);
  const phone3Ref = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      setErrorMsg('사진은 최대 5장까지 첨부할 수 있습니다.');
      return;
    }
    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) {
        setErrorMsg(`사진 크기 5MB 초과: ${f.name}`);
        return;
      }
    }
    setPhotos((prev) => [...prev, ...files]);
    setErrorMsg('');
    e.target.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!contractorName.trim()) return setErrorMsg('계약자명을 입력해 주세요.');
    if (phone1.length < 2 || phone2.length < 3 || phone3.length < 4) {
      return setErrorMsg('연락처를 정확히 입력해 주세요.');
    }
    if (!address.trim()) return setErrorMsg('주소를 입력해 주세요.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErrorMsg('이메일 형식이 올바르지 않습니다.');
    if (!description.trim()) return setErrorMsg('AS 상세내용을 입력해 주세요.');
    if (!agreed) return setErrorMsg('개인정보 수집에 동의해 주세요.');

    setSubmitting(true);

    const formData = new FormData();
    formData.append('contractor_name', contractorName.trim());
    formData.append('phone', `${phone1}-${phone2}-${phone3}`);
    formData.append('address', address.trim());
    formData.append('email', email.trim());
    formData.append('description', description.trim());
    formData.append('hw_website', honeypotRef.current?.value || '');
    for (const f of photos) formData.append('photos', f);

    try {
      const res = await fetch('/api/as/create', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || '접수 실패');
        return;
      }
      sessionStorage.setItem('hw_as_done_no', data.reception_no);
      sessionStorage.setItem('hw_as_done_name', contractorName.trim());
      navigate('/as/done');
    } catch (err) {
      console.error(err);
      setErrorMsg('네트워크 오류로 접수에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] py-8 px-4 md:py-12">
      <div className="max-w-2xl mx-auto">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1 text-[#666] hover:text-[#333] text-[14px] mb-4"
        >
          <ArrowLeft size={16} /> 메인으로
        </button>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* 헤더 */}
          <div className="bg-[#D22727] text-white px-6 py-6 md:px-8 md:py-7">
            <h1 className="text-[22px] md:text-[26px] font-extrabold">AS 접수하기</h1>
            <p className="text-[13px] md:text-[14px] text-white/80 mt-1">
              청암홈윈도우에서 시공받으신 고객님의 AS 신청을 접수합니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 md:px-8 md:py-8 space-y-5">
            <HoneypotField ref={honeypotRef} />

            {/* 계약자명 */}
            <Field label="계약자명" icon={<User size={14} />} required>
              <input
                type="text"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                disabled={submitting}
                maxLength={30}
                placeholder="홍길동"
                className={inputCls}
              />
            </Field>

            {/* 연락처 */}
            <Field label="연락처" icon={<Phone size={14} />} required>
              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  value={phone1}
                  onChange={(e) => setPhone1(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  disabled={submitting}
                  className={`${inputCls} w-[68px] text-center`}
                />
                <span className="text-[#ccc]">—</span>
                <input
                  ref={phone2Ref}
                  type="tel"
                  value={phone2}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    setPhone2(v);
                    if (v.length === 4) phone3Ref.current?.focus();
                  }}
                  placeholder="0000"
                  disabled={submitting}
                  className={`${inputCls} w-[88px] text-center`}
                />
                <span className="text-[#ccc]">—</span>
                <input
                  ref={phone3Ref}
                  type="tel"
                  value={phone3}
                  onChange={(e) => setPhone3(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder="0000"
                  disabled={submitting}
                  className={`${inputCls} w-[88px] text-center`}
                />
              </div>
            </Field>

            {/* 주소 */}
            <Field label="주소 (창호 교체한 곳)" icon={<MapPin size={14} />} required>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={submitting}
                maxLength={200}
                placeholder="시공받으신 주소를 입력해 주세요"
                className={inputCls}
              />
            </Field>

            {/* 이메일 */}
            <Field label="이메일 (답변 회신용)" icon={<Mail size={14} />} required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                maxLength={100}
                placeholder="example@domain.com"
                className={inputCls}
              />
            </Field>

            {/* 상세내용 */}
            <Field label="AS 상세내용" icon={<MessageSquare size={14} />} required>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                maxLength={2000}
                placeholder="문제 발생 시점, 증상, 위치 등을 자세히 적어주세요."
                rows={6}
                className={`${inputCls} resize-none`}
              />
              <div className="text-[11px] text-[#999] text-right mt-1">
                {description.length}/2000
              </div>
            </Field>

            {/* 사진 첨부 */}
            <Field label="사진 첨부 (선택, 최대 5장)" icon={<Camera size={14} />}>
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#ccc] rounded-lg cursor-pointer hover:bg-[#f8f8f8] text-[13px] text-[#666]">
                  <Camera size={16} />
                  사진 선택
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                    disabled={submitting || photos.length >= 5}
                    className="hidden"
                  />
                </label>
                {photos.length > 0 && (
                  <ul className="space-y-1">
                    {photos.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between bg-[#f8f8f8] rounded px-3 py-1.5 text-[12px]"
                      >
                        <span className="truncate text-[#555]">
                          {f.name} ({(f.size / 1024).toFixed(0)}KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          disabled={submitting}
                          className="text-[#999] hover:text-[#D22727]"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Field>

            {/* 동의 */}
            <label className="flex items-start gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={submitting}
                className="mt-0.5 w-4 h-4 accent-[#D22727]"
              />
              <span className="text-[12px] text-[#666] leading-[1.5]">
                AS 처리를 위해 입력하신 정보(계약자명·연락처·주소·이메일·상세내용·사진)를 수집·이용하는 것에 동의합니다.
                수집된 정보는 AS 처리 완료 후 1년 이내 파기됩니다. (필수)
              </span>
            </label>

            {/* 오류 메시지 */}
            {errorMsg && (
              <div className="bg-[#fff5f5] border border-[#fecaca] text-[#c81e1e] text-[13px] rounded-lg px-4 py-3">
                {errorMsg}
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-[52px] bg-[#D22727] hover:bg-[#b02020] disabled:bg-[#ccc] text-white font-bold rounded-xl transition-colors"
              >
                {submitting
                  ? photos.length > 0
                    ? `📷 사진 업로드 중... (${photos.length}장)`
                    : '접수 중...'
                  : 'AS 접수하기'}
              </button>
            </div>
            {/* 사진 업로드 진행 안내 — 시간 오래 걸릴 수 있음을 미리 알림 */}
            {submitting && photos.length > 0 && (
              <div className="text-center pt-1 text-[12px] text-[#888]">
                첨부 사진을 업로드하는 중입니다. 사진 수와 용량에 따라 1분 이상 소요될 수 있습니다.
                창을 닫지 마시고 잠시만 기다려 주세요.
              </div>
            )}

            {/* 조회 링크 */}
            <div className="text-center pt-2 text-[13px] text-[#666]">
              이미 접수하셨나요?{' '}
              <Link to="/as/lookup" className="text-[#D22727] underline font-medium">
                접수내역 조회
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full h-[44px] px-3 border-2 border-[#e5e5e5] rounded-lg text-[14px] text-[#222] bg-white focus:border-[#D22727] outline-none transition-colors disabled:bg-[#f5f5f5]';

function Field({
  label,
  icon,
  required,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#444] mb-1.5">
        {icon}
        <span>{label}</span>
        {required && <span className="text-[#D22727]">*</span>}
      </label>
      {children}
    </div>
  );
}
