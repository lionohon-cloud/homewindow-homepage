import { useEffect, useRef, useState } from 'react';

/**
 * 세로 영상(쇼츠) 플레이어. 유튜브와 구글 드라이브를 모두 받는다.
 *
 * · src 에 링크를 통째로 넣으면 어느 쪽인지 알아서 판별한다.
 *   - 유튜브: youtube.com/shorts/ID · youtu.be/ID · watch?v=ID
 *   - 드라이브: drive.google.com/file/d/ID/... (또는 파일 ID 만)
 * · iframe 은 플레이어가 화면에 40% 들어올 때 붙는다. 유튜브는 그때 음소거 자동재생.
 * · loop 를 주면 끝나고 처음부터 다시 돈다(유튜브만).
 *
 * 예전에는 포스터 + 재생 버튼을 그려 두고 "누를 때" iframe 을 붙였다.
 * 드라이브 iframe 이 무거워 초기 진입을 늦추기 때문이었는데, 그러면 재생까지
 * 두 번을 눌러야 했다(우리 버튼 → 드라이브 플레이어의 재생 버튼).
 * 화면에 들어올 때 붙이면 초기 로딩 부담은 그대로 피하면서 클릭이 한 번 준다.
 *
 * 클릭을 0 으로 만들지는 못한다 — 드라이브 preview 임베드는 자동재생 파라미터가
 * 없고, 브라우저도 소리 있는 자동재생을 막는다. 드라이브 플레이어 안의 재생
 * 버튼 한 번은 남는다.
 *
 * 준비물: 드라이브에서 해당 파일을 "링크가 있는 모든 사용자 — 뷰어" 로 공유해야
 *        외부에서 재생된다. 비공개면 로그인 화면이 뜬다.
 */

/** 공유 링크 / 미리보기 링크 / 순수 ID 를 모두 받아 파일 ID 만 뽑는다. */
export function driveFileId(input: string): string {
  const m =
    input.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ?? input.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : input.trim();
}

/** 유튜브 링크면 영상 ID, 아니면 null. shorts / youtu.be / watch?v= 를 모두 받는다. */
export function youtubeId(input: string): string | null {
  const m =
    input.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/) ??
    input.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/) ??
    input.match(/youtube\.com\/(?:watch\?v=|embed\/)([a-zA-Z0-9_-]{6,})/);
  return m ? m[1] : null;
}

/**
 * 붙일 iframe 주소. 유튜브면 nocookie 도메인을 쓴다 — 재생 전 추적 쿠키를 안 심는다.
 *
 * autoplay 는 반드시 mute 와 같이 간다. 브라우저가 소리 있는 자동재생을 막기 때문에
 * mute 없이 autoplay 만 주면 그냥 재생이 안 된다(에러도 안 뜬다).
 * 소리는 플레이어 안에서 사용자가 켜면 된다.
 */
function embedUrl(src: string, autoplay: boolean, loop: boolean): string {
  const yt = youtubeId(src);
  if (yt) {
    const q = ['rel=0', 'playsinline=1', 'modestbranding=1'];
    if (autoplay) q.push('autoplay=1', 'mute=1');
    /* 한 편짜리 반복은 loop 만으로는 안 된다 — playlist 에 자기 자신을 넣어야
       유튜브가 "이 목록을 반복"으로 해석해서 끝나면 처음으로 돌아간다. */
    if (loop) q.push('loop=1', `playlist=${yt}`);
    return `https://www.youtube-nocookie.com/embed/${yt}?${q.join('&')}`;
  }
  /* 드라이브 preview 임베드에는 자동재생 파라미터가 없다 — 재생 버튼 한 번이 남는다 */
  return `https://drive.google.com/file/d/${driveFileId(src)}/preview`;
}

interface Props {
  /** 드라이브 공유 링크 또는 파일 ID */
  src: string;
  title?: string;
  className?: string;
  /** 화면에 들어오면 소리 없이 자동재생 (유튜브만 해당) */
  autoplay?: boolean;
  /** 끝나면 처음부터 다시 (유튜브만 해당) */
  loop?: boolean;
  /**
   * 상자 비율. 기본은 세로 쇼츠(9/16).
   * 부모가 크기를 이미 정해 둔 자리(예: 배너 위 절대배치)에 넣을 때는
   * "auto" 를 주면 비율을 강제하지 않고 부모 상자를 그대로 채운다.
   */
  aspect?: string;
  /**
   * true 면 화면에 들어오는 걸 기다리지 않고 마운트 즉시 붙인다(스크롤 트리거 없음).
   * 배너처럼 "무조건 위에서부터 돌고 있어야" 하는 자리에서만 켠다 — 기본은 false 라
   * 대부분의 자리는 여전히 화면에 40% 들어와야 재생이 시작된다(대역폭 절약).
   */
  eager?: boolean;
}

export function ShortsPlayer({
  src,
  title = '강화유리 영상',
  className = '',
  autoplay = true,
  loop = false,
  aspect = '9 / 16',
  eager = false,
}: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const isYoutube = youtubeId(src) !== null;
  const ready = isYoutube || driveFileId(src).length > 10; // 자리표시자면 안내 문구를 띄운다

  useEffect(() => {
    if (!ready || mounted) return;

    // eager 는 화면 진입을 기다리지 않는다 — 관찰자를 아예 안 건다
    if (eager) {
      setMounted(true);
      return;
    }

    const el = boxRef.current;
    if (!el) return;

    // 관찰자를 못 쓰는 환경이면 그냥 바로 붙인다 — 안 보이는 것보다 낫다
    if (typeof IntersectionObserver !== 'function') {
      setMounted(true);
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setMounted(true);
      },
      /* 자동재생이라 "실제로 도착했을 때" 붙어야 한다. 예전처럼 300px 미리 붙이면
         아직 화면 밖인데 재생이 시작된다. 40% 가 보이면 도착한 것으로 본다. */
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ready, mounted, eager]);

  return (
    <div
      ref={boxRef}
      className={`relative w-full overflow-hidden rounded-2xl bg-[#111] shadow-[0_12px_32px_rgba(0,0,0,.18)] ${className}`}
      style={aspect === 'auto' ? undefined : { aspectRatio: aspect }}
    >
      {!ready ? (
        /* 링크를 아직 안 넣은 상태 — 배포 전에 눈에 띄도록 */
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <span className="text-[13px] font-bold text-white/70">영상 링크 미설정</span>
          <span className="text-[11.5px] leading-[1.6] text-white/40 break-keep">
            호출부의 SHORTS_SRC 에<br />
            유튜브 또는 드라이브 링크를 넣어 주세요
          </span>
        </div>
      ) : mounted ? (
        <iframe
          className="absolute inset-0 w-full h-full border-0"
          src={embedUrl(src, autoplay, loop)}
          title={title}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
        />
      ) : (
        /* 붙기 전 자리 — 크기가 같아서 뜰 때 화면이 밀리지 않는다 */
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg,#2b2b2f,#141416)' }}
        />
      )}
    </div>
  );
}
