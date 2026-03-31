import { motion } from "motion/react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import warrantyDoc from "figma:asset/7aa5b58dfdfe22954c95262a521b04eb920d9585.png";

export function InsuranceSection() {
  return (
    <section className="py-24 w-full overflow-hidden bg-[#f8f8f8]">
      <div className="max-w-screen-md mx-auto px-6 md:px-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
        >
          {/* 키워드 */}
          <p className="text-[#999] text-[16px] font-medium mb-3">업계 최초 선금보험 제도</p>
          
          {/* 메인타이틀 */}
          <h2 className="font-extrabold text-[#333] leading-[1.3] mb-5 break-keep text-[28px]">소중한 계약금, 불안하십니까?<br/> <span className="text-[#d22727]">법으로 철저하게 보호</span>합니다</h2>
          
          {/* 서브타이틀 */}
          <div className="text-[#999] text-[16px] md:text-[18px] leading-[26px] break-keep mb-8">
            <p>창호 업계 최초, 업계 유일 <span className="font-bold text-[#333]">SGI 서울보증보험</span> 가입.</p>
            <p>비교 전 반드시 확인해야 할 사항입니다.</p>
          </div>

          {/* 보증보험 카드 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 md:p-8 border border-[#eaeaea] relative overflow-visible"
          >
            {/* 우측 상단 보증서 이미지 - 데스크톱만 */}
            <div className="hidden md:block absolute -top-50 right-10 w-[180px] pointer-events-none" style={{ zIndex: 10 }}>
              <motion.img
                src={warrantyDoc}
                alt="선금보증보험증권"
                className="w-full h-auto object-contain"
                initial={{ opacity: 0, y: -20, rotate: -5 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                style={{
                  filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15))",
                }}
              />
            </div>

            {/* 카드 헤더 - 아이콘과 타이틀 */}
            <div className="flex items-center gap-4 mx-[0px] mt-[0px] mb-[13px]">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#D227271A' }}
              >
                <ShieldCheck size={22} strokeWidth={2.5} color="#D22727" />
              </div>
              <div className="flex-1">
                <h3 className="text-[22px] md:text-[24px] font-extrabold text-[#333] leading-[1.3] mb-2 break-keep">계약금 걱정 이제 안하셔도 됩니다</h3>
              </div>
            </div>

            {/* 카피 본문 */}
            <p className="text-[#666] text-[15px] md:text-[17px] leading-[26px] md:leading-[28px] break-keep mb-6">혹여나 발생할 수 있는 시공 미이행 시에도 보험사에서 전액 보상하므로 공사 전 과정에서 불안감을 완전히 해소해 드립니다.</p>

            {/* 보장 항목 리스트 */}
            <div className="bg-[#f8f8f8] rounded-xl p-5 space-y-3">
              {[
                "계약금부터 잔금까지 전액 보증",
                "시공 미이행 시 전액 보상",
                "SGI 서울보증보험 안심 보증"
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 size={18} strokeWidth={2.5} color="#D22727" className="shrink-0" />
                  <p className="text-[#333] font-semibold text-[15px] md:text-[16px]">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}