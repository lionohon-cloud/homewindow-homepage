import { motion } from "motion/react";
import { Link } from "react-router";
import pcBg from "../../assets/event/pc-bg.png";
import moBg from "../../assets/event/mo-bg.png";
import titleImg from "../../assets/event/event-title.png";
import btnImg from "../../assets/event/event-btn.png";

type Coupon = {
  title: string;
  desc: string;
  pct: string;
  prefix?: string; // "최대"
};

const COUPONS: Coupon[] = [
  { title: "선금보증보험 할인", desc: "견적 상담시 적용", pct: "10" },
  { title: "기간 내 선착순 할인", desc: "7월 전용 프로모션", pct: "10" },
  { title: "리뷰 작성 약속", desc: "간단하게 리뷰만 남기면 끝!", prefix: "최대", pct: "20" },
];

/**
 * 흰색 가로 쿠폰 카드 (다크 배너 위).
 * @container 로 내부 폰트를 카드 폭(cqw) 비례 → 데스크탑(3열)·모바일(세로 스택) 모두 자동 스케일.
 * 왼쪽: SUPER SALE / 제목 / 설명, 오른쪽: (최대) 숫자 %.
 */
function CouponCard({ coupon }: { coupon: Coupon }) {
  return (
    // @container 는 래퍼에만 → 안쪽 카드의 padding·radius·폰트(cqw)가 모두 이 래퍼 폭 기준으로 계산됨.
    // (카드 자신에 @container + cqw 를 함께 주면 cqw 가 카드가 아닌 상위(뷰포트) 기준으로 잡혀 깨진다.)
    <div className="@container w-full">
    <div className="rounded-[5cqw] bg-white ring-1 ring-[#cfe0f7] shadow-[0_8px_20px_rgba(0,40,90,0.20)] flex items-center justify-between gap-[2cqw] px-[5.5cqw] py-[4.5cqw]">
      <div className="min-w-0 flex-1 overflow-hidden pr-[1cqw]">
        <div
          className="font-bold text-[#7fb4ef] leading-none"
          style={{ fontSize: "3.2cqw", letterSpacing: "0.1em" }}
        >
          SUPER SALE
        </div>
        <div
          className="font-extrabold text-[#006BD7] tracking-tight whitespace-nowrap leading-tight"
          style={{ fontSize: "7cqw", marginTop: "2cqw" }}
        >
          {coupon.title}
        </div>
        <div
          className="text-[#7C7C7C] whitespace-nowrap leading-none"
          style={{ fontSize: "3.6cqw", marginTop: "2cqw" }}
        >
          {coupon.desc}
        </div>
      </div>
      <div className="flex items-baseline text-[#006BD7] shrink-0">
        {coupon.prefix && (
          <span className="font-extrabold self-center" style={{ fontSize: "4.5cqw", marginRight: "0.5cqw" }}>
            {coupon.prefix}
          </span>
        )}
        <span className="font-black leading-none tracking-tight" style={{ fontSize: "21cqw" }}>
          {coupon.pct}
        </span>
        <span className="font-black leading-none" style={{ fontSize: "8cqw", marginLeft: "0.5cqw" }}>
          %
        </span>
      </div>
    </div>
    </div>
  );
}

/** CTA — 버튼 이미지 전체가 /review/type 로 가는 링크 (버튼 영역만 클릭 가능) */
function CtaButton({ className }: { className?: string }) {
  return (
    <Link
      to="/review/type"
      aria-label="프리미엄 리뷰 작성 하기"
      className={["inline-block transition active:scale-[0.98] hover:-translate-y-0.5", className].join(" ")}
    >
      <img src={btnImg} alt="프리미엄 리뷰 작성 하기" className="w-full h-auto" loading="lazy" decoding="async" />
    </Link>
  );
}

export function EventSection() {
  return (
    <section className="w-full bg-[#04060a] overflow-hidden" id="event">
      {/* =============== 데스크탑/태블릿: 가로 배너 (2716×908) ===============
          배경은 텍스트가 없는 순수 다크 이미지. 타이틀·쿠폰·버튼은 코드로 얹어
          배너 폭에 비례(%)해 함께 확대·축소. 2716px 에서 멈추고 그 이상은 양옆 레터박스. */}
      <div className="hidden md:block w-full bg-[#04060a]">
        <div className="relative mx-auto w-full max-w-[2716px] aspect-[2716/908] overflow-hidden">
          {/* 순수 다크 배경 */}
          <img
            src={pcBg}
            alt="한여름 냉방비 절감 SUPER SALE 최대 40% 할인 이벤트"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />

          {/* 타이틀 로고 */}
          <motion.img
            src={titleImg}
            alt=""
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2 h-auto"
            style={{ top: "11.2%", width: "27%" }}
            initial={{ opacity: 0, y: -16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            loading="lazy"
            decoding="async"
          />

          {/* 쿠폰 3열 */}
          <motion.div
            className="absolute inset-x-0 flex justify-center items-stretch"
            style={{ top: "53%", gap: "1.58%" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {COUPONS.map((c) => (
              <div key={c.title} className="w-[14.58%]">
                <CouponCard coupon={c} />
              </div>
            ))}
          </motion.div>

          {/* 버튼 */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ top: "81.4%", width: "18.7%" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CtaButton />
          </motion.div>
        </div>
      </div>

      {/* =============== 모바일: 세로 배경 위 타이틀 + 쿠폰 세로 스택 + 버튼 =============== */}
      <div
        className="md:hidden relative bg-[#04060a] bg-no-repeat bg-top bg-cover"
        style={{ backgroundImage: `url(${moBg})` }}
      >
        <div className="px-5 pt-10 pb-10">
          <motion.img
            src={titleImg}
            alt="한여름 냉방비 절감 SUPER SALE 최대 40% 할인 이벤트"
            className="mx-auto w-[76%] h-auto"
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45 }}
            loading="lazy"
            decoding="async"
          />

          <div className="mt-7 flex flex-col gap-3">
            {COUPONS.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <CouponCard coupon={c} />
              </motion.div>
            ))}
          </div>

          <div className="mt-7 flex justify-center">
            <CtaButton className="w-[70%] max-w-[300px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
