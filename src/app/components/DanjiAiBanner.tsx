import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { DanjiSearchField } from "./DanjiSearchField";
import { DanjiAnalysis } from "./DanjiAnalysis";
import { DANJI_COUNT, type Danji } from "@/lib/danjiSearch";

/**
 * 예상견적 진입 띠배너 — 히어로와 상담신청 바 사이에 들어간다.
 *
 * 랜딩퍼널(전달용_청암랜딩퍼널)의 1~3단계를 배너 한 칸 안에서 굴린다.
 *   거주 형태 → (아파트) 단지 검색 → 분석 결과
 *   거주 형태 → (주택·상가) 아래 연락처 접수  ← 단지 자료가 없는 경로
 *
 * 연락처 입력과 한 덩어리로 두면 "접수 폼의 부속"으로 읽혀서 따로 뗐다.
 * 배경 톤을 흰 상담 바와 다르게 줘서 띠로 구분한다.
 */

/** 아래 상담신청 바의 연락처 칸으로 넘긴다 — 두 섹션이 분리돼 ref 를 못 넘긴다. */
function focusConsultPhone() {
  const form = document.getElementById("consult-form");
  const tels = form?.querySelectorAll<HTMLInputElement>('input[type="tel"]');
  const target = tels?.[1] ?? tels?.[0]; // 국번(010)은 이미 차 있으니 가운데 칸부터
  if (!target) return;
  target.scrollIntoView({ block: "center", behavior: "smooth" });
  target.focus({ preventScroll: true });
}

/**
 * 단지 수 카운트업. 화면에 들어왔을 때 한 번만 돈다(배너가 히어로 아래라
 * 로드 시점엔 안 보인다). 빠르게 훑고 끝나야 해서 0.7초.
 *
 * 자릿수가 늘면 문장 폭이 흔들리는데 배너가 가운데 정렬이라 줄 전체가 떤다.
 * 그래서 최종 값을 투명하게 깔아 폭을 잡아 두고, 그 위에 현재 값을 겹쳐 그린다.
 */
const COUNT_MS = 700;

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce =
    typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* 초기값은 0 이 아니라 최종값이다 — 관찰자가 끝내 안 걸리는 환경(구형 브라우저,
     스크롤 없이 벗어난 경우)에서 "전국 0개" 로 굳는 것보다 안 움직이는 게 낫다.
     화면에 들어온 순간 0 부터 다시 센다. 그 전엔 보이지 않으므로 튀지 않는다. */
  const [n, setN] = useState(to);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const run = () => {
      setN(0);
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / COUNT_MS, 1);
        const eased = 1 - Math.pow(1 - p, 3); // 끝에서 부드럽게 멈춘다
        setN(Math.round(to * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        run();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, reduce]);

  return (
    <span ref={ref} className="inline-grid align-baseline tabular-nums">
      <span aria-hidden className="col-start-1 row-start-1 invisible">
        {to.toLocaleString()}
      </span>
      <span className="col-start-1 row-start-1 text-right">{n.toLocaleString()}</span>
    </span>
  );
}

/* 거주형태를 고르면 넘어갈 광고 랜딩 퍼널 주소 (배포본과 동일) */
const LANDING_APT = "https://homewindow.kr/request/search?t=apt";
const LANDING_HOUSE = "https://homewindow.kr/request/region?t=house";

