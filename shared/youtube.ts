// 청암홈윈도우 공식 유튜브 — 최신 롱폼 영상 목록
// API 키 없이 공개 RSS를 읽는다. 플레이리스트 UULF + 채널ID(UC 뒤) = 롱폼 업로드만 (쇼츠·라이브 제외), 최신 15개.
// Cloudflare Pages Function(functions/api/youtube.ts)과 로컬 dev 서버(vite.config.ts)가 같은 코드를 쓴다.

export const YT_CHANNEL_ID = "UCuBqu8K9aDUpTJbJ_dcywrQ" // @homewindowca

export type YtVideo = { id: string; t: string; date: string }

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")

// 게시 시각(UTC) → 한국 날짜 YYYY-MM-DD
const kstDate = (iso: string) => {
  const d = new Date(new Date(iso).getTime() + 9 * 3600 * 1000)
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10)
}

export async function fetchLongform(limit = 6, channelId = YT_CHANNEL_ID): Promise<YtVideo[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?playlist_id=UULF${channelId.slice(2)}`
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })
  if (!res.ok) throw new Error(`youtube rss ${res.status}`)
  const xml = await res.text()
  const out: YtVideo[] = []
  for (const [, e] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const id = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]
    const t = e.match(/<title>([^<]*)<\/title>/)?.[1]
    const p = e.match(/<published>([^<]+)<\/published>/)?.[1]
    if (id && t && p) out.push({ id, t: decode(t), date: kstDate(p) })
  }
  return out.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit)
}
