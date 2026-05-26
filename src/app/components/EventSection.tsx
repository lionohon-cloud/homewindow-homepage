import { motion } from "motion/react";
import { Link } from "react-router";
import { Crown } from "lucide-react";

type DiscountRow = {
  num: string;
  title: string;
  desc: string;
  pct: string;
  isNew?: boolean;
  featured?: boolean;
  to?: string;
};

const ROWS: DiscountRow[] = [
  {
    num: "01",
    title: "홈페이지 상담 신청",
    desc: "현재 페이지에서 무료 견적 신청 시 자동 적용",
    pct: "10",
  },
  {
    num: "02",
    title: "간편 리뷰 약속",
    desc: "시공 후 후기 작성을 약속하시면 자동 적용",
    pct: "10",
    isNew: true,
    featured: true,
    to: "/review/new",
  },
  {
    num: "03",
    title: "선금보증보험 할인",
    desc: "견적 상담 시 할인 적용",
    pct: "20",
  },
];

function DiscountCard({ row }: { row: DiscountRow; index: number }) {
  const inner = (
    <div
      className={[
        "relative grid items-center gap-4 md:gap-5 rounded-2xl p-4 md:p-5 shadow-lg",
        "grid-cols-[44px_1fr_auto] md:grid-cols-[56px_1fr_auto]",
        row.featured
          ? "bg-gradient-to-br from-[#fff7e6] to-white ring-2 ring-[#ffd84d]"
          : "bg-white/95",
        row.to ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-xl transition" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-full bg-[#952c2c] text-white font-extrabold text-[15px] md:text-[17px] tracking-tight">
        {row.num}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#1c1614] font-extrabold text-[15px] md:text-[17px] tracking-tight break-keep">
            {row.title}
          </span>
          {row.isNew && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-[#d22727] text-white">
              NEW
            </span>
          )}
        </div>
        <p className="text-[#6b6460] text-[12.5px] md:text-[13.5px] leading-[1.45] mt-0.5 break-keep">
          {row.desc}
        </p>
      </div>
      <div className="flex items-baseline text-[#d22727] font-extrabold tracking-tight">
        <span className="text-[16px] md:text-[18px] leading-none">+</span>
        <span className="text-[28px] md:text-[34px] leading-none">{row.pct}</span>
        <span className="text-[16px] md:text-[18px] leading-none">%</span>
      </div>
    </div>
  );
  return row.to ? <Link to={row.to}>{inner}</Link> : inner;
}

export function EventSection() {
  return (
    <section className="w-full bg-[radial-gradient(120%_80%_at_50%_0%,_#d23030_0%,_#b01818_60%,_#8a1010_100%)] py-16 md:py-24 relative overflow-hidden isolate">
      {/* 배경 데코 원 3개 (opacity-5) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
        <div className="absolute bottom-20 right-16 w-24 h-24 border-4 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border-4 border-white rounded-full" />
      </div>

      <div className="max-w-screen-md mx-auto px-6 md:px-10 relative z-10">
        {/* 키워드 배지 */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/15 px-4 md:px-5 py-2 rounded-full border border-white/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffd84d]" />
            <span className="text-white text-[12px] md:text-[13px] font-semibold tracking-[0.04em]">
              릴레이 고객 감사 EVENT
            </span>
          </div>
        </div>

        {/* 메인 타이틀 */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-white text-center text-[28px] md:text-[44px] font-extrabold leading-[1.2] tracking-tight break-keep"
        >
          최대{" "}
          <span className="text-[#ffd84d] font-black text-[42px] md:text-[64px] tracking-tight">
            40%
          </span>{" "}
          릴레이 할인,
          <br />
          지금 신청하면 더 드립니다
        </motion.h2>

        {/* 서브 카피 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-5 md:mt-6 text-white/85 text-[13.5px] md:text-[16px] text-center leading-[1.7] break-keep"
        >
          혜택을 모두 더해 최대 40% 할인을 받아보세요.
          <br className="md:hidden" />
          <span className="hidden md:inline"> </span>
          선착순 한정 프로모션으로 조기 마감될 수 있습니다.
        </motion.p>

        {/* 할인 스택 3행 */}
        <div className="mt-10 md:mt-12 grid gap-3">
          {ROWS.map((row, i) => (
            <DiscountCard key={row.num} row={row} index={i} />
          ))}
        </div>

        {/* 누적 할인 바 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.5 }}
          className="mt-5 flex items-center justify-between rounded-2xl px-5 md:px-7 py-5 md:py-6 bg-white/10 border border-white/20"
        >
          <div className="min-w-0 pr-3">
            <div className="text-[11px] md:text-[12px] tracking-[0.18em] text-[#ffd84d] font-bold">
              총 누적 할인
            </div>
            <div className="text-white text-[14px] md:text-[16px] font-semibold mt-1 break-keep">
              모든 창호 할인 혜택을 합치면 최대
            </div>
          </div>
          <div className="flex items-baseline text-[#ffd84d] font-black tracking-tight shrink-0">
            <span className="text-[44px] md:text-[64px] leading-none">40</span>
            <span className="text-[20px] md:text-[28px] leading-none">%</span>
          </div>
        </motion.div>

        {/* 프리미엄 보너스 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.6 }}
          className="mt-8 md:mt-10 rounded-3xl bg-gradient-to-br from-[#1a1210] to-[#2a1f1c] border border-[#b8945a]/35 p-6 md:p-9 relative overflow-hidden"
        >
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#b8945a]/15 border border-[#b8945a]/40 text-[#d4b277] text-[10.5px] md:text-[11px] font-bold tracking-[0.18em]">
              <Crown className="w-3 h-3" />
              PREMIUM EXCLUSIVE
            </span>

            <h3 className="mt-4 text-[#faf7f4] text-[20px] md:text-[26px] font-extrabold leading-[1.35] tracking-tight break-keep">
              프리미엄 후기 작성 고객께는
              <br />
              <em className="not-italic text-[#d4b277]">두 가지 혜택 중 선택</em>해서 드립니다
            </h3>
            <p className="mt-2.5 text-white/55 text-[13px] md:text-[14.5px] leading-[1.6] break-keep">
              사진 3장 이상 + 200자 본문 시공 후기를 남겨주시면 아래 혜택 중 하나를 선택하실 수
              있어요.
            </p>

            {/* 옵션 그리드 */}
            <div className="mt-6 md:mt-7 grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-5 items-stretch">
              {/* OPTION A */}
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 md:p-6 flex md:flex-col items-center md:items-start justify-between gap-3">
                <div>
                  <div className="text-[10.5px] tracking-[0.2em] text-[#d4b277] font-bold">
                    OPTION A
                  </div>
                  <div className="text-white/65 text-[12.5px] md:text-[13px] leading-[1.5] mt-1.5 break-keep">
                    추가 할인 — 견적가에서 즉시 차감
                  </div>
                </div>
                <div className="flex items-baseline text-[#d4b277] font-black tracking-tight shrink-0">
                  <span className="text-[16px] md:text-[20px]">+</span>
                  <span className="text-[40px] md:text-[52px] leading-none">5</span>
                  <span className="text-[18px] md:text-[22px] leading-none">%</span>
                </div>
              </div>

              {/* OR 디바이더 */}
              <div className="flex md:flex-col items-center justify-center gap-3 text-white/30">
                <div className="hidden md:block w-px h-8 bg-white/15" />
                <div className="md:block flex-1 md:flex-none h-px md:h-8 md:w-px bg-white/15" />
                <div className="text-[11px] tracking-[0.2em] font-bold text-white/45">OR</div>
                <div className="md:block flex-1 md:flex-none h-px md:h-8 md:w-px bg-white/15" />
                <div className="hidden md:block w-px h-8 bg-white/15" />
              </div>

              {/* OPTION B */}
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 md:p-6 flex md:flex-col items-center md:items-start justify-between gap-3">
                <div>
                  <div className="text-[10.5px] tracking-[0.2em] text-[#d4b277] font-bold">
                    OPTION B
                  </div>
                  <div className="text-white/65 text-[12.5px] md:text-[13px] leading-[1.5] mt-1.5 break-keep">
                    백화점 상품권 — 후기 등록 확인 후 발송
                  </div>
                </div>
                <div className="flex items-baseline text-[#d4b277] font-black tracking-tight shrink-0">
                  <span className="text-[40px] md:text-[52px] leading-none">10</span>
                  <span className="text-[18px] md:text-[22px] leading-none ml-1">만원</span>
                </div>
              </div>
            </div>

            {/* 약관 + CTA */}
            <div className="mt-7 md:mt-8 flex flex-col items-center gap-4">
              <p className="text-white/45 text-[11.5px] md:text-[12.5px] text-center leading-[1.6] break-keep">
                ※ 두 혜택 중복 적용 불가 / 옵션 A는 견적 단계에서 사전 선택 시에만 적용
              </p>
              <Link
                to="/review/new"
                className="group inline-flex items-center justify-center gap-2 h-[54px] px-8 rounded-2xl bg-gradient-to-br from-[#d4b277] to-[#b8945a] text-[#1a1210] font-extrabold text-[15px] md:text-[16px] tracking-tight shadow-[0_8px_24px_rgba(212,178,119,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <Crown className="w-4 h-4" />
                지금 후기 작성하러 가기
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
