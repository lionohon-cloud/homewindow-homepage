import imgRectangle1 from "figma:asset/77c9545bdd5bfc576a2227956e537cb57564b88c.png";

function Frame() {
  return (
    <div className="bg-white h-[44px] relative shrink-0 w-full">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center pb-[21px] pt-[20px] px-[132px] relative size-full">
          <p className="font-['Pretendard:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#d22727] text-[22.68px] whitespace-nowrap">BEFORE</p>
        </div>
      </div>
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full">
      <div className="h-[233px] relative shrink-0 w-full">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-full left-[0.21%] max-w-none top-0 w-[99.58%]" src={imgRectangle1} />
        </div>
      </div>
      <Frame />
    </div>
  );
}