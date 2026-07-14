import { FaqPageShell, generalFaqs } from "./faqShared";

/** /faq/general — 자주 묻는 질문 (정본: 청암홈윈도우_FAQ_일반.html, 푸터 링크) */
export function Component() {
  return (
    <FaqPageShell
      kicker="자주 묻는 질문"
      title={
        <>
          창호·샷시 교체, <span className="text-[#D22727]">궁금한 점</span>을 모았습니다
        </>
      }
      sub="실제 상담에서 가장 많이 나오는 질문을 결론부터 정리했습니다."
      faqs={generalFaqs}
    />
  );
}
