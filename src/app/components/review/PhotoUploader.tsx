import { useRef } from "react";
import { Plus, X } from "lucide-react";

export type ReviewPhoto = {
  file: File;
  preview: string;
  label?: "before" | "after" | "other";
};

const MAX = 10;

export function PhotoUploader({
  photos,
  onChange,
  minRequired = 3,
}: {
  photos: ReviewPhoto[];
  onChange: (next: ReviewPhoto[]) => void;
  minRequired?: number;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const remain = MAX - photos.length;
    const next: ReviewPhoto[] = [];
    Array.from(files)
      .slice(0, remain)
      .forEach((f) => {
        if (!f.type.startsWith("image/")) return;
        next.push({ file: f, preview: URL.createObjectURL(f), label: "other" });
      });
    onChange([...photos, ...next]);
    if (inputRef.current) inputRef.current.value = "";
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
    <div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2.5">
        {photos.map((p, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-xl overflow-hidden bg-[#f4ede4] border border-[#ebe5e0]"
          >
            <img src={p.preview} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/55 text-white flex items-center justify-center"
              aria-label="사진 삭제"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-0 inset-x-0 flex">
              {(["before", "after", "other"] as const).map((lb) => (
                <button
                  key={lb}
                  type="button"
                  onClick={() => setLabel(i, lb)}
                  className={[
                    "flex-1 text-[10px] font-bold tracking-wider py-1",
                    p.label === lb
                      ? "bg-[#952c2c] text-white"
                      : "bg-black/35 text-white/80 hover:bg-black/55",
                  ].join(" ")}
                >
                  {lb === "before" ? "BEFORE" : lb === "after" ? "AFTER" : "기타"}
                </button>
              ))}
            </div>
          </div>
        ))}
        {photos.length < MAX && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-[#c8b8a8] bg-[#faf7f4] text-[#6b6460] flex flex-col items-center justify-center gap-1.5 hover:bg-[#f4ede4]"
          >
            <Plus className="w-6 h-6" />
            <span className="text-[11px] font-semibold">사진 추가</span>
          </button>
        )}
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[12px] text-[#6b6460]">
        <span>
          {photos.length} / {MAX}장
          {photos.length < minRequired && (
            <span className="text-[#952c2c] font-semibold ml-2">
              (최소 {minRequired}장 필요)
            </span>
          )}
        </span>
        <span>BEFORE/AFTER 라벨을 지정해 주세요</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => addFiles(e.target.files)}
      />
    </div>
  );
}
