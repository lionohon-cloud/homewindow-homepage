import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface WarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WarrantyModal({ isOpen, onClose }: WarrantyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-24 md:pb-4"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full md:w-[60vw] max-w-4xl flex flex-col shadow-2xl"
              style={{ maxHeight: 'calc(100vh - 8rem - 100px)' }}
            >
              {/* Header */}
              <div className="flex-shrink-0 bg-white border-b border-[#eee] px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="text-[20px] md:text-[24px] font-extrabold text-[#333]">
                  세부항목별 보증기간
                </h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors flex-shrink-0 cursor-pointer"
                  aria-label="닫기"
                >
                  <X size={20} className="text-[#999]" />
                </button>
              </div>

              {/* Content */}
              <div 
                className="flex-1 overflow-y-auto px-6 py-6"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db transparent'
                }}
              >
                <style>{`
                  div::-webkit-scrollbar {
                    width: 8px;
                  }
                  div::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  div::-webkit-scrollbar-thumb {
                    background-color: #d1d5db;
                    border-radius: 4px;
                  }
                  div::-webkit-scrollbar-thumb:hover {
                    background-color: #9ca3af;
                  }
                `}</style>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-2 py-3 text-left text-[14px] font-bold text-gray-700">
                          구분
                        </th>
                        <th className="border border-gray-300 px-2 py-3 text-left text-[14px] font-bold text-gray-700">
                          무상 보증 내역
                        </th>
                        <th className="border border-gray-300 px-2 py-3 text-center text-[14px] font-bold text-gray-700 w-32">
                          PRESTIGE
                        </th>
                        <th className="border border-gray-300 px-2 py-3 text-center text-[14px] font-bold text-gray-700 w-32">
                          SIGNATURE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 원자재 보증 */}
                      <tr>
                        <td className="border border-gray-300 px-2 py-3 text-[14px] font-medium text-gray-900 align-middle">
                          원자재 보증
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-[14px] text-gray-700">
                          프로파일 변형에 의한 불량
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] font-bold text-[#D22727]">
                          15년
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] font-bold text-[#D22727]">
                          15년
                        </td>
                      </tr>

                      {/* 제작 품질보증 */}
                      <tr>
                        <td rowSpan={4} className="border border-gray-300 px-2 py-3 text-[14px] font-medium text-gray-900 align-middle">
                          제작 품질보증
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-[14px] text-gray-700">
                          샷시(틀/짝)의 모서리 용접부 파손(틀새발생)
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] text-gray-900">
                          5년
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] text-gray-900">
                          4년
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-2 py-3 text-[14px] text-gray-700">
                          샷시 호차(틀러)의 파손으로 문열림 불량(개폐불량)
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] text-gray-900">
                          3년
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] text-gray-900">
                          2년
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-2 py-3 text-[14px] text-gray-700">
                          핸들 및 접금장치(크리센트)의 고장으로 샷시 개폐불량
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] text-gray-900">
                          3년
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] text-gray-900">
                          2년
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-2 py-3 text-[14px] text-gray-700">
                          성능 저하 및 파손(풍지판, 모헤어, 방충망)
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] text-gray-900">
                          3년
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] text-gray-900">
                          2년
                        </td>
                      </tr>

                      {/* 시공 품질보증 */}
                      <tr>
                        <td rowSpan={3} className="border border-gray-300 px-2 py-3 text-[14px] font-medium text-gray-900 align-middle">
                          시공 품질보증
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-[14px] text-gray-700">
                          벽체와 창틀 사이의 틈에 의한 누수 발생
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] text-gray-900">
                          2년
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] text-gray-900">
                          2년
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-2 py-3 text-[14px] text-gray-700">
                          창짝의 기울어짐(수평불량)에 의한 누수
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] text-gray-900">
                          2년
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] text-gray-900">
                          2년
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-2 py-3 text-[14px] text-gray-700">
                          시공시 발생한 실리콘 및 틈틈 자업의 불량
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] text-gray-900">
                          2년
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] text-gray-900">
                          2년
                        </td>
                      </tr>

                      {/* 유리 품질보증 */}
                      <tr>
                        <td className="border border-gray-300 px-2 py-3 text-[14px] font-medium text-gray-900 align-middle">
                          유리 품질보증
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-[14px] text-gray-700">
                          복층 유리 내부의 습기발생시 1:1 교환
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] text-gray-900">
                          1년
                        </td>
                        <td className="border border-gray-300 px-2 py-3 text-center text-[14px] text-gray-900">
                          1년
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {/* 원자재 보증 */}
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-3 font-bold text-[14px] text-gray-900 text-center">
                      원자재 보증
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="text-[14px] text-gray-700 text-center">
                        프로파일 변형에 의한 불량
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div>
                          <div className="text-[14px] font-bold text-[#D22727]">15년</div>
                          <div className="text-[12px] text-gray-600 mt-1">PRESTIGE</div>
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-[#D22727]">15년</div>
                          <div className="text-[12px] text-gray-600 mt-1">SIGNATURE</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 제작 품질보증 */}
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-3 font-bold text-[14px] text-gray-900 text-center">
                      제작 품질보증
                    </div>
                    <div className="divide-y divide-gray-200">
                      {/* 항목 1 */}
                      <div className="p-4 space-y-3">
                        <div className="text-[14px] text-gray-700 text-center">
                          샷시(틀/짝)의 모서리 용접부 파손(틀새발생)
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div>
                            <div className="text-[14px] font-bold text-gray-900">5년</div>
                            <div className="text-[12px] text-gray-600 mt-1">PRESTIGE</div>
                          </div>
                          <div>
                            <div className="text-[14px] font-bold text-gray-900">4년</div>
                            <div className="text-[12px] text-gray-600 mt-1">SIGNATURE</div>
                          </div>
                        </div>
                      </div>

                      {/* 항목 2 */}
                      <div className="p-4 space-y-3">
                        <div className="text-[14px] text-gray-700 text-center">
                          샷시 호차(틀러)의 파손으로 문열림 불량<br />(개폐불량)
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div>
                            <div className="text-[14px] font-bold text-gray-900">3년</div>
                            <div className="text-[12px] text-gray-600 mt-1">PRESTIGE</div>
                          </div>
                          <div>
                            <div className="text-[14px] font-bold text-gray-900">2년</div>
                            <div className="text-[12px] text-gray-600 mt-1">SIGNATURE</div>
                          </div>
                        </div>
                      </div>

                      {/* 항목 3 */}
                      <div className="p-4 space-y-3">
                        <div className="text-[14px] text-gray-700 text-center">핸들 및 잠금장치(크리센트)의 고장으로<br />샷시 개폐불량</div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div>
                            <div className="text-[14px] font-bold text-gray-900">3년</div>
                            <div className="text-[12px] text-gray-600 mt-1">PRESTIGE</div>
                          </div>
                          <div>
                            <div className="text-[14px] font-bold text-gray-900">2년</div>
                            <div className="text-[12px] text-gray-600 mt-1">SIGNATURE</div>
                          </div>
                        </div>
                      </div>

                      {/* 항목 4 */}
                      <div className="p-4 space-y-3">
                        <div className="text-[14px] text-gray-700 text-center">
                          성능 저하 및 파손(풍지판, 모헤어, 방충망)
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div>
                            <div className="text-[14px] font-bold text-gray-900">3년</div>
                            <div className="text-[12px] text-gray-600 mt-1">PRESTIGE</div>
                          </div>
                          <div>
                            <div className="text-[14px] font-bold text-gray-900">2년</div>
                            <div className="text-[12px] text-gray-600 mt-1">SIGNATURE</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 시공 품질보증 */}
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-3 font-bold text-[14px] text-gray-900 text-center">
                      시공 품질보증
                    </div>
                    <div className="divide-y divide-gray-200">
                      {/* 항목 1 */}
                      <div className="p-4 space-y-3">
                        <div className="text-[14px] text-gray-700 text-center">
                          벽체와 창틀 사이의 틈에 의한 누수 발생
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div>
                            <div className="text-[14px] font-bold text-gray-900">2년</div>
                            <div className="text-[12px] text-gray-600 mt-1">PRESTIGE</div>
                          </div>
                          <div>
                            <div className="text-[14px] font-bold text-gray-900">2년</div>
                            <div className="text-[12px] text-gray-600 mt-1">SIGNATURE</div>
                          </div>
                        </div>
                      </div>

                      {/* 항목 2 */}
                      <div className="p-4 space-y-3">
                        <div className="text-[14px] text-gray-700 text-center">
                          창짝의 기울어짐(수평불량)에 의한 누수
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div>
                            <div className="text-[14px] font-bold text-gray-900">2년</div>
                            <div className="text-[12px] text-gray-600 mt-1">PRESTIGE</div>
                          </div>
                          <div>
                            <div className="text-[14px] font-bold text-gray-900">2년</div>
                            <div className="text-[12px] text-gray-600 mt-1">SIGNATURE</div>
                          </div>
                        </div>
                      </div>

                      {/* 항목 3 */}
                      <div className="p-4 space-y-3">
                        <div className="text-[14px] text-gray-700 text-center">시공시 발생한 실리콘 및 몰딩 작업의 불량</div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div>
                            <div className="text-[14px] font-bold text-gray-900">2년</div>
                            <div className="text-[12px] text-gray-600 mt-1">PRESTIGE</div>
                          </div>
                          <div>
                            <div className="text-[14px] font-bold text-gray-900">2년</div>
                            <div className="text-[12px] text-gray-600 mt-1">SIGNATURE</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 유리 품질보증 */}
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-3 font-bold text-[14px] text-gray-900 text-center">
                      유리 품질보증
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="text-[14px] text-gray-700 text-center">
                        복층 유리 내부의 습기발생시 1:1 교환
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div>
                          <div className="text-[14px] font-bold text-gray-900">1년</div>
                          <div className="text-[12px] text-gray-600 mt-1">PRESTIGE</div>
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-gray-900">1년</div>
                          <div className="text-[12px] text-gray-600 mt-1">SIGNATURE</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="mt-6 text-[12px] text-gray-500">
                  원자재 보증 제외사항 : 백색 이외의 색상 프로파일 제품은 무상보증에서 제외됩니다.
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}