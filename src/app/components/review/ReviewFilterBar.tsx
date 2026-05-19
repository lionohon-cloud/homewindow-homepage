import { Crown } from "lucide-react";

export type ReviewTab = "all" | "simple" | "premium";
export type ReviewSort = "latest" | "helpful" | "rating";

export function ReviewFilterBar({
  tab,
  onTabChange,
  counts,
  sort,
  onSortChange,
  part,
  onPartChange,
  extraFilters,
  onExtraToggle,
}: {
  tab: ReviewTab;
  onTabChange: (t: ReviewTab) => void;
  counts: { all: number; simple: number; premium: number };
  sort: ReviewSort;
  onSortChange: (s: ReviewSort) => void;
  part: string;
  onPartChange: (p: string) => void;
  extraFilters: { hasPhoto: boolean; hasVideo: boolean; beforeAfter: boolean };
  onExtraToggle: (key: keyof typeof extraFilters) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-[#ebe5e0]">
        <nav className="flex gap-6">
          <TabBtn on={tab === "all"} onClick={() => onTabChange("all")}>
            전체 <Ct>{counts.all.toLocaleString()}</Ct>
          </TabBtn>
          <TabBtn on={tab === "simple"} onClick={() => onTabChange("simple")}>
            간편 리뷰 <Ct>{counts.simple.toLocaleString()}</Ct>
          </TabBtn>
          <TabBtn on={tab === "premium"} onClick={() => onTabChange("premium")}>
            <Crown className="inline w-3.5 h-3.5 -mt-0.5 mr-0.5 text-[#b8945a]" />
            프리미엄 리뷰 <Ct>{counts.premium.toLocaleString()}</Ct>
          </TabBtn>
        </nav>
        <div className="flex gap-3 text-[12.5px] text-[#9a948f] pb-3">
          {(["latest", "helpful", "rating"] as ReviewSort[]).map((s) => (
            <button
              key={s}
              onClick={() => onSortChange(s)}
              className={
                sort === s ? "text-[#1c1614] font-bold" : "hover:text-[#3a3531]"
              }
            >
              {s === "latest" ? "최신순" : s === "helpful" ? "도움순" : "별점 높은순"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center flex-wrap gap-2">
        {["전체 부위", "거실", "주방", "안방", "베란다"].map((p) => {
          const on = part === p || (p === "전체 부위" && !part);
          return (
            <Chip
              key={p}
              on={on}
              onClick={() => onPartChange(p === "전체 부위" ? "" : p)}
            >
              {p}
            </Chip>
          );
        })}
        <span className="inline-block w-px h-4 bg-[#ebe5e0] mx-1" />
        <Chip on={extraFilters.hasPhoto} onClick={() => onExtraToggle("hasPhoto")}>
          사진 있음
        </Chip>
        <Chip on={extraFilters.hasVideo} onClick={() => onExtraToggle("hasVideo")}>
          동영상 있음
        </Chip>
        <Chip on={extraFilters.beforeAfter} onClick={() => onExtraToggle("beforeAfter")}>
          Before / After
        </Chip>
      </div>
    </div>
  );
}

function TabBtn({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "pb-3 -mb-px border-b-2 transition text-[14.5px] font-bold tracking-tight",
        on
          ? "border-[#952c2c] text-[#1c1614]"
          : "border-transparent text-[#9a948f] hover:text-[#3a3531]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Ct({ children }: { children: React.ReactNode }) {
  return <span className="ml-1 text-[12px] font-semibold text-[#9a948f]">{children}</span>;
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "h-8 px-3.5 rounded-full text-[12.5px] font-semibold transition border",
        on
          ? "bg-[#952c2c] text-white border-[#952c2c]"
          : "bg-white text-[#3a3531] border-[#ebe5e0] hover:border-[#c8b8a8]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
