import { Navigate } from "react-router";

export function Component() {
  // 상세 관리도 ERP에서 처리 — 리스트 안내 페이지로 보냄
  return <Navigate to="/admin/reviews" replace />;
}
