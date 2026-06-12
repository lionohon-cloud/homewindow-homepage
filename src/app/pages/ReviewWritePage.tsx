import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router";
import { ArrowLeft, Loader2, Crown, ChevronRight, Plus, Video, X } from "lucide-react";
import {
  REVIEW_SESSION_KEYS,
  REVIEW_PARTS_EXT,
  REVIEW_TAGS,
  type ReviewTier,
  type ReviewBrand,
  type ReviewModel,
} from "../styles/reviewTokens";
import { StarInput } from "../components/review/StarInput";
import { TagPicker } from "../components/review/TagPicker";
import { BrandModelSelect } from "../components/review/BrandModelSelect";
import { PhotoUploader, type ReviewPhoto } from "../components/review/PhotoUploader";
import { ConfirmModal } from "../components/review/ConfirmModal";
import { HoneypotField } from "@/lib/HoneypotField";
import { submitReview, type ReviewSnapshot } from "@/lib/reviewApi";
import { trackReview } from "@/lib/submitReview";

interface FormState {
  rating: number;
  parts: string[];
  brand: ReviewBrand | "";
  model: ReviewModel | "";
  reviewText: string;
  tags: string[];
  photos: ReviewPhoto[];
  // PC premium 폼의 제품정보 5개 (snapshot prefill 가능, 수정 가능)
  productName: string;
  glassType: string;
  installCount: string;
  size: string;
  installDate: string;
}

// ERP snapshot이 채운 필드의 잠금 여부
interface FieldLocks {
  brand: boolean;
  model: boolean;
  productName: boolean;
  glassType: boolean;
  installCount: boolean;
  size: boolean;
  installDate: boolean;
}

