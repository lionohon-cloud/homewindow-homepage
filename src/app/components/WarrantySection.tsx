import { motion } from "motion/react";
import warrantyMark from "figma:asset/c0aa673e45f6c78d85111b9880270af00e191d75.png";
import serviceMap from "figma:asset/b1e625139de58ae38ac57e9487f92a224a0cd168.png";
import { useState } from "react";
import { WarrantyModal } from "./WarrantyModal";

export function WarrantySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const serviceCenters = [
    { name: "서울북부사무소", address: "경기도 양주시 광적면 부흥로 883" },
    { name: "서울하남사무소", address: "경기도 하남시 미사강변대로 96" },
    { name: "이천공장", address: "경기도 이천시 대월면 대월로 292" },
    { name: "논산공장", address: "충청남도 논산시 선비로 704-1" },
    { name: "대전사무소", address: "대전광역시 유성구 북유성대로 334" },
    { name: "목포영업소", address: "전라남도 무안군 청계면 청계공단길 37" },
    { name: "김해영업소", address: "경상남도 김해시 한림면 김해대로 1389-11" },
    { name: "제주공장", address: "제주특별자치도 제주시 도리로 106-9" }
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-[#222]">
      <div className="max-w-screen-md mx-auto px-6 md:px-10">
        {/* Desktop Layout - Horizontal */}
        <div className="hidden md:flex items-center justify-between gap-12">
          {/* Text Content */}
          <div className="flex-1">
            {/* Keyword */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-200px" }}
              transition={{ duration: 0.5 }}
              className="text-[#999] text-[16px] font-medium mb-3"
            >
              품질 보증
            </motion.p>

            {/* Main Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-200px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[28px] md:text-[36px] font-extrabold text-white leading-[1.3] mb-5 break-keep text-[#cacaca]"
            ><span className="text-[#fff]">업계 최장 15년 무상보증,</span><br />정식 보증으로 평생 안심</motion.h2>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-200px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[#999] text-[16px] md:text-[18px] leading-[26px] break-keep"
            >
              <p className="mb-4">
                창호는 한 번 바꾸면 10년 이상을 씁니다. 타사 대비 <span className="text-[#eee] font-bold">평균 3배 이상 긴 보증 기간</span>은 물론, 유상 <span className="text-[#eee] font-bold">평생 사후관리</span>로 안심하세요.
              </p>
              <p>
                청암홈윈도우는 <span className="text-[#eee] font-bold">전국 직영서비스센터 운영</span>으로 시공후 문제가 발생하실 경우 <span className="text-[#eee] font-bold">즉각적인 조치</span>가 가능합니다.
              </p>
            </motion.div>
          </div>

          {/* Warranty Mark - Desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-shrink-0 flex flex-col items-center gap-4"
          >
            <div className="w-[220px] h-[220px] flex items-center justify-center">
              <motion.img 
                src={warrantyMark} 
                alt="Warranty Mark" 
                className="w-full h-full object-contain" 
                animate={{
                  filter: [
                    'drop-shadow(0 0 0px rgba(200, 200, 200, 0))',
                    'drop-shadow(0 0 20px rgba(200, 200, 200, 0.6))',
                    'drop-shadow(0 0 0px rgba(200, 200, 200, 0))'
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <button className="px-6 py-3 bg-white text-[#333333] text-[14px] font-bold border border-white transition-colors hover:bg-transparent hover:text-white rounded-md cursor-pointer" onClick={() => setIsModalOpen(true)}>
              품질보증기간 자세히보기 &gt;
            </button>
          </motion.div>
        </div>

        {/* Service Center Map & Address - Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="hidden md:flex gap-8 mt-12 items-start"
        >
          {/* Map - Left */}
          <div className="flex-1 rounded-xl overflow-hidden">
            {/* ⚠️ 스케일 조절: overflow-hidden을 overflow-auto로 바꾸고, 아래 transform scale 값을 조절하세요 (예: 1.2, 1.5 등) */}
            <img
              src={serviceMap}
              alt="전국 직영서비스센터 지도"
              className="w-full h-auto object-contain"
              style={{ transform: "scale(1.2)" }}
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Address List - Right */}
          <div className="flex-1">
            <ul className="space-y-3">
              {serviceCenters.map((center, index) => (
                <motion.li
                  key={center.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-200px" }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.03 }}
                  className="flex gap-2 text-[14px] leading-[1.7]"
                >
                  <span className="text-[#d22727] font-bold mt-0.5">•</span>
                  <span className="flex-1">
                    <span className="text-[#eee] font-bold">{center.name}</span>
                    <span className="text-[#999]"> : {center.address}</span>
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Mobile Layout - Vertical with Centered Text */}
        <div className="flex md:hidden flex-col items-center text-center">
          {/* Keyword */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.5 }}
            className="text-[#999] text-[16px] font-medium mb-3"
          >
            품질 보증
          </motion.p>

          {/* Main Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[28px] font-extrabold text-white leading-[1.3] mb-5 break-keep text-[#cccccc]"
          ><span className="text-[#fff]">업계 최장 15년 무상보증</span>,<br />정식 보증으로 평생 안심</motion.h2>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[#999] text-[16px] leading-[26px] break-keep mb-8"
          >
            <p>
              창호는 한 번 바꾸면 10년 이상을 씁니다. 타사 대비 <span className="text-[#eee] font-bold">평균 3배 이상 긴 보증 기간</span>은 물론, 유상 <span className="text-[#eee] font-bold">평생 사후관리</span>로 안심하세요.
            </p>
          </motion.div>

          {/* Warranty Mark - Mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center gap-4 mb-6"
          >
            <div className="w-[198px] h-[198px] flex items-center justify-center">
              <motion.img 
                src={warrantyMark} 
                alt="Warranty Mark" 
                className="w-full h-full object-contain" 
                animate={{
                  filter: [
                    'drop-shadow(0 0 0px rgba(200, 200, 200, 0))',
                    'drop-shadow(0 0 20px rgba(200, 200, 200, 0.6))',
                    'drop-shadow(0 0 0px rgba(200, 200, 200, 0))'
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <button className="px-6 py-3 bg-white text-[#333333] text-[14px] font-bold border border-white transition-colors hover:bg-transparent hover:text-white rounded-md" onClick={() => setIsModalOpen(true)}>
              품질보증기간 자세히보기 &gt;
            </button>
          </motion.div>

          {/* Service Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-[#999] text-[16px] leading-[26px] break-keep mb-6"
          >
            청암홈윈도우는 <span className="text-[#eee] font-bold">전국 직영서비스센터 운영</span>으로 시공후 문제가 발생하실 경우 <span className="text-[#eee] font-bold">즉각적인 조치</span>가 가능합니다.
          </motion.p>

          {/* Service Center Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="w-full rounded-x0 overflow-hidden"
          >
            <img
              src={serviceMap}
              alt="전국 직영서비스센터 지도"
              className="w-full h-auto object-contain mx-[0px] mt-[0px] mb-[-27px]"
              loading="lazy"
              decoding="async"
            />
          </motion.div>

          {/* Service Centers Address List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-full mt-6 text-left"
          >
            <ul className="space-y-2.5">
              {serviceCenters.map((center, index) => (
                <motion.li
                  key={center.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-200px" }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.03 }}
                  className="flex gap-2 text-[13px] leading-[1.7]"
                >
                  <span className="text-[#d22727] font-bold mt-0.5">•</span>
                  <span className="flex-1">
                    <span className="text-[#ddd] font-bold">{center.name}</span>
                    <span className="text-[#999]"> : {center.address}</span>
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Warranty Modal */}
      <WarrantyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}