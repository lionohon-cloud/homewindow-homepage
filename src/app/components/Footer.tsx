import { motion } from "motion/react";
import { Link } from "react-router";
import { FaPhone, FaYoutube, FaInstagram } from "react-icons/fa";
import { SiNaver } from "react-icons/si";
import logoImage from "@/assets/logo-slogan-left.svg";
// LX Z:IN 공식대리점 마크 — LX하우시스 제공 원본 SVG (부사장님 전달 260731). 색·자간 임의 변경 금지.
import lxDealerMark from "../../assets/lx-zin-dealer-mark.svg";

function scrollToConsultForm(e: React.MouseEvent<HTMLAnchorElement>) {
  if (window.innerWidth >= 768) {
    e.preventDefault();
  }
}

export function Footer() {
  return (
    <footer className="w-full bg-[#222222] text-white pt-16 pb-24 md:pb-8">
      <div className="max-w-screen-md mx-auto px-6 md:px-10">
        {/* CTA Section */}
        <div className="mb-12">
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
              onClick={scrollToConsultForm}
              className="w-full max-w-[400px] md:max-w-[480px] inline-flex items-center justify-center gap-4 bg-gradient-to-b from-[#e02e2e] to-[#bd1f1f] text-white rounded-2xl transition-all active:scale-95 hover:brightness-95 shadow-[0_10px_28px_rgba(210,39,39,0.35)] px-8 py-4 md:py-5"
            >
              <span className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/15 flex-shrink-0">
                <FaPhone className="rotate-90 w-6 h-6 md:w-7 md:h-7" />
              </span>
              <div className="flex flex-col items-start">
                <span className="text-[32px] md:text-[40px] font-bold leading-none whitespace-nowrap">1661-4830</span>
                <span className="text-white/85 font-normal text-[13px] md:text-[15px] leading-tight mt-1">24시간 문자접수 가능</span>
              </div>
            </a>

            <p className="text-[13px] text-gray-400 leading-[1.7] mt-4">
              접수시간 : 연중무휴 (1년 365일)
            </p>

            {/* 자주 묻는 질문 링크 (260714 — 일반 질문 페이지. 상단 메뉴 FAQ(/faq)와 별도) */}
            <Link
              to="/faq/general"
              className="mt-2 text-[14px] font-bold text-white/85 hover:text-white transition-colors"
            >
              [자주묻는 질문]
            </Link>
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
          {/* 로고 블록(좌) + LX Z:IN 공식대리점 마크(우) — 부사장님 지시 260730/260731.
              마크는 LX하우시스 제공 공식 SVG(단색 #64646c) 그대로 사용 — 브랜드 규정상
              색·비율 임의 변경 없이 높이만 지정한다. 검색·AI 크롤러 노출은 alt 텍스트가 담당. */}
          {/* 좁은 화면(≈375px 이하)에서는 마크가 아랫줄로 내려간다(flex-wrap).
              nowrap 로 한 줄에 밀어넣으면 Home WINDOW 로고 이미지가 가로로 찌그러진다
              (flex 축소 — 320px 에서 가로비 9.88 → 6.29). 양쪽 다 shrink-0 로 원본 비율 고정. */}
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2 mb-4">
            <div className="flex flex-col items-start gap-1.5 shrink-0">
              {/* 슬로건 CI 는 두 줄 락업이라 예전 한 줄 로고(h-5)보다 키워야 아랫줄이 읽힌다.
                  어두운 푸터라 brightness-0 invert 로 순백 처리 — 기존 로고도 순백 PNG 였다. */}
              <img src={logoImage} alt="청암홈윈도우 로고" className="h-[30px] w-auto brightness-0 invert" loading="lazy" decoding="async" />
              <p className="text-[15px] text-[#dddddd] font-bold">주식회사 청암홈윈도우</p>
            </div>
            <img
              src={lxDealerMark}
              alt="LX Z:IN 공식대리점"
              className="h-[11px] md:h-[15px] w-auto shrink-0 ml-auto mt-1"
              loading="lazy"
              decoding="async"
            />
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