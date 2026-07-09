import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router";
import { Pencil, ChevronRight, ArrowLeft } from "lucide-react";
import {
  RatingDistribution,
  type RatingSummary,
} from "../components/review/RatingDistribution";
import {
  ReviewFilterBar,
  type ReviewTab,
  type ReviewSort,
} from "../components/review/ReviewFilterBar";
import {
  ReviewRowCard,
  type ReviewRowData,
} from "../components/review/ReviewRowCard";
import {
  PhotoReviewCard,
  type PhotoReviewData,
} from "../components/review/PhotoReviewCard";
import { PhotoReviewCarousel } from "../components/review/PhotoReviewCarousel";
import { keywordTags } from "@/lib/reviewTags";
import { displayablePhotos } from "@/lib/displayablePhotos";
import { BottomBar } from "../components/BottomBar";

// "더보기" 초기 노출 개수 / 클릭당 추가 개수
const PAGE_SIZE = 5;

interface ListItem {
  id: string;
  tier: "simple" | "premium";
  rating: number;
  brand?: string;
  model?: string;
  parts?: string[];
  tags?: string[];
  reviewText: string;
  photos?: { url?: string }[];
  videoCount?: number;
  snapshot?: {
    productLabel?: string;
    modelGrade?: string;
    locationLabel?: string;
    installDate?: string;
  };
  customerName: string;
  publishedAt: string;
  helpfulCount?: number;
}

interface ListResponse {
  summary: RatingSummary & {
    counts: { all: number; simple: number; premium: number };
  };
  items: ListItem[];
}

