import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollLock } from "@/lib/useScrollLock";
import imgProfile from "@/assets/spec/profile.webp";
import imgProfileLx from "@/assets/spec/profile-lx.webp";
import imgScreenSafety from "@/assets/spec/screen-safety.webp";
import imgScreenStain from "@/assets/spec/screen-stain.webp";
import imgScreenMesh from "@/assets/spec/screen-mesh.webp";
import imgArgonMark from "@/assets/spec/argon-mark.webp";
import imgArgonMarkHome from "@/assets/spec/argon-mark-home.webp";
import imgSpacerAl from "@/assets/spec/spacer-al.webp";
import imgSpacerTps from "@/assets/spec/spacer-tps.webp";
import imgLowE from "@/assets/spec/lowe.webp";
import imgSuperDoubleLowE from "@/assets/spec/super-double-lowe.webp";
import imgLowEVsConcrete from "@/assets/spec/lowe-vs-concrete.webp";
import imgGlassThick from "@/assets/spec/glass-thick.webp";
import imgTurningDoor from "@/assets/spec/turningdoor.webp";
import imgTurningDoorLx from "@/assets/spec/turningdoor-lx.webp";
import imgTurningDoorHandleLx from "@/assets/spec/turningdoor-handle-lx.webp";
import imgHandleAuto from "@/assets/spec/handle-auto.webp";
import imgHandleSemi from "@/assets/spec/handle-semi.webp";
import imgHandleCouple from "@/assets/spec/handle-couple.webp";
import imgHandleFixed from "@/assets/spec/handle-fixed.webp";
import imgCrescent from "@/assets/spec/crescent.webp";
import imgWindCloser from "@/assets/spec/windcloser.webp";
import imgRailCap from "@/assets/spec/railcap.webp";
import imgRailCapLx from "@/assets/spec/railcap-lx.webp";
import imgDrainHoleHome from "@/assets/spec/drainhole-home.webp";
import imgDrainHoleLx from "@/assets/spec/drainhole-lx.webp";
import imgStopper from "@/assets/spec/stopper.webp";
import imgHandleAutoHome from "@/assets/spec/handle-auto-home.webp";
import imgHandleSemiHome from "@/assets/spec/handle-semi-home.webp";
import imgHandleFixedHome from "@/assets/spec/handle-fixed-home.webp";
import imgCrescentHome from "@/assets/spec/crescent-home.webp";
import imgTurningDoorHandleHome from "@/assets/spec/turningdoor-handle-home.webp";
import imgWindCloserHome from "@/assets/spec/windcloser-home.webp";
import imgStopperHome from "@/assets/spec/stopper-home.webp";
import imgDryer from "@/assets/spec/dryer.webp";

/**
 * 브랜드 사양표 항목 설명 팝업 (260923 가맹전환 — 등급제 폐지로 표가 "선택 옵션" 목록이 되면서 추가).
 *
 * 내용은 고객 영업자료 PDF(260415 v3) 각 페이지를 옮긴 것이고,
 * 그림은 홈페이지 단열유리·방충망 섹션에서 이미 쓰는 것을 우선 쓴다 (고객이 같은 그림을 보게).
 * 사진 여러 장이면 좌우 슬라이드, 선택지가 있으면 아래에 "선택지" 카드로 비교해 준다.
 * 등급(PRESTIGE·SIGNATURE)이 보이는 자료는 쓰지 않는다.
 */

export type Slide = { src: string; caption?: string };
export type Option = { name: string; desc: string; tag?: string };
export type SpecInfo = {
  title: string;
  subtitle: string;
  body: string;
  slides?: Slide[];
  options?: Option[];
  optionsTitle?: string;
  note?: string;
};

