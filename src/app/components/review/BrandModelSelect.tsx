import { REVIEW_BRANDS, REVIEW_MODELS, type ReviewBrand, type ReviewModel } from "../../styles/reviewTokens";

export function BrandModelSelect({
  brand,
  model,
  onBrandChange,
  onModelChange,
  brandLocked = false,
  modelLocked = false,
}: {
  brand: ReviewBrand | "";
  model: ReviewModel | "";
  onBrandChange: (b: ReviewBrand) => void;
  onModelChange: (m: ReviewModel) => void;
  /** ERP 시공 데이터로 확정된 경우 true — 선택 변경 불가 */
  brandLocked?: boolean;
  modelLocked?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-[12.5px] font-semibold tracking-tight text-[#6b6460] mb-2">
          브랜드
        </div>
        <div className="grid grid-cols-3 gap-2">
          {REVIEW_BRANDS.map((b) => {
            const on = brand === b;
            return (
              <button
                key={b}
                type="button"
                disabled={brandLocked}
                onClick={() => onBrandChange(b)}
                className={[
                  "h-12 rounded-xl border text-[14px] font-bold tracking-tight transition",
                  on
                    ? "bg-[#fbf0ef] border-[#952c2c] text-[#952c2c]"
                    : "bg-white border-[#ebe5e0] text-[#3a3531]" +
                      (brandLocked ? "" : " hover:border-[#c8b8a8]"),
                  brandLocked ? (on ? "cursor-default" : "opacity-35 cursor-default") : "",
                ].join(" ")}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="text-[12.5px] font-semibold tracking-tight text-[#6b6460] mb-2">
          모델
        </div>
        <div className="grid grid-cols-3 gap-2">
          {REVIEW_MODELS.map((m) => {
            const on = model === m;
            return (
              <button
                key={m}
                type="button"
                disabled={modelLocked}
                onClick={() => onModelChange(m)}
                className={[
                  "h-12 rounded-xl border text-[14px] font-bold tracking-tight transition",
                  on
                    ? "bg-[#fbf0ef] border-[#952c2c] text-[#952c2c]"
                    : "bg-white border-[#ebe5e0] text-[#3a3531]" +
                      (modelLocked ? "" : " hover:border-[#c8b8a8]"),
                  modelLocked ? (on ? "cursor-default" : "opacity-35 cursor-default") : "",
                ].join(" ")}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
