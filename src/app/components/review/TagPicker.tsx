export function TagPicker({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tag) => {
        const on = value.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={[
              "px-3.5 h-9 rounded-full border text-[13px] font-semibold tracking-tight transition",
              on
                ? "bg-[#fbf0ef] border-[#952c2c] text-[#952c2c]"
                : "bg-white border-[#ebe5e0] text-[#3a3531] hover:border-[#c8b8a8]",
            ].join(" ")}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
