import imgRectangle3 from "figma:asset/e24e47bb4b16e8b7b1d2a3b1ac9f35c4ddf8adf9.png";

function Frame() {
  return (
    <div className="bg-[#d22727] h-[44px] relative shrink-0 w-full">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center pb-[15px] pt-[14px] px-[120px] relative size-full">
          <p className="font-['Pretendard:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[22.68px] text-center text-white whitespace-nowrap">AFTER</p>
        </div>
      </div>
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full">
      <div className="h-[233px] relative shrink-0 w-full">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgRectangle3} />
      </div>
      <Frame />
    </div>
  );
}