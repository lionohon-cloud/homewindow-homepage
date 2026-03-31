import svgPaths from "./svg-dab6akfqbx";
import imgImage1 from "figma:asset/677d3c9852a0720b22ed2ae5d4ac1812cc00bc3c.png";
import imgImage2 from "figma:asset/978f56bc931f29607d72fa188f89650568cf6ba1.png";
import imgImage3 from "figma:asset/36b216e9790a73d70f16ed1c2604afcebccfd997.png";

function RightSide() {
  return (
    <div className="absolute h-[11.336px] right-[14.67px] top-[17.33px] w-[66.662px]" data-name="Right Side">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 66.6615 11.3363">
        <g id="Right Side">
          <g id="Battery">
            <path d={svgPaths.p12384570} id="Rectangle" opacity="0.35" stroke="var(--stroke-0, black)" />
            <path d={svgPaths.p1a0c9260} fill="var(--fill-0, black)" id="Combined Shape" opacity="0.4" />
            <path d={svgPaths.p2be35b00} fill="var(--fill-0, black)" id="Rectangle_2" />
          </g>
          <path d={svgPaths.p23c16c00} fill="var(--fill-0, black)" id="Wifi" />
          <path d={svgPaths.p6b69b70} fill="var(--fill-0, black)" id="Mobile Signal" />
        </g>
      </svg>
    </div>
  );
}

function Time() {
  return (
    <div className="absolute h-[21px] left-[21px] top-[12px] w-[54px]" data-name="Time">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 54 21">
        <g id="Time">
          <g id="9:41">
            <path d={svgPaths.p3de63e00} fill="var(--fill-0, black)" />
            <path d={svgPaths.p3029a300} fill="var(--fill-0, black)" />
            <path d={svgPaths.p2e0c43c0} fill="var(--fill-0, black)" />
            <path d={svgPaths.p38350600} fill="var(--fill-0, black)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function LeftSide() {
  return (
    <div className="absolute contents left-[21px] top-[12px]" data-name="Left Side">
      <Time />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="absolute h-[44px] left-0 overflow-clip top-0 w-[375px]" data-name="Status Bar">
      <RightSide />
      <LeftSide />
      <div className="absolute bg-black h-[685px] left-0 top-[44px] w-[375px]" />
    </div>
  );
}

function Group1() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[102.72px] top-1/2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 102.72 102.72">
        <g id="Group 6">
          <circle cx="51.3602" cy="51.3602" fill="var(--fill-0, white)" id="Ellipse 1" r="49.9892" stroke="var(--stroke-0, #D22727)" strokeWidth="2.74195" />
        </g>
      </svg>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[17.37px] top-[44.79px]">
      <div className="absolute h-[13.389px] left-[17.37px] top-[44.79px] w-[67.393px]" data-name="image 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute left-[19px] size-[102.72px] top-[272px]">
      <Group1 />
      <Group2 />
    </div>
  );
}

function Group() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[102.72px] top-1/2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 102.72 102.72">
        <g id="Group 4">
          <circle cx="51.3602" cy="51.3602" fill="var(--fill-0, white)" id="Ellipse 2" r="50.8602" stroke="var(--stroke-0, #999999)" />
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute left-[136.72px] size-[102.72px] top-[272px]">
      <Group />
      <div className="absolute h-[21.809px] left-[13.71px] top-[40.22px] w-[74.464px]" data-name="image 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute bg-white border border-[#999] border-solid left-[254.44px] rounded-[51.36px] size-[102.72px] top-[272px]">
      <div className="absolute h-[19.511px] left-[9.97px] top-[41.06px] w-[80.665px]" data-name="image 3">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage3} />
      </div>
    </div>
  );
}

