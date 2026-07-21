/**
 * Cloudflare Pages 미들웨어 — SEO/AEO 서버 주입 (GEO Phase 4).
 *
 * SPA(index.html)는 모든 콘텐츠 라우트에서 동일한 <title>/메타/구조화데이터를 갖는다.
 * JS를 실행하지 않는 AI 크롤러(GPTBot·ClaudeBot·PerplexityBot 등)와 초기 HTML 색인을
 * 위해, 라우트별로 다음을 서버에서 HTMLRewriter로 주입한다:
 *   - <title> / meta description / canonical / og:title·description·url
 *   - 라우트별 JSON-LD (FAQPage, BreadcrumbList)
 *
 * 사용자 화면(React 렌더)에는 영향 없음 — head만 바꾸고 body는 그대로 둔다.
 * /api, /admin, 정적 자산(HTML 아님)은 건드리지 않는다.
 */
import { guideFaqs, generalFaqs, type FaqItem } from "../src/app/data/faqData";

const SITE = "https://homewindow.kr";

const HOME_DESC =
  "38,000평 자동화 공장에서 직접 제조, 전국 직영팀 직접 시공. LX 수퍼더블로이·TPS 단열간봉·아르곤가스·안전방충망. 업계 최장 15년 무상보증. 대한민국 유일의 완성창 창호시공 전문기업 청암홈윈도우. 무료견적 1661-4830";

interface RouteMeta {
  title: string;
  description: string;
  faqs?: FaqItem[];
  breadcrumb?: Array<[string, string]>; // [name, path]
}

const ROUTES: Record<string, RouteMeta> = {
  "/": {
    title: "청암홈윈도우 | 완성창 창호 교체·시공 · 전국 직영 · 15년 무상보증",
    description: HOME_DESC,
  },
  "/faq": {
    title: "창호 교체 업체 선택 가이드 (FAQ) | 청암홈윈도우",
    description:
      "창호 교체 업체를 고르는 기준 — 완성창 여부, 15년 무상보증, SGI 서울보증(업계 최초·유일), 전국 직영 시공. 청암홈윈도우가 실적으로 답합니다.",
    faqs: guideFaqs,
    breadcrumb: [
      ["홈", "/"],
      ["업체 선택 가이드", "/faq"],
    ],
  },
  "/faq/general": {
    title: "자주 묻는 질문 — 완성창·유리·시공·보증 | 청암홈윈도우",
    description:
      "완성창과 제작창 차이, 이중창·로이유리 단열, 원데이 시공, 15년 무상보증, 그린리모델링까지. 창호 교체 자주 묻는 질문에 청암홈윈도우가 답합니다.",
    faqs: generalFaqs,
    breadcrumb: [
      ["홈", "/"],
      ["업체 선택 가이드", "/faq"],
      ["자주 묻는 질문", "/faq/general"],
    ],
  },
  "/partners": {
    title: "홈윈도우 파트너스 — 소개 파트너 모집 | 청암홈윈도우",
    description:
      "청암홈윈도우 홈윈도우 파트너스 안내. 창호 교체 소개 파트너 모집.",
  },
};

/** JSON을 <script> 안에 안전하게 넣기 위해 '<'를 이스케이프 */
function safeJson(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

function ldScript(obj: unknown): string {
  return `<script type="application/ld+json">${safeJson(obj)}</script>`;
}

function buildJsonLd(route: RouteMeta, canonical: string): string {
  const parts: string[] = [];

  if (route.faqs && route.faqs.length) {
    parts.push(
      ldScript({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: route.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: `${f.lead} ${f.body}` },
        })),
      })
    );
  }

  if (route.breadcrumb && route.breadcrumb.length) {
    parts.push(
      ldScript({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: route.breadcrumb.map(([name, path], i) => ({
          "@type": "ListItem",
          position: i + 1,
          name,
          item: SITE + (path === "/" ? "/" : path),
        })),
      })
    );
  }

  return parts.join("");
}

export const onRequest: PagesFunction = async (ctx) => {
  const { request, next } = ctx;
  const res = await next();

  // fail-open: 주입 로직에서 어떤 오류가 나도 원본 응답을 그대로 반환한다.
  // (SEO 주입이 안 될 뿐, 사이트는 절대 깨지지 않도록 보장)
  try {
    const url = new URL(request.url);
    // 트레일링 슬래시 정규화 ('/faq/' → '/faq', '/' 유지)
    const path = url.pathname !== "/" ? url.pathname.replace(/\/+$/, "") : "/";

    // HTML 응답만, 관리자 제외
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html")) return res;
    if (path.startsWith("/admin")) return res;

    const route = ROUTES[path];
    if (!route) return res; // 정의 안 된 라우트는 SPA 기본값 유지

    const canonical = SITE + (path === "/" ? "/" : path);
    const jsonLd = buildJsonLd(route, canonical);

    let rw = new HTMLRewriter()
      .on("title", {
        element(e) {
          e.setInnerContent(route.title);
        },
      })
      .on('meta[name="description"]', {
        element(e) {
          e.setAttribute("content", route.description);
        },
      })
      .on('link[rel="canonical"]', {
        element(e) {
          e.setAttribute("href", canonical);
        },
      })
      .on('meta[property="og:title"]', {
        element(e) {
          e.setAttribute("content", route.title);
        },
      })
      .on('meta[property="og:description"]', {
        element(e) {
          e.setAttribute("content", route.description);
        },
      })
      .on('meta[property="og:url"]', {
        element(e) {
          e.setAttribute("content", canonical);
        },
      });

    if (jsonLd) {
      rw = rw.on("head", {
        element(e) {
          e.append(jsonLd, { html: true });
        },
      });
    }

    return rw.transform(res);
  } catch {
    return res;
  }
};
