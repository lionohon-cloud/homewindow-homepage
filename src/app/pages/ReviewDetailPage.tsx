import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router";
import { ArrowLeft, ChevronRight, ThumbsUp, Share2, Crown } from "lucide-react";
import { StarsDisplay } from "../components/review/StarsDisplay";
import { SpecTable, type ReviewSpec } from "../components/review/SpecTable";

interface DetailItem {
  id: string;
  tier: "simple" | "premium";
  rating: number;
  brand?: string;
  model?: string;
  parts?: string[];
  tags?: string[];
  reviewText: string;
  photos?: { url?: string; label?: string }[];
  snapshot?: ReviewSpec & {
    productLabel?: string;
    locationLabel?: string;
  };
  customerName: string;
  publishedAt: string;
  helpfulCount?: number;
}

export function Component() {
  // 토글 OFF면 메인으로 리다이렉트 (docs/REVIEW_GO_LIVE.md)
  if (import.meta.env.VITE_REVIEW_SECTION_LIVE !== "1") {
    return <Navigate to="/" replace />;
  }

  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<DetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/review/${encodeURIComponent(id)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(String(e.message || e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <main className="min-h-screen bg-[#faf7f4] flex items-center justify-center text-[#9a948f]">로딩중...</main>;
  }
  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#faf7f4] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-[15px] text-[#3a3531] mb-6">후기를 찾을 수 없습니다.</p>
        <Link to="/review" className="text-[#952c2c] font-bold hover:underline">
          후기 목록으로 →
        </Link>
      </main>
    );
  }

  const photos = data.photos || [];
  const activePhoto = photos[activeIdx];
  const initial = data.customerName[0] || "리";

  return (
    <main className="min-h-screen bg-[#faf7f4] text-[#1c1614]">
      {/* breadcrumb header */}
      <header className="border-b border-[#ebe5e0] bg-white">
        <div className="max-w-screen-lg mx-auto px-6 md:px-10 py-5 flex items-center gap-2 text-[12px] text-[#9a948f]">
          <Link to="/" className="hover:text-[#3a3531]">홈</Link>
          <ChevronRight className="w-3 h-3 text-[#c8b8a8]" />
          <Link to="/review" className="hover:text-[#3a3531]">시공후기</Link>
          <ChevronRight className="w-3 h-3 text-[#c8b8a8]" />
          <span className="text-[#3a3531] font-semibold">{data.id}</span>
        </div>
      </header>

      <section className="max-w-screen-lg mx-auto px-6 md:px-10 py-8 md:py-10">
        <Link
          to="/review"
          className="inline-flex items-center gap-1 text-[13px] text-[#6b6460] hover:text-[#1c1614] mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 목록으로
        </Link>

        <div className="grid md:grid-cols-[1.2fr_1fr] gap-8">
          {/* 좌: 갤러리 */}
          <div>
            {photos.length === 0 ? (
              <div className="aspect-[4/3] rounded-2xl bg-[#f4ede4] border border-[#ebe5e0] flex items-center justify-center text-[#9a948f] text-[13px]">
                사진 없음
              </div>
            ) : (
              <>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#f4ede4] border border-[#ebe5e0] relative">
                  {activePhoto?.url && (
                    <img
                      src={activePhoto.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                  {activePhoto?.label && (
                    <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold tracking-wider">
                      {activePhoto.label.toUpperCase()}
                    </span>
                  )}
                </div>
                {photos.length > 1 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {photos.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIdx(i)}
                        className={[
                          "aspect-square rounded-lg overflow-hidden border-2 transition",
                          i === activeIdx
                            ? "border-[#952c2c]"
                            : "border-transparent hover:border-[#c8b8a8]",
                        ].join(" ")}
                      >
                        {p.url ? (
                          <img src={p.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#f4ede4]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* 우: 본문 + 스펙 */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white border border-[#ebe5e0] p-6">
              {/* meta */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#fbf0ef] text-[#952c2c] font-bold flex items-center justify-center text-[15px]">
                    {initial}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[15px] font-extrabold text-[#1c1614]">
                        {data.customerName}
                      </span>
                      {data.tier === "premium" && (
                        <Crown className="w-3.5 h-3.5 text-[#b8945a]" />
                      )}
                    </div>
                    <div className="text-[12px] text-[#9a948f]">
                      {data.snapshot?.locationLabel || ""}{" "}
                      {data.publishedAt ? `· ${formatDate(data.publishedAt)}` : ""}
                    </div>
                  </div>
                </div>
                <StarsDisplay value={data.rating} size={16} />
              </div>

              <p className="mt-5 text-[14.5px] leading-[1.8] text-[#3a3531] break-keep whitespace-pre-wrap">
                {data.reviewText}
              </p>

              {data.tags && data.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {data.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center px-2.5 h-[26px] rounded-full bg-[#fbf0ef] text-[#952c2c] text-[12px] font-semibold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 스펙 테이블 (snapshot이 있을 때만) */}
            {data.snapshot && (
              <SpecTable
                spec={{
                  siteWorkSummary:
                    data.snapshot.siteWorkSummary ||
                    (data.parts && data.parts.length
                      ? data.parts.join("·")
                      : undefined),
                  productLabel: data.snapshot.productLabel,
                  glassLabel: data.snapshot.glassLabel,
                  sizeLabel: data.snapshot.sizeLabel,
                  installDate: data.snapshot.installDate,
                  warrantyLabel: data.snapshot.warrantyLabel,
                }}
              />
            )}

            {/* 반응 */}
            <div className="flex items-center gap-3">
              <button
                disabled
                className="inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-white border border-[#ebe5e0] text-[13px] text-[#6b6460] font-semibold"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                도움돼요 {data.helpfulCount ?? 0}
              </button>
              <button
                disabled
                className="inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-white border border-[#ebe5e0] text-[13px] text-[#6b6460] font-semibold"
              >
                <Share2 className="w-3.5 h-3.5" />
                공유
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}