function Frame3({ className }: { className?: string }) {
  return (
    <div className={className || "absolute bg-[#d22427] content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[393px] w-[86px]"}>
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-l border-solid border-t inset-[-0.5px_0_-0.5px_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">ECO</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[13px] pb-[6px] pt-[7px] px-[9px] top-[421px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#aaa] border-b border-solid border-t inset-[-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[14px] whitespace-nowrap">시공보증</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[421px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-r border-solid border-t inset-[-0.5px_-0.5px_-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">15년</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[421px] w-[85px]">
      <div aria-hidden="true" className="absolute border border-[#de752b] border-solid inset-[-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">15년</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[421px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-l border-solid border-t inset-[-0.5px_0_-0.5px_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">15년</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[13px] pb-[6px] pt-[7px] px-[9px] top-[449px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#aaa] border-b border-solid border-t inset-[-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[14px] whitespace-nowrap">발코니 방충망</p>
    </div>
  );
}

function Frame9() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[449px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-r border-solid border-t inset-[-0.5px_-0.5px_-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">안전방충망</p>
    </div>
  );
}

function Frame10() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[449px] w-[85px]">
      <div aria-hidden="true" className="absolute border border-[#de752b] border-solid inset-[-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">블랙스텐망</p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[449px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-l border-solid border-t inset-[-0.5px_0_-0.5px_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">스텐망</p>
    </div>
  );
}

function Frame12() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[13px] pb-[6px] pt-[7px] px-[9px] top-[477px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#aaa] border-b border-solid border-t inset-[-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[14px] whitespace-nowrap">아르곤</p>
    </div>
  );
}

function Frame13() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[477px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-r border-solid border-t inset-[-0.5px_-0.5px_-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">O</p>
    </div>
  );
}

function Frame14() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[477px] w-[85px]">
      <div aria-hidden="true" className="absolute border border-[#de752b] border-solid inset-[-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">X</p>
    </div>
  );
}

function Frame15() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[477px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-l border-solid border-t inset-[-0.5px_0_-0.5px_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">X</p>
    </div>
  );
}

function Frame16() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[13px] pb-[6px] pt-[7px] px-[9px] top-[505px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#aaa] border-b border-solid border-t inset-[-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[14px] whitespace-nowrap">간봉</p>
    </div>
  );
}

function Frame17() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[505px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-r border-solid border-t inset-[-0.5px_-0.5px_-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">TPS</p>
    </div>
  );
}

function Frame18() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[505px] w-[85px]">
      <div aria-hidden="true" className="absolute border border-[#de752b] border-solid inset-[-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">TPS</p>
    </div>
  );
}

function Frame19() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[505px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-l border-solid border-t inset-[-0.5px_0_-0.5px_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">AL</p>
    </div>
  );
}

function Frame20() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[13px] pb-[6px] pt-[7px] px-[9px] top-[533px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#aaa] border-b border-solid border-t inset-[-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[14px] whitespace-nowrap">유리종류</p>
    </div>
  );
}

function Frame21() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[533px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-r border-solid border-t inset-[-0.5px_-0.5px_-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">수퍼더블로이</p>
    </div>
  );
}

function Frame22() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[533px] w-[85px]">
      <div aria-hidden="true" className="absolute border border-[#de752b] border-solid inset-[-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">수퍼로이+투명</p>
    </div>
  );
}

function Frame23() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[533px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-l border-solid border-t inset-[-0.5px_0_-0.5px_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">투명+그린</p>
    </div>
  );
}

function Frame24() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[13px] pb-[6px] pt-[7px] px-[9px] top-[561px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#aaa] border-b border-solid border-t inset-[-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[14px] whitespace-nowrap">발코니창 유리</p>
    </div>
  );
}

function Frame25() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[561px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-r border-solid border-t inset-[-0.5px_-0.5px_-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">26mm</p>
    </div>
  );
}

function Frame26() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[561px] w-[85px]">
      <div aria-hidden="true" className="absolute border border-[#de752b] border-solid inset-[-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">26mm</p>
    </div>
  );
}

function Frame27() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[561px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-l border-solid border-t inset-[-0.5px_0_-0.5px_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">24mm</p>
    </div>
  );
}

function Frame28() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[13px] pb-[6px] pt-[7px] px-[9px] top-[589px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#aaa] border-b border-solid border-t inset-[-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[14px] whitespace-nowrap">일반창 유리</p>
    </div>
  );
}

function Frame29() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[589px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-r border-solid border-t inset-[-0.5px_-0.5px_-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">26mm</p>
    </div>
  );
}

function Frame30() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[589px] w-[85px]">
      <div aria-hidden="true" className="absolute border border-[#de752b] border-solid inset-[-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">24mm</p>
    </div>
  );
}

function Frame31() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[589px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-l border-solid border-t inset-[-0.5px_0_-0.5px_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">24mm</p>
    </div>
  );
}

function Frame32() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[13px] pb-[6px] pt-[7px] px-[9px] top-[617px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#aaa] border-b border-solid border-t inset-[-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[14px] whitespace-nowrap">FIX/PJ/터닝</p>
    </div>
  );
}

function Frame33() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[617px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-r border-solid border-t inset-[-0.5px_-0.5px_-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">24mm</p>
    </div>
  );
}

function Frame34() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[617px] w-[85px]">
      <div aria-hidden="true" className="absolute border border-[#de752b] border-solid inset-[-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">24mm</p>
    </div>
  );
}

function Frame35() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[617px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-l border-solid border-t inset-[-0.5px_0_-0.5px_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">24mm</p>
    </div>
  );
}

function Frame36() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[13px] pb-[6px] pt-[7px] px-[9px] top-[645px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#aaa] border-b border-solid border-t inset-[-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[14px] whitespace-nowrap">발코니 핸들</p>
    </div>
  );
}

