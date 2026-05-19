import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router";
import { Pencil, ChevronRight } from "lucide-react";
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
  PremiumReviewCard,
  type PremiumCardData,
} from "../components/review/PremiumReviewCard";
import {
  SimpleReviewCard,
  type SimpleRowData,
} from "../components/review/SimpleReviewCard";

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
  const [extras, setExtras] = useState({
    hasPhoto: false,
    hasVideo: false,
    beforeAfter: false,
  });
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = new URL("/api/review/list", window.location.origin);
    if (tab !== "all") url.searchParams.set("tier", tab);
    if (part) url.searchParams.set("part", part);
    url.searchParams.set("sort", sort);
    fetch(url.toString())
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData({ summary: emptySummary, items: [] }))
      .finally(() => setLoading(false));
  }, [tab, part, sort]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    let arr = data.items;
    if (extras.hasPhoto) arr = arr.filter((i) => (i.photos?.length || 0) > 0);
    if (extras.hasVideo) arr = arr.filter((i) => (i.videoCount || 0) > 0);
    // beforeAfter 필터는 향후 photos[].label 검사 추가
    return arr;
  }, [data, extras]);

  const premium = filteredItems.filter((i) => i.tier === "premium");
  const simple = filteredItems.filter((i) => i.tier === "simple");

  return (
    <main className="min-h-screen bg-[#faf7f4] text-[#1c1614]">
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
              to="/review/new"
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
          counts={
            data?.summary?.counts || { all: 0, simple: 0, premium: 0 }
          }
          sort={sort}
          onSortChange={setSort}
          part={part}
          onPartChange={setPart}
          extraFilters={extras}
          onExtraToggle={(k) =>
            setExtras((p) => ({ ...p, [k]: !p[k] }))
          }
        />

        {/* premium grid */}
        {(tab === "all" || tab === "premium") && premium.length > 0 && (
          <div>
            <div className="text-[13px] text-[#6b6460] mb-3">
              <strong className="text-[#1c1614]">프리미엄 후기</strong> — 사진과 함께 자세한 시공기를 남긴 후기입니다
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {premium.slice(0, tab === "premium" ? 50 : 4).map((it) => (
                <PremiumReviewCard
                  key={it.id}
                  data={toPremiumCard(it)}
                />
              ))}
            </div>
          </div>
        )}

        {/* simple list */}
        {(tab === "all" || tab === "simple") && simple.length > 0 && (
          <div>
            <div className="text-[13px] text-[#6b6460] mb-1">
              <strong className="text-[#1c1614]">간편 후기</strong>
            </div>
            <div>
              {simple.slice(0, tab === "simple" ? 50 : 10).map((it) => (
                <SimpleReviewCard key={it.id} data={toSimpleRow(it)} />
              ))}
            </div>
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-16 text-[#9a948f]">
            <p className="text-[14px]">조건에 맞는 후기가 아직 없습니다.</p>
            <Link
              to="/review/new"
              className="inline-block mt-4 text-[#952c2c] font-bold text-[13px] hover:underline"
            >
              첫 후기를 남겨주세요 →
            </Link>
          </div>
        )}
      </section>
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

function toPremiumCard(it: ListItem): PremiumCardData {
  return {
    id: it.id,
    customerName: it.customerName,
    location: it.snapshot?.locationLabel || "",
    productLabel: it.snapshot?.productLabel,
    modelLabel: it.model
      ? `${it.model}${it.parts?.length ? ` · ${it.parts.length}개소` : ""}`
      : undefined,
    rating: it.rating,
    photoCount: it.photos?.length || 0,
    videoCount: it.videoCount,
    publishedAt: formatRelative(it.publishedAt) || it.publishedAt,
    excerpt: it.reviewText,
    thumbnailUrl: it.photos?.[0]?.url,
  };
}

function toSimpleRow(it: ListItem): SimpleRowData {
  return {
    id: it.id,
    customerName: it.customerName,
    publishedAt: formatRelative(it.publishedAt) || it.publishedAt,
    rating: it.rating,
    reviewText: it.reviewText,
    tags: it.tags,
    helpfulCount: it.helpfulCount,
  };
}

function formatRelative(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days < 1) return "오늘";
    if (days < 7) return `${days}일 전`;
    if (days < 30) return `${Math.floor(days / 7)}주 전`;
    if (days < 365) return `${Math.floor(days / 30)}개월 전`;
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}