export function Component() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem(REVIEW_SESSION_KEYS.TOKEN);
  const tier = sessionStorage.getItem(REVIEW_SESSION_KEYS.TIER) as ReviewTier | null;
  const isPremium = tier === "premium";
  const snapshot = useMemo<ReviewSnapshot | null>(() => {
    try {
      const raw = sessionStorage.getItem(REVIEW_SESSION_KEYS.SNAPSHOT);
      return raw ? (JSON.parse(raw) as ReviewSnapshot) : null;
    } catch {
      return null;
    }
  }, []);

  // ERP 시공 데이터(snapshot)에서 온 값은 자동 선택 + 잠금 (사용자 변경 불가)
  const lockedBrand = mapSnapshotBrand(snapshot?.brand);
  const lockedModel = mapSnapshotModel(snapshot?.modelGrade);
  const locks: FieldLocks = {
    brand: !!lockedBrand,
    model: !!lockedModel,
    productName: !!snapshot?.productLabel,
    glassType: !!snapshot?.glassLabel,
    installCount: !!snapshot?.sizeLabel?.match(/외 (\d+)개소/),
    size: !!snapshot?.sizeLabel,
    installDate: !!snapshot?.installDate,
  };

  const [form, setForm] = useState<FormState>(() => ({
    rating: 0,
    parts: snapshot?.siteWorkSummary
      ? snapshot.siteWorkSummary.split(/[·\s,]+/).filter(Boolean).slice(0, 8)
      : [],
    brand: lockedBrand,
    model: lockedModel,
    reviewText: "",
    tags: [],
    photos: [],
    productName: snapshot?.productLabel || "",
    glassType: snapshot?.glassLabel || "",
    installCount: snapshot?.sizeLabel?.match(/외 (\d+)개소/)?.[1]
      ? `${parseInt(snapshot.sizeLabel.match(/외 (\d+)개소/)![1], 10) + 1}개소`
      : "",
    size: snapshot?.sizeLabel?.replace(/ 외 \d+개소/, "") || "",
    installDate: snapshot?.installDate || "",
  }));

  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const minLen = isPremium ? 200 : 0;
  const maxLen = isPremium ? 5000 : 50;

  const valid = useMemo(() => {
    if (!form.rating) return false;
    if (!form.brand || !form.model) return false;
    if (form.parts.length === 0) return false;
    if (isPremium) {
      if (form.reviewText.trim().length < 200) return false;
      if (form.photos.length < 3) return false;
    } else {
      if (form.reviewText.trim().length === 0) return false;
      if (form.reviewText.length > 50) return false;
    }
    return true;
  }, [form, isPremium]);

  useEffect(() => {
    return () => {
      form.photos.forEach((p) => URL.revokeObjectURL(p.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!token) return <Navigate to="/review/new" replace />;
  if (!tier) return <Navigate to="/review/type" replace />;

  const update = (patch: Partial<FormState>) => setForm((p) => ({ ...p, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setErrorMsg("");
    setSubmitting(true);
    try {
      await submitReview({
        token,
        tier,
        rating: form.rating,
        parts: form.parts,
        brand: form.brand as string,
        model: form.model as string,
        reviewText: form.reviewText.trim(),
        tags: isPremium ? undefined : form.tags,
        photos: isPremium
          ? form.photos.map((p) => ({ file: p.file, label: p.label }))
          : undefined,
      });
      trackReview("submit_review", { tier, rating: form.rating });
      sessionStorage.setItem(REVIEW_SESSION_KEYS.DONE, "1");
      setShowConfirm(true);
    } catch {
      setErrorMsg("저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeConfirm = () => {
    sessionStorage.removeItem(REVIEW_SESSION_KEYS.TOKEN);
    sessionStorage.removeItem(REVIEW_SESSION_KEYS.MASKED);
    sessionStorage.removeItem(REVIEW_SESSION_KEYS.SNAPSHOT);
    sessionStorage.removeItem(REVIEW_SESSION_KEYS.TIER);
    sessionStorage.removeItem(REVIEW_SESSION_KEYS.DONE);
    navigate("/", { replace: true });
  };

  const ratingLabel = ["", "아쉬워요", "그저 그래요", "괜찮아요", "좋아요", "최고예요"][form.rating] || "별점을 선택해주세요";

  return (
    <>
      {/* === 모바일 === */}
      <div className="md:hidden">
        <MobileForm
          isPremium={isPremium}
          form={form}
          locks={locks}
          update={update}
          ratingLabel={ratingLabel}
          minLen={minLen}
          maxLen={maxLen}
          valid={valid}
          submitting={submitting}
          errorMsg={errorMsg}
          onSubmit={handleSubmit}
        />
      </div>

      {/* === PC === */}
      <div className="hidden md:block">
        <DesktopForm
          isPremium={isPremium}
          form={form}
          locks={locks}
          update={update}
          ratingLabel={ratingLabel}
          minLen={minLen}
          maxLen={maxLen}
          valid={valid}
          submitting={submitting}
          errorMsg={errorMsg}
          onSubmit={handleSubmit}
          snapshot={snapshot}
        />
      </div>

      <ConfirmModal open={showConfirm} onClose={closeConfirm} />
    </>
  );
}

// =========================================================================
// 모바일 (기존 그대로 유지 — 시안 screens.jsx 모바일 모양)
// =========================================================================
function MobileForm({
  isPremium,
  form,
  locks,
  update,
  ratingLabel,
  minLen,
  maxLen,
  valid,
  submitting,
  errorMsg,
  onSubmit,
}: {
  isPremium: boolean;
  form: FormState;
  locks: FieldLocks;
  update: (p: Partial<FormState>) => void;
  ratingLabel: string;
  minLen: number;
  maxLen: number;
  valid: boolean;
  submitting: boolean;
  errorMsg: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <main
      className={
        isPremium
          ? "min-h-screen bg-gradient-to-br from-[#1a1210] to-[#2a1f1c] text-[#faf7f4]"
          : "min-h-screen bg-[#faf7f4] text-[#1c1614]"
      }
    >
      <header
        className={
          isPremium
            ? "sticky top-0 z-10 bg-[#1a1210]/85 backdrop-blur border-b border-white/10"
            : "sticky top-0 z-10 bg-white/85 backdrop-blur border-b border-[#ebe5e0]"
        }
      >
        <div className="max-w-screen-sm mx-auto px-5 h-14 flex items-center">
          <Link to="/review/type" aria-label="뒤로" className="-ml-2 p-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="ml-1 text-[15px] font-bold tracking-tight flex items-center gap-1.5">
            {isPremium && <Crown className="w-4 h-4 text-[#d4b277]" />}
            {isPremium ? "프리미엄 후기 작성" : "간편 후기 작성"}
          </h1>
        </div>
      </header>

      <form onSubmit={onSubmit} className="max-w-screen-sm mx-auto px-5 pt-8 pb-28 space-y-8">
        <HoneypotField />

        <section>
          <SectionLabel premium={isPremium}>전체 만족도</SectionLabel>
          <div className="mt-4 flex justify-center">
            <StarInput value={form.rating} onChange={(n) => update({ rating: n })} size={isPremium ? 40 : 36} />
          </div>
        </section>

        <section>
          <SectionLabel premium={isPremium}>시공 부위 (다중 선택)</SectionLabel>
          <div className="mt-3">
            <TagPicker options={REVIEW_PARTS_EXT} value={form.parts} onChange={(v) => update({ parts: v })} />
          </div>
        </section>

        <section>
          <SectionLabel premium={isPremium}>브랜드 · 모델</SectionLabel>
          <div className="mt-3">
            <BrandModelSelect
              brand={form.brand}
              model={form.model}
              onBrandChange={(b) => update({ brand: b })}
              onModelChange={(m) => update({ model: m })}
              brandLocked={locks.brand}
              modelLocked={locks.model}
            />
          </div>
        </section>

        <section>
          <SectionLabel premium={isPremium}>
            {isPremium ? "상세 후기 (200자 이상)" : "한 줄 후기 (50자 이내)"}
          </SectionLabel>
          <textarea
            value={form.reviewText}
            onChange={(e) => update({ reviewText: e.target.value.slice(0, maxLen) })}
            placeholder={
              isPremium
                ? "시공 전후 변화, 만족스러웠던 점, 시공 과정의 느낌을 자유롭게 적어주세요."
                : "시공받으신 솔직한 한 줄 후기를 남겨주세요."
            }
            rows={isPremium ? 8 : 3}
            className={
              isPremium
                ? "mt-3 w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-[14.5px] leading-[1.65] text-white placeholder-white/35 focus:outline-none focus:border-[#d4b277]/60 focus:ring-2 focus:ring-[#d4b277]/15"
                : "mt-3 w-full rounded-xl bg-white border border-[#ebe5e0] px-4 py-3 text-[14.5px] leading-[1.55] focus:outline-none focus:border-[#952c2c] focus:ring-2 focus:ring-[#952c2c]/15"
            }
          />
          <CharMeta length={form.reviewText.length} minLen={minLen} maxLen={maxLen} isPremium={isPremium} />
        </section>

        {!isPremium && (
          <section>
            <SectionLabel premium={false}>좋았던 부분 (선택)</SectionLabel>
            <div className="mt-3">
              <TagPicker options={REVIEW_TAGS} value={form.tags} onChange={(v) => update({ tags: v })} />
            </div>
          </section>
        )}

        {isPremium && (
          <section>
            <SectionLabel premium>사진 (최소 3장)</SectionLabel>
            <div className="mt-3 rounded-2xl bg-white/5 border border-white/10 p-4">
              <PhotoUploader photos={form.photos} onChange={(v) => update({ photos: v })} minRequired={3} />
            </div>
          </section>
        )}

        {errorMsg && (
          <div className="rounded-xl bg-[#fff5f5] border border-[#f3d0d0] p-3.5 text-[13px] text-[#7a1f1f]">
            {errorMsg}
          </div>
        )}

        <div
          className={
            "fixed bottom-0 inset-x-0 z-20 backdrop-blur border-t " +
            (isPremium ? "bg-[#1a1210]/95 border-white/10" : "bg-white/95 border-[#ebe5e0]")
          }
        >
          <div className="max-w-screen-sm mx-auto px-5 py-3">
            <button
              type="submit"
              disabled={!valid || submitting}
              className={
                "w-full h-[54px] rounded-2xl font-extrabold text-[15px] tracking-tight flex items-center justify-center gap-2 disabled:cursor-not-allowed transition " +
                (isPremium
                  ? "bg-gradient-to-br from-[#d4b277] to-[#b8945a] text-[#1a1210] disabled:opacity-40"
                  : "bg-[#952c2c] hover:bg-[#7e2424] text-white disabled:bg-[#cdb8b8]")
              }
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPremium ? (
                <>
                  <Crown className="w-4 h-4" /> 프리미엄 후기 등록하기
                </>
              ) : (
                "후기 등록하기"
              )}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}

// =========================================================================
// PC — 시안 PcPremiumForm / PcSimpleForm 1:1 (좌 폼 + 우 사이드)
// =========================================================================
function DesktopForm({
  isPremium,
  form,
  locks,
  update,
  ratingLabel,
  minLen,
  maxLen,
  valid,
  submitting,
  errorMsg,
  onSubmit,
  snapshot,
}: {
  isPremium: boolean;
  form: FormState;
  locks: FieldLocks;
  update: (p: Partial<FormState>) => void;
  ratingLabel: string;
  minLen: number;
  maxLen: number;
  valid: boolean;
  submitting: boolean;
  errorMsg: string;
  onSubmit: (e: React.FormEvent) => void;
  snapshot: ReviewSnapshot | null;
}) {
  return (
    <main className="min-h-screen bg-[#faf7f4] text-[#1c1614]">
      {/* page head (Breadcrumb + 타이틀 + step indicator) */}
      <header className="bg-white border-b border-[#ebe5e0]">
        <div className="max-w-screen-xl mx-auto px-12 pt-10 pb-7">
          <nav className="text-[12px] text-[#8a807c] flex items-center gap-1.5">
            <Link to="/" className="hover:text-[#3a3531]">홈</Link>
            <ChevronRight className="w-3 h-3 text-[#cfc6c2]" />
            <Link to="/review" className="hover:text-[#3a3531]">시공후기</Link>
            <ChevronRight className="w-3 h-3 text-[#cfc6c2]" />
            <span className="text-[#3a3531]">{isPremium ? "프리미엄 리뷰 작성" : "간편 리뷰 작성"}</span>
          </nav>
          <div className="mt-1 flex items-end justify-between">
            <h1 className="text-[28px] font-extrabold tracking-tight flex items-center gap-2.5">
              {isPremium && <Crown className="w-5 h-5 text-[#b8945a]" />}
              {isPremium ? "프리미엄 리뷰 작성" : "간편 리뷰 작성"}
            </h1>
            <div className="flex items-center gap-3.5 text-[13px] text-[#8a807c]">
              {isPremium ? (
                <>
                  <span>2 / 4 단계</span>
                  <div className="flex gap-1">
                    <span className="w-8 h-[3px] rounded-sm bg-[#b8945a]" />
                    <span className="w-8 h-[3px] rounded-sm bg-[#b8945a]" />
                    <span className="w-8 h-[3px] rounded-sm bg-[#ebe5e0]" />
                    <span className="w-8 h-[3px] rounded-sm bg-[#ebe5e0]" />
                  </div>
                </>
              ) : (
                <span>약 30초 소요</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-screen-xl mx-auto px-12 py-8">
        <form
          onSubmit={onSubmit}
          className={
            isPremium
              ? "grid gap-8 items-start grid-cols-[1fr_380px]"
              : "grid gap-8 items-start grid-cols-[1fr_380px]"
          }
        >
          {/* 좌: 메인 폼 (흰 카드) */}
          <div className="bg-white border border-[#ebe5e0] rounded-2xl p-8 grid gap-6">
            <HoneypotField />

            {/* 별점 */}
            <FormBlock label="별점" required>
              <div className="flex items-center gap-1">
                <DesktopStarInput value={form.rating} onChange={(n) => update({ rating: n })} />
                <span className="ml-3 text-[14px] font-semibold text-[#952c2c]">{ratingLabel}</span>
              </div>
            </FormBlock>

            {/* 시공 부위 */}
            <FormBlock label="시공 부위" required hint="중복 선택 가능">
              <div className="flex flex-wrap gap-2">
                {REVIEW_PARTS_EXT.map((p) => {
                  const on = form.parts.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        update({
                          parts: on ? form.parts.filter((x) => x !== p) : [...form.parts, p],
                        })
                      }
                      className={
                        "px-4 h-[38px] rounded-full text-[13px] tracking-tight transition border " +
                        (on
                          ? "bg-[#fbf0ef] border-[#952c2c] text-[#952c2c] font-semibold"
                          : "bg-white border-[#ebe5e0] text-[#4a423f] hover:border-[#c8b8a8] font-medium")
                      }
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </FormBlock>

            {/* 브랜드/모델 */}
            <FormBlock label="브랜드 · 모델" required>
              <BrandModelSelect
                brand={form.brand}
                model={form.model}
                onBrandChange={(b) => update({ brand: b })}
                onModelChange={(m) => update({ model: m })}
                brandLocked={locks.brand}
                modelLocked={locks.model}
              />
            </FormBlock>

            {/* 제품 정보 — 프리미엄만, snapshot prefill */}
            {isPremium && (
              <FormBlock label="제품 정보" required>
                <div className="grid gap-2.5">
                  <DesktopInput
                    placeholder="제품명 (예: LX Z:IN 슈퍼세이브2 PHC235)"
                    value={form.productName}
                    onChange={(v) => update({ productName: v })}
                    locked={locks.productName}
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <DesktopInput
                      placeholder="유리 종류"
                      value={form.glassType}
                      onChange={(v) => update({ glassType: v })}
                      locked={locks.glassType}
                    />
                    <DesktopInput
                      placeholder="시공 개소"
                      value={form.installCount}
                      onChange={(v) => update({ installCount: v })}
                      locked={locks.installCount}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <DesktopInput
                      placeholder="대표 사이즈 (mm)"
                      value={form.size}
                      onChange={(v) => update({ size: v })}
                      locked={locks.size}
                    />
                    <DesktopInput
                      placeholder="시공 일자"
                      value={form.installDate}
                      onChange={(v) => update({ installDate: v })}
                      locked={locks.installDate}
                    />
                  </div>
                </div>
              </FormBlock>
            )}

            {/* 사진 첨부 — 프리미엄만 */}
            {isPremium && (
              <FormBlock
                label="사진 첨부"
                required
                hint="최소 3장 · Before/After 권장"
              >
                <DesktopPhotoGrid photos={form.photos} onChange={(v) => update({ photos: v })} />
              </FormBlock>
            )}

            {/* 본문 */}
            <FormBlock
              label={isPremium ? "상세 후기" : "한 줄 후기"}
              required
              hint={isPremium ? "200자 이상" : "50자 이내"}
            >
              <textarea
                value={form.reviewText}
                onChange={(e) => update({ reviewText: e.target.value.slice(0, maxLen) })}
                placeholder={
                  isPremium
                    ? "시공 결정 이유, 진행 과정, 완성 후 만족도 등을 자유롭게 적어주세요"
                    : "시공 후 솔직한 한 줄 후기를 남겨주세요"
                }
                rows={isPremium ? 7 : 3}
                className="w-full px-4 py-3.5 rounded-[10px] bg-[#faf7f4] border border-[#ebe5e0] text-[14.5px] leading-[1.7] text-[#1c1614] focus:outline-none focus:border-[#952c2c] focus:bg-white tracking-tight resize-y"
                style={{ minHeight: isPremium ? 180 : 80 }}
              />
              <DesktopCharMeta
                length={form.reviewText.length}
                minLen={minLen}
                maxLen={maxLen}
                isPremium={isPremium}
              />
            </FormBlock>

            {/* 간편: 좋았던 부분 태그 */}
            {!isPremium && (
              <FormBlock label="좋았던 부분" hint="중복 선택 가능">
                <div className="flex flex-wrap gap-2">
                  {REVIEW_TAGS.map((t) => {
                    const on = form.tags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          update({
                            tags: on ? form.tags.filter((x) => x !== t) : [...form.tags, t],
                          })
                        }
                        className={
                          "px-4 h-[38px] rounded-full text-[13px] tracking-tight transition border " +
                          (on
                            ? "bg-[#fbf0ef] border-[#952c2c] text-[#952c2c] font-semibold"
                            : "bg-white border-[#ebe5e0] text-[#4a423f] hover:border-[#c8b8a8] font-medium")
                        }
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </FormBlock>
            )}

            {errorMsg && (
              <div className="rounded-xl bg-[#fff5f5] border border-[#f3d0d0] p-3.5 text-[13px] text-[#7a1f1f]">
                {errorMsg}
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-3 justify-between mt-2">
              <Link
                to="/review/type"
                className="inline-flex items-center justify-center h-12 px-7 rounded-[10px] bg-transparent border border-[#ebe5e0] text-[#4a423f] font-semibold text-[14px] tracking-tight hover:bg-[#faf7f4]"
              >
                {isPremium ? "이전 단계" : "취소"}
              </Link>
              <button
                type="submit"
                disabled={!valid || submitting}
                className={
                  "flex-1 inline-flex items-center justify-center gap-1.5 h-12 px-9 rounded-[10px] font-bold text-[14px] tracking-tight disabled:cursor-not-allowed transition " +
                  (isPremium
                    ? "bg-gradient-to-br from-[#1a1210] to-[#2a1f1c] text-[#d4b277] disabled:opacity-50"
                    : "bg-[#952c2c] hover:bg-[#7e2424] text-white disabled:bg-[#cdb8b8]")
                }
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPremium ? (
                  <>
                    <Crown className="w-3.5 h-3.5" />
                    다음 단계로 진행
                  </>
                ) : (
                  "후기 등록하기"
                )}
              </button>
            </div>
          </div>

          {/* 우: 사이드 (프리미엄만 — 미리보기 + 가이드 + 안내) */}
          {isPremium && (
            <aside className="bg-white border border-[#ebe5e0] rounded-2xl p-6 sticky top-6 self-start">
              <h4 className="text-[13px] font-bold tracking-tight mb-3.5">미리보기</h4>
              <div className="border border-dashed border-[#ebe5e0] rounded-[10px] p-3.5 bg-[#faf7f4] text-[12px] text-[#8a807c] leading-[1.65]">
                작성하시는 내용이 이렇게 노출됩니다.
                <br />
                <br />
                · 별점, 시공 부위 태그
                <br />
                · 대표 사진 (Before/After)
                <br />
                · 본문 첫 3줄 요약
                <br />
                · 제품명 · 시공일
              </div>

              <div className="mt-4 p-4 bg-[#fbf0ef] rounded-[10px] text-[12.5px] text-[#6e1f1f] leading-[1.65] tracking-tight">
                <b className="block text-[#952c2c] font-bold mb-1.5 text-[11px] uppercase tracking-wider">
                  좋은 후기 작성 가이드
                </b>
                · 시공 전 어떤 문제가 있었나요?
                <br />
                · 청암홈윈도우를 선택한 이유는?
                <br />
                · 시공 과정 중 인상적이었던 점은?
                <br />
                · 사용해보니 어떤 점이 달라졌나요?
              </div>

              <div className="mt-4 px-4 py-3.5 bg-[#faf7f4] rounded-[10px] text-[12px] text-[#8a807c] leading-[1.6]">
                작성하신 내용은 자동 저장되며, 임시저장 후 나중에 이어서 작성하실 수 있습니다.
              </div>

              {snapshot?.locationLabel && (
                <div className="mt-4 px-4 py-3.5 bg-white border border-[#ebe5e0] rounded-[10px] text-[12px] text-[#4a423f] leading-[1.6]">
                  <div className="text-[11px] font-bold text-[#952c2c] tracking-wider mb-1">
                    ERP 자동 매핑
                  </div>
                  {snapshot.locationLabel && <div>📍 {snapshot.locationLabel}</div>}
                  {snapshot.productLabel && <div>🪟 {snapshot.productLabel}</div>}
                  {snapshot.installDate && <div>📅 {snapshot.installDate}</div>}
                  {snapshot.warrantyLabel && <div>🛡 {snapshot.warrantyLabel}</div>}
                </div>
              )}
            </aside>
          )}
        </form>
      </section>
    </main>
  );
}

// =========================================================================
// 작은 컴포넌트들
// =========================================================================

function FormBlock({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-bold tracking-tight text-[#1c1614] mb-3">
        {label}
        {required && <span className="text-[#952c2c] ml-0.5">*</span>}
        {hint && <span className="ml-2 text-[11.5px] font-medium text-[#8a807c]">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function DesktopInput({
  placeholder,
  value,
  onChange,
  locked = false,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  /** ERP 시공 데이터로 채워진 값 — 수정 불가 */
  locked?: boolean;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={locked}
      className={
        "w-full h-[46px] px-3.5 rounded-lg bg-[#faf7f4] border border-[#ebe5e0] text-[14px] tracking-tight text-[#1c1614] focus:outline-none focus:border-[#952c2c] focus:bg-white" +
        (locked ? " text-[#6b6460] cursor-default" : "")
      }
    />
  );
}

// ERP snapshot 값 → 화면 선택지 매핑. 매핑 실패 시 "" (잠그지 않고 직접 선택)
function mapSnapshotBrand(raw?: string): ReviewBrand | "" {
  if (!raw) return "";
  const v = raw.toUpperCase();
  if (v.includes("LX") || v.includes("Z:IN") || raw.includes("지인")) return "LX";
  if (v.includes("KCC") || raw.includes("홈씨씨")) return "홈씨씨";
  if (raw.includes("홈윈도우") || v.includes("HOME")) return "홈윈도우";
  return "";
}

function mapSnapshotModel(raw?: string): ReviewModel | "" {
  if (!raw) return "";
  const v = raw.toUpperCase();
  if (raw.includes("프레스티지") || v.includes("PRESTIGE")) return "프레스티지";
  if (raw.includes("시그니처") || v.includes("SIGNATURE")) return "시그니처";
  if (raw.includes("에코") || v.includes("ECO") || v.includes("LITE") || raw.includes("라이트")) return "에코";
  return "";
}

function DesktopStarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const v = hover || value;
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const on = i <= v;
        return (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i)}
            className={"p-0 bg-transparent border-0 cursor-pointer " + (on ? "text-[#c89545]" : "text-[#cfc6c2]")}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2.5l3 6 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.9 3.1 1.1-6.5L2.5 9.4l6.5-.9z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

function DesktopCharMeta({
  length,
  minLen,
  maxLen,
  isPremium,
}: {
  length: number;
  minLen: number;
  maxLen: number;
  isPremium: boolean;
}) {
  const ok = isPremium ? length >= minLen : length <= maxLen && length > 0;
  const remain = isPremium ? Math.max(0, minLen - length) : maxLen - length;
  return (
    <div className="mt-1.5 flex items-center justify-between text-[11.5px] text-[#8a807c] font-mono">
      <span>
        {isPremium
          ? length < minLen
            ? `아직 ${remain}자 더 필요해요`
            : "✓ 충분한 길이입니다"
          : `${length} / ${maxLen}자`}
      </span>
      <span>
        <b className={ok ? "text-[#5a7a4f] font-bold" : "text-[#952c2c] font-bold"}>{length}</b>
        {isPremium ? ` / 최소 ${minLen}자` : ` / ${maxLen}자`}
      </span>
    </div>
  );
}

function CharMeta({
  length,
  minLen,
  maxLen,
  isPremium,
}: {
  length: number;
  minLen: number;
  maxLen: number;
  isPremium: boolean;
}) {
  return (
    <div
      className={
        "mt-1.5 flex items-center justify-between text-[12px] " +
        (isPremium ? "text-white/55" : "text-[#6b6460]")
      }
    >
      <span>
        {length} {isPremium ? `/ 최소 ${minLen}` : `/ ${maxLen}`}
        {isPremium && length < minLen && (
          <span className="text-[#d4b277] font-semibold ml-2">({minLen - length}자 더 필요)</span>
        )}
      </span>
    </div>
  );
}

function SectionLabel({ children, premium }: { children: React.ReactNode; premium: boolean }) {
  return (
    <h3
      className={
        "text-[14px] font-bold tracking-tight " +
        (premium ? "text-[#d4b277]" : "text-[#1c1614]")
      }
    >
      {children}
    </h3>
  );
}

// PC 사진 grid — 6-col + 사진 슬롯 + Before/After 라벨 + 대표 뱃지 + 영상 추가
function DesktopPhotoGrid({
  photos,
  onChange,
}: {
  photos: ReviewPhoto[];
  onChange: (p: ReviewPhoto[]) => void;
}) {
  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const remain = 10 - photos.length;
    const next: ReviewPhoto[] = [];
    Array.from(files)
      .slice(0, remain)
      .forEach((f) => {
        if (!f.type.startsWith("image/")) return;
        next.push({ file: f, preview: URL.createObjectURL(f), label: "other" });
      });
    onChange([...photos, ...next]);
  };

  const removeAt = (i: number) => {
    const removed = photos[i];
    if (removed?.preview) URL.revokeObjectURL(removed.preview);
    onChange(photos.filter((_, idx) => idx !== i));
  };

  const setLabel = (i: number, label: ReviewPhoto["label"]) => {
    onChange(photos.map((p, idx) => (idx === i ? { ...p, label } : p)));
  };

  return (
    <>
      <div className="grid grid-cols-6 gap-2">
        {photos.map((p, i) => (
          <div
            key={i}
            className="aspect-square rounded-[10px] relative overflow-hidden bg-[#f4ede4]"
          >
            <img src={p.preview} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 text-white text-[11px] flex items-center justify-center"
              aria-label="삭제"
            >
              <X className="w-2.5 h-2.5" />
            </button>
            {/* Before / After / 기타 라벨 */}
            <div className="absolute bottom-1.5 left-1.5 flex gap-1">
              {(["before", "after", "other"] as const).map((lb) => (
                <button
                  key={lb}
                  type="button"
                  onClick={() => setLabel(i, lb)}
                  className={
                    "px-1.5 py-0.5 rounded text-[9.5px] font-bold tracking-wider font-mono " +
                    (p.label === lb
                      ? "bg-[#952c2c] text-white"
                      : "bg-black/55 text-white/80 hover:bg-black/70")
                  }
                >
                  {lb === "before" ? "BEFORE" : lb === "after" ? "AFTER" : "기타"}
                </button>
              ))}
            </div>
            {/* 첫 사진엔 "대표" 골드 뱃지 */}
            {i === 0 && (
              <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#b8945a] text-[#1a1210] text-[9.5px] font-bold">
                대표
              </div>
            )}
          </div>
        ))}

        {photos.length < 10 && (
          <label className="aspect-square rounded-[10px] border-[1.5px] border-dashed border-[#cfc6c2] bg-[#faf7f4] flex flex-col items-center justify-center gap-1 text-[#8a807c] text-[11.5px] cursor-pointer hover:bg-[#f4ede4] hover:border-[#b8945a]">
            <Plus className="w-[22px] h-[22px]" strokeWidth={1.5} />
            <span>
              {photos.length} / 10
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => addPhotos(e.target.files)}
            />
          </label>
        )}

        {/* 영상 추가 슬롯 */}
        <button
          type="button"
          disabled
          className="aspect-square rounded-[10px] border-[1.5px] border-dashed border-[#cfc6c2] bg-[#faf7f4] flex flex-col items-center justify-center gap-1 text-[#8a807c] text-[11.5px] cursor-not-allowed opacity-60"
          title="동영상 업로드는 다음 단계에서 지원됩니다"
        >
          <Video className="w-[22px] h-[22px]" strokeWidth={1.5} />
          <span>영상 추가</span>
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11.5px] text-[#8a807c]">
        <span>
          {photos.length} / 10장
          {photos.length < 3 && (
            <span className="text-[#952c2c] font-semibold ml-2">(최소 3장 필요)</span>
          )}
        </span>
        <span>BEFORE/AFTER 라벨을 지정해 주세요</span>
      </div>
    </>
  );
}
