import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Phone } from "lucide-react";
import { ConsultationModal } from "./ConsultationModal";
import logo from "figma:asset/4ae621bc1ae2b4dd2f88bf2d3c6c087ff22567bb.png";

interface NavigationProps {
  onMenuClick?: () => void;
}

const sections = [
  { id: "hero", label: "처음으로" },
  { id: "event", label: "이벤트" },
  { id: "awards", label: "수상내역" },
  { id: "insurance", label: "안심보증" },
  { id: "production", label: "자동화 제조 공장" },
  { id: "brands", label: "취급 브랜드" },
  { id: "materials", label: "자재품질" },
  { id: "glass", label: "단열유리" },
  { id: "safety", label: "방충망" },
  { id: "installation", label: "원데이 시공" },
  { id: "warranty", label: "업게 최장 15년 보증" },
  { id: "review", label: "시공 후기" },
  { id: "corporate", label: "사회공헌활동" },
];

// 데스크톱 GNB 메뉴 항목
// type 'section' = 같은 페이지 앵커 스크롤, type 'route' = 별도 페이지 이동
type DesktopMenuItem =
  | { type: "section"; id: string; label: string }
  | { type: "route"; href: string; label: string };

const desktopMenuItems: DesktopMenuItem[] = [
  { type: "section", id: "event", label: "이벤트" },
  { type: "section", id: "production", label: "제작공장" },
  { type: "section", id: "brands", label: "브랜드" },
  { type: "section", id: "glass", label: "단열유리" },
  { type: "section", id: "installation", label: "원데이시공" },
  { type: "section", id: "warranty", label: "15년보증" },
  { type: "route", href: "/as", label: "AS접수" },
];

