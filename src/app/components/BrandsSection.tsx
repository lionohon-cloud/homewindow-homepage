import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SpecInfoButton, SpecInfoModal, type SpecInfo } from "./BrandSpecInfo";
import imgLogo1 from "figma:asset/677d3c9852a0720b22ed2ae5d4ac1812cc00bc3c.png";
import imgLogo2 from "@/assets/logo-gnb.svg"; // 260923 — GNB 신규 로고로 교체

type BrandId = 'lx' | 'home';

const brands = [
  {
    id: 'lx' as BrandId,
    name: 'LX Z:IN',
    logo: imgLogo1,
    theme: {
      headerBg: 'bg-[#d22427]',
      headerBorder: 'border-[#de752b]',
      rowBgEven: 'bg-white',
      rowBgOdd: 'bg-[#fff5f5]',
      textColor: 'text-[#3f0202]',
      borderColor: 'border-[#d22427]'
    },
    table: [
      { label: "프로파일 보증", options: "15년" },
      { label: "발코니 방충망", options: "안전방충망 / 블랙스텐망 / 스텐망" },
      { label: "Ar(아르곤가스)", options: "선택 가능" },
      { label: "간봉", options: "TPS / AL" },
      { label: "유리종류", options: "수퍼더블로이 / 수퍼로이+투명 / 투명+그린" },
      { label: "발코니창 유리", options: "26mm" },
      { label: "일반창 유리", options: "26mm / 24mm" },
      { label: "FIX/PJ/터닝도어", options: "24mm" },
      { label: "발코니 핸들", options: "자동" },
      { label: "일반창 핸들", options: "자동 / 고정+크리센트 / 크리센트" },
      { label: "공틀분합문", options: "커플핸들 / 고정+크리센트" },
      { label: "윈드클로저", options: "발코니창 적용" },
      { label: "레일캡", options: "LX 정품" },
      { label: "물구멍방충캡", options: "선택 가능" },
      { label: "안전스토퍼", options: "BF스토퍼" },
      { label: "빨래건조대", options: "선택 가능" },
    ]
  },
  {
    id: 'home' as BrandId,
    name: 'HOME WINDOW',
    logo: imgLogo2,
    theme: {
      headerBg: 'bg-[#333333]',
      headerBorder: 'border-[#555555]',
      rowBgEven: 'bg-white',
      rowBgOdd: 'bg-[#f5f5f5]',
      textColor: 'text-[#333333]',
      borderColor: 'border-[#333333]'
    },
    table: [
      { label: "프로파일 보증", options: "15년" },
      { label: "발코니 방충망", options: "안전방충망 / 블랙스텐망 / 스텐망" },
      { label: "Ar(아르곤가스)", options: "선택 가능" },
      { label: "간봉", options: "TPS / AL" },
      { label: "유리종류", options: "수퍼더블로이 / 로이+투명 / 투명+그린" },
      { label: "발코니창 유리", options: "26mm" },
      { label: "일반창 유리", options: "24mm / 22mm" },
      { label: "FIX/PJ/터닝도어", options: "24mm" },
      { label: "발코니 핸들", options: "자동" },
      { label: "일반창 핸들", options: "자동 / 고정+크리센트 / 크리센트" },
      { label: "공틀분합문", options: "반자동 / 고정+크리센트" },
      { label: "윈드클로저", options: "발코니창 적용" },
      { label: "레일캡", options: "기밀형 정품" },
      { label: "물구멍방충캡", options: "선택 가능" },
      { label: "안전스토퍼", options: "BF스토퍼" },
      { label: "빨래건조대", options: "선택 가능" },
    ]
  }
];

