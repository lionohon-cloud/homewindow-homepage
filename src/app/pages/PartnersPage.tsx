import { useEffect, useState } from "react";
import PartnersHero from "../components/partners/PartnersHero";
import PartnersProcess from "../components/partners/PartnersProcess";
import PartnersTrust from "../components/partners/PartnersTrust";
import PartnersBenefits from "../components/partners/PartnersBenefits";
import PartnersPlans from "../components/partners/PartnersPlans";
import PartnersTestimonials from "../components/partners/PartnersTestimonials";
import PartnersFAQ from "../components/partners/PartnersFAQ";
import PartnersApplicationModal from "../components/partners/PartnersApplicationModal";

export function Component() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 검색엔진 인덱싱 정책 — 모집 페이지라 허용
  useEffect(() => {
    document.title = "홈윈도우 파트너스 — 창문 소개만 해주세요";
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PartnersHero onApplyClick={() => setIsModalOpen(true)} />
      <PartnersProcess />
      <PartnersTrust />
      <PartnersBenefits />
      <PartnersPlans />
      <PartnersTestimonials />
      <PartnersFAQ />

      {/* Fixed Apply Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-0 w-[40%] md:w-[20%] bg-[#1f6fff] text-white font-['Pretendard',sans-serif] font-bold text-base py-4 rounded-l-full border-1 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-[#1557d6] transition-colors z-50 cursor-pointer"
      >
        지금 신청하기→
      </button>

      <PartnersApplicationModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
