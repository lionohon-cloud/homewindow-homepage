
  import { createRoot } from "react-dom/client";
  import AppRouter from "./app/Router";
  import { ErrorBoundary } from "./app/ErrorBoundary";
  import { PhoneVerifyHost } from "./app/components/PhoneVerifyHost";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <AppRouter />
      {/* 260917 번호인증 실험 — 어느 폼에서 접수하든 이 팝업 하나가 뜬다 */}
      <PhoneVerifyHost />
    </ErrorBoundary>
  );
