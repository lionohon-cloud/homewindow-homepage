import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import imgLogo1 from "figma:asset/677d3c9852a0720b22ed2ae5d4ac1812cc00bc3c.png";
import imgLogo2 from "figma:asset/978f56bc931f29607d72fa188f89650568cf6ba1.png";
import imgLogo3 from "figma:asset/36b216e9790a73d70f16ed1c2604afcebccfd997.png";

type BrandId = 'lx' | 'home' | 'kcc';

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
      { label: "프로파일 보증", p: "15년", s: "15년", e: "-" },
      { label: "발코니 방충망", p: "안전방충망", s: "블랙스텐망", e: "스텐망" },
      { label: "Ar", p: "O", s: "X", e: "X" },
      { label: "간봉", p: "TPS", s: "TPS", e: "AL" },
      { label: "유리종류", p: "수퍼더블로이", s: "수퍼로이+투명", e: "투명+그린" },
      { label: "발코니창 유리", p: "26mm", s: "26mm", e: "-" },
      { label: "일반창 유리", p: "26mm", s: "24mm", e: "24mm" },
      { label: "FIX/PJ/터닝도어", p: "24mm", s: "24mm", e: "24mm" },
      { label: "발코니 핸들", p: "자동", s: "자동", e: "-" },
      { label: "일반창 핸들", p: "자동", s: "고정+크리센트", e: "크리센트" },
      { label: "공틀분합문", p: "커플핸들", s: "커플핸들", e: "고정+크리센트" },
      { label: "윈드클로저", p: "발코니창 적용", s: "X", e: "X" },
      { label: "레일캡", p: "LX 정품", s: "LX 정품", e: "LX 정품" },
      { label: "물구멍방충캡", p: "O", s: "O", e: "X" },
      { label: "안전스토퍼", p: "BF스토퍼", s: "BF스토퍼", e: "BF스토퍼" },
      { label: "빨래건조대", p: "O", s: "X", e: "X" },
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
      { label: "프로파일 보증", p: "15년", s: "15년", e: "-" },
      { label: "발코니 방충망", p: "안전방충망", s: "블랙스텐망", e: "스텐망" },
      { label: "Ar", p: "O", s: "X", e: "X" },
      { label: "간봉", p: "TPS", s: "TPS", e: "AL" },
      { label: "유리종류", p: "수퍼더블로이", s: "로이+투명", e: "투명+그린" },
      { label: "발코니창 유리", p: "26mm", s: "26mm", e: "-" },
      { label: "일반창 유리", p: "24mm", s: "24mm", e: "22mm" },
      { label: "FIX/PJ/터닝도어", p: "24mm", s: "24mm", e: "24mm" },
      { label: "발코니 핸들", p: "자동", s: "자동", e: "-" },
      { label: "일반창 핸들", p: "자동", s: "고정+크리센트", e: "크리센트" },
      { label: "공틀분합문", p: "반자동", s: "반자동", e: "고정+크리센트" },
      { label: "윈드클로저", p: "발코니창 적용", s: "X", e: "X" },
      { label: "레일캡", p: "기밀형 정품", s: "기밀형 정품", e: "기밀형 정품" },
      { label: "물구멍방충캡", p: "O", s: "O", e: "X" },
      { label: "안전스토퍼", p: "BF스토퍼", s: "BF스토퍼", e: "BF스토퍼" },
      { label: "빨래건조대", p: "O", s: "X", e: "X" },
    ]
  },
  {
    id: 'kcc' as BrandId,
    name: 'KCC Homecc',
    logo: imgLogo3,
    theme: {
      headerBg: 'bg-[#1b509f]',
      headerBorder: 'border-[#3068bc]',
      rowBgEven: 'bg-white',
      rowBgOdd: 'bg-[#f0f5fa]',
      textColor: 'text-[#0a2958]',
      borderColor: 'border-[#1b509f]'
    },
    table: [
      { label: "프로파일 보증", p: "15년", s: "15년", e: "-" },
      { label: "발코니 방충망", p: "안전방충망", s: "블랙스텐망", e: "스텐망" },
      { label: "Ar", p: "O", s: "X", e: "X" },
      { label: "간봉", p: "TPS", s: "TPS", e: "AL" },
      { label: "유리종류", p: "더블로이", s: "로이+투명", e: "투명+그린" },
      { label: "발코니창 유리", p: "26mm", s: "26mm", e: "-" },
      { label: "일반창 유리", p: "24mm", s: "24mm", e: "22mm" },
      { label: "FIX/PJ/터닝도어", p: "24mm", s: "24mm", e: "24mm" },
      { label: "발코니 핸들", p: "자동", s: "자동", e: "-" },
      { label: "일반창 핸들", p: "자동", s: "고정+크리센트", e: "크리센트" },
      { label: "공틀분합문", p: "반자동", s: "반자동", e: "고정+크리센트" },
      { label: "윈드클로저", p: "발코니창 적용", s: "X", e: "X" },
      { label: "레일캡", p: "기밀형 정품", s: "기밀형 정품", e: "기밀형 정품" },
      { label: "물구멍방충캡", p: "O", s: "O", e: "X" },
      { label: "안전스토퍼", p: "BF스토퍼", s: "BF스토퍼", e: "BF스토퍼" },
      { label: "빨래건조대", p: "O", s: "X", e: "X" },
    ]
  }
];

