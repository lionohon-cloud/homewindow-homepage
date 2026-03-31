import svgPaths from "./svg-ln9efff4u1";
import imgImage5 from "figma:asset/a2d5d52d293483dbe37645b6f1a429cad0268c8a.png";

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

function Frame() {
  return (
    <div className="absolute left-[295px] size-[57px] top-[274px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 57 57">
        <g id="Frame 10">
          <circle cx="28.5" cy="28.5" fill="var(--fill-0, white)" id="Ellipse 3" r="18" stroke="var(--stroke-0, #333333)" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute left-[295px] size-[57px] top-[343px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 57 57">
        <g id="Frame 12" opacity="0.85">
          <circle cx="28.5" cy="28.5" fill="var(--fill-0, #F1FFE9)" id="Ellipse 4" r="18" stroke="var(--stroke-0, #999999)" />
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute left-[295px] size-[57px] top-[412px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 57 57">
        <g id="Frame 14" opacity="0.85">
          <circle cx="28.5" cy="28.5" fill="var(--fill-0, #F2F2F2)" id="Ellipse 5" r="18" stroke="var(--stroke-0, #999999)" />
        </g>
      </svg>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute left-[305px] size-[37px] top-[491px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 37 37">
        <g id="Group 9" opacity="0.85">
          <mask height="37" id="mask0_1_510" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="37" x="0" y="0">
            <circle cx="18.5" cy="18.5" fill="var(--fill-0, white)" id="Ellipse 6" r="18.5" />
          </mask>
          <g mask="url(#mask0_1_510)">
            <g id="Group 8" opacity="0.6">
              <line id="Line 1" stroke="var(--stroke-0, black)" x1="-3.5" x2="-3.5" y1="-15" y2="44" />
              <line id="Line 2" stroke="var(--stroke-0, black)" x1="1.5" x2="1.5" y1="-15" y2="44" />
              <line id="Line 3" stroke="var(--stroke-0, black)" x1="6.5" x2="6.5" y1="-15" y2="44" />
              <line id="Line 4" stroke="var(--stroke-0, black)" x1="11.5" x2="11.5" y1="-15" y2="44" />
              <line id="Line 5" stroke="var(--stroke-0, black)" x1="16.5" x2="16.5" y1="-15" y2="44" />
              <line id="Line 6" stroke="var(--stroke-0, black)" x1="21.5" x2="21.5" y1="-15" y2="44" />
              <line id="Line 7" stroke="var(--stroke-0, black)" x1="26.5" x2="26.5" y1="-15" y2="44" />
              <line id="Line 8" stroke="var(--stroke-0, black)" x1="31.5" x2="31.5" y1="-15" y2="44" />
              <line id="Line 9" stroke="var(--stroke-0, black)" x1="36.5" x2="36.5" y1="-15" y2="44" />
              <line id="Line 10" stroke="var(--stroke-0, black)" x1="41.5" x2="41.5" y1="-15" y2="44" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function P() {
  return (
    <div className="bg-white relative size-full" data-name="p4">
      <div className="absolute h-[452px] left-[16px] top-[263px] w-[344px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="Rectangle 9" />
        </svg>
      </div>
      <StatusBar />
      <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[normal] left-[30px] not-italic text-[#999] text-[16px] top-[74px] whitespace-nowrap">유리 컬러</p>
      <div className="absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[30px] not-italic text-[#999] text-[16px] top-[191px] w-[312px]">
        <p className="mb-0">채광과 프라이버시, 두 가지 모두 놓칠 수 없다면 공간의 쓰임새에 맞게 컬러를 선택하실 수 있습니다.</p>
        <p>&nbsp;</p>
      </div>
      <div className="absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[28px] not-italic text-[#999] text-[16px] top-[648px] w-[320px] whitespace-pre-wrap">
        <p className="mb-0">{`따스한 햇살을 집 안 깊숙이 그대로 받아들여, 언제나 밝고 화사하게 만들어 줍니다. `}</p>
        <p>&nbsp;</p>
      </div>
      <div className="-translate-x-1/2 absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[188px] not-italic text-[#999] text-[14px] text-center top-[559px] w-[320px]">
        <p className="mb-0">*우측을 터치 하시면 컬러를 미리 볼 수 있습니다</p>
        <p>&nbsp;</p>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[24px] left-[28px] not-italic text-[#333] text-[18px] top-[605px] w-[320px]">투명 유리</p>
      <p className="absolute font-['Pretendard:ExtraBold',sans-serif] leading-[0] left-[30px] not-italic text-[#333] text-[28px] top-[107px] whitespace-nowrap">
        <span className="leading-[35px]">
          빛은 들이고 시선은 막아주는
          <br aria-hidden="true" />
        </span>
        <span className="leading-[35px] text-[#d22727]">유리 컬러</span>
      </p>
      <div className="absolute left-[31px] rounded-[10px] shadow-[5px_5px_5px_0px_rgba(0,0,0,0.25)] size-[254px] top-[284px]" data-name="image 5">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgImage5} />
      </div>
      <Frame />
      <Frame1 />
      <Frame2 />
      <Group />
      <div className="absolute left-[305px] size-[37px] top-[491px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 37 37">
          <circle cx="18.5" cy="18.5" id="Ellipse 7" opacity="0.85" r="18" stroke="var(--stroke-0, #999999)" />
        </svg>
      </div>
      <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[311px] not-italic text-[#333] text-[14px] top-[322px] whitespace-nowrap">투명</p>
      <p className="-translate-x-1/2 absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[323.5px] not-italic opacity-90 text-[#999] text-[14px] text-center top-[391px] whitespace-nowrap">그린</p>
      <p className="-translate-x-1/2 absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[323.5px] not-italic opacity-90 text-[#999] text-[14px] text-center top-[460px] whitespace-nowrap">미스트</p>
      <p className="-translate-x-1/2 absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[323.5px] not-italic opacity-85 text-[#999] text-[14px] text-center top-[529px] whitespace-nowrap">모루</p>
      <div className="absolute h-0 left-[26px] top-[639px] w-[326px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 326 1">
            <line id="Line 11" stroke="var(--stroke-0, #333333)" x2="326" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}