function Frame37() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[645px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-r border-solid border-t inset-[-0.5px_-0.5px_-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">자동</p>
    </div>
  );
}

function Frame38() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[645px] w-[85px]">
      <div aria-hidden="true" className="absolute border border-[#de752b] border-solid inset-[-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">자동</p>
    </div>
  );
}

function Frame39() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[645px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-l border-solid border-t inset-[-0.5px_0_-0.5px_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">자동</p>
    </div>
  );
}

function Frame40() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[13px] pb-[6px] pt-[7px] px-[9px] top-[673px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#aaa] border-b border-solid border-t inset-[-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[14px] whitespace-nowrap">일반창 핸들</p>
    </div>
  );
}

function Frame41() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[673px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-r border-solid border-t inset-[-0.5px_-0.5px_-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">자동</p>
    </div>
  );
}

function Frame42() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[673px] w-[85px]">
      <div aria-hidden="true" className="absolute border border-[#de752b] border-solid inset-[-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">고정+크리센트</p>
    </div>
  );
}

function Frame43() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[673px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-l border-solid border-t inset-[-0.5px_0_-0.5px_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">크리센트</p>
    </div>
  );
}

function Frame44() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[13px] pb-[6px] pt-[7px] px-[9px] top-[701px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#aaa] border-b border-solid border-t inset-[-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[14px] whitespace-nowrap">공틀분합문</p>
    </div>
  );
}

function Frame45() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[701px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-r border-solid border-t inset-[-0.5px_-0.5px_-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">커플핸들</p>
    </div>
  );
}

function Frame46() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[701px] w-[85px]">
      <div aria-hidden="true" className="absolute border border-[#de752b] border-solid inset-[-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">커플핸들</p>
    </div>
  );
}

function Frame47() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[701px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-l border-solid border-t inset-[-0.5px_0_-0.5px_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">고정+크리센트</p>
    </div>
  );
}

function Frame48() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[13px] pb-[6px] pt-[7px] px-[9px] top-[729px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#aaa] border-b border-solid border-t inset-[-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[14px] whitespace-nowrap">윈드클로저</p>
    </div>
  );
}

function Frame49() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[729px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-r border-solid border-t inset-[-0.5px_-0.5px_-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">발코니창 적용</p>
    </div>
  );
}

function Frame50() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[729px] w-[85px]">
      <div aria-hidden="true" className="absolute border border-[#de752b] border-solid inset-[-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">X</p>
    </div>
  );
}

function Frame51() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[729px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-l border-solid border-t inset-[-0.5px_0_-0.5px_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">X</p>
    </div>
  );
}

function Frame52() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[13px] pb-[6px] pt-[7px] px-[9px] top-[757px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#aaa] border-b border-solid border-t inset-[-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[14px] whitespace-nowrap">레일캡</p>
    </div>
  );
}

function Frame53() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[757px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-r border-solid border-t inset-[-0.5px_-0.5px_-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">LX 정품</p>
    </div>
  );
}

function Frame54() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[757px] w-[85px]">
      <div aria-hidden="true" className="absolute border border-[#de752b] border-solid inset-[-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">LX 정품</p>
    </div>
  );
}

function Frame55() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[757px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-l border-solid border-t inset-[-0.5px_0_-0.5px_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">LX 정품</p>
    </div>
  );
}

function Frame56() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[13px] pb-[6px] pt-[7px] px-[9px] top-[785px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#aaa] border-b border-solid border-t inset-[-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[14px] whitespace-nowrap">물구멍방충캡</p>
    </div>
  );
}

function Frame57() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[785px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-r border-solid border-t inset-[-0.5px_-0.5px_-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">O</p>
    </div>
  );
}

function Frame58() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[785px] w-[85px]">
      <div aria-hidden="true" className="absolute border border-[#de752b] border-solid inset-[-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">O</p>
    </div>
  );
}

function Frame59() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[785px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-l border-solid border-t inset-[-0.5px_0_-0.5px_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">X</p>
    </div>
  );
}

function Frame60() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[13px] pb-[6px] pt-[7px] px-[9px] top-[813px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#aaa] border-b border-solid border-t inset-[-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[14px] whitespace-nowrap">안전스토퍼</p>
    </div>
  );
}

function Frame61() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[813px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-r border-solid border-t inset-[-0.5px_-0.5px_-0.5px_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">BF 스토퍼</p>
    </div>
  );
}

function Frame62() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[813px] w-[85px]">
      <div aria-hidden="true" className="absolute border border-[#de752b] border-solid inset-[-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">BF 스토퍼</p>
    </div>
  );
}

