import { motion } from "motion/react";
import { FaPhone, FaYoutube, FaInstagram } from "react-icons/fa";
import { SiNaver } from "react-icons/si";
import { Headphones } from "lucide-react";
import logoImage from "figma:asset/771e2a28afe6f5e97ddf040de4e16d1715624cd8.png";

export function Footer() {
  return (
    <footer className="w-full bg-[#222222] text-white pt-16 pb-24 md:pb-8">
      <div className="max-w-screen-md mx-auto px-6 md:px-10">
        {/* CTA Section with Consultation Info */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center flex flex-col justify-center items-center my-4"
          >
            <h2 className="font-bold leading-tight mb-3 text-[28px]">
              창호교체 고민하시나요?
              <br />
              이제 혼자하지마세요!
            </h2>
            
            {/* Phone Number - Big CTA */}
            <a
              href="tel:1661-4830"
              className="inline-flex items-center justify-center gap-4 bg-[#d22727] text-white rounded-xl transition-all active:scale-95 hover:bg-[#b02020] px-[32px] py-[10px]"
            >
              <FaPhone size={32} className="rotate-90 flex-shrink-0" />
              <div className="flex flex-col items-start">
                <span className="text-[28px] md:text-[32px] font-bold leading-none">1661-4830</span>
                <span className="text-white/80 font-normal text-[#ffffff] text-[14px] leading-tight mt-0.5">24시간 문자접수 가능</span>
              </div>
            </a>
          </motion.div>

          {/* Right: Consultation Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <a
              href="tel:16614830"
              className="bg-[#2a2a2a] rounded-lg p-5 cursor-pointer active:scale-[0.98] transition-transform md:pointer-events-none md:cursor-default"
            >
              <div className="flex items-start gap-3">
                <Headphones className="text-[#d22727] flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-[16px] font-bold mb-1">전문상담 : 1661-4830</p>
                  <p className="text-[13px] text-gray-400 leading-relaxed">
                    운영시간 : 월~토 09:00~18:00<br />
                    <span className="text-[#aaa]">(점심시간 12:00~13:00 제외)</span><br />
                    <span className="text-white font-medium">근무시간 외에는 AI상담사가 24시간 응대합니다</span>
                  </p>
                </div>
              </div>
            </a>
          </motion.div>
        </div>

        {/* Social Media Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-3 mb-12"
        >
          <a
            href="https://www.youtube.com/@homewindowca"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-[#2a2a2a] rounded-full flex items-center justify-center text-white hover:bg-[#d22727] transition-colors"
            aria-label="유튜브"
          >
            <FaYoutube size={20} />
          </a>
          <a
            href="https://www.instagram.com/homewindow.ca/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-[#2a2a2a] rounded-full flex items-center justify-center text-white hover:bg-[#d22727] transition-colors"
            aria-label="인스타그램"
          >
            <FaInstagram size={20} />
          </a>
          <a
            href="https://blog.naver.com/homewindow_ca2"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-[#2a2a2a] rounded-full flex items-center justify-center text-white hover:bg-[#d22727] transition-colors"
            aria-label="네이버 블로그"
          >
            <SiNaver size={20} />
          </a>
        </motion.div>

        {/* Company Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="border-t border-gray-700 pt-8 mb-6"
        >
          <div className="flex flex-col items-start gap-1.5 mb-4">
            <img src={logoImage} alt="청암홈윈도우 로고" className="h-5 w-auto" />
            <p className="text-[15px] text-[#dddddd] font-bold">주식회사 청암홈윈도우</p>
          </div>
          
          <div className="space-y-2 text-[13px] text-gray-400 leading-relaxed">
            <p>사업자 등록번호 : 758-88-02425</p>
            <p>주소 : 경기도 하남시 미사강변대로 96</p>
            <p>논산공장 : 충청남도 논산시 연산면 선비로720번길 40</p>
            <p>E-mail : homewindow@ca1996.co.kr</p>
            <p>기업은행 940-052869-04-010 (주)청암홈윈도우</p>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-[12px] text-gray-500 text-center md:text-left"
        >
          Copyright ⓒ 2024 CAHOME WINDOW All right reserved.
        </motion.div>
      </div>
    </footer>
  );
}