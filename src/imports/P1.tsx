import svgPaths from "./svg-tmazeetorn";
import imgRectangle6 from "figma:asset/62e80a07fe09f7c67b19b27a2756f537d3580612.png";
import imgRectangle7 from "figma:asset/36f2636135c2b0d3902c5fdaf3bb85ce8a4933a3.png";
import imgRectangle8 from "figma:asset/1b594842be2f39dbf04c5356be99b8a6c04fa3c3.png";

function Frame1() {
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
      <Frame1 />
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

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <p className="col-1 font-['Pretendard:Medium',sans-serif] leading-[24px] ml-px mt-[238px] not-italic relative row-1 text-[#333] text-[16px] text-center whitespace-nowrap">한국토지주택공사 격려장</p>
      <div className="col-1 h-[228px] ml-0 mt-0 pointer-events-none relative rounded-[9px] row-1 w-[160px]">
        <div className="absolute inset-0 overflow-hidden rounded-[9px]">
          <img alt="" className="absolute h-full left-[-1.56%] max-w-none top-0 w-[103.13%]" src={imgRectangle6} />
        </div>
        <div aria-hidden="true" className="absolute border border-[#999] border-solid inset-[-1px] rounded-[10px] shadow-[0px_4px_9.3px_0px_rgba(0,0,0,0.25)]" />
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-center relative shrink-0 w-[159px]">
      <div className="h-[228px] pointer-events-none relative rounded-[9px] shrink-0 w-full">
        <div className="absolute inset-0 overflow-hidden rounded-[9px]">
          <img alt="" className="absolute h-full left-[-1.56%] max-w-none top-0 w-[103.13%]" src={imgRectangle7} />
        </div>
        <div aria-hidden="true" className="absolute border border-[#999] border-solid inset-[-1px] rounded-[10px] shadow-[0px_4px_9.3px_0px_rgba(0,0,0,0.25)]" />
      </div>
      <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#333] text-[16px] text-center w-full">국토교통부장관 표창장</p>
    </div>
  );
}

function Group1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <p className="col-1 font-['Pretendard:Medium',sans-serif] leading-[24px] ml-[6px] mt-[238px] not-italic relative row-1 text-[#333] text-[16px] text-center whitespace-nowrap">한국일보 히트상품 선정</p>
      <div className="col-1 h-[228px] ml-0 mt-0 pointer-events-none relative rounded-[9px] row-1 w-[160px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[9px] size-full" src={imgRectangle8} />
        <div aria-hidden="true" className="absolute border border-[#999] border-solid inset-[-1px] rounded-[10px] shadow-[0px_4px_9.3px_0px_rgba(0,0,0,0.25)]" />
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute content-stretch flex gap-[19px] items-center justify-center left-[30px] top-[322px]">
      <Group />
      <Frame />
      <Group1 />
    </div>
  );
}

export default function P() {
  return (
    <div className="bg-white relative size-full" data-name="p1">
      <TabBar />
      <StatusBar />
      <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[normal] left-[30px] not-italic text-[#999] text-[16px] top-[74px] whitespace-nowrap">믿을 수 있습니다</p>
      <div className="absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[30px] not-italic text-[#999] text-[16px] top-[191px] whitespace-nowrap">
        <p className="mb-0">어느 업체나 스스로 좋다고 말합니다.</p>
        <p>청암홈윈도우는 국가와 소비자가 증명합니다.</p>
      </div>
      <div className="absolute font-['Pretendard:Bold',sans-serif] font-['Pretendard:ExtraBold',sans-serif] leading-[35px] left-[30px] not-italic text-[#d22727] text-[28px] top-[107px] whitespace-nowrap">
        <p className="mb-0 text-[#333]">국가와 소비자가 인정한</p>
        <p>청암홈윈도우</p>
      </div>
      <Frame2 />
    </div>
  );
}