export function BrandsSection() {
  const [selectedBrandId, setSelectedBrandId] = useState<BrandId | null>(null);
  const [specInfo, setSpecInfo] = useState<SpecInfo | null>(null); // 260923 — 항목 (?) 설명 팝업
  
  const currentBrand = selectedBrandId ? brands.find(b => b.id === selectedBrandId) : null;

  return (
    <section className="py-24 w-full bg-[#fafafa]">
      <div className="max-w-screen-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          className="px-6 md:px-10 mb-8"
        >
          <p className="text-[#999] text-[16px] font-medium mb-3">브랜드 라인업</p>
          <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] mb-5 break-keep">
            집을 지키는 뼈대,<br/>
            <span className="text-[#d22727]">프리미엄 창호</span> 브랜드 라인업
          </h2>
          <div className="text-[#999] text-[16px] md:text-[18px] leading-[26px] break-keep">
            <p>브랜드와 사양은 원하시는 대로 맞춰 드립니다.</p>
            <p>어떤 구성이 좋을지는 상담에서 함께 정해 드립니다.</p>
          </div>
        </motion.div>

        {/* Logos */}
        <div className="flex justify-center md:justify-start gap-4 mb-4 px-6 md:px-10 items-center">
          {brands.map((brand, i) => {
            const isSelected = selectedBrandId === brand.id;
            return (
              <motion.button
                key={brand.id}
                onClick={() => setSelectedBrandId(isSelected ? null : brand.id)}
                initial={{ opacity: 0, y: 20, filter: "grayscale(0%) opacity(100%)" }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: i * 0.1,
                  type: "spring", stiffness: 400, damping: 25 
                }}
                animate={{
                  scale: isSelected ? 1.15 : 1,
                  filter: isSelected ? "grayscale(0%) opacity(100%)" : selectedBrandId ? "grayscale(100%) opacity(60%)" : "grayscale(0%) opacity(100%)",
                }}
                style={{ transformOrigin: "center" }}
                className={`w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[140px] md:h-[140px] flex-shrink-0 rounded-full border-[2.5px] bg-white flex items-center justify-center p-3 shadow-sm transition-colors duration-300 outline-none cursor-pointer ${
                  brand.theme.borderColor
                }`}
              >
                <img src={brand.logo} alt={brand.name} className="w-full object-contain" loading="lazy" decoding="async" />
              </motion.button>
            )
          })}
        </div>

        {/* 안내 문구 - 선택 전에만 표시 */}
        {!selectedBrandId && (
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#999] text-[14px] mb-8 px-6 text-left"
          >* 궁금한 브랜드를 선택하시면 상세정보를 보실 수 있습니다.</motion.p>
        )}

        {/* Table wrapper - 아코디언 */}
        <AnimatePresence>
          {currentBrand && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden px-4 md:px-10"
            >
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
                className="w-full overflow-hidden border border-[#ddd] rounded-xl shadow-sm bg-white mb-4"
              >
                {/* Header (Animates Background Color smoothly) */}
                {/* 260923 가맹전환 — 등급제(PRESTIGE·SIGNATURE·LITE) 폐지. 항목 | 선택 가능한 사양 2열 */}
                <div className={`grid grid-cols-[38%_62%] md:grid-cols-[30%_70%] text-center ${currentBrand.theme.headerBg} text-white text-[13px] md:text-[16px] font-bold transition-colors duration-500 ease-in-out`}>
                  <div className={`py-3 md:py-4 border-r ${currentBrand.theme.headerBorder} flex items-center justify-center transition-colors duration-500`}>항목</div>
                  <div className={`py-3 md:py-4 flex items-center justify-center transition-colors duration-500`}>선택 가능한 사양</div>
                </div>
                
                {/* Rows with fade animation on switch */}
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedBrandId}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      {currentBrand.table.map((row, idx) => (
                        <div key={idx} className={`grid grid-cols-[38%_62%] md:grid-cols-[30%_70%] text-center text-[12px] md:text-[15px] border-t border-[#ddd] transition-colors duration-300 ${idx % 2 === 0 ? currentBrand.theme.rowBgEven : currentBrand.theme.rowBgOdd}`}>
                          {/* 항목 칸 전체가 설명 버튼 — 위아래 6px 는 비워 두어 옆 줄을 잘못 누르지 않게 */}
                          <div className="border-r border-[#ddd] flex items-stretch px-1 md:px-2">
                            <SpecInfoButton label={row.label} brand={currentBrand.id} onOpen={setSpecInfo} />
                          </div>
                          <div className={`py-3 md:py-4 ${currentBrand.theme.textColor} transition-colors duration-300 flex items-center justify-center px-2 md:px-4 break-keep`}>{row.options}</div>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
              
              {/* 안내 문구 - 스펙표 밑 */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center text-[#999] text-[14px] mb-4 px-6"
              >
                * 항목 옆 물음표를 누르면 설명을 보실 수 있습니다. 어떤 조합이 좋을지는 집 상태를 보고 추천해 드립니다.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* 항목 설명 팝업 — 원데이 시공과 같은 모양, 사진 여러 장이면 좌우 슬라이드 */}
      <SpecInfoModal info={specInfo} onClose={() => setSpecInfo(null)} />
    </section>
  );
}