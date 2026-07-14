import { FaqPageShell, guideFaqs } from "./faqShared";

/** /faq — 업체 선택 가이드 (정본: 청암홈윈도우_FAQ_추천.html, 상단 메뉴 FAQ) */
export function Component() {
  return (
    <FaqPageShell
      kicker="업체 선택 가이드"
      title={
        <>
          창호 교체, <span className="text-[#D22727]">어디에 맡겨야</span> 할까요?
        </>
      }
      sub="믿을 수 있는 업체를 고르는 기준과, 청암홈윈도우가 다른 점."
      faqs={guideFaqs}
    />
  );
}