export function Navigation({ onMenuClick }: NavigationProps) {
  const navigate = useNavigate();
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");
  const [showIndicator, setShowIndicator] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  // GNB가 숨겨지면 상담 모달도 닫기
  useEffect(() => {
    if (!showNav) {
      setIsConsultationOpen(false);
    }
  }, [showNav]);

  useEffect(() => {
    // EstimateModal 상태 감지
    const checkModalState = () => {
      const isOpen = document.body.hasAttribute("data-estimate-modal-open");
      setIsEstimateModalOpen(isOpen);
    };

    // 초기 체크
    checkModalState();

    // MutationObserver로 attribute 변화 감지
    const observer = new MutationObserver(checkModalState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-estimate-modal-open"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // 네비게이션 클릭 직후에는 숨김 로직 무시
          if (!isNavigating) {
            // 모바일 네비게이션 show/hide 로직
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
              setShowNav(false);
            } else {
              setShowNav(true);
            }
          }
          
          setLastScrollY(currentScrollY);
          
          // 현재 활성 섹션 감지
          let currentSection = "hero";
          let foundAwards = false;
          
          // 역순으로 순회하여 화면 상단을 지난 섹션 중 가장 마지막 것을 찾기
          for (let i = sections.length - 1; i >= 0; i--) {
            const { id } = sections[i];
            const element = document.getElementById(id);
            if (element) {
              const rect = element.getBoundingClientRect();
              // 섹션의 상단이 화면 중앙보다 위에 있으면 현재 섹션으로 설정
              if (rect.top <= window.innerHeight / 2) {
                currentSection = id;
                break;
              }
            }
          }
          
          // awards 섹션 지나갔는지 체크
          const awardsElement = document.getElementById("awards");
          if (awardsElement) {
            const rect = awardsElement.getBoundingClientRect();
            if (rect.top < window.innerHeight / 2) {
              foundAwards = true;
            }
          }
          
          setActiveSection(currentSection);
          setShowIndicator(foundAwards);
          
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isNavigating]);

  const scrollToSection = (id: string) => {
    // 메인 페이지가 아닌 곳에 있으면 메인으로 이동 후 스크롤
    if (window.location.pathname !== '/') {
      sessionStorage.setItem('hw_scroll_to', id);
      navigate('/');
      setIsMobileMenuOpen(false);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth"
      });
      // 모바일 메뉴 닫기
      setIsMobileMenuOpen(false);
      // 네비게이션 중복 방지
      setIsNavigating(true);
      setTimeout(() => setIsNavigating(false), 3000);
    }
  };

  const goToRoute = (href: string) => {
    setIsMobileMenuOpen(false);
    navigate(href);
  };

  return (
    <>
      {/* 데스크톱 GNB */}
      <AnimatePresence>
        {showNav && (
          <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#eaeaea] shadow-sm"
          >
            <div className="max-w-screen-xl mx-auto px-6 md:px-10">
              <div className="flex items-center justify-between h-[70px]">
                {/* 로고 */}
                <button
                  onClick={() => scrollToSection("hero")}
                  className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <img src={logo} alt="청암홈윈도우" className="h-[32px] w-auto" loading="lazy" decoding="async" />
                </button>

                {/* 메뉴 항목 */}
                <div className="flex items-center gap-8">
                  {desktopMenuItems.map((item) => {
                    if (item.type === "route") {
                      return (
                        <button
                          key={item.href}
                          onClick={() => goToRoute(item.href)}
                          className="text-[15px] font-medium transition-all text-[#666] hover:text-[#333] cursor-pointer"
                        >
                          {item.label}
                        </button>
                      );
                    }
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`text-[15px] font-medium transition-all relative group ${
                          activeSection === item.id
                            ? "text-[#d22727]"
                            : "text-[#666] hover:text-[#333] cursor-pointer"
                        }`}
                      >
                        {item.label}
                        {/* 활성 상태 밑줄 */}
                        {activeSection === item.id && (
                          <motion.div
                            layoutId="desktopActiveMenu"
                            className="absolute -bottom-[23px] left-0 right-0 h-[3px] bg-[#d22727]"
                            initial={false}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 무료상담 전화번호 */}
                <button
                  onClick={() => setIsConsultationOpen(true)}
                  className="flex items-center gap-2 bg-[#d22727] text-white px-5 py-2.5 rounded-full hover:bg-[#b81f1f] transition-colors cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                  <span className="font-medium whitespace-nowrap text-[16px]">
                    무료상담접수 : 1661-4830
                  </span>
                </button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* 데스크톱 상담 모달 */}
      <ConsultationModal
        isOpen={showNav && isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        variant="top"
      />

      {/* 모바일 네비게이션 */}
      <AnimatePresence>
        {showNav && (
          <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#eaeaea] shadow-sm"
          >
            <div className="flex items-center justify-between h-[60px] px-6">
              {/* 로고 */}
              <button
                onClick={() => scrollToSection("hero")}
                className="flex items-center"
              >
                <img src={logo} alt="청암홈윈도우" className="h-[28px] w-auto" loading="lazy" decoding="async" />
              </button>

              {/* 햄버거/X 버튼 */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-lg active:bg-[#f8f8f8] transition-colors relative"
              >
                {/* 햄버거 -> X 애니메이션 */}
                <div className="relative w-6 h-5 flex flex-col justify-center gap-1.5">
                  <motion.span
                    animate={{
                      rotate: isMobileMenuOpen ? 45 : 0,
                      y: isMobileMenuOpen ? 8 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-0.5 bg-[#333] rounded-full origin-center"
                  />
                  <motion.span
                    animate={{
                      opacity: isMobileMenuOpen ? 0 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-0.5 bg-[#333] rounded-full"
                  />
                  <motion.span
                    animate={{
                      rotate: isMobileMenuOpen ? -45 : 0,
                      y: isMobileMenuOpen ? -8 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-0.5 bg-[#333] rounded-full origin-center"
                  />
                </div>
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* 모바일 사이드 메뉴 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* 반투명 오버레이 (30%) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-[60]"
            />

            {/* 메뉴 패널 (70%) */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="md:hidden fixed right-0 top-0 bottom-0 w-[70%] bg-white z-[70] shadow-2xl overflow-y-auto"
            >
              {/* 메뉴 헤더 */}
              <div className="sticky top-0 bg-white border-b border-[#eaeaea] px-6 py-4 z-10">
                <h2 className="text-lg font-bold text-[#333]">메뉴</h2>
              </div>

              {/* 메뉴 아이템 리스트 */}
              <div className="py-4">
                {sections.map(({ id, label }, index) => (
                  <motion.button
                    key={id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    onClick={() => scrollToSection(id)}
                    className={`w-full text-left px-6 py-4 border-l-4 transition-all ${
                      activeSection === id
                        ? "border-[#d22727] bg-[#d22727]/5 text-[#d22727] font-bold"
                        : "border-transparent text-[#666] active:bg-[#f8f8f8]"
                    }`}
                  >
                    <span className="text-[15px]">{label}</span>
                  </motion.button>
                ))}

                {/* 별도 페이지 — AS접수 */}
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: sections.length * 0.03, duration: 0.3 }}
                  onClick={() => goToRoute('/as')}
                  className="w-full text-left px-6 py-4 border-l-4 border-transparent text-[#666] active:bg-[#f8f8f8] mt-2 border-t border-[#eee] pt-5"
                >
                  <span className="text-[15px] font-semibold">AS 접수</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PC 섹션 인디케이터 */}
      <AnimatePresence>
        {showIndicator && !isEstimateModalOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            className="hidden md:block fixed right-8 top-1/2 -translate-y-1/2 z-[9999]"
          >
            <div className="flex flex-col gap-3 items-end relative">
              {/* 연결선 */}
              <div className="absolute right-[7px] top-[4px] bottom-[4px] w-[2px] bg-[#e0e0e0] -z-10" />
              
              {sections.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className="group flex items-center gap-3 relative"
                >
                  {/* 섹션 라벨 - 항상 표시 */}
                  <span
                    className={`text-[13px] whitespace-nowrap transition-all duration-300 text-right ${
                      activeSection === id
                        ? "text-[#d22727] font-bold"
                        : "text-[#bbb] font-normal group-hover:text-[#666] cursor-pointer"
                    }`}
                  >
                    {label}
                  </span>

                  {/* 인디케이터 점 */}
                  <div className="relative flex items-center justify-center w-4 h-4">
                    {/* 실제 점 */}
                    <div
                      className={`relative z-10 transition-all duration-300 rounded-full ${
                        activeSection === id
                          ? "w-3 h-3 bg-[#d22727]"
                          : "w-2 h-2 bg-[#ccc] group-hover:bg-[#999]"
                      }`}
                    />
                    
                    {/* 활성화 하이라이트 효과 */}
                    {activeSection === id && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 bg-[#d22727]/20 rounded-full z-0"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}