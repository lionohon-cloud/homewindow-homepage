import { useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { cfImage, type CfImageOptions } from "@/lib/cfImage";

/**
 * 후기 사진 공용 이미지 컴포넌트.
 * 폴백 체인: wsrv 변환 URL → (실패) 원본 URL → (실패) placeholder.
 * 로딩 중에는 스피너, 최종 실패 시 "이미지를 표시할 수 없음" placeholder 를 보여
 * 깨진 이미지 아이콘이 사용자에게 절대 노출되지 않게 한다.
 * (예: 브라우저가 못 그리는 HEIC + 변환 서비스도 거부하는 경우)
 */
export function ReviewImage({
  url,
  resize,
  className = "",
  showSpinner = true,
}: {
  url?: string;
  resize: CfImageOptions;
  className?: string;
  showSpinner?: boolean;
}) {
  // stage: 0 = wsrv 변환, 1 = 원본, 2 = 실패(placeholder)
  const [stage, setStage] = useState(0);
  const [loading, setLoading] = useState(true);

  if (!url || stage === 2) {
    return (
      <div className="w-full h-full bg-[#f4ede4] flex items-center justify-center">
        <ImageOff className="w-1/4 max-w-[28px] min-w-[16px] text-[#cbbfb2]" />
      </div>
    );
  }

  const src = stage === 0 ? cfImage(url, resize) : url;

  return (
    <>
      <img
        key={src}
        src={src}
        alt=""
        className={`${className} transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoading(false)}
        onError={() => {
          // wsrv 실패 → 원본, 원본도 실패 → placeholder
          setStage((s) => (s < 2 ? s + 1 : 2));
        }}
      />
      {showSpinner && loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-7 h-7 text-[#c8b8a8] animate-spin" />
        </div>
      )}
    </>
  );
}