/** 표의 label 을 키로 쓴다 — 브랜드가 달라도 항목 이름은 같다. */
export const SPEC_INFO: Record<string, SpecInfo> = {
  "프로파일 보증@lx": {
    title: "프로파일 보증",
    subtitle: "창의 뼈대, 프로파일을 15년 동안 보증합니다",
    body: "창틀과 창짝을 이루는 PVC 뼈대가 프로파일입니다. 이 뼈대가 변형돼 생기는 불량을 15년 동안 무상으로 처리합니다.",
    slides: [{ src: imgProfileLx, caption: "LX 프로파일 단면 — 여러 겹의 격실이 냉기를 막고, 빨간 보강재가 뼈대를 잡아 줍니다" }],
    note: "다른 항목은 보증서에 기간이 따로 정해져 있으며, 백색 이외 색상 프로파일은 무상보증에서 제외됩니다.",
  },
  "프로파일 보증": {
    title: "프로파일 보증",
    subtitle: "창의 뼈대, 프로파일을 15년 동안 보증합니다",
    body: "창틀과 창짝을 이루는 PVC 뼈대가 프로파일입니다. 이 뼈대가 변형돼 생기는 불량을 15년 동안 무상으로 처리합니다.",
    slides: [{ src: imgProfile, caption: "프로파일 단면 — 안쪽 격실이 냉기를 막고, 보강재가 뼈대를 잡아 줍니다" }],
    note: "다른 항목은 보증서에 기간이 따로 정해져 있으며, 백색 이외 색상 프로파일은 무상보증에서 제외됩니다.",
  },
  "발코니 방충망": {
    title: "발코니 방충망",
    subtitle: "벌레 차단은 기본, 망의 튼튼함까지 고를 수 있습니다",
    body: "발코니창에 들어가는 방충망입니다. 망 재질과 굵기에 따라 내구성과 안전성이 달라집니다.",
    slides: [
      { src: imgScreenSafety, caption: "안전방충망 — 굵고 튼튼한 망이라 창을 열어 두어도 안심" },
      { src: imgScreenStain, caption: "스텐망 — 녹이 잘 슬지 않는 스테인리스 망" },
      { src: imgScreenMesh, caption: "망 확대 — 촘촘한 격자가 작은 벌레까지 막습니다" },
    ],
    optionsTitle: "선택할 수 있는 망",
    options: [
      { name: "일반스텐망", desc: "녹이 잘 슬지 않는 스테인리스 망입니다." },
      { name: "블랙스텐망", desc: "블랙 코팅으로 빛 반사가 적어 밖이 선명하고 오염이 덜 보입니다." },
      { name: "안전방충망", tag: "추천", desc: "굵고 튼튼해 아이·반려동물 추락을 막고, 저층 방범살을 대신합니다." },
    ],
    note: "플라스틱 재질의 일반 촘촘망은 열에 약해 권하지 않습니다.",
  },
  "Ar(아르곤가스)@lx": {
    title: "아르곤가스",
    subtitle: "유리 사이 빈 공간을 채워 열이 빠져나갈 틈을 없앱니다",
    body: "복층유리 사이를 공기 대신 아르곤가스로 채웁니다. 공기보다 무겁고 움직임이 둔해 열이 빠져나가지 못하게 막고, 결로도 줄여 줍니다.",
    slides: [{ src: imgArgonMark, caption: "유리 마킹 — 아르곤가스 주입 여부는 유리에 새겨진 인증 마크로 확인할 수 있습니다" }],
    optionsTitle: "공기층과 무엇이 다른가요",
    options: [
      { name: "일반 공기", desc: "바깥 온도에 따라 실내 온기를 쉽게 빼앗깁니다." },
      { name: "아르곤가스 주입", tag: "추천", desc: "열 이동을 막아 단열이 좋고 결로가 줄어듭니다." },
    ],
  },
  "Ar(아르곤가스)": {
    title: "아르곤가스",
    subtitle: "유리 사이 빈 공간을 채워 열이 빠져나갈 틈을 없앱니다",
    body: "복층유리 사이를 공기 대신 아르곤가스로 채웁니다. 공기보다 무겁고 움직임이 둔해 열이 빠져나가지 못하게 막고, 결로도 줄여 줍니다.",
    slides: [{ src: imgArgonMarkHome, caption: "유리 마킹 — 아르곤가스 주입 여부는 유리에 새겨진 인증 마크로 확인할 수 있습니다" }],
    optionsTitle: "공기층과 무엇이 다른가요",
    options: [
      { name: "일반 공기", desc: "바깥 온도에 따라 실내 온기를 쉽게 빼앗깁니다." },
      { name: "아르곤가스 주입", tag: "추천", desc: "열 이동을 막아 단열이 좋고 결로가 줄어듭니다." },
    ],
  },
  간봉: {
    title: "간봉",
    subtitle: "유리 가장자리 단열의 완성도를 결정하는 부품",
    body: "복층유리 두 장을 일정 간격으로 잡아 주는 테두리 부품입니다. 겨울에 유리 가장자리 결로가 생기느냐 마느냐가 이 재질에 달려 있습니다.",
    slides: [
      { src: imgSpacerAl, caption: "알루미늄(AL) 간봉" },
      { src: imgSpacerTps, caption: "TPS 단열 간봉 — 열이 거의 통하지 않는 특수 소재" },
    ],
    optionsTitle: "선택할 수 있는 간봉",
    options: [
      { name: "알루미늄(AL) 간봉", desc: "금속이라 겨울 냉기가 유리 가장자리로 전해집니다." },
      { name: "TPS 단열 간봉", tag: "추천", desc: "열이 거의 안 통하는 소재라 가장자리 결로를 크게 줄입니다." },
    ],
  },
  유리종류: {
    title: "유리 종류",
    subtitle: "눈에 안 보이는 코팅 한 겹이 10년 뒤 관리비를 바꿉니다",
    body: "로이(Low-E)유리는 유리 안쪽에 얇은 은 코팅을 입혀, 집 안의 열이 밖으로 빠져나가지 못하게 되돌려 보내는 단열 유리입니다.",
    slides: [
      { src: imgLowE, caption: "로이유리 원리 — 은 코팅막이 실내 온기를 안쪽으로 되돌려 보냅니다" },
      { src: imgSuperDoubleLowE, caption: "수퍼더블로이 — 은 코팅 두 겹. 영하 10℃에서 실내 유리 표면 15.3℃ (일반 복층 9.1℃)" },
      { src: imgLowEVsConcrete, caption: "26mm 로이 복층유리 한 장의 단열이 콘크리트 벽 118cm와 맞먹습니다" },
    ],
    optionsTitle: "선택할 수 있는 유리",
    options: [
      { name: "투명 + 그린 (일반 복층)", desc: "코팅 없는 복층유리. 채광이 좋고 가격이 낮습니다." },
      { name: "수퍼로이(로이) + 투명 (싱글로이)", desc: "은 코팅 한 겹. 일반 복층보다 열 손실이 훨씬 적습니다." },
      { name: "수퍼더블로이", tag: "프리미엄", desc: "은 코팅 두 겹. 싱글로이보다 난방 에너지 40%↓, 추가 비용 4~5년 회수." },
    ],
    note: "수치는 26mm 복층유리 시뮬레이션 기준이며 실제 환경에 따라 다를 수 있습니다.",
  },
  "발코니창 유리": {
    title: "발코니창 유리 두께",
    subtitle: "바깥바람을 직접 막는 창이라 두꺼운 유리를 씁니다",
    body: "두 장의 유리 사이에 공기층을 가둔 복층유리를 씁니다. 바깥바람을 직접 받는 발코니창에는 두꺼운 26mm를 적용합니다.",
    slides: [{ src: imgGlassThick, caption: "단유리(왼쪽)와 복층유리(오른쪽) — 사이 공기층이 열을 잡아 줍니다" }],
    optionsTitle: "두께는 이렇게 정해집니다",
    options: [
      { name: "26mm", tag: "발코니창", desc: "바깥바람을 직접 받는 발코니창용. 단열·방음에 유리합니다." },
      { name: "24mm · 22mm", tag: "실내창", desc: "실내 방창용. 창 크기와 용도에 맞춰 정합니다." },
    ],
  },
  "일반창 유리@lx": {
    title: "일반창 유리 두께",
    subtitle: "실내 방창은 창 크기와 용도에 맞춘 두께를 씁니다",
    body: "거실·방 창에 들어가는 복층유리 두께입니다. 창 크기와 용도에 맞춰 정하며, 두꺼울수록 단열과 방음에 유리합니다.",
    slides: [{ src: imgGlassThick, caption: "단유리(왼쪽)와 복층유리(오른쪽) — 사이 공기층이 열을 잡아 줍니다" }],
    optionsTitle: "두께는 이렇게 정해집니다",
    options: [
      { name: "26mm", desc: "바깥과 닿거나 큰 창에. 단열·방음에 유리합니다." },
      { name: "24mm", desc: "실내 방창에 많이 쓰는 두께입니다." },
    ],
  },
  "일반창 유리": {
    title: "일반창 유리 두께",
    subtitle: "실내 방창은 창 크기와 용도에 맞춘 두께를 씁니다",
    body: "거실·방 창에 들어가는 복층유리 두께입니다. 창 크기와 용도에 맞춰 정하며, 두꺼울수록 단열과 방음에 유리합니다.",
    slides: [{ src: imgGlassThick, caption: "단유리(왼쪽)와 복층유리(오른쪽) — 사이 공기층이 열을 잡아 줍니다" }],
    optionsTitle: "두께는 이렇게 정해집니다",
    options: [
      { name: "24mm", desc: "실내 방창에 많이 쓰는 두께입니다." },
      { name: "22mm", desc: "작은 창이나 예산을 우선할 때." },
    ],
  },
  "FIX/PJ/터닝도어": {
    title: "FIX · PJ · 터닝도어",
    subtitle: "열리지 않는 창, 위로 여는 창, 돌아서 여는 문",
    body: "FIX는 열리지 않는 붙박이창, PJ는 위쪽이 바깥으로 열리는 창, 터닝도어는 문처럼 돌아서 여는 PVC 문입니다. 모두 24mm 복층유리를 씁니다.",
    slides: [
      { src: imgTurningDoor, caption: "홈윈도우 터닝도어" },
      { src: imgTurningDoorHandleHome, caption: "홈윈도우 터닝도어 핸들" },
    ],
    optionsTitle: "터닝도어 유리 컬러",
    options: [
      { name: "투명", desc: "햇살을 그대로 받아 밝습니다." },
      { name: "그린", desc: "은은한 색으로 밖에서 안이 덜 보입니다." },
      { name: "미스트", desc: "뿌옇게 처리돼 안이 안 보입니다. 세탁실·다용도실·화장실용." },
      { name: "모루", desc: "세로 무늬 불투명 유리. 시선 차단과 인테리어 효과." },
    ],
  },
  "FIX/PJ/터닝도어@lx": {
    title: "FIX · PJ · 터닝도어",
    subtitle: "열리지 않는 창, 위로 여는 창, 돌아서 여는 문",
    body: "FIX는 열리지 않는 붙박이창, PJ는 위쪽이 바깥으로 열리는 창, 터닝도어는 문처럼 돌아서 여는 PVC 문입니다. 모두 24mm 복층유리를 씁니다.",
    slides: [
      { src: imgTurningDoorLx, caption: "LX 터닝도어" },
      { src: imgTurningDoorHandleLx, caption: "LX 터닝도어 핸들" },
    ],
    optionsTitle: "터닝도어 유리 컬러",
    options: [
      { name: "투명", desc: "햇살을 그대로 받아 밝습니다." },
      { name: "그린", desc: "은은한 색으로 밖에서 안이 덜 보입니다." },
      { name: "미스트", desc: "뿌옇게 처리돼 안이 안 보입니다. 세탁실·다용도실·화장실용." },
      { name: "모루", desc: "세로 무늬 불투명 유리. 시선 차단과 인테리어 효과." },
    ],
  },
  "발코니 핸들@lx": {
    title: "발코니 핸들",
    subtitle: "닫는 순간 스스로 잠기는 손잡이",
    body: "크고 무거운 발코니창을 여닫는 손잡이입니다. 자동핸들은 지렛대 원리로 가볍게 열리고, 닫는 순간 스스로 잠깁니다.",
    slides: [{ src: imgHandleAuto, caption: "LX 자동핸들 — 닫으면 저절로 잠깁니다" }],
    note: "사진은 예시이며, 브랜드와 라인업에 따라 실제 디자인은 다를 수 있습니다.",
  },
  "발코니 핸들": {
    title: "발코니 핸들",
    subtitle: "닫는 순간 스스로 잠기는 손잡이",
    body: "크고 무거운 발코니창을 여닫는 손잡이입니다. 자동핸들은 지렛대 원리로 가볍게 열리고, 닫는 순간 스스로 잠깁니다.",
    slides: [{ src: imgHandleAutoHome, caption: "홈윈도우 자동핸들 — 닫으면 저절로 잠깁니다" }],
    note: "사진은 예시이며, 브랜드와 라인업에 따라 실제 디자인은 다를 수 있습니다.",
  },
  "일반창 핸들@lx": {
    title: "일반창 핸들",
    subtitle: "실내 창의 손잡이와 잠금 방식",
    body: "거실·방 창의 손잡이와 잠금 방식입니다. 자동핸들, 고정핸들, 크리센트 중에서 고를 수 있습니다.",
    slides: [
      { src: imgHandleAuto, caption: "LX 자동핸들 — 닫으면 저절로 잠깁니다" },
      { src: imgHandleFixed, caption: "LX 고정핸들 — 유리를 밀지 않고 손잡이로 여닫습니다" },
      { src: imgCrescent, caption: "LX 크리센트 — 창이 겹치는 가운데에서 잠급니다" },
    ],
    optionsTitle: "선택할 수 있는 핸들",
    options: [
      { name: "자동핸들", tag: "프리미엄", desc: "가볍게 열리고, 닫는 순간 스스로 잠깁니다." },
      { name: "고정핸들 + 크리센트", desc: "고정핸들로 여닫고 크리센트로 잠급니다." },
      { name: "크리센트", desc: "잠그면 두 창이 밀착돼 외풍과 소음을 한 번 더 막습니다." },
    ],
    note: "사진은 예시이며, 브랜드와 라인업에 따라 실제 디자인은 다를 수 있습니다.",
  },
  "일반창 핸들": {
    title: "일반창 핸들",
    subtitle: "실내 창의 손잡이와 잠금 방식",
    body: "거실·방 창의 손잡이와 잠금 방식입니다. 자동핸들, 고정핸들, 크리센트 중에서 고를 수 있습니다.",
    slides: [
      { src: imgHandleAutoHome, caption: "홈윈도우 자동핸들 — 닫으면 저절로 잠깁니다" },
      { src: imgHandleFixedHome, caption: "홈윈도우 고정핸들 — 유리를 밀지 않고 손잡이로 여닫습니다" },
      { src: imgCrescentHome, caption: "홈윈도우 크리센트 — 창이 겹치는 가운데에서 잠급니다" },
    ],
    optionsTitle: "선택할 수 있는 핸들",
    options: [
      { name: "자동핸들", tag: "프리미엄", desc: "가볍게 열리고, 닫는 순간 스스로 잠깁니다." },
      { name: "고정핸들 + 크리센트", desc: "고정핸들로 여닫고 크리센트로 잠급니다." },
      { name: "크리센트", desc: "잠그면 두 창이 밀착돼 외풍과 소음을 한 번 더 막습니다." },
    ],
    note: "사진은 예시이며, 브랜드와 라인업에 따라 실제 디자인은 다를 수 있습니다.",
  },
  "공틀분합문@lx": {
    title: "공틀분합문",
    subtitle: "거실과 발코니를 나누는 큰 문의 손잡이",
    body: "거실과 발코니를 나누는 큰 문(분합문)의 손잡이입니다. 자주 오가는 문이라 어느 쪽에서든 편하게 열리는지가 중요합니다.",
    slides: [
      { src: imgHandleCouple, caption: "LX 커플핸들 — 실내·실외 양쪽에서 여닫습니다" },
      { src: imgHandleFixed, caption: "LX 고정핸들 — 유리를 밀지 않고 손잡이로 여닫습니다" },
      { src: imgCrescent, caption: "LX 크리센트 — 창이 겹치는 가운데에서 잠급니다" },
    ],
    optionsTitle: "선택할 수 있는 핸들",
    options: [
      { name: "커플핸들", tag: "추천", desc: "실내·실외 양쪽에서 여닫을 수 있습니다." },
      { name: "고정핸들 + 크리센트", desc: "고정핸들로 여닫고 크리센트로 잠급니다." },
    ],
    note: "사진은 예시이며, 브랜드와 라인업에 따라 실제 디자인은 다를 수 있습니다.",
  },
  공틀분합문: {
    title: "공틀분합문",
    subtitle: "거실과 발코니를 나누는 큰 문의 손잡이",
    body: "거실과 발코니를 나누는 큰 문(분합문)의 손잡이입니다. 자주 오가는 문이라 어느 쪽에서든 편하게 열리는지가 중요합니다.",
    slides: [
      { src: imgHandleSemiHome, caption: "홈윈도우 반자동핸들 — 자동·수동 모드를 바꿀 수 있습니다" },
      { src: imgHandleFixedHome, caption: "홈윈도우 고정핸들 — 유리를 밀지 않고 손잡이로 여닫습니다" },
      { src: imgCrescentHome, caption: "홈윈도우 크리센트 — 창이 겹치는 가운데에서 잠급니다" },
    ],
    optionsTitle: "선택할 수 있는 핸들",
    options: [
      { name: "반자동핸들", desc: "자동·수동 잠금을 바꿀 수 있어 갇히는 사고를 막습니다." },
      { name: "고정핸들 + 크리센트", desc: "고정핸들로 여닫고 크리센트로 잠급니다." },
    ],
    note: "사진은 예시이며, 브랜드와 라인업에 따라 실제 디자인은 다를 수 있습니다.",
  },
  "윈드클로저@lx": {
    title: "윈드클로저",
    subtitle: "창문이 겹치는 틈새 바람과 소음을 막는 부자재",
    body: "창문과 창문이 겹치는 미세한 틈으로 드는 외풍과 소음을 막는 밀착 부자재입니다. 바람을 직접 받는 발코니창에 적용합니다.",
    slides: [{ src: imgWindCloser, caption: "LX 윈드클로저 — 창짝이 교차하는 자리에 붙어 틈을 메웁니다" }],
  },
  윈드클로저: {
    title: "윈드클로저",
    subtitle: "창문이 겹치는 틈새 바람과 소음을 막는 부자재",
    body: "창문과 창문이 겹치는 미세한 틈으로 드는 외풍과 소음을 막는 밀착 부자재입니다. 바람을 직접 받는 발코니창에 적용합니다.",
    slides: [{ src: imgWindCloserHome, caption: "홈윈도우 윈드클로저 — 창짝이 교차하는 자리에 붙어 틈을 메웁니다" }],
  },
  // 레일캡은 브랜드마다 다르다 — "레일캡@lx" 처럼 브랜드 키가 있으면 그것을 먼저 쓴다
  "레일캡@lx": {
    title: "레일캡",
    subtitle: "레일 끝을 막아 바람과 먼지를 줄이는 LX 정품 마감",
    body: "창짝 아래 레일 끝에 끼우는 LX 정품 마감 부품입니다. 레일 끝 틈으로 드는 바람과 먼지를 막고, 창짝 모서리를 보호합니다.",
    slides: [{ src: imgRailCapLx, caption: "LX 정품 레일캡 — 창짝 아래 레일 끝에 끼웁니다" }],
  },
  레일캡: {
    title: "레일캡",
    subtitle: "창짝과 레일 사이 틈까지 따라 움직이며 막는 마감",
    body: "창을 여닫을 때 레일 굴곡에 맞춰 위아래로 움직이며 밀착하는 '상하유동식' 기밀 레일캡입니다. 레일 틈으로 드는 바람과 벌레를 막습니다.",
    slides: [{ src: imgRailCap, caption: "상하유동식 기밀 레일캡" }],
  },
  "물구멍방충캡@lx": {
    title: "물구멍 방충캡",
    subtitle: "빗물은 빼내고 벌레는 막습니다",
    body: "창틀에 고인 빗물이 빠지는 물구멍에 끼우는 LX 정품 캡입니다. 배수는 그대로 되면서 모기·날벌레가 이 구멍으로 들어오는 것을 막습니다.",
    slides: [{ src: imgDrainHoleLx, caption: "LX 방충배수캡 — 창틀 물구멍에 끼운 모습" }],
  },
  물구멍방충캡: {
    title: "물구멍 방충캡",
    subtitle: "빗물은 빼내고 벌레는 막습니다",
    body: "창틀에 고인 빗물이 빠지는 물구멍에 끼우는 캡입니다. 배수는 그대로 되면서 모기·날벌레가 이 구멍으로 들어오는 것을 막습니다.",
    slides: [{ src: imgDrainHoleHome, caption: "홈윈도우 방충캡 — 창틀 물구멍에 끼운 모습" }],
  },
  "안전스토퍼@lx": {
    title: "안전스토퍼",
    subtitle: "활짝 열어도 제자리에 멈추게 잡아 줍니다",
    body: "창을 세게 열 때 핸들이 반대편 창틀에 부딪혀 부서지는 것을 막고, 문틈에 손이 끼는 사고도 예방하는 완충 장치입니다.",
    slides: [{ src: imgStopper, caption: "LX 창틀 스토퍼 — 창이 세게 부딪히기 전에 멈춥니다" }],
  },
  안전스토퍼: {
    title: "안전스토퍼",
    subtitle: "활짝 열어도 제자리에 멈추게 잡아 줍니다",
    body: "창을 세게 열 때 핸들이 반대편 창틀에 부딪혀 부서지는 것을 막고, 문틈에 손이 끼는 사고도 예방하는 완충 장치입니다.",
    slides: [{ src: imgStopperHome, caption: "홈윈도우 창틀 스토퍼 — 창이 세게 부딪히기 전에 멈춥니다" }],
  },
  빨래건조대: {
    title: "빨래건조대",
    subtitle: "바닥을 차지하지 않는 천장형 건조대",
    body: "바닥형 대신 천장 공간을 쓰는 건조대입니다. 바닥을 차지하지 않아 오가는 데 방해가 없고, 창호 공사와 함께 설치합니다.",
    slides: [{ src: imgDryer, caption: "천장형 빨래건조대" }],
    note: "자동형(전동) 건조대도 선택할 수 있으며, 추가 비용은 상담에서 안내해 드립니다.",
  },
};

