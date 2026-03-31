import svgPaths from "./svg-fr2qzconq7";
import imgRectangle4 from "figma:asset/043d32be9e8d4e45d2ea3135af6c4c2ad7644c36.png";

function Frame() {
  return (
    <div className="absolute bg-[#eee] h-[56px] left-[188px] top-0 w-[188px]">
      <p className="-translate-x-1/2 absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[93.5px] not-italic text-[#333] text-[15.582px] text-center top-[21px] whitespace-nowrap">직접견적내기</p>
    </div>
  );
}

function TabBar() {
  return (
    <div className="absolute h-[83px] left-0 top-[729px] w-[375px]" data-name="Tab Bar">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#d22727] h-[56px] left-[calc(50%-93.5px)] top-[calc(50%-13.5px)] w-[188px]" />
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[normal] left-[calc(50%-136.5px)] not-italic text-[15.582px] text-white top-[calc(50%-20.74px)] whitespace-nowrap">상담접수하기</p>
      <Frame />
      <div className="absolute bg-black inset-[84.34%_32%_9.64%_32%] rounded-[10px]" data-name="Shape" />
    </div>
  );
}

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

function Frame1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7px] items-end leading-[normal] left-[246.86px] not-italic text-right top-[585px] w-[116.138px]">
      <p className="font-['Pretendard:Bold',sans-serif] min-w-full relative shrink-0 text-[#d22727] text-[14px] w-[min-content]">창호 제조 업력</p>
      <p className="font-['Pretendard:ExtraBold',sans-serif] relative shrink-0 text-[30px] text-white w-[156px]">30년</p>
      <p className="font-['Pretendard:Bold',sans-serif] min-w-full relative shrink-0 text-[#d22727] text-[14px] w-[min-content]">국내 최대 제조 공장</p>
      <p className="font-['Pretendard:ExtraBold',sans-serif] relative shrink-0 text-[30px] text-white w-[156px]">38,000평</p>
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-white relative size-full" data-name="메인페이지">
      <div className="absolute h-[686px] left-[-3px] top-[44px] w-[378px]">
        <div className="absolute backdrop-blur-[50px] inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-full left-[-118.15%] max-w-none top-0 w-[256.42%]" src={imgRectangle4} />
        </div>
      </div>
      <div className="absolute backdrop-blur-[2px] bg-[rgba(20,20,20,0.9)] h-[687px] left-0 top-[44px] w-[375px]" />
      <TabBar />
      <StatusBar />
      <div className="-translate-x-1/2 absolute font-['Pretendard:Bold',sans-serif] font-['Pretendard:ExtraBold',sans-serif] leading-[0] left-[186.4px] not-italic text-[#d22727] text-[0px] text-[30.969px] text-center top-[290px] whitespace-nowrap">
        <p className="mb-0">
          <span className="leading-[44.428px]">{`창호 교체, `}</span>
          <span className="leading-[44.428px] text-white">이제</span>
        </p>
        <p className="leading-[44.428px] mb-0 text-white">믿을 수 있는 곳에서</p>
        <p className="leading-[44.428px] text-white">한번에 끝내세요.</p>
      </div>
      <Frame1 />
    </div>
  );
}