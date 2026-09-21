// GET /api/youtube?limit=6 — 최신 롱폼 영상 JSON (Cloudflare Pages Function)
// 유튜브 RSS가 가끔 404/500을 내므로, 마지막으로 성공한 목록을 엣지 캐시에 30일 보관했다가 대신 돌려준다.
import { fetchLongform } from "../../shared/youtube"

declare const caches: { default: { match(k: string): Promise<Response | undefined>; put(k: string, r: Response): Promise<void> } }

const LAST_GOOD = "https://cache.local/youtube-last-good"
const CORS = { "Access-Control-Allow-Origin": "*" }

export const onRequestGet = async ({ request, waitUntil }: { request: Request; waitUntil: (p: Promise<unknown>) => void }) => {
  const limit = Math.min(15, Math.max(1, Number(new URL(request.url).searchParams.get("limit")) || 6))
  try {
    const items = await fetchLongform(15)
    if (!items.length) throw new Error("empty")
    const body = JSON.stringify({ items })
    waitUntil(caches.default.put(LAST_GOOD, new Response(body, { headers: { "Cache-Control": "public, max-age=2592000" } })))
    // 엣지 30분 캐시 — 새 영상은 늦어도 30분 안에 반영
    return Response.json({ items: items.slice(0, limit) }, { headers: { "Cache-Control": "public, max-age=300, s-maxage=1800", ...CORS } })
  } catch {
    const last = await caches.default.match(LAST_GOOD)
    if (last) {
      const { items } = (await last.json()) as { items: unknown[] }
      return Response.json({ items: items.slice(0, limit), stale: true }, { headers: { "Cache-Control": "public, max-age=300", ...CORS } })
    }
    return Response.json({ items: [] }, { status: 502, headers: CORS })
  }
}
