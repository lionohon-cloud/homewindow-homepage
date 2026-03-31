import svgPaths from "./svg-ibpbq0byiu";
import imgImage12 from "figma:asset/cc2abc5bda7f48bff9dc8dfbe71d3b6eb3c91434.png";
import imgImage6 from "figma:asset/3b1157dd45dc72ad32f60044aab9618df6d2c76c.png";
import imgImage7 from "figma:asset/e0f4ff7fa950d8e765f02349c57ace4d0b0c30c0.png";
import imgImage14 from "figma:asset/32710f238ff0fe260249d080347a708872d3dbc3.png";
import imgImage8 from "figma:asset/cb6834247a37a7cd38d04ac9b9706f392e51bff9.png";

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
    <div className="bg-white relative size-full" data-name="p5">
      <div className="absolute h-[452px] left-[16px] top-[263px] w-[344px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="Rectangle 9" />
        </svg>
      </div>
      <StatusBar />
      <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[normal] left-[30px] not-italic text-[#999] text-[16px] top-[74px] whitespace-nowrap">유리 두께</p>
      <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[normal] left-[30px] not-italic text-[#999] text-[16px] top-[1002px] whitespace-nowrap">로이 유리</p>
      <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[normal] left-[30px] not-italic text-[#999] text-[16px] top-[2454px] whitespace-nowrap">수퍼더블로이 유리</p>
      <div className="absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[30px] not-italic text-[#999] text-[16px] top-[191px] w-[312px]">
        <p className="mb-0">한장의 유리로는 막을 수 없는 추위와 열기. 최적의 복층 유리 설계로 우리 집의 온도를 지켜줍니다.</p>
        <p>&nbsp;</p>
      </div>
      <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[30px] not-italic text-[#999] text-[16px] top-[1119px] w-[312px]">{`눈에 보이지 않는 얇은 코팅 한 겹이 10년 뒤 우리 집 관리비의 큰 차이를 만듭니다. `}</p>
      <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[30px] not-italic text-[#999] text-[16px] top-[2571px] w-[312px]">두 겹의 은(Silver) 코팅으로 단열의 한계를 뛰어넘었습니다. 여름엔 더 시원하고 겨울엔 더 따뜻한 프리미엄의 차이를 경험해 보십시오.</p>
      <div className="absolute h-[322px] left-[-5px] top-[1177px] w-[386px]" data-name="image 12">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage12} />
      </div>
      <div className="absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[16px] not-italic text-[#999] text-[16px] top-[511px] whitespace-nowrap">
        <p className="mb-0">과거 20년 이상 노후 아파트</p>
        <p>&nbsp;</p>
      </div>
      <div className="-translate-x-1/2 absolute font-['Pretendard:Bold',sans-serif] leading-[22px] left-[272px] not-italic text-[#333] text-[16px] text-center top-[541px] whitespace-nowrap">
        <p className="mb-0">청암홈윈도우 기본 유리</p>
        <p className="mb-0">(복층유리)</p>
        <p>&nbsp;</p>
      </div>
      <p className="absolute font-['Pretendard:ExtraBold',sans-serif] leading-[0] left-[30px] not-italic text-[#333] text-[28px] top-[107px] whitespace-nowrap">
        <span className="leading-[35px]">
          한 장의 유리와는 차원이 다른
          <br aria-hidden="true" />
        </span>
        <span className="leading-[35px] text-[#d22727]">복층 유리</span>
      </p>
      <div className="absolute font-['Pretendard:ExtraBold',sans-serif] leading-[0] left-[30px] not-italic text-[#333] text-[28px] top-[1035px] whitespace-nowrap">
        <p className="leading-[35px] mb-0">사계절 냉난방비 걱정을</p>
        <p>
          <span className="leading-[35px]">{`덜어주는 마법, `}</span>
          <span className="leading-[35px] text-[#d22727]">로이유리</span>
        </p>
      </div>
      <div className="absolute font-['Pretendard:ExtraBold',sans-serif] leading-[35px] left-[30px] not-italic text-[#333] text-[28px] top-[2487px] whitespace-nowrap">
        <p className="mb-0">프리미엄의 완성</p>
        <p className="text-[#d22727]">수퍼더블로이</p>
      </div>
      <div className="absolute h-[191px] left-[40px] top-[312px] w-[75px]" data-name="image 6">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage6} />
      </div>
      <div className="absolute h-[246px] left-[210px] top-[283px] w-[126px]" data-name="image 7">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage7} />
      </div>
      <div className="absolute font-['Pretendard:Medium',sans-serif] leading-[0] left-[30px] not-italic text-[#999] text-[0px] text-[16px] top-[646px] w-[320px] whitespace-pre-wrap">
        <p className="mb-0">
          <span className="leading-[24px]">{`옛날 집에서 흔히 보던 한 장짜리(단유리)는 바깥의 찬 공기를 그대로 집 안으로 들여보냅니다. 청암홈윈도우는 두 장의 유리 사이에 공기층을 가둔 '`}</span>
          <span className="font-['Pretendard:Bold',sans-serif] leading-[24px] not-italic text-[#333]">복층</span>
          <span className="font-['Pretendard:Bold',sans-serif] leading-[24px] not-italic text-[#333]">{` 유`}</span>
          <span className="font-['Pretendard:Bold',sans-serif] leading-[24px] not-italic text-[#333]">리</span>
          <span className="leading-[24px]">{`'를 `}</span>
          <span className="font-['Pretendard:Bold',sans-serif] leading-[24px] not-italic text-[#333]">기본으로 적용</span>
          <span className="leading-[24px]">{`하여 밖으로 새어나가는 열을 잡아줍니다. `}</span>
        </p>
        <p className="leading-[24px] mb-0">&nbsp;</p>
        <p className="mb-0">
          <span className="font-['Pretendard:Bold',sans-serif] leading-[24px] not-italic text-[#333]">22mm, 24mm, 26mm</span>
          <span className="leading-[24px]">는 공간의 용도와 창의 크기에 맞춰 계산된 두께입니다. 발코니부터 실내 방창까지, 고객님의 주거 환경에 딱 맞는 맞춤 두께를 적용해 빈틈없는 따뜻함을 선사합니다.</span>
        </p>
        <p className="leading-[24px]">&nbsp;</p>
      </div>
      <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[0] left-[30px] not-italic text-[#999] text-[16px] top-[1574px] w-[320px]">
        <span className="leading-[24px]">유리 안쪽에 눈에 보이지 않는 아주 얇은</span>
        <span className="font-['Pretendard:Bold',sans-serif] leading-[24px] text-[#333]">{` '은(Silver)'을 코팅`}</span>
        <span className="leading-[24px]">{`하여 `}</span>
        <span className="font-['Pretendard:Bold',sans-serif] leading-[24px] text-[#333]">단열 성능을 획기적으로 높인 기능성 유리</span>
        <span className="leading-[24px]">{`입니다. 이 은 코팅이 마치 '투명한 거울'처럼 작동하여, 집 안의 열이 밖으로 빠져나가지 못하게 다시 실내로 튕겨내는 역할을 합니다.`}</span>
      </p>
      <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[0] left-[30px] not-italic text-[#999] text-[16px] top-[3050px] w-[320px]">
        <span className="font-['Pretendard:Bold',sans-serif] leading-[24px] text-[#333]">2겹의 은(Silver) 코팅막</span>
        <span className="leading-[24px]">{`으로 기존 싱글로이 대비 단열 성능 향상과 더불어 `}</span>
        <span className="font-['Pretendard:Bold',sans-serif] leading-[24px] text-[#333]">태양열 및 자외선 차단 기능이 향상</span>
        <span className="leading-[24px]">되었습니다. 또한 실내가 어두워지는 단점을 보완해, 자연광을 최대한 유입시켜 밝고 화사한 공간을 완성합니다.</span>
      </p>
      <p className="absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[144px] not-italic text-[#999] text-[16px] top-[1966px] whitespace-nowrap">일반 복층 유리</p>
      <div className="absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[22px] not-italic text-[#999] text-[14px] top-[2246px] w-[328px] whitespace-pre-wrap">
        <p className="mb-0">{`※ 참고: 본 비교 데이터는 26mm 복층 유리 기준입니다.  `}</p>
        <p>콘크리트 벽 두께는 콘크리트 열전도율(1.8W/m·K, 표면저항 제외)을 기준으로 환산한 수치이며, 열관류율은 수치가 낮을수록 단열 성능이 우수합니다.</p>
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[24px] left-[142px] not-italic text-[#333] text-[16px] top-[2204px] whitespace-nowrap">싱글 복층 유리</p>
      <div className="absolute h-[177px] left-[44px] top-[2008px] w-[288px]" data-name="image 14">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage14} />
      </div>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[24px] left-[30px] not-italic text-[#333] text-[18px] top-[615px] w-[320px]">집의 아늑함을 결정하는 복층유리</p>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[24px] left-[30px] not-italic text-[#333] text-[18px] top-[1543px] w-[320px]">로이(Low-E) 유리란 무엇인가요?</p>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[24px] left-[30px] not-italic text-[#333] text-[18px] top-[3019px] w-[320px]">수퍼더블로이유리란 무엇인가요?</p>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[24px] left-[30px] not-italic text-[#333] text-[18px] top-[3247px] w-[320px]">수퍼더블로이유리 VS 싱글로이 비교</p>
      <p className="absolute font-['Pretendard:Bold',sans-serif] leading-[24px] left-[30px] not-italic text-[#333] text-[18px] top-[1739px] w-[320px]">일반 유리 대비 로이유리의 효과</p>
      <div className="absolute flex h-[32px] items-center justify-center left-[141px] top-[387px] w-[49px]">
        <div className="-scale-y-100 flex-none">
          <div className="h-[32px] relative w-[49px]" data-name="image 8">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage8} />
          </div>
        </div>
      </div>
      <div className="absolute bg-[#eee] h-[201px] left-[30px] rounded-[5px] top-[3444px] w-[316px]" />
    </div>
  );
}