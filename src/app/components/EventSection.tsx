import { motion } from "motion/react";
import { Link } from "react-router";
import poolBg from "../../assets/event/pool-bg.png";
import titleImg from "../../assets/event/title.png";
import bubbleImg from "../../assets/event/bubble.png";
import couponImg from "../../assets/event/coupon.png";

type Coupon = {
  title: string;
  desc: string;
  pct: string;
  prefix?: string; // "최대"
  to?: string; // 있으면 클릭 시 이동 (리뷰 작성 쿠폰)
};

const COUPONS: Coupon[] = [
  { title: "선금보증보험 할인", desc: "견적 상담 시 적용", pct: "10" },
  { title: "기간 내 선착순 할인", desc: "7월 전용 프로모션", pct: "10" },
  { title: "리뷰 작성 약속", desc: "간단하게 리뷰만 남기면 끝!", prefix: "최대", pct: "20", to: "/review/type" },
];

// 버블 — 배경 위 물 공간에 보글보글 떠다님 (left/top %, 크기 %, 투명도, 애니메이션 진폭/주기/지연)
const BUBBLES = [
  { left: "5%", top: "50%", size: "2.2%", op: 0.9, rise: 14, dur: 4.5, delay: 0 },
  { left: "11%", top: "72%", size: "1%", op: 0.65, rise: 10, dur: 6.3, delay: 1.3 },
  { left: "16%", top: "28%", size: "1.4%", op: 0.8, rise: 10, dur: 5.5, delay: 0.8 },
  { left: "23%", top: "55%", size: "0.9%", op: 0.6, rise: 9, dur: 6.8, delay: 2.4 },
  { left: "30%", top: "70%", size: "1.3%", op: 0.75, rise: 12, dur: 6, delay: 1.6 },
  { left: "37%", top: "32%", size: "1%", op: 0.65, rise: 11, dur: 5.7, delay: 0.5 },
  { left: "44%", top: "16%", size: "1.6%", op: 0.85, rise: 16, dur: 5, delay: 0.4 },
  { left: "50%", top: "62%", size: "1.1%", op: 0.7, rise: 12, dur: 6.4, delay: 1.8 },
  { left: "57%", top: "38%", size: "0.9%", op: 0.6, rise: 9, dur: 7, delay: 2.7 },
  { left: "63%", top: "58%", size: "1.4%", op: 0.78, rise: 13, dur: 5.4, delay: 1 },
  { left: "70%", top: "22%", size: "2%", op: 0.9, rise: 15, dur: 4.8, delay: 1.1 },
  { left: "76%", top: "66%", size: "1%", op: 0.65, rise: 10, dur: 6.6, delay: 2 },
  { left: "83%", top: "44%", size: "1.3%", op: 0.8, rise: 13, dur: 5.8, delay: 0.6 },
  { left: "88%", top: "70%", size: "0.9%", op: 0.6, rise: 8, dur: 7.2, delay: 1.5 },
  { left: "91%", top: "28%", size: "1.1%", op: 0.72, rise: 9, dur: 6.2, delay: 1.9 },
  { left: "95%", top: "54%", size: "1.5%", op: 0.82, rise: 14, dur: 5.2, delay: 0.9 },
  // 40% 노란 숫자 위에 겹쳐 떠다니는 버블 (선명하게)
  { left: "54%", top: "14%", size: "1.6%", op: 0.95, rise: 12, dur: 5.6, delay: 0.3 },
  { left: "61%", top: "26%", size: "1.2%", op: 0.9, rise: 10, dur: 6.4, delay: 1.4 },
  { left: "58%", top: "20%", size: "1%", op: 0.92, rise: 14, dur: 5.2, delay: 2.1 },
  { left: "64%", top: "16%", size: "0.9%", op: 0.88, rise: 9, dur: 6.8, delay: 0.9 },
  { left: "56%", top: "30%", size: "1.3%", op: 0.9, rise: 11, dur: 7, delay: 1.7 },
];