export function BrandsSection() {
  const [selectedBrandId, setSelectedBrandId] = useState<BrandId | null>(null);
  
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
            <p>고객님의 예산과 취향에 맞춰</p>
            <p>브랜드를 자유롭게 선택해 보십시오.</p>
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
                <div className={`grid grid-cols-[31%_23%_23%_23%] md:grid-cols-[25%_25%_25%_25%] text-center ${currentBrand.theme.headerBg} text-white text-[13px] md:text-[16px] font-bold transition-colors duration-500 ease-in-out`}>
                  <div className={`py-3 md:py-4 border-r ${currentBrand.theme.headerBorder} bg-transparent transition-colors duration-500`}></div>
                  <div className={`py-3 md:py-4 border-r ${currentBrand.theme.headerBorder} flex items-center justify-center transition-colors duration-500`}>PRESTIGE</div>
                  <div className={`py-3 md:py-4 border-r ${currentBrand.theme.headerBorder} flex items-center justify-center transition-colors duration-500`}>SIGNATURE</div>
                  <div className={`py-3 md:py-4 flex items-center justify-center`}>LITE</div>
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
                        <div key={idx} className={`grid grid-cols-[31%_23%_23%_23%] md:grid-cols-[25%_25%_25%_25%] text-center text-[12px] md:text-[15px] border-t border-[#ddd] transition-colors duration-300 ${idx % 2 === 0 ? currentBrand.theme.rowBgEven : currentBrand.theme.rowBgOdd}`}>
                          <div className="py-3 md:py-4 border-r border-[#ddd] font-medium text-[#333] flex items-center justify-center px-1 md:px-4 break-keep">{row.label}</div>
                          <div className={`py-3 md:py-4 border-r border-[#ddd] ${currentBrand.theme.textColor} transition-colors duration-300 flex items-center justify-center px-1 md:px-4 break-keep`}>{row.p}</div>
                          <div className={`py-3 md:py-4 border-r border-[#ddd] ${currentBrand.theme.textColor} transition-colors duration-300 flex items-center justify-center px-1 md:px-4 break-keep`}>{row.s}</div>
                          <div className={`py-3 md:py-4 ${currentBrand.theme.textColor} transition-colors duration-300 flex items-center justify-center px-1 md:px-4 break-keep`}>{row.e}</div>
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
                * 궁금하신 브랜드를 선택하시면 상세정보를 보실 수 있습니다.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}