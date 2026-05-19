import { Link } from "react-router";
import { CheckCircle2 } from "lucide-react";

export function Component() {
  return (
    <main className="min-h-screen bg-[#faf7f4] flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <CheckCircle2 className="w-14 h-14 text-[#952c2c] mx-auto" />
        <h1 className="mt-5 text-[22px] font-extrabold tracking-tight text-[#1c1614]">
          후기가 접수되었습니다
        </h1>
        <p className="mt-3 text-[14px] text-[#6b6460] leading-[1.7] break-keep">
          관리자 확인 후 게시됩니다.
          <br />
          소중한 후기를 남겨주셔서 감사합니다.
        </p>
        <Link
          to="/"
          replace
          className="mt-7 inline-flex items-center justify-center w-full h-12 rounded-xl bg-[#952c2c] text-white font-bold text-[15px]"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
