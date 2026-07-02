import type { ReviewTier } from "../app/styles/reviewTokens";
import { resizeImageFile } from "./resizeImage";

const MOCK = import.meta.env.VITE_REVIEW_MOCK === "1";

export interface ReviewSnapshot {
  contractDocId?: string;
  brand?: string;
  modelGrade?: string;
  productLabel?: string;
  locationLabel?: string;
  installDate?: string;
  glassLabel?: string;
  sizeLabel?: string;
  warrantyLabel?: string;
  warrantyYears?: number;
  siteWorkSummary?: string;
  erpPhotos?: { path: string; url: string }[];
}

export type LookupResponse =
  | {
      matched: "one";
      token: string;
      masked: { name: string; phone: string };
      customerId?: string;
      snapshot?: ReviewSnapshot;
    }
  | { matched: "none" }
  | { matched: "already_reviewed" };

export async function lookupCustomer(input: {
  name: string;
  phoneLast4: string;
}): Promise<LookupResponse> {
  if (MOCK) {
    if (input.phoneLast4 === "0000") return { matched: "none" };
    if (input.phoneLast4 === "1111") return { matched: "already_reviewed" };
    return {
      matched: "one",
      token: "mock-token-" + Date.now(),
      masked: {
        name: input.name.replace(/(?<=.).(?=.*$)/g, "*"),
        phone: "010-****-" + input.phoneLast4,
      },
      customerId: "mock-cust-001",
      snapshot: {
        contractDocId: "CAH-mock-001",
        brand: "KCC",
        modelGrade: "시그니처",
        productLabel: "KCC 클렌체 240mm 이중창",
        locationLabel: "경기 부천 원미동",
        installDate: "2026.03.14",
        glassLabel: "로이복층 22mm + 아르곤",
        sizeLabel: "3,200×2,400mm 외 6개소",
        warrantyLabel: "시그니처 15년 무상보증",
        warrantyYears: 15,
        siteWorkSummary: "거실·주방·안방·작은방·베란다",
      },
    };
  }
  const res = await fetch("/api/review/customer-lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, hw_website: "" }),
  });
  if (!res.ok) {
    throw new Error(`lookup_failed_${res.status}`);
  }
  return res.json();
}

export type SubmitReviewInput = {
  token: string;
  tier: ReviewTier;
  rating: number;
  parts: string[];
  brand: string;
  model: string;
  reviewText: string;
  tags?: string[];
  photos?: { file: File; label?: string }[];
};

export async function submitReview(input: SubmitReviewInput): Promise<{ id: string }> {
  if (MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    console.info("[mock] submitReview", {
      ...input,
      photos: input.photos?.length || 0,
      mockSnapshot: {
        productLabel: "KCC 시그니처",
        locationLabel: "경기 부천 원미동",
        installDate: "2026.03.14",
        glassLabel: "로이복층 22mm + 아르곤 가스",
        sizeLabel: "3,200×2,400mm 외 6개소",
        warrantyLabel: "시그니처 15년 무상보증",
      },
    });
    return { id: "mock-review-" + Date.now() };
  }
  const form = new FormData();
  form.append("token", input.token);
  form.append("tier", input.tier);
  form.append("rating", String(input.rating));
  form.append("parts", JSON.stringify(input.parts));
  form.append("brand", input.brand);
  form.append("model", input.model);
  form.append("reviewText", input.reviewText);
  if (input.tags) form.append("tags", JSON.stringify(input.tags));
  if (input.photos) {
    // 업로드 전 병렬 리사이즈/압축 (전송량·시간 대폭 감소)
    const resized = await Promise.all(
      input.photos.map((p) => resizeImageFile(p.file))
    );
    input.photos.forEach((p, i) => {
      const file = resized[i];
      form.append("photos", file, file.name);
      form.append("photoLabels", p.label || "other");
    });
  }
  form.append("hw_website", "");
  const res = await fetch("/api/review/submit", { method: "POST", body: form });
  if (!res.ok) throw new Error(`submit_failed_${res.status}`);
  return res.json();
}

// === 메인 ReviewSection 용 ===

export interface FeaturedReviewItem {
  id: string;
  tier: "simple" | "premium";
  rating: number;
  brand?: string;
  model?: string;
  parts?: string[];
  tags?: string[];
  reviewText: string;
  photos?: { url?: string; label?: string }[];
  videoCount?: number;
  snapshot?: ReviewSnapshot;
  customerName: string;     // 마스킹됨
  publishedAt: string;
  helpfulCount?: number;
  featured?: boolean;
}

export interface FeaturedListResponse {
  summary: {
    avg: number;
    count: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
    counts: { all: number; simple: number; premium: number };
  };
  items: FeaturedReviewItem[];
}

/**
 * 메인 ReviewSection 용 — ERP에서 featured=true 선정한 후기들.
 * 없으면 tier=premium 최신으로 fallback (서버 측 처리).
 */
export async function fetchFeaturedReviews(limit = 4): Promise<FeaturedListResponse> {
  if (MOCK) {
    const mockItems: FeaturedReviewItem[] = Array.from({ length: limit }).map((_, i) => ({
      id: `mock-featured-${i}`,
      tier: "premium" as const,
      rating: 5,
      brand: ["KCC", "LX", "홈씨씨", "홈윈도우"][i % 4],
      model: ["시그니처", "프레스티지", "에코"][i % 3],
      parts: ["거실", "주방"],
      reviewText:
        "30평대 아파트 전체 창호 교체. 결정 전 3군데 견적을 받았는데 청암홈윈도우는 견적 단계부터 디테일이 달랐어요. 시공 당일 오전 9시 도착, 오후 6시 전에 마무리. 정말 하루 완공이었습니다.",
      photos: [],
      videoCount: 0,
      snapshot: {
        productLabel: "KCC 클렌체 240mm 이중창",
        locationLabel: ["경기 분당", "서울 마포구", "인천 송도", "부산 해운대"][i % 4],
        installDate: "2026.03.14",
      },
      customerName: ["이*윤", "김*서", "박*훈", "최*연"][i % 4],
      publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
      featured: true,
    }));
    return {
      summary: {
        avg: 4.9,
        count: 2847,
        distribution: { 1: 6, 2: 18, 3: 57, 4: 256, 5: 2510 },
        counts: { all: 2847, simple: 2591, premium: 256 },
      },
      items: mockItems,
    };
  }

  const url = new URL("/api/review/list", window.location.origin);
  url.searchParams.set("featured", "1");
  url.searchParams.set("limit", String(limit));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`featured_failed_${res.status}`);
  return res.json();
}
