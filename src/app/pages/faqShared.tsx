import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { motion } from "motion/react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { BottomBar } from "../components/BottomBar";
import { guideFaqs, generalFaqs, type FaqItem } from "../data/faqData";

/**
 * FAQ 공용 파츠 (260714). 정본 2종 = 별도 페이지 2개:
 *   /faq          — 업체 선택 가이드 (상단 메뉴 FAQ)
 *   /faq/general  — 자주 묻는 질문   (푸터 링크)
 * FAQ 데이터는 ../data/faqData.ts 로 분리(화면·서버 JSON-LD 공유). 문구 수정은 거기서.
 */

export { guideFaqs, generalFaqs };
export type { FaqItem };

/** 정본과 동일 규칙 — 대표전화 빨간 강조 */
function renderBody(body: string) {
  const parts = body.split("1661-4830");
  if (parts.length === 1) return body;
  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && (
        <span className="text-[#D22727] font-bold whitespace-nowrap">1661-4830</span>
      )}
    </span>
  ));
}

function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  return (
    <Accordion.Root type="single" collapsible className="space-y-3">
      {faqs.map((faq, index) => (
        <Accordion.Item
          key={index}
          value={`item-${index}`}
          className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden transition-all data-[state=open]:border-[#D22727] data-[state=open]:shadow-[0_4px_16px_rgba(210,39,39,0.06)]"
        >
          <Accordion.Header>
            <Accordion.Trigger className="w-full flex items-start justify-between gap-3 px-5 md:px-6 py-5 text-left cursor-pointer group [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg]:text-[#D22727]">
              <div className="flex items-start gap-2 flex-1">
                <span className="font-extrabold text-[#D22727] text-[16px] md:text-[17px] flex-shrink-0 leading-[1.45]">
                  Q.
                </span>
                <span className="font-extrabold text-[#333] text-[16px] md:text-[17px] break-keep leading-[1.45] tracking-[-0.3px]">
                  {faq.q}
                </span>
              </div>
              <ChevronDown className="w-5 h-5 mt-0.5 text-[#999] flex-shrink-0 transition-transform duration-200" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden">
            <p className="px-5 md:px-6 pb-6 text-[#666] text-[15px] leading-[1.75] break-keep">
              <strong className="text-[#333] font-bold">{faq.lead}</strong>{" "}
              {renderBody(faq.body)}
            </p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

interface FaqPageShellProps {
  kicker: string;
  title: ReactNode;
  sub: string;
  faqs: FaqItem[];
}

/** FAQ 페이지 공통 프레임 — 상단 GNB·하단 푸터는 메인과 동일 */
export function FaqPageShell({ kicker, title, sub, faqs }: FaqPageShellProps) {
  // FAQPage JSON-LD 는 서버(functions/_middleware.ts)에서 초기 HTML에 주입한다
  // (AI 크롤러가 JS 없이도 읽도록). 여기서 중복 주입하지 않는다.
  return (
    <div className="relative w-full min-h-screen pb-[100px] md:pb-[110px] bg-white font-['Pretendard',sans-serif] overflow-x-hidden selection:bg-[#d22727] selection:text-white">
      <Navigation />

      <main className="w-full">
        <section className="w-full pt-[110px] md:pt-[130px] pb-16 md:pb-20 bg-[#fafafa]">
          <div className="max-w-screen-md mx-auto px-6 md:px-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-[#999] text-[16px] font-medium mb-2.5">{kicker}</p>
              <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#333] leading-[1.3] tracking-[-0.5px] mb-4 break-keep">
                {title}
              </h1>
              <p className="text-[#666] text-[15px] md:text-[16px] leading-[1.65] mb-10 break-keep">
                {sub}
              </p>
              <FaqAccordion faqs={faqs} />
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <BottomBar />
    </div>
  );
}
