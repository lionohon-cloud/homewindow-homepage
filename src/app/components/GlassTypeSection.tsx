import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MoveHorizontal, X } from "lucide-react";
import imgImage12 from "figma:asset/cc2abc5bda7f48bff9dc8dfbe71d3b6eb3c91434.png";
import imgImage6 from "figma:asset/3b1157dd45dc72ad32f60044aab9618df6d2c76c.png";
import imgImage7 from "figma:asset/e0f4ff7fa950d8e765f02349c57ace4d0b0c30c0.png";
import imgImage14 from "figma:asset/32710f238ff0fe260249d080347a708872d3dbc3.png";
import imgImage8 from "figma:asset/cb6834247a37a7cd38d04ac9b9706f392e51bff9.png";
import imgSuperDoubleLowE from "figma:asset/cdf81efc109f940f4483e8334c254537fd87b759.png";
import imgGlassAr from "figma:asset/d1c197b5bf2818d6c9fddc478372124f55f5bdfd.png";
import imgEmaxClub from "figma:asset/2a612fa0c53997d34d4f031cc6c6db951df1ee1b.png";
import imgAluminumSpacer from "figma:asset/2de60d93c48b0b8aa548511e364caf6dd2f4b332.png";
import imgTPSSpacer from "figma:asset/77133ee935633e4236cca5543a6173c740010940.png";
import imgImage5 from "figma:asset/a2d5d52d293483dbe37645b6f1a429cad0268c8a.png";
import imgArrow from "figma:asset/51bbc1bf9a077f22c67c427f30c9e8a43913f863.png";

const windowViewImg = "https://images.unsplash.com/photo-1758706552616-730074257a61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kb3clMjBkYXl0aW1lJTIwYnJpZ2h0JTIwbGFuZHNjYXBlfGVufDF8fHx8MTc3NDIyMzkwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

type GlassColor = "투명" | "그린" | "미스트" | "모루";

const glassOptions: Record<GlassColor, { title: string; desc: string; previewClass: string }> = {
  투명: {
    title: "투명 유리",
    desc: "따스한 햇살을 집 안 깊숙이 그대로 받아들여, 언제나 밝고 화사하게 만들어 줍니다.",
    previewClass: "bg-transparent",
  },
  그린: {
    title: "그린 유리",
    desc: "은은한 그린 톤이 눈의 피로를 덜어주고 실내 공간에 생기를 더해줍니다.",
    previewClass: "bg-[#F1FFE9]/30 backdrop-hue-rotate-15",
  },
  미스트: {
    title: "미스트 유리",
    desc: "외부의 시선을 부드럽게 차단하여 프라이버시를 보호하면서도 채광은 유지합니다.",
    previewClass: "backdrop-blur-md bg-white/20",
  },
  모루: {
    title: "모루 유리",
    desc: "세로 패턴의 불투명 유리가 감각적인 인테리어 효과와 함께 시선 차단 효과를 줍니다.",
    previewClass: "backdrop-blur-sm bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(255,255,255,0.3)_4px,rgba(255,255,255,0.3)_8px)]",
  },
};

const glassOrder: GlassColor[] = ["투명", "그린", "미스트", "모루"];