/** 표 항목 칸 — 칸 전체가 버튼이고 (?) 는 표시용. 설명이 없는 항목은 글자만 보여 준다. */
export function SpecInfoButton({ label, brand, onOpen }: { label: string; brand?: string; onOpen: (info: SpecInfo) => void }) {
  const info = (brand && SPEC_INFO[`${label}@${brand}`]) || SPEC_INFO[label];
  if (!info) {
    return <span className="flex-1 my-3 md:my-4 flex items-center justify-center font-medium text-[#333] break-keep">{label}</span>;
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen(info);
      }}
      aria-label={`${label} 설명 보기`}
      className="flex-1 my-1.5 rounded-lg flex items-center justify-center gap-1 font-medium text-[#333] break-keep hover:bg-black/[.04] active:bg-black/[.07] transition-colors cursor-pointer group"
    >
      <span>{label}</span>
      <HelpCircle className="shrink-0 w-[15px] h-[15px] md:w-4 md:h-4 text-[#bbb] group-hover:text-[#d22727] transition-colors" strokeWidth={2} />
    </button>
  );
}

const TAG_STYLE: Record<string, string> = {
  추천: "bg-[#D22727] text-white",
  프리미엄: "bg-[#333] text-white",
};

/**
 * 항목 설명 팝업 — 원데이 시공 팝업(StepInfoModal)과 같은 모양.
 * 사진이 여러 장이면 좌우로 넘겨 보고, 선택지가 있으면 아래에 카드로 비교해 준다.
 * 뒤 페이지 스크롤은 useScrollLock 으로 잠근다 (scrollbar-gutter 덕에 흔들리지 않음).
 */
