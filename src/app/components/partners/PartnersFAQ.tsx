import { motion } from 'motion/react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

export default function PartnersFAQ() {
  const faqs = [
    {
      question: '정말 전문 지식 없이 가능한가요?',
      answer: '홈윈도우 파트너는 희망고객만 알려주시면 돼요. 이후 모든 과정은 청암홈윈도우 영업팀이 진행해요.',
    },
    {
      question: '수익은 어떻게, 언제 지급되나요?',
      answer: '소개해주신 고객님의 계약금 입금이 완료되면 계약금액의 일정 비율만큼 지급돼요. (프리랜서 3.3% 원천징수 후 지급)',
    },
    {
      question: '본업과 병행할 수 있나요?',
      answer: '정해진 근무 시간이나 출퇴근 의무가 없어 본업과 병행 가능해요.',
    },
    {
      question: '자격이나 비용이 드나요?',
      answer: '나이·성별·학력·경력 제한 없으며, 신청·활동에 별도 비용은 없어요.',
    },
  ];

  return (
    <section className="bg-[#f4f7fb] min-h-screen md:min-h-[80vh] flex flex-col items-center justify-center px-6 py-20 md:py-10">
      <div className="max-w-3xl w-full">
        {/* Section Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-['Pretendard',sans-serif] font-extrabold text-[35px] leading-[1.3] text-black">
            자주 묻는 질문
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Accordion.Root type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <Accordion.Item
                key={index}
                value={`item-${index}`}
                className="bg-white border border-[#e4eaf2] rounded-2xl overflow-hidden shadow-sm"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="w-full flex items-center justify-between px-6 py-5 text-left group hover:bg-[#1f6fff] transition-colors cursor-pointer">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="font-['Pretendard',sans-serif] font-bold text-[#1f6fff] group-hover:text-white text-lg flex-shrink-0 transition-colors">
                        Q.
                      </span>
                      <span className="font-['Pretendard',sans-serif] font-bold text-lg text-black group-hover:text-white transition-colors">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      className="w-6 h-6 text-[#666] group-hover:text-white flex-shrink-0 ml-4 transition-all duration-300 group-data-[state=open]:rotate-180"
                      strokeWidth={2.5}
                    />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                  <div className="px-6 pb-5 pt-2">
                    <div className="pl-9">
                      <p className="font-['Pretendard',sans-serif] font-medium text-base leading-[1.6] text-[#666]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </motion.div>
      </div>
    </section>
  );
}
