import { useEffect, useId, useRef, useState } from "react";
import { Loader2, X, ArrowUp } from "lucide-react";
import { RiSparkling2Fill } from "react-icons/ri";
import {
  loadDanjiDB,
  searchDanji,
  danjiMeta,
  DANJI_COUNT,
  MIN_QUERY,
  VISIBLE,
  type Danji,
} from "@/lib/danjiSearch";

/**
 * 단지 AI 검색창 — 상담신청 폼 위에 붙는다.
 *
 * 생김새를 AI 검색처럼 잡은 이유: 고른 뒤에 단지 연식·구조를 분석해서
 * 돌려주는 흐름이라, 일반 검색창처럼 보이면 "그냥 찾기"로만 읽힌다.
 *
 * 데이터(1.6MB)는 검색창을 처음 건드릴 때 받아 온다. 페이지 첫 로딩에는
 * 영향이 없고, 검색을 안 쓰는 방문자는 끝까지 안 받는다.
 *
 * 목록에 없다고 답하면 onNotFound 로 알린다 — 호출부에서 번호 입력으로 되돌린다.
 */

interface Props {
  onSelect: (danji: Danji) => void;
  /** "목록에 없어요" — 번호 입력으로 되돌릴 때 */
  onNotFound?: () => void;
  disabled?: boolean;
}

