import { motion } from 'motion/react';
import { UserPlus, Briefcase } from 'lucide-react';

export default function PartnersPlans() {
  const plans = [
    {
      icon: <UserPlus className="w-8 h-8 text-[#1f6fff]" strokeWidth={2.5} />,
      badge: '소개만',
      percentage: '6%',
      title: '홈윈도우 파트너',
      description: <>희망고객만 알려주시면<br/> 방문·실측·계약은 회사가'</>,
      target: '부담 없이 가볍게 시작하고 싶은 분',
    },
    {
      icon: <Briefcase className="w-8 h-8 text-[#1f6fff]" strokeWidth={2.5} />,
      badge: '직접',
      percentage: '10%',
      title: '홈윈도우 매니저',
      description: <>발굴부터 실측·계약까지 직접<br />(전문 멘토링 지원)</>,
      target: '부업을 넘어 전문가로 활동하고 싶은 분',
      highlighted: true,
    },
  ];

  return (
    <section className="bg-white min-h-screen md:min-h-[80vh] flex flex-col items-center justify-center px-6 py-20 md:py-10">
      <div className="max-w-md md:max-w-4xl w-full">
        {/* Section Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-['Pretendard',sans-serif] font-extrabold text-[35px] leading-[1.3] text-black">
            두 가지 방법으로 <br/> 시작하세요
          </h2>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`bg-white border-2 ${
                plan.highlighted ? 'border-[#1f6fff]' : 'border-[#e4eaf2]'
              } rounded-2xl p-8 relative`}
            >
              {/* Badge and Percentage */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-[#eef4ff] rounded-full w-12 h-12 flex items-center justify-center">
                    {plan.icon}
                  </div>
                  <span className="font-['Pretendard',sans-serif] font-bold text-sm text-[#1f6fff] bg-[#eef4ff] px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-['Pretendard',sans-serif] font-extrabold text-2xl text-black mb-4">
                {plan.title}
              </h3>

              {/* Description */}
              <p className="font-['Pretendard',sans-serif] font-medium text-base leading-[1.6] text-[#333] mb-6">
                {plan.description}
              </p>

              {/* Target */}
              <div className="bg-[#f4f7fb] rounded-xl p-4">
                <p className="font-['Pretendard',sans-serif] font-medium text-sm leading-[1.6] text-[#666]">
                  {plan.target}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="font-['Pretendard',sans-serif] font-medium text-sm text-center text-[#666]"
        >
          *부업으로 시작해 전문가로 성장하는 길이 열려 있어요.
        </motion.p>
      </div>
    </section>
  );
}
