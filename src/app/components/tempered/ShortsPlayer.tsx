import { useEffect, useRef, useState } from 'react';

/**
 * 구글 드라이브 세로 영상(쇼츠) 플레이어.
 *
 * · src 에 공유 링크를 통째로 넣어도 되고 파일 ID 만 넣어도 된다.
 * · iframe 은 플레이어가 화면에 들어올 때 붙인다.
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

interface Props {
  /** 드라이브 공유 링크 또는 파일 ID */
  src: string;
  title?: string;
  className?: string;
}

export function ShortsPlayer({ src, title = '강화유리 영상', className = '' }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const id = driveFileId(src);
  const ready = id.length > 10; // 자리표시자면 안내 문구를 띄운다

  useEffect(() => {
    if (!ready || mounted) return;
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
      // 화면에 닿기 조금 전에 붙여 두면 스크롤이 멈췄을 때 이미 준비돼 있다
      { rootMargin: '300px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ready, mounted]);

  return (
    <div
      ref={boxRef}
      className={`relative w-full overflow-hidden rounded-2xl bg-[#111] shadow-[0_12px_32px_rgba(0,0,0,.18)] ${className}`}
      style={{ aspectRatio: '9 / 16' }}
    >
      {!ready ? (
        /* 링크를 아직 안 넣은 상태 — 배포 전에 눈에 띄도록 */
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <span className="text-[13px] font-bold text-white/70">영상 링크 미설정</span>
          <span className="text-[11.5px] leading-[1.6] text-white/40 break-keep">
            호출부의 SHORTS_SRC 에<br />
            구글 드라이브 공유 링크를 넣어 주세요
          </span>
        </div>
      ) : mounted ? (
        <iframe
          className="absolute inset-0 w-full h-full border-0"
          src={`https://drive.google.com/file/d/${id}/preview`}
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
