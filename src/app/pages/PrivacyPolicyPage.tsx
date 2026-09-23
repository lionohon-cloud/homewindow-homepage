import type { ReactNode } from "react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { BottomBar } from "../components/BottomBar";

/**
 * /privacy — 개인정보처리방침 (260923 가맹전환)
 * 정본: Downloads/Telegram Desktop/개인정보처리방침_최종_vox정리_1621.docx (개발 확인 완료본). 문구를 고치면 docx 와 함께 맞출 것.
 * 푸터 [개인정보처리방침] 링크와 상담 동의 모달에서 연결된다.
 */

/** 시행일 = 홈페이지에 게시하는 날. 소급 금지 — 배포 전에 반드시 실제 날짜로 바꿀 것 */
const EFFECTIVE_DATE = "2026년 9월 23일";

type Row = ReactNode[];

/** PC 는 표, 모바일은 행마다 카드(머리글: 값) — 6열 표도 가로 스크롤 없이 읽히게 */
function PolicyTable({ head, rows }: { head: string[]; rows: Row[] }) {
  // 5열 이상(국외 이전)은 PC 에서도 칸이 너무 좁아져 카드형으로만 보여 준다
  const cardsOnly = head.length >= 5;
  return (
    <>
      <div className={`${cardsOnly ? "hidden" : "hidden md:block"} overflow-hidden rounded-lg border border-[#e5e5e5] my-4`}>
        <table className="w-full text-[13.5px] leading-[1.6] border-collapse">
          <thead>
            <tr className="bg-[#f7f7f7]">
              {head.map((h) => (
                <th key={h} className="px-3 py-2.5 text-left font-bold text-[#333] border-b border-[#e5e5e5] break-keep">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-[#eee] first:border-t-0 align-top">
                {r.map((c, j) => (
                  <td key={j} className={`px-3 py-2.5 text-[#555] break-keep ${j === 0 ? "font-medium text-[#333]" : ""}`}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={`${cardsOnly ? "" : "md:hidden"} flex flex-col gap-2.5 my-4`}>
        {rows.map((r, i) => (
          <dl key={i} className="rounded-lg border border-[#e5e5e5] overflow-hidden text-[13.5px] leading-[1.6]">
            <div className="bg-[#f7f7f7] px-3.5 py-2.5 font-bold text-[#333] break-keep">{r[0]}</div>
            {r.slice(1).map((c, j) => (
              <div key={j} className="grid grid-cols-[84px_1fr] md:grid-cols-[120px_1fr] gap-2 px-3.5 md:px-4 py-2 border-t border-[#eee]">
                <dt className="text-[#999] break-keep">{head[j + 1]}</dt>
                <dd className="text-[#555] break-keep">{c}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
    </>
  );
}

function Article({ no, title, children }: { no: number; title: string; children: ReactNode }) {
  return (
    <section id={`article-${no}`} className="scroll-mt-[90px] pt-10 first:pt-0">
      <h2 className="text-[18px] md:text-[20px] font-bold text-[#222] mb-3">
        제{no}조 ({title})
      </h2>
      <div className="text-[14.5px] md:text-[15px] leading-[1.8] text-[#555] break-keep">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1 my-2 marker:text-[#bbb]">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

const Note = ({ children }: { children: ReactNode }) => (
  <p className="text-[13.5px] text-[#888] mt-2">{children}</p>
);

const ARTICLES = [
  "개인정보의 처리 목적",
  "처리하는 개인정보 항목과 수집 방법",
  "개인정보의 보유 및 이용 기간",
  "개인정보의 제3자 제공",
  "개인정보 처리의 위탁",
  "개인정보의 국외 이전",
  "개인정보의 파기 절차와 방법",
  "정보주체와 법정대리인의 권리·의무 및 행사 방법",
  "개인정보의 안전성 확보 조치",
  "쿠키의 설치·운영과 거부",
  "개인정보 보호책임자",
  "권익침해 구제 방법",
  "개인정보처리방침의 변경",
];

export function Component() {
  return (
    <div className="relative w-full min-h-screen pb-[100px] md:pb-[110px] bg-white font-['Pretendard',sans-serif] overflow-x-hidden">
      <Navigation />

      <main className="w-full">
        <section className="w-full pt-[110px] md:pt-[130px] pb-10 bg-[#fafafa] border-b border-[#eee]">
          <div className="max-w-screen-md mx-auto px-6 md:px-10">
            <h1 className="text-[28px] md:text-[34px] font-extrabold text-[#333] leading-[1.3] mb-4">개인정보처리방침</h1>
            <p className="text-[#666] text-[15px] leading-[1.7] break-keep">
              주식회사 청암홈윈도우(이하 「회사」)는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고, 이와
              관련한 고충을 신속하고 원활하게 처리하기 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.
            </p>
            <p className="text-[#999] text-[13.5px] mt-3">시행일자: {EFFECTIVE_DATE}</p>
          </div>
        </section>

        <div className="max-w-screen-md mx-auto px-6 md:px-10 py-10 md:py-14">
          {/* 목차 */}
          <nav aria-label="목차" className="rounded-xl bg-[#f7f7f7] px-5 py-4 mb-12">
            <p className="text-[14px] font-bold text-[#333] mb-2">목차</p>
            <ol className="grid md:grid-cols-2 gap-x-6 gap-y-1 text-[13.5px] text-[#666]">
              {ARTICLES.map((t, i) => (
                <li key={t}>
                  <a href={`#article-${i + 1}`} className="hover:text-[#D22727] hover:underline">
                    제{i + 1}조 {t}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <Article no={1} title={ARTICLES[0]}>
            <p>
              회사는 다음 목적으로 개인정보를 처리하며, 목적이 변경되면 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등
              필요한 조치를 이행합니다.
            </p>
            <Bullets
              items={[
                "상담 및 견적: 창호 상담 신청 접수, 방문 실측·견적 안내, 담당자 배정과 상담 결과 안내",
                "계약 및 시공: 계약 체결·이행, 시공 일정 안내, 대금 청구와 수금, 세금계산서·현금영수증 발행",
                "사후관리(AS): AS 접수와 처리, 처리 현황 조회, 품질 보증 이행",
                "고객 안내: 본인 확인을 위한 문자 인증, 진행 상황 안내 문자·전화 발송",
                "서비스 개선: 홈페이지 이용 통계 분석(개인을 식별하지 않는 형태)",
              ]}
            />
          </Article>

          <Article no={2} title={ARTICLES[1]}>
            <PolicyTable
              head={["구분", "필수 항목", "선택 항목"]}
              rows={[
                ["상담 신청", "휴대전화번호, 상담 지역, 상담분야, 상담 내용", "성명, 주소, 상세주소"],
                ["AS 접수", "성명, 휴대전화번호, 주소, 접수 내용", "이메일, 사진(최대 5장)"],
                ["세금계산서·현금영수증", "상호, 사업자등록번호, 대표자명, 이메일 또는 현금영수증 발급번호", "-"],
                ["전화 상담", "발신 전화번호, 통화 내용(녹음 및 녹취록)", "-"],
                ["자동 수집", "접속 기록, 쿠키, 유입 경로(광고 매체·검색어 등), 기기·브라우저 정보", "-"],
              ]}
            />
            <p>
              수집 방법: 홈페이지 상담·AS 신청 양식, 전화 상담, 문자, 제휴 플랫폼(숨고 등)을 통한 상담 신청
            </p>
          </Article>

          <Article no={3} title={ARTICLES[2]}>
            <p>회사는 처리 목적을 달성하면 개인정보를 지체 없이 파기합니다. 다만 다음의 경우에는 해당 기간 동안 보관합니다.</p>
            <Bullets
              items={[
                "상담만 하고 계약하지 않은 경우: 서비스 종료 시까지. 다만 정보주체가 삭제를 요청하면 지체 없이 파기",
                "계약 고객: 계약 종료일로부터 5년. 다만 AS 보증기간이 더 길면 보증기간 종료 시까지",
                "관계 법령에 따른 보관: 아래 표와 같습니다.",
              ]}
            />
            <PolicyTable
              head={["보관 항목", "보관 기간", "근거 법령"]}
              rows={[
                ["계약 또는 청약철회 등에 관한 기록", "5년", "전자상거래법"],
                ["대금결제 및 재화 등의 공급에 관한 기록", "5년", "전자상거래법"],
                ["소비자의 불만 또는 분쟁처리에 관한 기록", "3년", "전자상거래법"],
                ["세금계산서 등 거래 증빙", "5년", "국세기본법"],
                ["웹사이트 방문 기록", "3개월", "통신비밀보호법"],
              ]}
            />
          </Article>

          <Article no={4} title={ARTICLES[3]}>
            <p>
              회사는 정보주체의 동의가 있거나 법률에 특별한 규정이 있는 경우에만 개인정보를 제3자에게 제공합니다. 회사는 다음과
              같이 개인정보를 제공합니다.
            </p>
            <PolicyTable
              head={["제공받는 자", "제공 목적", "제공 항목", "보유 기간"]}
              rows={[
                [
                  <>
                    청암홈윈도우 가맹점
                    <br />
                    <span className="text-[#888] font-normal">(고객 거주 지역 담당)</span>
                  </>,
                  "방문 상담·실측·견적 제공, 시공 및 AS 수행",
                  "성명, 휴대전화번호, 주소, 상세주소, 상담 권역, 상담 내용, 접수 일시, 접수 방법",
                  "서비스 종료 시 또는 제공 동의 철회 시까지",
                ],
                [
                  <>
                    방충망 제휴 전문업체 청년방충망
                    <br />
                    <span className="text-[#888] font-normal">(방충망 단독 상담 시)</span>
                  </>,
                  "방충망 상담·실측·시공",
                  "휴대전화번호, 상담 지역, 상담 내용",
                  "서비스 종료 시 또는 제공 동의 철회 시까지",
                ],
              ]}
            />
            <Note>※ 개인정보를 제공받는 가맹점의 상호와 연락처는 가맹점 배정 후 안내해 드립니다.</Note>
            <Note>
              ※ 정보주체는 제3자 제공에 동의하지 않을 수 있습니다. 다만 동의하지 않으면 방문 상담과 시공 서비스 이용이 제한될 수
              있습니다.
            </Note>
          </Article>

          <Article no={5} title={ARTICLES[4]}>
            <p>회사는 원활한 업무 처리를 위해 다음과 같이 개인정보 처리 업무를 위탁합니다.</p>
            <PolicyTable
              head={["수탁자", "위탁 업무"]}
              rows={[
                ["Google LLC (Firebase, Google Cloud)", "고객 정보·첨부 사진의 저장과 관리, 시스템 운영 (서울 리전)"],
                ["Cloudflare, Inc.", "홈페이지·업무 시스템의 호스팅과 네트워크 보안"],
                ["(주)링크허브 (팝빌)", "문자·알림톡 발송, 세금계산서·현금영수증 발행"],
                [
                  "vox.ai (주식회사 플릭)",
                  "AI 전화 상담, 통화 녹취와 요약",
                ],
                ["Anthropic PBC", "홈페이지 AI 상담 창에 입력한 내용의 답변·분류, 상담 내용의 요약"],
                ["Telegram", "신규 접수 사실의 담당자 알림"],
              ]}
            />
            <p>
              회사는 위탁 계약을 맺을 때 「개인정보 보호법」 제26조에 따라 위탁 업무 수행 목적 외 처리 금지, 안전성 확보 조치,
              재위탁 제한, 수탁자 관리·감독, 손해배상 등 책임에 관한 사항을 문서에 명시하고, 수탁자가 개인정보를 안전하게
              처리하는지 감독합니다.
            </p>
          </Article>

          <Article no={6} title={ARTICLES[5]}>
            <p>
              회사의 고객 정보는 국내(Google Cloud 서울 리전)에 저장됩니다. 다만 제5조의 위탁 업무 가운데 일부를 국외 사업자가
              처리하므로 다음과 같이 개인정보를 국외로 이전합니다.
            </p>
            <PolicyTable
              head={["이전받는 자 (연락처)", "이전 국가", "이전 항목", "이전 목적", "이전 시기와 방법", "보유 기간"]}
              rows={[
                [
                  "Cloudflare, Inc. (privacyquestions@cloudflare.com)",
                  "미국 등",
                  "접속 정보, 신청 양식 입력값, AI 상담 입력 내용",
                  "호스팅·보안",
                  "서비스 이용 시 네트워크로 수시 전송",
                  "로그 저장 한도(10만 건)에 도달하면 오래된 기록부터 자동 삭제",
                ],
                [
                  "vox.ai (주식회사 플릭, support@tryvox.co)",
                  "대한민국(원칙, 서울 리전 저장) — 통화 실시간 처리 중 미국(Supabase, Vercel, OpenAI, Google, Anthropic), 일본·싱가포르(LiveKit) 경유",
                  "전화번호, 통화 내용",
                  "AI 전화 상담",
                  "통화 시 네트워크로 전송",
                  "회사가 삭제하거나 이용계약이 끝날 때까지",
                ],
                [
                  "Anthropic PBC (privacy@anthropic.com)",
                  "미국",
                  "상담 내용",
                  "요약·분류",
                  "처리 시 네트워크로 전송",
                  "처리 후 30일 이내 자동 삭제",
                ],
                [
                  "Telegram (telegram.org/privacy)",
                  "아랍에미리트 등",
                  "신규 접수 알림 내용(휴대전화번호 등 접수 정보 일부)",
                  "담당자 알림",
                  "접수 시 네트워크로 전송",
                  "회사가 알림 메시지를 삭제할 때까지",
                ],
              ]}
            />
            <p>
              정보주체는 국외 이전을 거부할 수 있습니다. 이 경우 회사 개인정보 보호책임자에게 요청하시면 됩니다. 다만 위 업무는
              서비스 제공에 꼭 필요하므로 거부하시면 상담·AS 서비스 이용이 제한될 수 있습니다.
            </p>
          </Article>

          <Article no={7} title={ARTICLES[6]}>
            <Bullets
              items={[
                "보유 기간이 지났거나 처리 목적을 달성한 개인정보는 지체 없이 파기합니다.",
                "전자 파일은 복구할 수 없는 방법으로 영구 삭제하고, 종이 문서는 분쇄하거나 소각합니다.",
                "법령에 따라 보관해야 하는 개인정보는 다른 개인정보와 분리해 보관합니다.",
              ]}
            />
          </Article>

          <Article no={8} title={ARTICLES[7]}>
            <Bullets
              items={[
                "정보주체는 회사에 언제든지 개인정보의 열람, 정정·삭제, 처리 정지, 동의 철회를 요구할 수 있습니다.",
                "권리 행사는 전화, 서면, 이메일로 할 수 있으며, 회사는 지체 없이 조치합니다.",
                "법정대리인이나 위임을 받은 자를 통해서도 권리를 행사할 수 있습니다. 이 경우 위임장을 제출해야 합니다.",
                "다른 법령에서 수집 대상으로 명시한 개인정보는 삭제를 요구할 수 없습니다.",
              ]}
            />
          </Article>

          <Article no={9} title={ARTICLES[8]}>
            <Bullets
              items={[
                "관리적 조치: 개인정보 취급 직원을 최소화하고 정기적으로 교육합니다.",
                "기술적 조치: 접근 권한을 역할별로 차등 부여하고, 전송 구간을 암호화(HTTPS)하며, 접속 기록을 보관합니다.",
                "물리적 조치: 클라우드 사업자의 보안 인증을 받은 데이터센터에 저장합니다.",
              ]}
            />
          </Article>

          <Article no={10} title={ARTICLES[9]}>
            <Bullets
              items={[
                "회사는 이용자에게 더 나은 서비스를 제공하고 홈페이지 이용 현황을 분석하기 위해 쿠키를 사용합니다.",
                "사용 도구: Google 태그 관리자(GTM), Google 애널리틱스(GA4)",
                "사용 목적: 방문 경로와 이용 형태 분석, 광고 효과 측정, 신청 양식 입력 편의 제공",
                "거부 방법: 웹 브라우저 설정에서 쿠키 저장을 거부할 수 있습니다.",
                "쿠키 저장을 거부해도 상담 신청은 이용할 수 있으나, 일부 기능이 제한될 수 있습니다.",
              ]}
            />
            <PolicyTable
              head={["브라우저", "설정 경로"]}
              rows={[
                ["Chrome", "설정 → 개인정보 및 보안 → 서드 파티 쿠키"],
                ["Edge", "설정 → 쿠키 및 사이트 권한"],
                ["Safari (iPhone)", "설정 → Safari → 모든 쿠키 차단"],
              ]}
            />
          </Article>

          <Article no={11} title={ARTICLES[10]}>
            <p>
              회사는 개인정보 처리에 관한 업무를 총괄하고 정보주체의 불만 처리와 피해 구제를 위해 다음과 같이 개인정보
              보호책임자를 지정합니다.
            </p>
            <PolicyTable
              head={["구분", "내용"]}
              rows={[
                ["개인정보 보호책임자", "대표이사 권오환"],
                [
                  "연락처",
                  <>
                    <a href="tel:1661-4830" className="underline">1661-4830</a> /{" "}
                    <a href="mailto:homewindow@ca1996.co.kr" className="underline">homewindow@ca1996.co.kr</a>
                  </>,
                ],
              ]}
            />
          </Article>

          <Article no={12} title={ARTICLES[11]}>
            <p>개인정보 침해에 대한 신고나 상담이 필요하면 아래 기관에 문의할 수 있습니다.</p>
            <PolicyTable
              head={["기관", "연락처", "누리집"]}
              rows={[
                ["개인정보분쟁조정위원회", "(국번 없이) 1833-6972", "www.kopico.go.kr"],
                ["개인정보침해신고센터", "(국번 없이) 118", "privacy.kisa.or.kr"],
                ["대검찰청", "(국번 없이) 1301", "www.spo.go.kr"],
                ["경찰청", "(국번 없이) 182", "ecrm.police.go.kr"],
              ]}
            />
          </Article>

          <Article no={13} title={ARTICLES[12]}>
            <p>
              이 개인정보처리방침은 {EFFECTIVE_DATE}부터 적용합니다. 내용이 바뀌면 시행 7일 전부터 홈페이지 공지사항으로
              알립니다.
            </p>
          </Article>

          <p className="mt-14 pt-6 border-t border-[#eee] text-[13px] text-[#999] leading-[1.7] break-keep">
            주식회사 청암홈윈도우 | 사업자등록번호 758-88-02425 | 충청남도 논산시 연산면 선비로 720번길 47 | 대표전화 1661-4830
          </p>
        </div>
      </main>

      <Footer />
      <BottomBar />
    </div>
  );
}
