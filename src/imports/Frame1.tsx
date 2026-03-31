import svgPaths from "./svg-i251ehq8ub";
import imgEllipse1 from "figma:asset/603ca5461a37b3c3a1ba4cc743217510f0241fbb.png";

export default function Frame() {
  return (
    <div className="bg-white relative size-full">
      <div className="absolute flex items-center justify-center left-[79.71px] size-[224.585px] top-[136.71px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="flex-none rotate-[15.02deg]">
          <div className="relative size-[183.332px]">
            <div className="absolute bottom-1/2 left-1/2 right-0 top-[46.86%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 91.6661 5.75576">
                <path d={svgPaths.p735a300} fill="var(--fill-0, #656565)" id="Ellipse 3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex items-center justify-center left-[73.85px] size-[236.294px] top-[130.85px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="flex-none rotate-[11.31deg]">
          <div className="relative size-[200.816px]">
            <div className="absolute inset-[31.01%_-1.99%_46.02%_48.01%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 108.408 46.1328">
                <g filter="url(#filter0_d_2017_459)" id="Ellipse 2">
                  <path d={svgPaths.p2be8b500} fill="url(#paint0_linear_2017_459)" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="46.1328" id="filter0_d_2017_459" width="108.408" x="0" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_2017_459" />
                    <feBlend in="SourceGraphic" in2="effect1_dropShadow_2017_459" mode="normal" result="shape" />
                  </filter>
                  <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2017_459" x1="110.394" x2="3.5098" y1="16.8582" y2="35.6814">
                    <stop stopColor="#D9D9D9" />
                    <stop offset="1" stopColor="#737373" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex items-center justify-center left-[58px] size-[268.219px] top-[115px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "231" } as React.CSSProperties}>
        <div className="flex-none rotate-15">
          <div className="relative size-[219px]">
            <div className="absolute inset-[0_-1.83%_-3.65%_-1.83%]">
              <img alt="" className="block max-w-none size-full" height="227" src={imgEllipse1} width="227" />
            </div>
          </div>
        </div>
      </div>
      <p className="absolute font-['Pretendard:Regular',sans-serif] leading-[normal] left-[104px] not-italic text-[12px] text-shadow-[0px_2px_3.5px_rgba(76,0,0,0.54)] text-white top-[232px] whitespace-nowrap">매우 만족 고객</p>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[104px] not-italic text-[23.077px] text-shadow-[0px_2px_3.5px_rgba(76,0,0,0.54)] text-white top-[246px] whitespace-nowrap">92.8%</p>
    </div>
  );
}