function BeforeAfterSlider() {
  const [position, setPosition] = useState(50);
  
  return (
    <div className="relative w-full h-[250px] md:h-[350px] rounded-xl overflow-hidden shadow-lg border border-[#eee] touch-none mb-4">
      {/* Base Layer: Single Film (15%) - Very Dark */}
      <div className="absolute inset-0 flex">
        <img src={windowViewImg} alt="어두운 실내" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute right-4 bottom-4 z-10 text-white text-right drop-shadow-md">
          <p className="text-[12px] md:text-[14px] opacity-80">차량용 썬팅필름</p>
          <p className="text-[20px] md:text-[24px] font-bold">15%</p>
        </div>
      </div>
      
      {/* Overlay Layer: Super Double (68%) - Brighter */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)` }}
      >
        <img src={windowViewImg} alt="밝은 실내" className="absolute inset-0 w-full h-full object-cover" style={{ width: '100%', height: '100%', objectFit: 'cover', maxWidth: 'none' }} loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute left-4 bottom-4 z-10 text-white drop-shadow-md">
          <p className="text-[12px] md:text-[14px] opacity-80">수퍼더블로이</p>
          <p className="text-[20px] md:text-[24px] font-bold">68%</p>
        </div>
      </div>

      {/* Slider Divider Line */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize drop-shadow-sm"
        style={{ left: `calc(${position}% - 2px)` }}
      >
        {/* Custom Thumb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center justify-center pointer-events-none">
          <MoveHorizontal size={20} color="#d22727" />
        </div>
      </div>
      
      {/* Invisible Input for dragging */}
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 m-0 p-0"
      />
    </div>
  );
}

export function GlassTypeSection() {
  const [isLowEModalOpen, setIsLowEModalOpen] = useState(false);
  const [isGlassColorOpen, setIsGlassColorOpen] = useState(false);
  const [selected, setSelected] = useState<GlassColor>("투명");
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play effect for glass color
  useEffect(() => {
    if (!isAutoPlaying || !isGlassColorOpen) return;

    const timer = setInterval(() => {
      setSelected((prev) => {
        const currentIndex = glassOrder.indexOf(prev);
        const nextIndex = (currentIndex + 1) % glassOrder.length;
        return glassOrder[nextIndex];
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, isGlassColorOpen]);

  // When user clicks a color manually, we stop the autoplay
  const handleColorClick = (color: GlassColor) => {
    setSelected(color);
    setIsAutoPlaying(false);
  };

  // 모달이 열렸을 때 body 스크롤 막기
  useEffect(() => {
    if (isLowEModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLowEModalOpen]);

  return (
    <div className="w-full bg-white flex flex-col items-center">
      {/* 1. 복층 유리 섹션 */}
      <section className="py-24 w-full max-w-screen-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          className="px-6 md:px-10 mb-12"
        >
          <p className="text-[#999] text-[16px] font-medium mb-3">단열 유리 <span className="text-[14px] text-[#bbb]">*아르곤 가스는 등급별 상이</span></p>
          <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] mb-5 break-keep">단열을 위한 고성능 유리<br/><span className="text-[#d22727]">전 제품 적용</span></h2>
          <p className="text-[#999] text-[16px] md:text-[18px] leading-[26px] break-keep">아르곤 가스, TPS 단열 간봉의 결합. 사계절 내내 쾌적한 온도를 유지합니다.</p>
        </motion.div>

        {/* 복층유리 일러스트레이션 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.6 }}
          className="px-6 md:px-10 mb-14"
        >
          <div className="flex items-center justify-between mt-8 mb-6">
            
            
            <div className="w-[30px] md:w-[40px] flex-shrink-0 flex justify-center">
              
            </div>

            
          </div>

          {/* 아르곤가스 유리마킹 이미지 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8"
          >
            <h3 className="text-[#333] text-[18px] md:text-[20px] font-bold mb-4">LX글라스, KCC글라스 정품 자재 사용</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-3">
              <div className="w-full max-w-[320px] md:max-w-[400px]">
                <img src={imgGlassAr} alt="아르곤가스 유리마킹" className="w-full h-auto object-contain rounded-lg" loading="lazy" decoding="async" />
              </div>
              
              {/* HOME WINDOW e·MAX Club 인증 로고 */}
              <div className="w-full max-w-[320px] md:max-w-[400px]">
                <img src={imgEmaxClub} alt="HOME WINDOW e·MAX Club 인증 로고" className="w-full h-auto object-contain" loading="lazy" decoding="async" />
              </div>
            </div>
            
            <p className="text-[#999] text-[12px] md:text-[13px] text-center">*청암홈윈도우는 중국산 저가 유리를 사용하지 않습니다.</p>

            {/* 간봉 비교 이미지 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-200px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10"
            >
              <div className="flex items-start justify-center gap-2 md:gap-4">
                {/* 알루미늄 간봉 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0 }}
                  className="flex-1 max-w-[128px] md:max-w-[160px]"
                >
                  <div className="w-full mb-3">
                    <img src={imgAluminumSpacer} alt="알루미늄 간봉" className="w-full h-auto object-contain rounded-lg" loading="lazy" decoding="async" />
                  </div>
                  <p className="text-[#999] text-center font-medium text-[16px]">알루미늄 간봉</p>
                </motion.div>

                {/* 화살표 */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex items-center justify-center w-[40px] md:w-[50px] flex-shrink-0 mt-[62px]"
                >
                  <img src={imgArrow} alt="arrow" className="w-full h-auto object-contain" loading="lazy" decoding="async" />
                </motion.div>

                {/* TPS단열 간봉 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex-1 max-w-[160px] md:max-w-[200px]"
                >
                  <div className="w-full mb-3">
                    <img src={imgTPSSpacer} alt="TPS단열 간봉" className="w-full h-auto object-contain rounded-lg" loading="lazy" decoding="async" />
                  </div>
                  <p className="text-[#d22727] text-center font-bold text-[16px]">TPS단열 간봉</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          className="px-6 md:px-10"
        >
          <h3 className="text-[#333] text-[18px] md:text-[20px] font-bold mb-4">집의 아늑함을 결정하는 단열의 핵심</h3>
          <div className="text-[#999] text-[16px] md:text-[17px] leading-[26px] break-keep space-y-4">
            <p>유리 사이에는 일반 공기보다 무거운<span className="font-bold text-[#333]"> '아르곤(Ar) 가스'</span>를 주입해 열 이동을 차단하고, 가장자리는 특수 단열 소재인 <span className="font-bold text-[#333]">'TPS 단열 간봉'</span>으로 열 손실을 막아줍니다.</p>
          </div>

          {/* 유리 컬러 아코디언 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            className="mt-8 border-2 border-[#eaeaea] rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setIsGlassColorOpen(!isGlassColorOpen)}
              className="w-full flex items-center justify-between transition-all duration-300 hover:bg-[#d22727]/5 px-[20px] py-[14px] hover:cursor-pointer"
            >
              <h3 className="text-[#d22727] font-bold text-[16px]">공간에 맞는 유리컬러 확인하기</h3>
              <motion.span
                animate={{ rotate: isGlassColorOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-[#d22727] font-bold origin-center flex-shrink-0 ml-2 text-[16px]"
              >
                ▶
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isGlassColorOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t-2 border-[#eaeaea] p-6 md:p-8 space-y-8">
                    {/* Interactive Preview */}
                    <div className="flex flex-col items-center gap-8">
                      <div className="relative w-full aspect-square md:aspect-video max-w-[500px] rounded-[10px] shadow-[5px_5px_15px_rgba(0,0,0,0.15)] overflow-hidden">
                        {/* Base Image */}
                        <img src={imgImage5} alt="Glass preview" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                        {/* Glass Overlay Effect */}
                        <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${glassOptions[selected].previewClass} rounded-[10px]`} />
                      </div>

                      <div className="flex justify-center gap-4 md:gap-6 w-full">
                        {(Object.keys(glassOptions) as GlassColor[]).map((color) => {
                          const isSelected = selected === color;
                          return (
                            <button 
                              key={color} 
                              onClick={() => handleColorClick(color)}
                              className="flex flex-col items-center gap-3 outline-none group"
                            >
                              <div className={`w-[54px] h-[54px] md:w-[64px] md:h-[64px] rounded-full border-[2px] transition-all duration-300 flex items-center justify-center overflow-hidden relative ${isSelected ? 'border-[#333] scale-110' : 'border-[#e0e0e0] scale-100 group-hover:border-[#999]'}`}>
                                {color === '투명' && <div className="w-full h-full bg-white" />}
                                {color === '그린' && <div className="w-full h-full bg-[#F1FFE9]" />}
                                {color === '미스트' && <div className="w-full h-full bg-[#F2F2F2]" />}
                                {color === '모루' && (
                                  <div className="w-full h-full bg-white overflow-hidden flex justify-center">
                                    <div className="w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]" />
                                  </div>
                                )}
                              </div>
                              <span className={`text-[14px] md:text-[15px] transition-colors ${isSelected ? 'text-[#333] font-bold' : 'text-[#999] font-medium'}`}>{color}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-center text-[#999] text-[14px] md:text-[15px] font-medium">
                      *컬러를 터치하시면 옵션을 미리 볼 수 있습니다
                    </p>

                    {/* Selected Description */}
                    <div className="border-t border-[#333] pt-6 min-h-[140px]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selected}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h3 className="text-[#333] text-[18px] md:text-[20px] font-bold mb-4">{glassOptions[selected].title}</h3>
                          <p className="text-[#999] text-[16px] md:text-[17px] leading-[26px] break-keep">
                            {glassOptions[selected].desc}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. 수퍼더블로이 유리 섹션 */}
      <section className="py-24 w-full bg-white">
        <div className="max-w-screen-md mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            className="px-6 md:px-10 mb-12"
          >
            <p className="text-[#999] text-[16px] font-medium mb-3">수퍼더블로이 유리</p>
            <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] mb-5 break-keep">프리미엄의 완성<br/><span className="text-[#d22727]">LX 수퍼더블로이</span></h2>
            <div className="mb-5"><span className="inline-block bg-white border-1 border-[#aaa] text-[#d22727] text-[12px] md:text-[13px] px-3 py-1.5 rounded-full"><span className="font-semibold">프레스티지 기본 적용</span></span></div>
            <p className="text-[#999] text-[16px] md:text-[18px] leading-[26px] break-keep">
              두 겹의 은(Silver) 코팅으로 단열의 한계를 뛰어넘었습니다. 여름엔 더 시원하고 겨울엔 더 따뜻한 프리미엄의 차이를 경험해 보십시오.
            </p>
          </motion.div>

          <div className="px-6 md:px-10 space-y-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-200px" }}
            >
              {/* 수퍼더블로이 이미지 */}
              <div className="w-full max-w-[300px] md:max-w-[400px] mx-auto mb-6">
                <img src={imgSuperDoubleLowE} alt="수퍼더블로이유리 원리" className="w-full h-auto object-contain" loading="lazy" decoding="async" />
              </div>
              
              <h3 className="text-[#333] text-[18px] md:text-[20px] font-bold mb-4">LX 수퍼더블로이란 무엇인가요?</h3>
              
              <p className="text-[#999] text-[16px] md:text-[17px] leading-[26px] break-keep">
                <span className="font-bold text-[#333]">2겹의 은(Silver) 코팅막</span>으로 기존 <span 
                  onClick={() => setIsLowEModalOpen(true)}
                  className="font-bold text-[#333] hover:text-[#d22727] transition-colors cursor-pointer"
                >싱글로이</span><button
                  onClick={() => setIsLowEModalOpen(true)}
                  className="inline-flex items-center justify-center w-4 h-4 ml-1 text-[10px] text-white bg-[#999] rounded-full hover:bg-[#d22727] transition-colors align-top -translate-y-1 cursor-pointer"
                  aria-label="싱글로이 설명 보기"
                >
                  ?
                </button> 대비 단열 성능 향상과 더불어 <span className="font-bold text-[#333]">태양열 및 자외선 차단 기능이 향상</span>되었습니다. 또한 실내가 어두워지는 단점을 보완해, 자연광을 최대한 유입시켜 밝고 화사한 공간을 완성합니다.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-200px" }}
            >
              <h3 className="text-[#333] font-bold mb-6 text-[16px]">LX 수퍼더블로이 VS 썬팅필름 비교</h3>
              
              {/* 가시광선 투과율 비교 */}
              <div className="mb-14">
                
                
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <BeforeAfterSlider />
                  <p className="text-[#999] text-[12px] md:text-[13px] text-center mt-3">좌우로 스와이프하여 수퍼더블로이와 썬팅필름의 투과율 차이를 확인해보세요.</p>
                </motion.div>
              </div>

              {/* 성능 수치 비교 소제목 */}
              <h4 className="text-[#333] text-[16px] md:text-[18px] font-bold mb-6">LX 수퍼더블로이 VS 싱글로이 비교</h4>

              {/* 성능 비교 */}
              <div className="space-y-8">
                
                
                {/* 태양열 취득률 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg p-5 md:p-6 shadow-sm border border-[#eee]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[#333] text-[15px] md:text-[17px] font-bold">태양열 취득률(SHGC)</p>
                    <div className="bg-[#d22727] text-white text-[13px] md:text-[14px] font-bold px-3 py-1 rounded-full">
                      ▼ 44% 감소
                    </div>
                  </div>
                  
                  <div className="space-y-5 mt-6 mb-4">
                    <div>
                      <div className="flex justify-between text-[13px] md:text-[14px] mb-2">
                        <span className="text-[#666]">싱글로이</span>
                        <span className="text-[#666] font-bold">0.63</span>
                      </div>
                      <div className="w-full bg-[#f0f0f0] h-[12px] md:h-[14px] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "63%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                          className="h-full bg-[#999] rounded-full"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[13px] md:text-[14px] mb-2">
                        <span className="font-bold text-[#d22727]">수퍼더블로이</span>
                        <span className="font-bold text-[#d22727]">0.35</span>
                      </div>
                      <div className="w-full bg-[#f0f0f0] h-[12px] md:h-[14px] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "35%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                          className="h-full bg-[#d22727] rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[#999] text-[12px] md:text-[13px] text-center mt-3">※ 낮을수록 여름철 실내 온도 상승 방지</p>
                </motion.div>

                {/* 열관류율 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg p-5 md:p-6 shadow-sm border border-[#eee]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[#333] text-[15px] md:text-[17px] font-bold">열관류율(W/m²K)</p>
                    <div className="bg-[#d22727] text-white text-[13px] md:text-[14px] font-bold px-3 py-1 rounded-full">
                      ▼ 39% 감소
                    </div>
                  </div>
                  
                  <div className="space-y-5 mt-6 mb-4">
                    <div>
                      <div className="flex justify-between text-[13px] md:text-[14px] mb-2">
                        <span className="text-[#666]">싱글로이</span>
                        <span className="text-[#666] font-bold">1.76</span>
                      </div>
                      <div className="w-full bg-[#f0f0f0] h-[12px] md:h-[14px] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "88%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                          className="h-full bg-[#999] rounded-full"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[13px] md:text-[14px] mb-2">
                        <span className="font-bold text-[#d22727]">수퍼더블로이</span>
                        <span className="font-bold text-[#d22727]">1.06</span>
                      </div>
                      <div className="w-full bg-[#f0f0f0] h-[12px] md:h-[14px] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "53%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                          className="h-full bg-[#d22727] rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[#999] text-[12px] md:text-[13px] text-center mt-3">※ 낮을수록 단열 성능이 우수</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 싱글로이 설명 모달 */}
      {isLowEModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 pb-24 md:pb-4"
          onClick={() => setIsLowEModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl w-full md:w-[60vw] max-w-4xl flex flex-col shadow-2xl"
            style={{ maxHeight: 'calc(100vh - 8rem - 100px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 - 고정 */}
            <div className="flex-shrink-0 bg-white border-b border-[#eee] px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-[20px] md:text-[24px] font-extrabold text-[#333]">로이유리<br className="md:hidden"/></h2>
              <button
                onClick={() => setIsLowEModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors flex-shrink-0"
                aria-label="닫기"
              >
                <X size={20} className="text-[#999]" />
              </button>
            </div>

            {/* 모달 내용 - 스크롤 가능 */}
            <div 
              className="flex-1 overflow-y-auto px-6 py-6 space-y-8"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#d1d5db transparent'
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 8px;
                }
                div::-webkit-scrollbar-track {
                  background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                  background-color: #d1d5db;
                  border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background-color: #9ca3af;
                }
              `}</style>
              

              {/* 로이유리 원리 이미지 */}
              <div className="w-full">
                <img src={imgImage12} alt="로이유리 원리" className="w-full h-auto object-contain" loading="lazy" decoding="async" />
              </div>

              {/* 로이(Low-E) 유리란 */}
              <div>
                <h3 className="text-[#333] text-[16px] md:text-[18px] font-bold mb-3">로이(Low-E) 유리란 무엇인가요?</h3>
                <p className="text-[#666] text-[14px] md:text-[15px] leading-[24px] break-keep">
                  유리 안쪽에 눈에 보이지 않는 아주 얇은 <span className="font-bold text-[#333]">'은(Silver)'을 코팅</span>하여 <span className="font-bold text-[#333]">단열 성능을 획기적으로 높인 기능성 유리</span>입니다. 이 은 코팅이 마치 '투명한 거울'처럼 작동하여, 집 안의 열이 밖으로 빠져나가지 못하게 다시 실내로 튕겨내는 역할을 합니다.
                </p>
              </div>

              {/* 일반 유리 대비 효과 */}
              <div>
                <h3 className="text-[#333] text-[16px] md:text-[18px] font-bold mb-6">일반 유리 대비 로이유리의 효과</h3>
                
                <div className="mb-4 flex justify-center items-center gap-4 text-[#333] font-bold text-[13px] md:text-[15px]">
                  <div className="w-[100px] text-center">싱글 복층 유리</div>
                  <div className="w-[100px] text-center">일반 복층 유리</div>
                </div>

                <div className="w-full max-w-[280px] md:max-w-[350px] mx-auto mb-6">
                  <img src={imgImage14} alt="단열 비교" className="w-full h-auto object-contain" loading="lazy" decoding="async" />
                </div>

                <div className="text-[#999] text-[12px] md:text-[13px] leading-[20px] break-keep bg-[#f9f9f9] p-4 rounded-lg">
                  <p className="mb-2">※ 참고: 본 비교 데이터는 26mm 복층 유리 기준입니다.</p>
                  <p>콘크리트 벽 두께는 콘크리트 열전도율(1.8W/m·K, 표면저항 제외)을 기준으로 환산한 수치이며, 열관류율은 수치가 낮을수록 단열 성능이 우수합니다.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}