function Frame63() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[813px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-b border-l border-solid border-t inset-[-0.5px_0_-0.5px_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">BF 스토퍼</p>
    </div>
  );
}

function Frame64() {
  return (
    <div className="absolute bg-white content-stretch flex h-[28px] items-center justify-center left-[13px] pb-[6px] pt-[7px] px-[9px] top-[841px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#aaa] border-solid border-t inset-[-0.5px_0_0_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[14px] whitespace-nowrap">빨래건조대</p>
    </div>
  );
}

function Frame65() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[841px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-r border-solid border-t inset-[-0.5px_-0.5px_0_0] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">O</p>
    </div>
  );
}

function Frame66() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[841px] w-[85px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-l border-r border-solid border-t inset-[-0.5px_-0.5px_0_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">X</p>
    </div>
  );
}

function Frame67() {
  return (
    <div className="absolute bg-[#fff5f5] content-stretch flex h-[28px] items-center justify-center left-[277px] pb-[6px] pt-[7px] px-[9px] top-[841px] w-[86px]">
      <div aria-hidden="true" className="absolute border-[#de752b] border-l border-solid border-t inset-[-0.5px_0_0_-0.5px] pointer-events-none" />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#3f0202] text-[14px] whitespace-nowrap">X</p>
    </div>
  );
}

export default function P() {
  return (
    <div className="bg-white relative size-full" data-name="p2">
      <StatusBar />
      <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[normal] left-[30px] not-italic text-[#999] text-[16px] top-[74px] whitespace-nowrap">브랜드 라인업</p>
      <div className="absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[30px] not-italic text-[#999] text-[16px] top-[191px] whitespace-nowrap">
        <p className="mb-0">고객님의 예산과 취향에 맞춰</p>
        <p>브랜드를 자유롭게 선택해 보십시오.</p>
      </div>
      <div className="absolute font-['Pretendard:ExtraBold',sans-serif] leading-[0] left-[30px] not-italic text-[#333] text-[28px] top-[107px] whitespace-nowrap">
        <p className="leading-[35px] mb-0">집을 지키는 뼈대,</p>
        <p>
          <span className="leading-[35px] text-[#d22727]">{`프리미엄 창호 `}</span>
          <span className="leading-[35px]">브랜드 라인업</span>
        </p>
      </div>
      <Frame1 />
      <Frame2 />
      <Frame />
      <Frame3 />
      <div className="absolute bg-[#d22427] content-stretch flex h-[28px] items-center justify-center left-[192px] pb-[6px] pt-[7px] px-[9px] top-[393px] w-[85px]">
        <div aria-hidden="true" className="absolute border border-[#de752b] border-solid inset-[-0.5px] pointer-events-none" />
        <p className="font-['Pretendard:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">SIGNATURE</p>
      </div>
      <div className="absolute bg-[#d22427] content-stretch flex h-[28px] items-center justify-center left-[106px] pb-[6px] pt-[7px] px-[9px] top-[393px] w-[86px]">
        <div aria-hidden="true" className="absolute border-[#de752b] border-b border-r border-solid border-t inset-[-0.5px_-0.5px_-0.5px_0] pointer-events-none" />
        <p className="font-['Pretendard:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">PRESTIGE</p>
      </div>
      <Frame4 />
      <Frame5 />
      <Frame6 />
      <Frame7 />
      <Frame8 />
      <Frame9 />
      <Frame10 />
      <Frame11 />
      <Frame12 />
      <Frame13 />
      <Frame14 />
      <Frame15 />
      <Frame16 />
      <Frame17 />
      <Frame18 />
      <Frame19 />
      <Frame20 />
      <Frame21 />
      <Frame22 />
      <Frame23 />
      <Frame24 />
      <Frame25 />
      <Frame26 />
      <Frame27 />
      <Frame28 />
      <Frame29 />
      <Frame30 />
      <Frame31 />
      <Frame32 />
      <Frame33 />
      <Frame34 />
      <Frame35 />
      <Frame36 />
      <Frame37 />
      <Frame38 />
      <Frame39 />
      <Frame40 />
      <Frame41 />
      <Frame42 />
      <Frame43 />
      <Frame44 />
      <Frame45 />
      <Frame46 />
      <Frame47 />
      <Frame48 />
      <Frame49 />
      <Frame50 />
      <Frame51 />
      <Frame52 />
      <Frame53 />
      <Frame54 />
      <Frame55 />
      <Frame56 />
      <Frame57 />
      <Frame58 />
      <Frame59 />
      <Frame60 />
      <Frame61 />
      <Frame62 />
      <Frame63 />
      <Frame64 />
      <Frame65 />
      <Frame66 />
      <Frame67 />
    </div>
  );
}