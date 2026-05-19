export interface ReviewSpec {
  siteWorkSummary?: string;
  productLabel?: string;
  glassLabel?: string;
  sizeLabel?: string;
  installDate?: string;
  warrantyLabel?: string;
}

export function SpecTable({ spec }: { spec: ReviewSpec }) {
  const rows: { label: string; value?: string }[] = [
    { label: "시공 부위", value: spec.siteWorkSummary },
    { label: "제품", value: spec.productLabel },
    { label: "유리", value: spec.glassLabel },
    { label: "사이즈", value: spec.sizeLabel },
    { label: "시공일", value: spec.installDate },
    { label: "보증", value: spec.warrantyLabel },
  ].filter((r) => !!r.value);

  if (rows.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white border border-[#ebe5e0] overflow-hidden">
      <table className="w-full text-[13.5px]">
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.label}
              className={i > 0 ? "border-t border-[#f4ede4]" : ""}
            >
              <th className="w-[88px] md:w-[100px] text-left px-4 md:px-5 py-3 text-[#9a948f] font-semibold align-top">
                {r.label}
              </th>
              <td className="px-4 md:px-5 py-3 text-[#1c1614] break-keep leading-[1.6]">
                {r.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
