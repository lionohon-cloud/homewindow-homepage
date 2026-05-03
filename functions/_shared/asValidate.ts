/**
 * AS 접수 입력 검증 유틸
 */

export interface AsRequestInput {
  contractor_name: string;
  phone: string;
  address: string;
  email: string;
  description: string;
}

export interface AsPhotoMeta {
  path: string;
  name: string;
  size: number;
  mime: string;
}

const PHONE_RE = /^010-\d{4}-\d{4}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RECEPTION_RE = /^AS-\d{6}-\d{5}$/;

export function normalizePhone(input: string): string {
  const digits = (input || '').replace(/[^0-9]/g, '');
  if (digits.length === 11 && digits.startsWith('010')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return input;
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
  data?: AsRequestInput;
}

export function validateAsInput(raw: Partial<AsRequestInput>): ValidationResult {
  const contractor_name = (raw.contractor_name || '').trim();
  const phone = normalizePhone(raw.phone || '');
  const address = (raw.address || '').trim();
  const email = (raw.email || '').trim();
  const description = (raw.description || '').trim();

  if (!contractor_name) return { ok: false, error: '계약자명을 입력해 주세요.' };
  if (contractor_name.length > 30) return { ok: false, error: '계약자명이 너무 깁니다.' };
  if (!PHONE_RE.test(phone)) return { ok: false, error: '연락처 형식이 올바르지 않습니다.' };
  if (!address) return { ok: false, error: '주소를 입력해 주세요.' };
  if (address.length > 200) return { ok: false, error: '주소가 너무 깁니다.' };
  if (!EMAIL_RE.test(email)) return { ok: false, error: '이메일 형식이 올바르지 않습니다.' };
  if (!description) return { ok: false, error: 'AS 상세내용을 입력해 주세요.' };
  if (description.length > 2000) return { ok: false, error: 'AS 상세내용은 2000자 이내로 입력해 주세요.' };

  return {
    ok: true,
    data: { contractor_name, phone, address, email, description },
  };
}

export function isValidReceptionNo(s: string): boolean {
  return RECEPTION_RE.test(s);
}

// 사진 파일 검증
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp']);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

export interface PhotoValidation {
  ok: boolean;
  error?: string;
}

export function validatePhotos(files: File[]): PhotoValidation {
  if (files.length > MAX_FILES) {
    return { ok: false, error: `사진은 최대 ${MAX_FILES}장까지 첨부할 수 있습니다.` };
  }
  for (const f of files) {
    if (!ALLOWED_MIME.has(f.type)) {
      return { ok: false, error: `허용되지 않은 사진 형식: ${f.name}` };
    }
    if (f.size > MAX_FILE_SIZE) {
      return { ok: false, error: `사진 크기 초과 (5MB): ${f.name}` };
    }
  }
  return { ok: true };
}
