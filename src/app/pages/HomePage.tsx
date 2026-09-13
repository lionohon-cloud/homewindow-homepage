import { useEffect } from "react";
import { Navigation } from "../components/Navigation";
// 260911 히어로를 스크롤 스토리로 교체 — 되돌릴 때 이 import 를 살린다
// import { HeroSection } from "../components/HeroSection";
import { STORY_E } from "../components/hero-lab/HeroScrollStory";
import { HeroScrollStoryLab } from "../components/hero-lab/HeroScrollStoryModes";
import { HeroConsultSection } from "../components/HeroConsultSection";
// 260831: 9월 프로모션 배너로 교체. 원래 SUPER SALE 배너는 EventSection.tsx 에 그대로 있다 —
// 되돌리려면 아래 import 와 <EventPromoBanner /> 를 EventSection 으로 되돌리면 된다.
import { EventPromoBanner } from "../components/EventPromoBanner";
import { TemperedSections } from "../components/tempered/TemperedSections";
import { WhyBasicSection } from "../components/tempered/WhyBasicSection";
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
import { SectionStepArrow } from "../components/SectionStepArrow";
import { DanjiAiBanner } from "../components/DanjiAiBanner";

export default function HomePage() {
  // 탭 구분용 — 로컬 개발 서버(dev)에서만 "메인"으로 바뀐다.
  // import.meta.env.DEV 는 프로덕션 빌드에서 항상 false 라 배포본은 자동으로
  // index.html 의 기본 타이틀("청암홈윈도우")로 돌아간다 — 되돌릴 필요 없음.
  useEffect(() => {
    if (import.meta.env.DEV) document.title = "메인";
  }, []);

  return (
    /* 260911 overflow-x-hidden → overflow-x-clip.
       히어로 스크롤 스토리가 화면에 붙어(sticky) 있어야 하는데, overflow-x:hidden 은 세로까지
       스크롤 상자로 만들어 sticky 가 풀린다. clip 은 가로로 넘치는 걸 똑같이 잘라 내면서 sticky 는 살린다. */
    <div className="relative w-full min-h-screen pb-[100px] md:pb-[110px] bg-white font-['Pretendard',sans-serif] overflow-x-clip selection:bg-[#d22727] selection:text-white">
      <Navigation />
      <main className="w-full h-full flex flex-col">
        <div id="hero">
          {/* 260911 — 히어로를 E안 스크롤 스토리로 교체 (/copy-lab E · /scroll-lab B 에서 확정).
              한 번 내릴 때마다 한 장면: 영상 → 사진 → 검정 "하지만" → "청암홈윈도우는 가능합니다." → 영상 + CTA.
              문구는 hero-lab/HeroScrollStory.tsx 의 STORY_E.
              예전 히어로로 되돌리려면 이 자리를 <HeroSection /> 로 바꾸고 위 overflow-x-clip 은 그대로 둬도 된다. */}
          {/* 260913 — snap(장면별 멈춤) → auto(자동 재생).
              스크롤을 잡지 않는다: 히어로가 화면에 있는 동안 5.7초 타임라인이 저절로 흐르고,
              첫 휠·터치부터 페이지는 평소대로 움직인다. snap 시안은 코드에 그대로 남아 있어
              mode 만 되돌리면 복귀한다. */}
          <HeroScrollStoryLab story={STORY_E} mode="auto" />
        </div>
        {/* 260911 — 히어로가 다 말하지 못한 "왜" 를 잇는다.
            왜 비싸고 번거로웠나 → 유리가 지나가는 길 비교 → 그래서 강화유리가 기본 */}
        <WhyBasicSection />
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
      {/* 260913 — 히어로 안에만 있던 장식용 화살표를 대신하는 단계 이동 버튼.
          하단 상담 바 위 가운데에 상시 노출되고, 왼쪽 단계 메뉴와 같은 순서
          (app/nav/sections.ts)로 다음 섹션까지 내려간다. 마지막 단계에서는 위로 뒤집혀
          "처음으로" 돌아간다. BottomBar 와 형제로 두어야 fixed 가 잘리지 않는다. */}
      <SectionStepArrow />
      <BottomBar />
    </div>
  );
}