export function Component() {
  // 토글 OFF면 메인으로 리다이렉트 (docs/REVIEW_GO_LIVE.md)
  if (import.meta.env.VITE_REVIEW_SECTION_LIVE !== "1") {
    return <Navigate to="/" replace />;
  }

  const [tab, setTab] = useState<ReviewTab>("all");
  const [sort, setSort] = useState<ReviewSort>("latest");
  const [part, setPart] = useState<string>("");
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // 필터/정렬/탭이 바뀌면 노출 개수 초기화
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [tab, sort, part]);

  useEffect(() => {
    setLoading(true);
    const url = new URL("/api/review/list", window.location.origin);
    if (part) url.searchParams.set("part", part);
    url.searchParams.set("sort", sort);
    fetch(url.toString())
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData({ summary: emptySummary, items: [] }))
      .finally(() => setLoading(false));
  }, [part, sort]);

  // "사진 리뷰" 탭이면 사진 있는 후기만
  const filteredItems = useMemo(() => {
    if (!data) return [];
    if (tab === "photo") return data.items.filter((i) => displayablePhotos(i.photos).length > 0);
    return data.items;
  }, [data, tab]);

  // "사진 후기 모아보기" — 사진 있는 후기만 (탭 무관, 데스크톱은 5개씩 슬라이드)
  const photoItems = useMemo(
    () => filteredItems.filter((i) => displayablePhotos(i.photos).length > 0),
    [filteredItems]
  );

  return (
    <main className="min-h-screen bg-[#faf7f4] text-[#1c1614] pb-[100px] md:pb-[110px]">
      {/* 좌상단 floating 칩 — 메인으로 가는 출구 */}
      <Link
        to="/"
        className="fixed top-4 left-4 md:top-5 md:left-5 z-40 flex items-center gap-1 md:gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 md:px-4 md:py-2 shadow-md hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#666]" />
        <span className="text-[11px] md:text-xs font-semibold text-[#333]">
          <span className="md:hidden">메인</span>
          <span className="hidden md:inline">메인으로</span>
        </span>
      </Link>

      {/* page head */}
      <header className="border-b border-[#ebe5e0] bg-white">
        <div className="max-w-screen-lg mx-auto px-6 md:px-10 py-8 md:py-10">
          <div className="text-[12px] text-[#9a948f]">
            <Link to="/" className="hover:text-[#3a3531]">홈</Link>
            <ChevronRight className="inline w-3 h-3 mx-1 -mt-0.5 text-[#c8b8a8]" />
            시공후기
          </div>
          <h1 className="mt-2 text-[28px] md:text-[34px] font-black tracking-tight">
            시공 후기
          </h1>
          <p className="mt-1.5 text-[14px] md:text-[15px] text-[#6b6460] break-keep">
            수천 건의 시공이 입증한, 청암홈윈도우를 경험한 이야기
          </p>
        </div>
      </header>

      <section className="max-w-screen-lg mx-auto px-6 md:px-10 py-8 md:py-10 space-y-8">
        {/* summary + CTA */}
        <div className="grid md:grid-cols-[1fr_300px] gap-6 items-start">
          <RatingDistribution summary={data?.summary || emptySummary} />
          <div className="rounded-2xl bg-white border border-[#ebe5e0] p-6 text-center">
            <div className="text-[13px] text-[#6b6460] mb-3">시공받으셨나요?</div>
            <Link
              to="/review/type"
              className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#952c2c] text-white font-bold text-[14.5px] tracking-tight hover:bg-[#7e2424] active:bg-[#6e1f1f] transition"
            >
              <Pencil className="w-4 h-4" />
              후기 작성하기
            </Link>
          </div>
        </div>

        {/* tab + sort + filter */}
        <ReviewFilterBar
          tab={tab}
          onTabChange={setTab}
          sort={sort}
          onSortChange={setSort}
          part={part}
          onPartChange={setPart}
        />

        {/* 사진 후기 모아보기 */}
        {photoItems.length > 0 && (
          <div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="w-1 h-4 bg-[#952c2c] rounded-full translate-y-0.5" />
              <strong className="text-[17px] font-extrabold text-[#1c1614]">
                사진 후기 모아보기
              </strong>
              <span className="text-[13px] text-[#9a948f] font-semibold">
                총 {photoItems.length}건
              </span>
            </div>
            {/* 모바일: 2열 그리드 (상위 4개) */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
              {photoItems.slice(0, 4).map((it) => (
                <PhotoReviewCard key={it.id} data={toPhotoCard(it)} />
              ))}
            </div>
            {/* 데스크톱: 5개씩 슬라이드 */}
            <div className="hidden md:block">
              <PhotoReviewCarousel items={photoItems.map(toPhotoCard)} />
            </div>
          </div>
        )}

        {/* 전체 후기 리스트 */}
        <div>
          <div className="flex items-baseline justify-between pb-3.5 mb-1 border-b-2 border-[#1c1614]">
            <div className="flex items-baseline gap-2.5">
              <strong className="text-[20px] font-black text-[#1c1614]">
                {tab === "photo" ? "사진 후기" : "전체 후기"}
              </strong>
              <span className="text-[14px] font-extrabold text-[#952c2c]">
                {filteredItems.length}건
              </span>
            </div>
          </div>

          <div>
            {filteredItems.slice(0, visibleCount).map((it) => (
              <ReviewRowCard key={it.id} data={toRowCard(it)} />
            ))}
          </div>

          {filteredItems.length > visibleCount && (
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="mt-7 mx-auto flex h-12 items-center justify-center rounded-xl border border-[#ebe5e0] bg-white px-8 text-[14px] font-extrabold text-[#3a3531] hover:border-[#c8b8a8] transition"
            >
              후기 더보기 ({filteredItems.length - visibleCount}건 남음)
            </button>
          )}
        </div>

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-16 text-[#9a948f]">
            <p className="text-[14px]">조건에 맞는 후기가 아직 없습니다.</p>
            <Link
              to="/review/type"
              className="inline-block mt-4 text-[#952c2c] font-bold text-[13px] hover:underline"
            >
              첫 후기를 남겨주세요 →
            </Link>
          </div>
        )}
      </section>

      {/* 하단 고정 상담신청 CTA — 메인과 동일. 콘텐츠 가림 방지는 main pb-[100px] */}
      <BottomBar />
    </main>
  );
}

const emptySummary: RatingSummary & {
  counts: { all: number; simple: number; premium: number };
} = {
  avg: 0,
  count: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  counts: { all: 0, simple: 0, premium: 0 },
};

function toRowCard(it: ListItem): ReviewRowData {
  return {
    id: it.id,
    customerName: it.customerName,
    location: it.snapshot?.locationLabel || "",
    brand: it.brand,
    model: it.model,
    rating: it.rating,
    publishedAt: formatRelative(it.publishedAt) || it.publishedAt,
    reviewText: it.reviewText,
    tags: keywordTags(it.tags),
    photoUrls: displayablePhotos(it.photos)
      .map((p) => p.url)
      .filter((u): u is string => !!u),
  };
}

function toPhotoCard(it: ListItem): PhotoReviewData {
  return {
    id: it.id,
    thumbnailUrl: displayablePhotos(it.photos)[0]?.url || "",
    location: it.snapshot?.locationLabel || "",
  };
}

// 작성일을 YYYY.MM.DD 로 표기 (상대시간 "오늘/N일 전" 사용 안 함)
function formatRelative(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}
