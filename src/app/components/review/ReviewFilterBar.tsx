import { Image as ImageIcon, ChevronDown } from "lucide-react";

export type ReviewTab = "all" | "photo";
export type ReviewSort = "latest" | "helpful" | "rating";

export function ReviewFilterBar({
  tab,
  onTabChange,
  sort,
  onSortChange,
  part,
  onPartChange,
}: {
  tab: ReviewTab;
  onTabChange: (t: ReviewTab) => void;
  sort: ReviewSort;
  onSortChange: (s: ReviewSort) => void;
  part: string;
  onPartChange: (p: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-[#ebe5e0]">
        <nav className="flex gap-6">
          <TabBtn on={tab === "all"} onClick={() => onTabChange("all")}>
            전체
          </TabBtn>
          <TabBtn on={tab === "photo"} onClick={() => onTabChange("photo")}>
            <ImageIcon className="inline w-3.5 h-3.5 -mt-0.5 mr-0.5 text-[#b8945a]" />
            사진 리뷰
          </TabBtn>
        </nav>
        <div className="relative flex items-center pb-3">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as ReviewSort)}
            className="appearance-none cursor-pointer bg-transparent pr-6 pl-1 text-[12.5px] font-bold text-[#1c1614] focus:outline-none"
          >
            <option value="latest">최신순</option>
            <option value="helpful">도움순</option>
            <option value="rating">별점 높은순</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-0 w-4 h-4 text-[#9a948f]" />
        </div>
      </div>

      <div className="mt-4 flex items-center flex-wrap gap-2">
        {["모든 공간", "거실", "주방", "안방", "베란다"].map((p) => {
          const on = part === p || (p === "모든 공간" && !part);
          return (
            <Chip
              key={p}
              on={on}
              onClick={() => onPartChange(p === "모든 공간" ? "" : p)}
            >
              {p}
            </Chip>
          );
        })}
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
