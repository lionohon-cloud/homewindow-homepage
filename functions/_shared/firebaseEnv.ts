/**
 * Firebase 환경변수 통합 — Cloudflare Functions 전용.
 *
 * ERP(cahwindow-quote)와 동일 Firebase 프로젝트 (`cahwindow-quote`)에 직접 붙음.
 * 부사장님 정책상 firebase-admin SDK 사용 불가 (서비스 계정 JSON 발급 막힘).
 * → Identity Toolkit signIn (시스템 계정 또는 익명) + Firestore REST API.
 */
export interface FirebaseEnv {
  FIREBASE_API_KEY?: string;
  FIREBASE_AUTH_DOMAIN?: string;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_STORAGE_BUCKET?: string;
  FIREBASE_MESSAGING_SENDER_ID?: string;
  FIREBASE_APP_ID?: string;
  SYSTEM_AUTH_EMAIL?: string;
  SYSTEM_AUTH_PASSWORD?: string;
  REVIEW_JWT_SECRET?: string;
  REVIEW_RL?: KVNamespace;
}

export function requireEnv(env: FirebaseEnv): {
  apiKey: string;
  projectId: string;
  storageBucket: string;
  email?: string;
  password?: string;
} {
  const apiKey = env.FIREBASE_API_KEY;
  const projectId = env.FIREBASE_PROJECT_ID;
  const storageBucket = env.FIREBASE_STORAGE_BUCKET;
  if (!apiKey) throw new Error('FIREBASE_API_KEY 환경변수 누락');
  if (!projectId) throw new Error('FIREBASE_PROJECT_ID 환경변수 누락');
  if (!storageBucket) throw new Error('FIREBASE_STORAGE_BUCKET 환경변수 누락');
  return {
    apiKey,
    projectId,
    storageBucket,
    email: env.SYSTEM_AUTH_EMAIL,
    password: env.SYSTEM_AUTH_PASSWORD,
  };
}
