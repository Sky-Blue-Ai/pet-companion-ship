// 由 tools/build-tokens.ts 从 design/tokens.json 生成 —— 禁止手改
// 改样式请改 tokens.json 后重新生成
export const DESIGN = {
  COLOR: {
    BG: '#FAF7F0',
    PANEL: '#FFFFFF',
    LINE: '#F0E9DE',
    LINE2: '#E6DDD1',
    TEXT: '#1F1D1A',
    MUTED: '#8C8278',
    WEAK: '#B7B0A5',
    BRAND: '#ED8A4C',
    BRAND_SOFT: '#FFF1E6',
    BRAND_DEEP: '#C9703A',
    OK: '#3F7D52',
    OK_SOFT: '#EAF3EC',
    WARN: '#C4562A',
    WARN_SOFT: '#FFF6F2',
    CAT_PRIMARY: '#F5A463',
    DOG_PRIMARY: '#E7A969',
  },
  RADIUS: {
    PANEL: 16,
    BTN: 26,
    CHIP: 13,
    SHEET: 22,
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 12,
    LG: 16,
    XL: 24,
  },
  FONT: {
    SIZE_TITLE: 22,
    SIZE_TITLE_SM: 18,
    SIZE_BODY: 12,
    SIZE_META: 10,
    FAMILY: 'Noto Sans SC',
  },
  MOTION: {
    FRAME_MS: 33,
    TWEEN_MS: 260,
    BUBBLE_MS: 2200,
    EMOTION_FADE_MS: 400,
    CAMERA_PUSH_MS: 2500,
  },
} as const;

export type DesignTokens = typeof DESIGN;
