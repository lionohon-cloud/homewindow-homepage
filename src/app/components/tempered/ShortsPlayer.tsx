import { useState } from 'react';
import { Play } from 'lucide-react';

/**
 * 세로 영상(쇼츠) 플레이어. 유튜브와 구글 드라이브를 모두 받는다.
 *
 * · src 에 공유 링크를 통째로 넣어도 되고 ID 만 넣어도 된다.
 *   - 유튜브: youtube.com/shorts/ID · youtu.be/ID · youtube.com/watch?v=ID
 *   - 드라이브: drive.google.com/file/d/ID/view
 * · 처음에는 포스터 + 재생 버튼만 그리고, 누를 때 iframe 을 붙인다.
 *   (iframe 은 무겁고 스크롤만 해도 로드돼 초기 진입이 느려진다)
 *
 * 드라이브를 쓸 때는 해당 파일을 "링크가 있는 모든 사용자 — 뷰어" 로 공유해야
 * 외부에서 재생된다. 비공개면 로그인 화면이 뜬다.
 * 유튜브는 "일부 공개(Unlisted)" 이상이면 재생된다.
 */

type Source =
  | { kind: 'youtube'; id: string }
  | { kind: 'drive'; id: string }
  | { kind: 'unset' };

/** 유튜브 ID 는 11자, 드라이브 ID 는 그보다 길다 — 순수 ID 만 들어와도 구분된다. */
export function parseShortsSrc(input: string): Source {
  const s = input.trim();
  if (!s) return { kind: 'unset' };

  const yt =
    s.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/) ??
    s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) ??
    s.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/) ??
    s.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (yt) return { kind: 'youtube', id: yt[1] };

  const drive = s.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ?? s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (drive) return { kind: 'drive', id: drive[1] };

  // 링크 없이 ID 만 넣은 경우
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return { kind: 'youtube', id: s };
  if (/^[a-zA-Z0-9_-]{12,}$/.test(s)) return { kind: 'drive', id: s };
  return { kind: 'unset' };
}

function embedUrl(src: Source): string {
  if (src.kind === 'youtube') {
    // nocookie 도메인 — 라이브 CSP(public/_headers)의 frame-src 에 이미 들어 있다.
    // 쇼츠는 대개 짧아서 반복 재생을 건다(loop 는 playlist 를 같이 줘야 먹는다).
    return `https://www.youtube-nocookie.com/embed/${src.id}?autoplay=1&rel=0&playsinline=1&loop=1&playlist=${src.id}`;
  }
  if (src.kind === 'drive') return `https://drive.google.com/file/d/${src.id}/preview`;
  return '';
}

interface Props {
  /** 유튜브 / 구글 드라이브 공유 링크, 또는 ID */
  src: string;
  /** 재생 전에 보여줄 포스터 이미지 (없으면 어두운 배경 + 재생 버튼만) */
  poster?: string;
  title?: string;
  className?: string;
}

export function ShortsPlayer({ src, poster, title = '강화유리 영상', className = '' }: Props) {
  const [playing, setPlaying] = useState(false);
  const parsed = parseShortsSrc(src);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-[#111] shadow-[0_12px_32px_rgba(0,0,0,.18)] ${className}`}
      style={{ aspectRatio: '9 / 16' }}
    >
      {parsed.kind === 'unset' ? (
        /* 링크를 아직 안 넣은 상태 — 배포 전에 눈에 띄도록 */
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <span className="text-[13px] font-bold text-white/70">영상 링크 미설정</span>
          <span className="text-[11.5px] leading-[1.6] text-white/40 break-keep">
            TemperedGlassPage.tsx 의 SHORTS_SRC 에<br />
            유튜브 또는 구글 드라이브 링크를 넣어 주세요
          </span>
        </div>
      ) : playing ? (
        <iframe
          className="absolute inset-0 w-full h-full border-0"
          src={embedUrl(parsed)}
          title={title}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`${title} 재생`}
          className="group absolute inset-0 w-full h-full cursor-pointer"
        >
          {poster ? (
            <img
              src={poster}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span
              className="absolute inset-0"
              style={{ background: 'linear-gradient(160deg,#2b2b2f,#141416)' }}
            />
          )}
          <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/15" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-16 h-16 md:w-[72px] md:h-[72px] rounded-full bg-white/95 shadow-[0_6px_20px_rgba(0,0,0,.35)] transition-transform group-hover:scale-105">
            <Play size={26} className="text-[#d22727] ml-1" fill="#d22727" />
          </span>
        </button>
      )}
    </div>
  );
}
