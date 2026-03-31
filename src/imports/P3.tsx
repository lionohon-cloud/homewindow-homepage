import svgPaths from "./svg-ftc6w4ic0b";
import img1 from "figma:asset/39019c51fb35d693198efef4d7e8cca5c84f47f2.png";

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

export default function P() {
  return (
    <div className="bg-white relative size-full" data-name="p3">
      <StatusBar />
      <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[normal] left-[30px] not-italic text-[#999] text-[16px] top-[74px] whitespace-nowrap">{`프로파일 & 보강재`}</p>
      <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[30px] not-italic text-[#999] text-[16px] top-[191px] w-[318px]">{`겉모습은 흉내 낼 수 있어도 속까지 같을 수는 없습니다. `}</p>
      <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[28px] not-italic text-[#999] text-[16px] top-[813px] w-[320px]">{`단열이 뛰어난 PVC 창틀 내부에는 무거운 복층 유리의 하중을 버티고, 거센 태풍의 비바람(풍압)을 이겨내기 위한 보강재가 반드시 들어가야 합니다. `}</p>
      <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[28px] not-italic text-[#999] text-[16px] top-[656px] w-[320px]">프로파일 내부에는 여러 개의 빈 공간(격실)이 나뉘어 있습니다. 이 촘촘한 격실 구조가 외부의 냉기가 실내로 들어오는 것을 철저하게 막아주어, 냉난방비를 획기적으로 줄여줍니다.</p>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[24px] left-[28px] not-italic text-[#333] text-[18px] top-[782px] w-[320px]">보강재의 중요성</p>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[24px] left-[28px] not-italic text-[#333] text-[18px] top-[625px] w-[320px]">프로파일의 중요성</p>
      <div className="absolute font-['Pretendard:ExtraBold',sans-serif] leading-[0] left-[30px] not-italic text-[#333] text-[28px] top-[107px] whitespace-nowrap">
        <p className="leading-[35px] mb-0">흔들림 없는 창호의 뼈대</p>
        <p>
          <span className="leading-[35px] text-[#d22727]">{`프로파일 &`}</span>
          <span className="leading-[35px]">{` `}</span>
          <span className="leading-[35px] text-[#d22727]">보강재</span>
        </p>
      </div>
      <div className="absolute h-[321px] left-[20px] top-[255px] w-[336px]" data-name="보강재 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[113.11%] left-[-0.04%] max-w-none top-[-6.56%] w-[100.07%]" src={img1} />
        </div>
      </div>
    </div>
  );
}