export function DanjiSearchField({ onSelect, onNotFound, disabled }: Props) {
  const listId = `danji-list-${useId().replace(/:/g, "")}`;
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Danji[]>([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState(-1); // 키보드로 짚고 있는 항목
  // 찾는 중에는 "목록에 없나요?" 를 띄우면 안 된다 — 글자 칠 때마다 깜빡인다
  const [searching, setSearching] = useState(false);

  /* 검색창을 건드리는 순간 데이터를 당겨 둔다 — 첫 타이핑이 매끄러워진다 */
  const warm = () => {
    if (disabled) return;
    loadDanjiDB()
      .then(() => setError(""))
      .catch((e: Error) => setError(e.message));
  };

  /* 입력이 멈춘 뒤에 찾는다. 110ms 는 원본 퍼널과 같은 값. */
  useEffect(() => {
    const q = query.replace(/\s/g, "");
    if (q.length < MIN_QUERY) {
      setItems([]);
      setTotal(0);
      setActive(-1);
      setSearching(false);
      return;
    }
    setSearching(true);
    let alive = true;
    const timer = setTimeout(() => {
      loadDanjiDB()
        .then((db) => {
          if (!alive) return;
          const r = searchDanji(db, query);
          setItems(r.items);
          setTotal(r.total);
          setActive(-1);
          setError("");
        })
        .catch((e: Error) => alive && setError(e.message))
        .finally(() => alive && setSearching(false));
    }, 110);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [query]);

  /* 바깥을 누르면 닫는다 */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (d: Danji) => {
    setOpen(false);
    setQuery("");
    setItems([]);
    setTotal(0);
    onSelect(d);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.preventDefault(); // 폼 밖이지만 실수로 제출되는 일 방지
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => {
        const n = items.length;
        return e.key === "ArrowDown" ? (i + 1) % n : (i <= 0 ? n : i) - 1;
      });
    } else if (e.key === "Enter") {
      pick(items[active >= 0 ? active : 0]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const typedEnough = query.replace(/\s/g, "").length >= MIN_QUERY;
  const noResult = typedEnough && !searching && items.length === 0 && !error;
  const showPanel = open && (typedEnough || !!error);

  return (
    <div className="w-full">
      <div ref={boxRef} className="relative w-full p-[2px]">
      {/* 흐르는 그라데이션 테두리.
          옅게 깔면 흰 배경에 묻혀 안 보여서(1px·35% 로는 PC·모바일 둘 다 안 보였다)
          색은 항상 100% 로 두고, 포커스 신호는 바깥 번짐으로 준다. */}
      <div
        aria-hidden
        className={`hw-ai-ring absolute inset-0 rounded-2xl transition-shadow duration-300 ${
          focused ? "shadow-[0_0_0_4px_rgba(210,39,39,0.13)]" : ""
        }`}
      />
      <div className="relative flex items-center gap-2.5 h-[50px] md:h-[54px] pl-4 pr-2 bg-white rounded-[14px]">
        <RiSparkling2Fill size={20} className="shrink-0 text-[#D22727]" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            warm();
            setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder="아파트 단지명 검색"
          aria-label="아파트 단지명으로 분석 요청"
          aria-expanded={showPanel}
          aria-controls={listId}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          className="flex-1 min-w-0 h-full bg-transparent text-[14.5px] md:text-[15.5px] font-medium text-[#2A2A2A] placeholder:text-[#b5b5b5] placeholder:font-normal outline-none disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden"
        />
        {searching ? (
          <Loader2 size={17} className="shrink-0 text-[#D22727] animate-spin" />
        ) : query ? (
          <button
            type="button"
            aria-label="입력 지우기"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[#bbb] hover:text-[#666] hover:bg-[#f2f2f2] transition-colors"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        ) : null}
        {/* 모바일엔 엔터 힌트가 안 통해서 실제 버튼으로 둔다.
            결과가 잡히기 전에는 눌러도 할 일이 없으므로 비활성. */}
        <button
          type="button"
          aria-label="분석하기"
          disabled={disabled || items.length === 0}
          onClick={() => items.length && pick(items[active >= 0 ? active : 0])}
          className="shrink-0 w-[38px] h-[38px] md:w-[40px] md:h-[40px] flex items-center justify-center rounded-full bg-[#D22727] text-white transition-colors hover:bg-[#b02020] disabled:bg-[#ededed] disabled:text-[#bbbbbb]"
        >
          <ArrowUp size={19} strokeWidth={2.6} />
        </button>
      </div>

      {/* 결과는 띄워서 보여준다 — 아래 번호 입력이 밀리면 안 된다 */}
      {showPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_14px_40px_rgba(0,0,0,0.14)] overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-[#fafafa] border-b border-[#f0f0f0]">
            <RiSparkling2Fill size={13} className="text-[#D22727]" />
            <span className="text-[11px] font-bold text-[#888] tracking-[0.02em]">
              전국 {DANJI_COUNT.toLocaleString()}개 단지 자료에서 찾는 중
            </span>
          </div>

          {error ? (
            <p className="px-4 py-3.5 text-[13px] text-[#D22727]">{error}</p>
          ) : searching && items.length === 0 ? (
            <p className="flex items-center gap-2 px-4 py-4 text-[13px] text-[#999]">
              <Loader2 size={14} className="animate-spin" /> 단지 자료를 분석하는 중…
            </p>
          ) : noResult ? (
            <div className="px-4 py-4">
              <p className="text-[13.5px] font-bold text-[#2A2A2A] mb-1">
                이 이름으로는 찾지 못했어요
              </p>
              <p className="text-[12.5px] text-[#888] leading-[1.6] mb-3">
                신축이거나 자료에 없는 단지일 수 있습니다. 연락처를 남겨 주시면
                상담하면서 직접 확인해 드립니다.
              </p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onNotFound?.();
                }}
                className="text-[12.5px] font-bold text-[#D22727] underline underline-offset-2 hover:text-[#b02020] transition-colors"
              >
                연락처로 상담 신청하기
              </button>
            </div>
          ) : (
            <ul id={listId} role="listbox" className="max-h-[320px] overflow-y-auto">
              {items.map((d, i) => (
                <li key={d.idx} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(d)}
                    className={`w-full text-left px-4 py-2.5 border-b border-[#f4f4f4] last:border-b-0 transition-colors ${
                      i === active ? "bg-[#fdf3f3]" : "hover:bg-[#fafafa]"
                    }`}
                  >
                    <span className="block text-[14px] font-bold text-[#2A2A2A] leading-snug">
                      {d.name}
                    </span>
                    <span className="block text-[12px] text-[#999] mt-0.5">
                      {danjiMeta(d)}
                    </span>
                  </button>
                </li>
              ))}
              {total > VISIBLE && (
                <li className="px-4 py-2.5 text-[12px] text-[#aaa] bg-[#fafafa]">
                  이 밖에 {(total - VISIBLE).toLocaleString()}개가 더 있습니다. 단지명을 더
                  입력해 보세요.
                </li>
              )}
            </ul>
          )}
        </div>
      )}
      </div>

      <p className="mt-2 px-1 text-[12px] md:text-[12.5px] text-[#9a969f] leading-[1.5] break-keep">
        이름 일부만 넣어도 됩니다. 초성 검색도 됩니다. (예: ㄹㅁㅇ)
      </p>
    </div>
  );
}