export function DanjiAiBanner() {
  /* type = 거주 형태 고르기(퍼널 1단계), search = 단지 검색(2단계) */
  const [stage, setStage] = useState<"type" | "search">("type");
  const [danji, setDanji] = useState<Danji | null>(null);

  const pickBtn =
    "flex items-center justify-center h-[64px] md:h-[72px] rounded-2xl border-2 border-[#e4e1e8] bg-white text-[17px] md:text-[19px] font-bold text-[#2A2A2A] transition-all hover:border-[#D22727] hover:text-[#D22727] active:scale-[0.98]";

  return (
    <section
      id="danji-ai"
      className="w-full bg-[linear-gradient(180deg,#f7f5fa_0%,#faf8f8_100%)] border-b border-[#e9e7ec]"
    >
      {/* PC 는 예전 높이의 4.5배(99 → 445). 모바일은 4.5배(734)면 화면을 통째로
          먹어서 그 절반으로 잡았다. 내용은 가운데로 모은다. */}
      <div className="max-w-screen-lg mx-auto px-5 md:px-10 py-4 md:py-5 min-h-[367px] md:min-h-[445px] flex flex-col justify-center">
        {danji ? (
          <DanjiAnalysis
            danji={danji}
            onReset={() => setDanji(null)}
            onWantQuote={focusConsultPhone}
          />
        ) : stage === "type" ? (
          /* ── 1단계 · 거주 형태 ── */
          <div className="text-center">
            <h2 className="text-[26px] md:text-[34px] font-extrabold text-[#2A2A2A] leading-[1.25] -tracking-[.025em] break-keep">
              우리집 창호 교체,
              {/* PC 는 한 줄로 붙고 모바일에서만 끊는다 */}
              <br className="md:hidden" />{" "}
              예상견적부터 확인하세요.
            </h2>

            <p className="mt-5 md:mt-7 text-[15px] md:text-[17px] font-semibold text-[#5f5b66]">
              주거형태가 어떻게 되시나요?
            </p>

            <div className="mt-3 md:mt-4 grid grid-cols-2 gap-2.5 md:gap-3 w-full max-w-[440px] mx-auto">
              {/* 배포본과 같은 동작 — 고르면 광고 랜딩 퍼널로 넘긴다.
                  아파트는 단지 검색부터, 주택·상가는 자료가 없어 지역 선택부터 시작한다.

                  아래 2단계(단지 검색 → AI 분석)를 이 페이지 안에서 그대로 쓰려면
                  이 두 <a> 를 아래 주석의 <button> 으로 되돌리면 된다. 코드는 그대로 살아 있다.
                    <button type="button" className={pickBtn} onClick={() => setStage("search")}>아파트</button>
                    <button type="button" className={pickBtn} onClick={focusConsultPhone}>주택,상가</button> */}
              <a href={LANDING_APT} className={`${pickBtn} no-underline`}>
                아파트
              </a>
              <a href={LANDING_HOUSE} className={`${pickBtn} no-underline`}>
                주택,상가
              </a>
            </div>
          </div>
        ) : (
          /* ── 2단계 · 단지 검색 ── */
          <div className="text-center">
            <h2 className="text-[26px] md:text-[34px] font-extrabold text-[#2A2A2A] leading-[1.25] -tracking-[.025em] break-keep">
              어느 단지에 사시나요?
            </h2>
            <p className="mt-2.5 md:mt-3 mx-auto max-w-[600px] text-[14px] md:text-[16px] text-[#8b8792] leading-[1.65] break-keep">
              전국 <b className="font-bold text-[#5f5b66]"><CountUp to={DANJI_COUNT} />개</b>{" "}
              단지 자료 보유
              {/* PC 는 한 줄이라 가운뎃점으로 잇고, 모바일은 줄을 나누므로 점을 뺀다.
                  자연 줄바꿈은 폭에 따라 끊기는 자리가 제각각이라 여기서 고정한다. */}
              <span className="hidden md:inline"> · </span>
              <br className="md:hidden" />
              단지 연식과 구조를 파악하고 무료로 분석해 드립니다.
            </p>

            <div className="mt-7 md:mt-8 w-full max-w-[560px] mx-auto text-left">
              <DanjiSearchField onSelect={setDanji} onNotFound={focusConsultPhone} />
            </div>

            <button
              type="button"
              onClick={() => setStage("type")}
              className="mt-5 inline-flex items-center gap-1 text-[13px] font-bold text-[#9a969f] hover:text-[#5f5b66] transition-colors"
            >
              <ChevronLeft size={14} strokeWidth={2.4} /> 거주 형태 다시 선택
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
