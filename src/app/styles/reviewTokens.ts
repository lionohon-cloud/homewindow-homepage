export const REVIEW_TOKENS = {
  BRAND: "#952c2c",
  BRAND_DARK: "#6e1f1f",
  GOLD: "#b8945a",
  GOLD_LIGHT: "#d4b277",
  PREMIUM_BG: "#1a1210",
  PREMIUM_BG_SOFT: "#2a1f1c",
  STAR: "#c89545",
  BG: "#faf7f4",
  SURFACE: "#ffffff",
  LINE: "#ebe5e0",
  INK: "#1c1614",
  INK_2: "#3a3531",
  INK_3: "#6b6460",
  INK_4: "#9a948f",
} as const;

export const REVIEW_TAGS = [
  "거실",
  "주방",
  "안방",
  "베란다",
  "단열 만족",
  "소음 차단",
  "깔끔한 마감",
  "친절 응대",
  "빠른 시공",
] as const;

export const REVIEW_PARTS = ["거실", "주방", "안방", "작은방", "베란다", "현관"] as const;

export const REVIEW_BRANDS = ["LX", "홈씨씨", "홈윈도우"] as const;
export const REVIEW_MODELS = ["프레스티지", "시그니처", "에코"] as const;

export type ReviewTier = "simple" | "premium";
export type ReviewBrand = (typeof REVIEW_BRANDS)[number];
export type ReviewModel = (typeof REVIEW_MODELS)[number];

export const REVIEW_SESSION_KEYS = {
  TOKEN: "hw_review_token",
  MASKED: "hw_review_masked",
  SNAPSHOT: "hw_review_snapshot",
  TIER: "hw_review_tier",
  DONE: "hw_review_done",
} as const;

export const REVIEW_PARTS_EXT = [
  "거실", "주방", "안방", "작은방", "베란다", "현관", "서재", "드레스룸",
] as const;
