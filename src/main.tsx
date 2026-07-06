
  import { createRoot } from "react-dom/client";
  import AppRouter from "./app/Router";
  import { ErrorBoundary } from "./app/ErrorBoundary";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
