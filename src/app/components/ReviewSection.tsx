/**
 * 메인 ReviewSection.
 *
 * VITE_REVIEW_SECTION_LIVE=1 → 신디자인 (featured 카드 그리드, ERP 승인된 후기 노출)
 * 미설정/0           → 구디자인 (채팅버블 5줄, 하드코딩)
 *
 * 토글 가이드: docs/REVIEW_GO_LIVE.md
 */
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { User, ArrowRight, Star, PenLine } from "lucide-react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { PremiumReviewCard, type PremiumCardData } from "./review/PremiumReviewCard";
import { type SimpleRowData } from "./review/SimpleReviewCard";
import { RecentReviewsCarousel } from "./review/RecentReviewsCarousel";
import { keywordTags } from "@/lib/reviewTags";
import { displayablePhotos, firstDisplayableUrl } from "@/lib/displayablePhotos";
import {
  fetchFeaturedReviews,
  type FeaturedReviewItem,
  type FeaturedListResponse,
} from "@/lib/reviewApi";

const REVIEW_LIVE = import.meta.env.VITE_REVIEW_SECTION_LIVE === "1";

export function ReviewSection() {
  return REVIEW_LIVE ? <LiveReviewSection /> : <LegacyReviewSection />;
}

// =============================================================================
// 구 디자인 — 채팅버블 5줄 (운영 시작 전 기본값)
// =============================================================================

const LEGACY_REVIEWS = [
  "살면서 거주중인데도 하루 만에 끝났어요!",
  "바꿔보니 외풍이 사라지고 집이 따뜻해진게 느껴져요.",
  "견적도 상세하고 상담이 친절해서 바로 믿고 맡겼습니다.",
  "창문을 닫는 순간 바깥 소음이 차단돼서 신기해요!",
  "타사에선 비싼 안전방충망을 무상으로 해줘서 가성비 좋아요.",
];

function LegacyReviewSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-white" id="review">
      <div className="max-w-screen-md mx-auto px-6 md:px-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5 }}
          className="text-[#999] text-[16px] font-medium mb-3 text-left"
        >
          고객 후기
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] mb-5 break-keep text-left"
        >
          수천 건의 시공이 입증한,
          <br />
          청암홈윈도우를 경험한 이야기
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-4 justify-start"
        >
          <span className="px-4 py-2 bg-[#f5f5f5] text-[#D22727] text-[14px] md:text-[15px] font-semibold rounded-full border border-[#e0e0e0]">
            #하루 만에 끝나서 편해요
          </span>
          <span className="px-4 py-2 bg-[#f5f5f5] text-[#D22727] text-[14px] md:text-[15px] font-semibold rounded-full border border-[#e0e0e0]">
            #외풍과 소음이 완전히 사라졌어요
          </span>
        </motion.div>

        {/* Before/After 슬라이더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <BeforeAfterSlider />
        </motion.div>

        {/* 채팅버블 Q&A */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 bg-white border border-[#e8e8e8] rounded-2xl p-6 md:p-8 shadow-sm"
        >
          {/* Q 카드 */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#D22727] text-white flex items-center justify-center font-bold text-[14px] flex-shrink-0">
              Q
            </div>
            <p className="text-[15px] md:text-[16px] font-bold text-[#333] pt-2 break-keep">
              청암홈윈도우 어떤점이 제일 만족스러웠나요?
            </p>
          </div>

          {/* 채팅 버블 */}
          <div className="space-y-3">
            {LEGACY_REVIEWS.map((review, idx) => {
              const isLeft = idx % 2 === 0;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.4, delay: 0.5 + idx * 0.15 }}
                  className={`flex items-end gap-2 ${isLeft ? "" : "flex-row-reverse"}`}
                >
                  <div className="w-7 h-7 rounded-full bg-[#f5f5f5] border border-[#e0e0e0] flex items-center justify-center flex-shrink-0 hidden md:flex">
                    <User className="w-3.5 h-3.5 text-[#999]" />
                  </div>
                  <div
                    className={`max-w-[85%] md:max-w-[75%] px-4 py-2.5 text-white text-[13.5px] md:text-[14.5px] font-medium break-keep leading-[1.5] shadow-sm ${
                      isLeft
                        ? "bg-gradient-to-br from-[#D22727] to-[#a01d1d] rounded-2xl rounded-bl-md"
                        : "bg-gradient-to-br from-[#a01d1d] to-[#D22727] rounded-2xl rounded-br-md"
                    }`}
                  >
                    "{review}"
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Naver 블로그 CTA (구 디자인 그대로) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="mt-8 text-center"
        >
          <p className="text-[14px] text-[#666] mb-3">더 많은 후기가 궁금하시다면?</p>
          <a
            href="https://blog.naver.com/homewindow_ca2"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#D22727] text-[#D22727] text-[14px] md:text-[15px] font-bold rounded-full hover:bg-[#D22727] hover:text-white transition-all"
          >
            네이버 블로그에서 더 보기
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// 신 디자인 — featured 카드 그리드 (VITE_REVIEW_SECTION_LIVE=1)
// =============================================================================

function LiveReviewSection() {
  const [data, setData] = useState<FeaturedListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [simpleItems, setSimpleItems] = useState<FeaturedReviewItem[]>([]);

  useEffect(() => {
    fetchFeaturedReviews(12)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  // 간편 후기는 featured 와 별개로 최신 간편 후기를 자동 노출
  useEffect(() => {
    const url = new URL("/api/review/list", window.location.origin);
    url.searchParams.set("tier", "simple");
    url.searchParams.set("sort", "latest");
    fetch(url.toString())
      .then((r) => r.json())
      .then((d) => setSimpleItems((d.items || []).filter((i: FeaturedReviewItem) => i.tier === "simple")))
      .catch(() => setSimpleItems([]));
  }, []);

  const items = data?.items || [];
  const summary = data?.summary;
  const hasItems = items.length > 0;
  const premiumItems = items.filter((it) => it.tier === "premium");

  return (
    <section className="w-full bg-[#faf7f4] text-[#1c1614] py-16 md:py-24" id="review">
      <div className="max-w-screen-md mx-auto px-6 md:px-10">
        {/* 헤더 */}
        <div className="md:flex md:items-end md:justify-between md:gap-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-200px" }}
              transition={{ duration: 0.5 }}
              className="text-[#999] text-[16px] font-medium mb-3"
            >
              고객 후기
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-200px" }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-[28px] md:text-[36px] font-extrabold leading-[1.3] mb-5 break-keep"
            >
              수천 건의 시공이 입증한,
              <br />
              청암홈윈도우를 경험한 이야기
            </motion.h2>

            {summary && summary.count > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-200px" }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-4 flex items-center gap-2.5 text-[14px] md:text-[15px]"
              >
                <span className="inline-flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      width={16}
                      height={16}
                      strokeWidth={1.5}
                      className={
                        n <= Math.round(summary.avg)
                          ? "fill-[#c89545] text-[#c89545]"
                          : "text-[#ebe5e0]"
                      }
                    />
                  ))}
                </span>
                <span className="font-bold text-[#1c1614]">{summary.avg.toFixed(1)}</span>
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-200px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-3 text-[14px] md:text-[15px] font-medium text-[#6b6460] leading-[1.7] break-keep"
            >
              깐깐하게 고르고 만족하신 고객님들의 진짜 후기입니다.
            </motion.p>
          </div>

          <Link
            to="/review"
            className="hidden md:inline-flex items-center gap-1.5 mt-4 md:mt-0 text-[13.5px] font-bold text-[#1c1614] hover:text-[#952c2c] tracking-tight shrink-0"
          >
            전체 후기 보러가기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>


        {/* 후기 카드 그리드 */}
        {(loading || hasItems) && (
          <div className="mt-10 md:mt-14">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white border border-[#ebe5e0] overflow-hidden animate-pulse"
                  >
                    <div className="h-[200px] md:h-[240px] bg-[#f4ede4]" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-[#f4ede4] rounded w-1/2" />
                      <div className="h-3 bg-[#f4ede4] rounded w-3/4" />
                      <div className="h-3 bg-[#f4ede4] rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                {premiumItems.slice(0, 4).map((it, i) => (
                  <motion.div
                    key={it.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                  >
                    <PremiumReviewCard data={toPremiumCard(it)} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 최근 후기 — 2개씩 자동 롤링 캐러셀 */}
        {simpleItems.length > 0 && (
          <div className="mt-10 md:mt-12">
            <div className="mb-3">
              <strong className="text-[16px] font-extrabold text-[#1c1614]">
                최근 후기
              </strong>
            </div>
            <RecentReviewsCarousel
              items={simpleItems.slice(0, 8).map(toSimpleRow)}
            />
          </div>
        )}

        {/* 하단 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 md:mt-14 flex flex-col items-center gap-4"
        >
          <div className="flex flex-col md:flex-row items-center gap-3">
            <Link
              to="/review"
              className="group inline-flex items-center justify-center gap-2 h-[54px] px-9 rounded-xl border-2 border-[#1c1614] text-[#1c1614] hover:bg-[#1c1614] hover:text-[#faf7f4] font-extrabold text-[15px] md:text-[16px] tracking-tight transition"
            >
              전체 후기 보러가기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </Link>
            <a
              href="https://blog.naver.com/homewindow_ca2"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 h-[54px] px-7 rounded-xl bg-white border border-[#ebe5e0] text-[#3a3531] hover:border-[#c8b8a8] hover:text-[#1c1614] font-bold text-[14px] md:text-[15px] tracking-tight transition"
            >
              네이버 블로그에서 더 보기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </a>
          </div>
          <Link
            to="/review/new"
            className="inline-flex items-center gap-1 text-[12.5px] text-[#9a948f] hover:text-[#952c2c] transition"
          >
            <PenLine className="w-3.5 h-3.5" />
            시공받으셨다면 후기를 남겨주세요
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function toPremiumCard(it: FeaturedReviewItem): PremiumCardData {
  return {
    id: it.id,
    customerName: it.customerName,
    location: it.snapshot?.locationLabel || "",
    productLabel: it.snapshot?.productLabel,
    modelLabel:
      it.brand && it.model
        ? `${it.brand} · ${it.model}`
        : it.model || it.brand || undefined,
    rating: it.rating,
    photoCount: displayablePhotos(it.photos).length,
    videoCount: it.videoCount,
    publishedAt: formatRelative(it.publishedAt) || it.publishedAt,
    excerpt: it.reviewText,
    thumbnailUrl: firstDisplayableUrl(it.photos),
  };
}

function toSimpleRow(it: FeaturedReviewItem): SimpleRowData {
  return {
    id: it.id,
    customerName: it.customerName,
    location: it.snapshot?.locationLabel || "",
    publishedAt: formatRelative(it.publishedAt) || it.publishedAt,
    rating: it.rating,
    reviewText: it.reviewText,
    tags: keywordTags(it.tags),
    helpfulCount: it.helpfulCount,
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