export function SpecInfoModal({ info, onClose }: { info: SpecInfo | null; onClose: () => void }) {
  const [i, setI] = useState(0);
  const slides = info?.slides ?? [];
  const many = slides.length > 1;
  useScrollLock(!!info);

  useEffect(() => setI(0), [info]);
  useEffect(() => {
    if (!info) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (many && e.key === "ArrowLeft") setI((v) => (v - 1 + slides.length) % slides.length);
      if (many && e.key === "ArrowRight") setI((v) => (v + 1) % slides.length);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [info, many, slides.length, onClose]);

  const go = (d: number) => setI((v) => (v + d + slides.length) % slides.length);

  return (
    <AnimatePresence>
      {info && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-[116px] md:pb-[150px]"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full md:w-[60vw] max-w-2xl flex flex-col shadow-2xl overflow-hidden"
              style={{ maxHeight: "calc(100vh - 2rem - 150px)" }}
            >
              {/* 헤더 */}
              <div className="flex-shrink-0 bg-white border-b border-[#eee] px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="text-[20px] md:text-[24px] font-extrabold text-[#333]">{info.title}</h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors flex-shrink-0 cursor-pointer"
                  aria-label="닫기"
                >
                  <X size={20} className="text-[#999]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                {slides.length > 0 && (
                  <div className="mb-6">
                    {/* 사진마다 비율이 달라도 상자 높이가 고정되게 — 슬라이드 넘길 때 팝업이 출렁이지 않는다 */}
                    <div className="relative w-full aspect-[100/62] rounded-xl overflow-hidden border border-[#eee] bg-white">
                      <img
                        key={slides[i].src}
                        src={slides[i].src}
                        alt={slides[i].caption || info.title}
                        className="absolute inset-0 w-full h-full object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                      {many && (
                        <>
                          <button
                            onClick={() => go(-1)}
                            aria-label="이전 사진"
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                          >
                            <ChevronLeft size={20} className="text-[#333]" />
                          </button>
                          <button
                            onClick={() => go(1)}
                            aria-label="다음 사진"
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                          >
                            <ChevronRight size={20} className="text-[#333]" />
                          </button>
                        </>
                      )}
                    </div>
                    {many && (
                      <div className="mt-3 flex items-center justify-center gap-2">
                        {slides.map((s, idx) => (
                          <button
                            key={s.src + idx}
                            onClick={() => setI(idx)}
                            aria-label={`${idx + 1}번째 사진`}
                            className={`h-2 rounded-full transition-all cursor-pointer ${idx === i ? "w-5 bg-[#D22727]" : "w-2 bg-[#ddd] hover:bg-[#bbb]"}`}
                          />
                        ))}
                      </div>
                    )}
                    {slides[i].caption && (
                      <p className="mt-2 min-h-[40px] text-center text-[13px] md:text-[14px] text-[#777] leading-[20px] break-keep">{slides[i].caption}</p>
                    )}
                  </div>
                )}

                <h4 className="text-[18px] md:text-[20px] font-bold text-[#333] mb-3 break-keep">{info.subtitle}</h4>
                <p className="text-[15px] md:text-[16px] text-[#666] leading-[1.7] break-keep">{info.body}</p>

                {info.options && info.options.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[13px] font-bold text-[#999] tracking-[0.02em] mb-2">{info.optionsTitle ?? "선택지"}</p>
                    <ul className="space-y-2">
                      {info.options.map((o) => (
                        <li key={o.name} className="rounded-xl border border-[#eee] bg-[#fafafa] px-4 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[15px] md:text-[16px] font-bold text-[#333]">{o.name}</span>
                            {o.tag && (
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${TAG_STYLE[o.tag] ?? "bg-[#f0f0f0] text-[#666]"}`}>
                                {o.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-[14px] text-[#666] leading-[1.6] break-keep">{o.desc}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {info.note && (
                  <p className="mt-5 text-[12px] md:text-[13px] text-[#999] leading-[1.6] break-keep border-t border-[#f0f0f0] pt-4">
                    ※ {info.note}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
