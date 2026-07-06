import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * 전역 에러 바운더리.
 * 렌더 도중 어느 컴포넌트에서든 예외가 나면 React 는 트리 전체를 언마운트해
 * 화면이 통째로 백지가 된다. 이 바운더리가 그 예외를 잡아 백지 대신
 * 안내 화면을 보여주고, 원인 진단을 위해 에러 메시지를 콘솔과 화면에 남긴다.
 *
 * (특정 기기/브라우저에서만 백지가 나는 문제를 잡기 위한 안전장치 겸 진단 도구)
 */
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 콘솔에 원인 그대로 남긴다 (그 기기 개발자도구에서 확인 가능)
    console.error("[ErrorBoundary] 렌더 중 오류:", error, info.componentStack);
  }

  handleReload = () => {
    // 캐시 꼬임(옛 배포의 사라진 JS 참조 등) 복구를 위해 강제 새로고침
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#faf7f4",
          color: "#1c1614",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>
            일시적인 오류가 발생했습니다
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#6b6460",
              lineHeight: 1.7,
              margin: "0 0 20px",
              wordBreak: "keep-all",
            }}
          >
            페이지를 불러오는 중 문제가 생겼어요. 새로고침하면 대부분 해결됩니다.
            계속 반복되면 잠시 후 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              height: 46,
              padding: "0 28px",
              borderRadius: 12,
              border: "none",
              background: "#952c2c",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            새로고침
          </button>

          {/* 진단용: 에러 메시지 노출 (원인 파악에 사용) */}
          <pre
            style={{
              marginTop: 24,
              padding: "12px 14px",
              background: "#f1eae2",
              borderRadius: 10,
              fontSize: 11.5,
              color: "#8a807c",
              textAlign: "left",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowX: "auto",
            }}
          >
            {error.name}: {error.message}
          </pre>
        </div>
      </div>
    );
  }
}
