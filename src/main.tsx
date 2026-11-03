
  import { createRoot } from "react-dom/client";
  import AppRouter from "./app/Router";
  import { ErrorBoundary } from "./app/ErrorBoundary";
  import { PhoneVerifyHost } from "./app/components/PhoneVerifyHost";
  import { ConsultTypeHost } from "./app/components/ConsultTypeHost";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <AppRouter />
      {/* 260917 번호인증 실험 — 어느 폼에서 접수하든 이 팝업 하나가 뜬다 */}
      <PhoneVerifyHost />
      {/* 2026-11 — 번호 인증 다음, 접수 직전에 상담 방법(방문/일반)을 묻는다 */}
      <ConsultTypeHost />
    </ErrorBoundary>
  );
