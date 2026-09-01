import { useEffect, useMemo, useState } from "react";
import { ChevronDown, RotateCcw, ArrowDown } from "lucide-react";
import { RiSparkling2Fill } from "react-icons/ri";
import { danjiMeta, type Danji } from "@/lib/danjiSearch";
import { diagnose, windowSpec } from "@/lib/danjiDiagnose";

/**
 * 단지를 고른 뒤 나오는 분석 결과.
 *
 * 계산은 즉시 끝나지만(순수 함수) 결과를 한 번에 뱉으면 조회한 표를 그대로
 * 붙인 것처럼 보인다. 항목을 순서대로 채워 "지금 살펴보는 중"으로 읽히게 했다.
 * prefers-reduced-motion 이면 단계를 건너뛰고 전부 바로 보여준다.
 */

interface Props {
  danji: Danji;
  /** 다시 검색 */
  onReset: () => void;
  /** 아래 연락처 입력으로 유도 */
  onWantQuote: () => void;
}

/** 단계별로 열리는 구간 — 인덱스가 곧 순서다 */
const STEPS = ["단지 조회", "노후도 판정", "창호 사양 추정", "분석 정리"] as const;
const STEP_MS = 420;

export function DanjiAnalysis({ danji, onReset, onWantQuote }: Props) {
  const g = useMemo(() => diagnose(danji), [danji]);
  const spec = useMemo(() => windowSpec(g), [g]);

  const instant =
    typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [step, setStep] = useState(instant ? STEPS.length : 0);
  const [gauge, setGauge] = useState(0);
  const [factsOpen, setFactsOpen] = useState(false);

  /* 단지가 바뀌면 처음부터 다시 훑는다 */
  useEffect(() => {
    if (instant) {
      setStep(STEPS.length);
      setGauge(g.gauge);
      return;
    }
    setStep(0);
    setGauge(0);
    const timers = STEPS.map((_, i) => setTimeout(() => setStep(i + 1), STEP_MS * (i + 1)));
    // 게이지는 노후도 판정이 뜬 뒤에 차오른다
    timers.push(setTimeout(() => setGauge(g.gauge), STEP_MS * 2 + 120));
    return () => timers.forEach(clearTimeout);
  }, [danji.idx, g.gauge, instant]);

  const done = step >= STEPS.length;
  const show = (i: number) => step > i;

  return (
    <div className="rounded-2xl border border-[#e8e8e8] bg-white overflow-hidden">
      {/* 헤더 — 진행 중에는 무엇을 보고 있는지 알린다 */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#fafafa] border-b border-[#f0f0f0]">
        <RiSparkling2Fill
          size={14}
          className={`text-[#D22727] ${done ? "" : "animate-pulse"}`}
        />
        <span className="text-[11.5px] font-bold text-[#888] tracking-[0.02em]">
          {done ? "분석 완료" : `${STEPS[Math.min(step, STEPS.length - 1)]} 중…`}
        </span>
        <button
          type="button"
          onClick={onReset}
          className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-bold text-[#aaa] hover:text-[#666] transition-colors"
        >
          <RotateCcw size={11} strokeWidth={2.4} /> 다시 검색
        </button>
      </div>

      <div className="px-4 py-4 md:px-5 md:py-5">
        {/* 1. 단지 — 이름과 연차 */}
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] text-[#aaa] leading-tight mb-0.5">
              {[g.danji.zone, g.danji.dong].filter(Boolean).join(" ")}
            </p>
            <h3 className="text-[17px] md:text-[19px] font-extrabold text-[#2A2A2A] leading-snug break-keep">
              {g.danji.name}
            </h3>
            <p className="text-[12px] text-[#999] mt-0.5">{danjiMeta(g.danji)}</p>
          </div>
          {g.danji.year && (
            <div
              className={`shrink-0 text-right transition-opacity duration-300 ${
                show(1) ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="block text-[24px] md:text-[28px] font-extrabold text-[#D22727] leading-none tabular-nums">
                {g.age}년
              </span>
              <span className="block text-[11px] text-[#999] mt-1">{g.ageLabel}</span>
            </div>
          )}
        </div>

        {/* 2. 노후도 게이지 — 20년을 만점으로 채운다 */}
        {g.danji.year && (
          <div
            className={`mt-4 transition-opacity duration-300 ${show(1) ? "opacity-100" : "opacity-0"}`}
          >
            <div className="h-[7px] rounded-full bg-[#f0f0f0] overflow-hidden">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#f0a04b,#D22727)] transition-[width] duration-[900ms] ease-out"
                style={{ width: `${gauge}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[10.5px] text-[#bbb] tabular-nums">
              <span>0년</span>
              <span>5년</span>
              <span>10년</span>
              <span>20년+</span>
            </div>
            <p className="mt-2 text-[13.5px] md:text-[14.5px] font-bold text-[#2A2A2A]">
              창호 교체 시점 기준 <span className="text-[#D22727]">{g.verdict}</span>
            </p>
          </div>
        )}

        {/* 3. 창호 추정 사양 */}
        <div
          className={`mt-4 transition-opacity duration-300 ${show(2) ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-[13px] font-extrabold text-[#2A2A2A]">창호 추정 사양</h4>
            <span className="text-[10.5px] font-bold text-[#b08b5a] bg-[#fdf6ec] border border-[#f0e0c8] rounded-full px-2 py-0.5">
              준공 기준 추정
            </span>
          </div>
          {spec.length ? (
            <dl className="rounded-xl border border-[#f0f0f0] overflow-hidden">
              {spec.map((r) => (
                <div
                  key={r.label}
                  className="flex items-center gap-3 px-3.5 py-2 border-b border-[#f4f4f4] last:border-b-0 odd:bg-[#fcfcfc]"
                >
                  <dt className="w-[74px] shrink-0 text-[12px] text-[#999]">{r.label}</dt>
                  <dd className="text-[12.5px] md:text-[13px] font-semibold text-[#2A2A2A] break-keep">
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-[13px] text-[#888] leading-[1.6] break-keep">
              공개 자료에 준공 연도가 없어 사양을 추정하지 못했습니다. 통화로 확인한 뒤
              안내드리겠습니다.
            </p>
          )}
        </div>

        {/* 4. 분석 문장 */}
        <ul
          className={`mt-4 grid gap-1.5 transition-opacity duration-300 ${
            show(3) ? "opacity-100" : "opacity-0"
          }`}
        >
          {g.notes.map((n, i) => (
            <li
              key={i}
              className="relative pl-4 text-[12.5px] md:text-[13.5px] text-[#666] leading-[1.65] break-keep before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#e5b0b0]"
            >
              {n}
            </li>
          ))}
        </ul>

        {/* 단지 기본정보 — 접어 둔다 */}
        {done && g.facts.length > 0 && (
          <>
            {factsOpen && (
              <dl className="mt-3 rounded-xl border border-[#f0f0f0] overflow-hidden">
                {g.facts.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center gap-3 px-3.5 py-2 border-b border-[#f4f4f4] last:border-b-0 odd:bg-[#fcfcfc]"
                  >
                    <dt className="w-[74px] shrink-0 text-[12px] text-[#999]">{r.label}</dt>
                    <dd className="text-[12.5px] font-semibold text-[#2A2A2A] break-keep">
                      {r.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <button
              type="button"
              onClick={() => setFactsOpen((v) => !v)}
              aria-expanded={factsOpen}
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold text-[#999] hover:text-[#666] transition-colors"
            >
              {factsOpen ? "추가 정보 접기" : "추가 정보 보기"}
              <ChevronDown
                size={13}
                strokeWidth={2.4}
                className={`transition-transform ${factsOpen ? "rotate-180" : ""}`}
              />
            </button>
          </>
        )}
      </div>

      {/* 다음 — 바로 아래 연락처 입력으로 넘긴다 */}
      {done && (
        <div className="px-4 py-3.5 md:px-5 bg-[#fdf3f3] border-t border-[#f6e2e2]">
          <p className="text-[12.5px] md:text-[13px] text-[#8a6a6a] leading-[1.6] break-keep mb-2.5">
            여기까지는 공개 자료로 본 추정입니다. 실제 창 크기와 교체 범위는 실측해야 나옵니다 —
            연락처를 남겨 주시면 이 단지 기준으로 예상 견적 범위를 안내해 드립니다.
          </p>
          <button
            type="button"
            onClick={onWantQuote}
            className="inline-flex items-center gap-1.5 h-[40px] px-4 bg-[#D22727] hover:bg-[#b02020] text-white font-bold text-[13.5px] rounded-xl transition-colors"
          >
            이 단지로 견적 받기
            <ArrowDown size={14} strokeWidth={2.6} />
          </button>
        </div>
      )}
    </div>
  );
}