/** 흰색 티켓(쿠폰) — coupon.png 배경 + 텍스트. 폰트는 카드 폭(cqw) 비례 */
function CouponCard({ coupon }: { coupon: Coupon }) {
  return (
    <div
      className="@container relative bg-no-repeat bg-contain bg-center aspect-[194/286] flex flex-col items-center justify-center text-center"
      style={{ backgroundImage: `url(${couponImg})` }}
    >
      <div className="font-bold text-[#99cff7] tracking-[0.16em]" style={{ fontSize: "6cqw" }}>
        SUPER SALE
      </div>
      <div
        className="font-extrabold text-[#4f98f8] tracking-tight break-keep leading-tight px-1"
        style={{ fontSize: "9.5cqw", marginTop: "5cqw" }}
      >
        {coupon.title}
      </div>
      <div
        className="text-[#707070] leading-[1.3] break-keep"
        style={{ fontSize: "6.5cqw", marginTop: "2.5cqw" }}
      >
        {coupon.desc}
      </div>
      <div className="flex items-baseline justify-center text-[#4f98f8]" style={{ marginTop: "11cqw" }}>
        {coupon.prefix && (
          <span className="font-extrabold self-center" style={{ fontSize: "6.5cqw", marginRight: "2cqw" }}>
            {coupon.prefix}
          </span>
        )}
        <span
          className="font-black leading-none tracking-tight inline-block"
          style={{ fontSize: "38cqw", transform: "scaleY(1.25)", transformOrigin: "bottom" }}
        >
          {coupon.pct}
        </span>
        <span className="font-black leading-none" style={{ fontSize: "18cqw", marginLeft: "1cqw" }}>
          %
        </span>
      </div>
    </div>
  );
}

/**
 * @param variant "mobile" = px 고정 크기(기존 동작 유지),
 *                "desktop" = 배너 컨테이너 폭(cqw) 비례 → 배너 전체와 함께 확대·축소.
 */
function CtaButton({ variant }: { variant: "mobile" | "desktop" }) {
  const isDesktop = variant === "desktop";
  // 데스크탑: 1920 까지 vw 로 스케일, 그 이상은 px 상한(min) → 다른 요소처럼 1920 에서 멈춤
  const dStyle = isDesktop
    ? {
        height: "min(3.4vw, 65px)",
        paddingLeft: "min(2.6vw, 50px)",
        paddingRight: "min(2.6vw, 50px)",
        fontSize: "min(1.25vw, 24px)",
        borderRadius: "9999px",
      }
    : undefined;
  return (
    <Link
      to="/review/type"
      style={dStyle}
      className={[
        "group inline-flex items-center justify-center rounded-full bg-gradient-to-b from-[#4a97df] to-[#2f86d8] text-white font-extrabold tracking-tight ring-2 ring-white/90 ring-offset-2 ring-offset-transparent shadow-[0_0_10px_1px_rgba(200,230,255,0.75),0_8px_22px_rgba(45,131,214,0.45)] hover:shadow-[0_0_16px_3px_rgba(200,230,255,0.9),0_8px_22px_rgba(45,131,214,0.5)] hover:from-[#3f8cd6] hover:to-[#2a7ace] active:scale-[0.98] transition",
        isDesktop ? "" : "h-[50px] px-8 text-[18px]",
      ].join(" ")}
    >
      프리미엄 리뷰 작성 하기
      <span
        style={isDesktop ? { fontSize: "min(1.25vw, 24px)", marginLeft: "min(0.9vw, 17px)" } : undefined}
        className={[
          "-translate-y-[2px] font-extrabold leading-none group-hover:translate-x-0.5 transition",
          isDesktop ? "" : "ml-1 text-[19px]",
        ].join(" ")}
      >
        &gt;
      </span>
    </Link>
  );
}

