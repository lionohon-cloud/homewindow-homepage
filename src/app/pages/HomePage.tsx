import { useEffect } from "react";
import { Navigation } from "../components/Navigation";
import { HeroSection } from "../components/HeroSection";
import { HeroConsultSection } from "../components/HeroConsultSection";
// 260831: 9월 프로모션 배너로 교체. 원래 SUPER SALE 배너는 EventSection.tsx 에 그대로 있다 —
// 되돌리려면 아래 import 와 <EventPromoBanner /> 를 EventSection 으로 되돌리면 된다.
import { EventPromoBanner } from "../components/EventPromoBanner";
import { TemperedSections } from "../components/tempered/TemperedSections";
import { AwardsSection } from "../components/AwardsSection";
import { InsuranceSection } from "../components/InsuranceSection";
import { ProductionSection } from "../components/ProductionSection";
import { BrandsSection } from "../components/BrandsSection";
import { MaterialsSection } from "../components/MaterialsSection";
import { GlassTypeSection } from "../components/GlassTypeSection";
import { SafetyNetSection } from "../components/SafetyNetSection";
import { OneDayInstallationSection } from "../components/OneDayInstallationSection";
import { WarrantySection } from "../components/WarrantySection";
import { ReviewSection } from "../components/ReviewSection";
import { CorporateValueSection } from "../components/CorporateValueSection";
import { Footer } from "../components/Footer";
import { BottomBar } from "../components/BottomBar";
import { DanjiAiBanner } from "../components/DanjiAiBanner";

export default function HomePage() {
  // 탭 구분용 — 로컬 개발 서버(dev)에서만 "메인"으로 바뀐다.
  // import.meta.env.DEV 는 프로덕션 빌드에서 항상 false 라 배포본은 자동으로
  // index.html 의 기본 타이틀("청암홈윈도우")로 돌아간다 — 되돌릴 필요 없음.
  useEffect(() => {
    if (import.meta.env.DEV) document.title = "메인";
  }, []);

  return (
    <div className="relative w-full min-h-screen pb-[100px] md:pb-[110px] bg-white font-['Pretendard',sans-serif] overflow-x-hidden selection:bg-[#d22727] selection:text-white">
      <Navigation />
      <main className="w-full h-full flex flex-col">
        <div id="hero">
          <HeroSection />
        </div>
        {/* 260907 통합버전 — 상세페이지가 없는 대신 그 본문(01 영상 ~ 06 어디에 쓰이나)이
            히어로 바로 다음에 통째로 들어간다. 히어로의 "강화유리 자세히 보기" 도
            여기(#video)로 내려온다.
            id="tempered" — GNB "강화유리" 메뉴가 이 id 로 스크롤한다(Navigation.tsx
            sections 배열). 이 태그 없이 <TemperedGlassSection> 만 빠지면 그 메뉴가
            아무 데도 못 간다. */}
        <div id="tempered">
          <TemperedSections />
        </div>
        {/* 번호 접수 — 강화유리 이야기를 다 읽은 다음에 받는다 */}
        <HeroConsultSection />
        <DanjiAiBanner />
        <div id="event">
          <EventPromoBanner />
        </div>
        <div id="awards">
          <AwardsSection />
        </div>
        <div id="insurance">
          <InsuranceSection />
        </div>
        <div id="production">
          <ProductionSection />
        </div>
        <div id="brands">
          <BrandsSection />
        </div>
        <div id="materials">
          <MaterialsSection />
        </div>
        {/* 260907 통합버전 — 여기 있던 강화유리 티저 섹션(TemperedGlassSection)은 뺐다.
            본문 전체가 이미 위에 들어가 있어 같은 얘기를 두 번 하게 되고,
            티저의 "자세히 보기" 목적지(상세페이지)도 이 버전에는 없다.
            되살리려면 import 와 함께 이 자리에 <TemperedGlassSection /> 를 넣으면 된다. */}
        <div id="glass">
          <GlassTypeSection />
        </div>
        <div id="safety">
          <SafetyNetSection />
        </div>
        <div id="installation">
          <OneDayInstallationSection />
        </div>
        <div id="warranty">
          <WarrantySection />
        </div>
        <div id="review">
          <ReviewSection />
        </div>
        <div id="corporate">
          <CorporateValueSection />
        </div>
      </main>
      <Footer />
      <BottomBar />
    </div>
  );
}
