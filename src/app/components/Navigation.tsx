import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router";
import { Phone, Handshake } from "lucide-react";
import { ConsultationModal } from "./ConsultationModal";
import {
  closeConsultBar,
  openConsultBar,
  useConsultBarEntry,
  useConsultBarOpen,
} from "@/lib/consultBar";
import { useDday } from "@/lib/dday";
import logo from "@/assets/logo-gnb.svg";

interface NavigationProps {
  onMenuClick?: () => void;
  /** 접수 출처 접두. 시트 D열의 "<출처> <기기> <위치>" 중 출처.
      기본값이 원본과 같아 메인 동작은 그대로다. */
  entrySource?: string;
}

const sections = [
  { id: "hero", label: "처음으로" },
  { id: "event", label: "이벤트" },
  { id: "awards", label: "수상내역" },
  { id: "insurance", label: "안심보증" },
  { id: "production", label: "자동화 제조 공장" },
  { id: "brands", label: "취급 브랜드" },
  { id: "materials", label: "자재품질" },
  { id: "tempered", label: "강화유리" },
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

// 시공후기 운영 토글 — docs/REVIEW_GO_LIVE.md 참조
// OFF: GNB 메뉴 + /review 리스트/상세 페이지 숨김 (작성 진입은 EventSection 의 CTA로 살아있음)
// ON : VITE_REVIEW_SECTION_LIVE=1
const REVIEW_LIVE = import.meta.env.VITE_REVIEW_SECTION_LIVE === "1";

// 260714 상단 메뉴 개편: 이벤트·제작공장·15년보증·시공후기·FAQ 5개 균등 정렬 (+파트너스)
// 260715 AS접수 복원: 개편 때 데스크톱 GNB에서 누락된 것 FAQ 오른쪽 끝에 재추가 (부사장님 지시)
const desktopMenuItems: DesktopMenuItem[] = [
  { type: "section", id: "event", label: "이벤트" },
  { type: "section", id: "production", label: "제작공장" },
  { type: "section", id: "warranty", label: "15년보증" },
  ...(REVIEW_LIVE
    ? [{ type: "section" as const, id: "review", label: "시공후기" }]
    : []),
  { type: "route", href: "/faq", label: "FAQ" },
  { type: "route", href: "/as", label: "AS접수" },
];

export function Navigation({ onMenuClick, entrySource }: NavigationProps) {
  const navigate = useNavigate();
  const dday = useDday(); // 종료일은 src/lib/dday.ts 의 PROMO_END 한 곳에서 관리
  const location = useLocation();
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  /* 접수 바는 화면에 하나뿐이다 — 히어로 버튼으로도 같은 바가 열린다.
     상태는 lib/consultBar.ts 에 있고, 그리는 건 여기(GNB)가 맡는다. */
  const isConsultationOpen = useConsultBarOpen();
  const consultEntry = useConsultBarEntry();

  // GNB가 숨겨지면 상담 모달도 닫기
  useEffect(() => {
    if (!showNav) {
      closeConsultBar();
    }
  }, [showNav]);

  /* 260911 — 접수 바가 열리면 GNB 를 다시 내린다.
     바는 GNB 가 보일 때만 그려진다(아래 isOpen={showNav && …}). 그래서 아래로 스크롤해
     GNB 가 접힌 상태에서 다른 버튼(히어로 스크롤 스토리 끝의 CTA 등)으로 열면
     "열림" 상태인데 화면에는 아무것도 안 뜨는 버그가 있었다.
     기준 스크롤 위치도 지금 자리로 맞춰, 열자마자 숨김 판정이 다시 걸리지 않게 한다.
     열린 뒤 아래로 스크롤하면 전처럼 GNB 와 함께 닫힌다. */
  useEffect(() => {
    if (!isConsultationOpen) return;
    setShowNav(true);
    setLastScrollY(window.scrollY);
  }, [isConsultationOpen]);

  // 모바일 사이드 메뉴 열려있는 동안 body 스크롤 잠금
  // (iOS Safari scroll chaining + 메뉴 바깥 터치 둘 다 차단)
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMobileMenuOpen]);

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

          setActiveSection(currentSection);
          
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
            className="hidden min-[1550px]:block fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#eaeaea] shadow-sm"
          >
            <div className="max-w-screen-xl mx-auto px-6 md:px-10">
              <div className="flex items-center justify-between h-[70px]">
                {/* 로고 */}
                <button
                  onClick={() => scrollToSection("hero")}
                  className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {/* 심볼 + 2줄 워드마크가 한 덩어리인 CI(비율 3.41).
                      HOME 글자가 이전 CI 의 워드마크와 같은 크기로 보이는 높이다. */}
                  <img src={logo} alt="청암홈윈도우" className="h-[34px] w-auto" loading="lazy" decoding="async" />
                </button>

                {/* 메뉴 항목 — 로고~버튼 사이 균등 간격 (260714) */}
                <div className="flex-1 flex items-center justify-evenly gap-2 px-4 md:px-8">
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

                  {/* 홈윈도우 파트너스 (별도 페이지) — 메뉴 항목 옆 텍스트 링크 */}
                  <button
                    onClick={() => navigate("/partners")}
                    className="flex items-center gap-1.5 text-[#1f6fff] hover:underline transition cursor-pointer"
                  >
                    <Handshake className="w-4 h-4" />
                    <span className="font-semibold whitespace-nowrap text-[14.5px]">
                      홈윈도우 파트너스
                    </span>
                  </button>
                </div>

                {/* 무료상담 전화번호 (단독 우측 CTA) — 재클릭 시 닫힘 (토글) */}
                <button
                  /* 토글이되, "GNB 가 연 바"에 대해서만이다.
                     바는 하나뿐이라 그냥 토글로 두면 히어로가 띄운 폼을 GNB 버튼이
                     닫아 버린다. 서로 다른 버튼이니 남이 연 건 건드리지 않는다.
                     (열려 있을 때 openConsultBar 는 아무 일도 안 한다 → 그대로 유지) */
                  onClick={() =>
                    isConsultationOpen && consultEntry === "GNB"
                      ? closeConsultBar()
                      : openConsultBar("GNB")
                  }
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
        onClose={closeConsultBar}
        variant="top"
        entry={consultEntry}
        entrySource={entrySource}
      />

      {/* 모바일 네비게이션 */}
      <AnimatePresence>
        {showNav && (
          <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="min-[1550px]:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#eaeaea] shadow-sm"
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
              className="min-[1550px]:hidden fixed inset-0 bg-black/50 z-[60]"
            />

            {/* 메뉴 패널 (70%) */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="min-[1550px]:hidden fixed right-0 top-0 bottom-0 w-[70%] max-w-[420px] bg-white z-[70] shadow-2xl overflow-y-auto overscroll-contain"
            >
              {/* 메뉴 헤더 — 제목 오른쪽 빈자리에 프로모션 배지 하나.
                  패널이 좁아(70%, 375px 기준 263px) 문구와 D-day 를 한 알약에 담고
                  글자를 11px 로 잡아야 "메뉴" 옆 한 줄에 들어간다.
                  350px 미만(구형 소형기기)에서는 글자와 좌우 여백을 한 단계 줄여 맞춘다. */}
              <div className="sticky top-0 bg-white border-b border-[#eaeaea] px-6 py-4 z-10 flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#333] shrink-0">메뉴</h2>
                <button
                  type="button"
                  onClick={() => scrollToSection("event")}
                  className="ml-auto shrink-0 inline-flex items-center gap-1.5 bg-[#d22727] rounded-full px-2 min-[350px]:px-2.5 py-1 text-[10px] min-[350px]:text-[11px] font-bold text-white whitespace-nowrap cursor-pointer active:opacity-80 transition-opacity"
                  aria-label="추석맞이 할인 보기"
                >
                  추석맞이 할인 진행중
                  <span className="font-extrabold tabular-nums">{dday}</span>
                </button>
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

                {/* 시공후기 페이지 — REVIEW_LIVE flag 켤 때만 노출 */}
                {REVIEW_LIVE && (
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sections.length * 0.03, duration: 0.3 }}
                    onClick={() => goToRoute('/review')}
                    className="w-full text-left px-6 py-4 border-l-4 border-transparent text-[#666] active:bg-[#f8f8f8] mt-2 border-t border-[#eee] pt-5"
                  >
                    <span className="text-[15px] font-semibold">시공 후기</span>
                  </motion.button>
                )}

                {/* 260503: Cloudflare 이관 완료 후 재개 */}
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (sections.length + 1) * 0.03, duration: 0.3 }}
                  onClick={() => goToRoute('/as')}
                  className={`w-full text-left px-6 py-4 border-l-4 border-transparent text-[#666] active:bg-[#f8f8f8] ${REVIEW_LIVE ? '' : 'mt-2 border-t border-[#eee] pt-5'}`}
                >
                  <span className="text-[15px] font-semibold">AS 접수</span>
                </motion.button>

                {/* FAQ — 업체 선택 가이드 (260714 신설, 데스크톱 메뉴와 동일) */}
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (sections.length + 2) * 0.03, duration: 0.3 }}
                  onClick={() => goToRoute('/faq')}
                  className="w-full text-left px-6 py-4 border-l-4 border-transparent text-[#666] active:bg-[#f8f8f8]"
                >
                  <span className="text-[15px] font-semibold">FAQ</span>
                </motion.button>

                {/* 홈윈도우 파트너스 (별도 페이지) — 톤다운 (회색 + 파란 점) */}
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (sections.length + 2) * 0.03, duration: 0.3 }}
                  onClick={() => goToRoute('/partners')}
                  className="w-full text-left px-6 py-4 border-l-4 border-transparent text-[#333] active:bg-[#f8f8f8] mt-2 border-t border-[#eee] pt-5 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1f6fff]" />
                  <span className="text-[15px] font-semibold">홈윈도우 파트너스</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PC 섹션 인디케이터 */}
      <AnimatePresence>
        {/* 히어로부터 상시 노출 (260714 — 부사장님 지시). 메인 페이지 전용 목차라 '/' 에서만 */}
        {location.pathname === "/" && !isEstimateModalOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="hidden min-[1550px]:block fixed left-8 top-1/2 -translate-y-1/2 z-[9999]"
          >
            <div className="flex flex-col gap-3 items-start relative">
              {/* 연결선 */}
              <div className="absolute left-[7px] top-[4px] bottom-[4px] w-[2px] bg-[#e0e0e0] -z-10" />

              {sections.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className="group flex flex-row-reverse items-center gap-3 relative"
                >
                  {/* 섹션 라벨 - 항상 표시 */}
                  <span
                    className={`text-[13px] whitespace-nowrap transition-all duration-300 text-left ${
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