/** 버블 — 위아래로 둥실둥실 떠다니며 입체감(scale·opacity 미세 변화) */
function Bubbles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {BUBBLES.map((b, i) => (
        <motion.img
          key={i}
          src={bubbleImg}
          alt=""
          aria-hidden="true"
          className="absolute"
          style={{ left: b.left, top: b.top, width: b.size }}
          loading="lazy"
          decoding="async"
          animate={{
            y: [0, -b.rise, 0],
            scale: [1, 1.12, 1],
            opacity: [b.op * 0.6, b.op, b.op * 0.6],
          }}
          transition={{
            duration: b.dur,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function EventSection() {
  return (
    <section className="w-full bg-[#3aaef0] overflow-hidden" id="event">
      {/* =============== 데스크탑/QHD: 수영장 배너 ===============
          1920 = 디자인 기준. 높이는 1920 기준으로 고정(<1920 은 vw 로 축소).
          화면이 1920 보다 커지면 높이는 그대로, 배경(2716px 원본)의 잘려있던 양옆이
          드러나며 옆으로만 확장된다. 콘텐츠(타이틀/쿠폰/버튼)는 1920 크기에서 멈춤. */}
      <div className="hidden md:block relative w-full h-[clamp(420px,48vw,922px)] overflow-hidden">
        {/* 배경 (순수 풀) — 컨테이너 채움 */}
        <img
          src={poolBg}
          alt="한여름 냉방비 절감 SUPER SALE 최대 40% 할인 이벤트"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
          decoding="async"
        />

        {/* 타이틀 (1920 까지 vw 로 스케일, 그 이상은 max 로 고정) */}
        <img
          src={titleImg}
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 top-[7%] w-[36vw] max-w-[690px] h-auto"
          loading="lazy"
          decoding="async"
        />

        {/* 버블 — 타이틀 뒤에 두어 글씨(40%) '위'에 떠 보이게 */}
        <Bubbles />

        {/* 쿠폰 + 버튼 오버레이
            top 기준 고정 → 타이틀↔쿠폰 간격이 컨테이너 높이 대비 항상 같은 비율 유지.
            (bottom 기준이면 고정 px 버튼이 작은 화면에서 쿠폰을 위로 밀어 타이틀과 겹침) */}
        <div className="absolute inset-x-0 top-[43%] flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="flex justify-center items-start gap-[1.5vw] w-full"
          >
            {COUPONS.map((c) =>
              c.to ? (
                <Link
                  key={c.title}
                  to={c.to}
                  className="w-[10.5vw] max-w-[202px] block transition hover:-translate-y-1 hover:drop-shadow-[0_10px_20px_rgba(13,71,120,0.3)]"
                >
                  <CouponCard coupon={c} />
                </Link>
              ) : (
                <div key={c.title} className="w-[10.5vw] max-w-[202px]">
                  <CouponCard coupon={c} />
                </div>
              )
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-[2.5%]"
          >
            <CtaButton variant="desktop" />
          </motion.div>
        </div>
      </div>

      {/* =============== 모바일: 수영장 배경 위에 타이틀 + 쿠폰 세로 스택 (전체 배경 채움) =============== */}
      <div
        className="md:hidden relative bg-[#00bdf6] bg-no-repeat bg-top bg-cover"
        style={{ backgroundImage: `url(${poolBg})` }}
      >
        {/* 상단 배너 (타이틀 + 버블) — 배경은 부모에서 깔림 */}
        <div className="@container relative w-full aspect-[16/10] overflow-hidden">
          <Bubbles />
          <img
            src={titleImg}
            alt="한여름 냉방비 절감 SUPER SALE 최대 40% 할인 이벤트"
            className="absolute left-1/2 -translate-x-1/2 top-[12%] w-[80%] h-auto"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* 쿠폰 세로 스택 (배경 이미지 위) */}
        <div className="px-5 -mt-16 pb-10 relative z-10">
          <div className="flex flex-col gap-3">
            {COUPONS.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <CouponRowMobile coupon={c} />
              </motion.div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <CtaButton variant="mobile" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** 모바일 쿠폰 — 흰 가로 행 카드 (좌: 텍스트, 우: 퍼센트), 양옆 노치. to 있으면 클릭 이동 */
function CouponRowMobile({ coupon }: { coupon: Coupon }) {
  const cls =
    "relative flex items-center justify-between gap-3 rounded-2xl bg-white shadow-[0_8px_22px_rgba(13,71,120,0.22)] px-5 py-4" +
    (coupon.to ? " active:scale-[0.99] transition" : "");
  const inner = (
    <>
      <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-[#3aaef0]" />
      <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-[#3aaef0]" />
      <div className="min-w-0">
        <div className="text-[9.5px] tracking-[0.16em] font-bold text-[#99cff7]">SUPER SALE</div>
        <div className="mt-0.5 text-[15px] font-extrabold text-[#4f98f8] tracking-tight break-keep">
          {coupon.title}
        </div>
        <div className="text-[12px] text-[#707070] leading-[1.4] mt-0.5 break-keep">{coupon.desc}</div>
      </div>
      <div className="flex items-baseline gap-0.5 text-[#4f98f8] shrink-0">
        {coupon.prefix && (
          <span className="text-[12px] font-bold mr-0.5 self-center">{coupon.prefix}</span>
        )}
        <span className="text-[34px] font-black leading-none tracking-tight">{coupon.pct}</span>
        <span className="text-[17px] font-black leading-none">%</span>
      </div>
    </>
  );
  return coupon.to ? (
    <Link to={coupon.to} className={cls + " block"}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
