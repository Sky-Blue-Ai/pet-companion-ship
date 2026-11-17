/**
 * 设计令牌：唯一真源 → 生成 Cocos 常量
 *
 * 冲突说明：用户资料库（docs/petlib-v1.md 第四节）给的是一套通用模板色（紫 #5b4ef0 / 灰白 #f5f6f8），
 * 与我们已经评审通过的视觉（奶油白 #FAF7F0 + 橙 #ED8A4C + 近黑 #1F1D1A）不一致。
 * 这里以**已评审通过的视觉**为准，结构沿用资料库的 schema（color/radius/spacing/font/motion），
 * 方便以后任何一方调整只改这个文件。
 *
 * 用法：node --experimental-strip-types tools/build-tokens.ts [--write]
 *   --write 时产出 design/DESIGN_TOKENS.ts（禁止手改）
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const SRC = 'design/tokens.json';
const OUT = 'design/DESIGN_TOKENS.ts';

interface Tokens {
  color: Record<string, string>;
  radius: Record<string, number>;
  spacing: Record<string, number>;
  font: Record<string, string | number>;
  motion: Record<string, number>;
}

if (!existsSync(SRC)) {
  console.error('缺少 ' + SRC);
  process.exit(2);
}
const tokens = JSON.parse(readFileSync(SRC, 'utf8')) as Tokens;

const constName = (k: string) => k.replace(/([A-Z])/g, '_$1').toUpperCase();
const obj = (o: Record<string, string | number>, fmt: (v: string | number) => string) =>
  Object.entries(o).map(([k, v]) => `    ${constName(k)}: ${fmt(v)},`).join('\n');

const ts = `// 由 tools/build-tokens.ts 从 design/tokens.json 生成 —— 禁止手改
// 改样式请改 tokens.json 后重新生成
export const DESIGN = {
  COLOR: {
${obj(tokens.color, (v) => `'${v}'`)}
  },
  RADIUS: {
${obj(tokens.radius, (v) => String(v))}
  },
  SPACING: {
${obj(tokens.spacing, (v) => String(v))}
  },
  FONT: {
${obj(tokens.font, (v) => (typeof v === 'number' ? String(v) : `'${v}'`))}
  },
  MOTION: {
${obj(tokens.motion, (v) => String(v))}
  },
} as const;

export type DesignTokens = typeof DESIGN;
`;

console.log('颜色 ' + Object.keys(tokens.color).length + ' 个，圆角 ' + Object.keys(tokens.radius).length + ' 个');
if (process.argv.includes('--write')) {
  writeFileSync(OUT, ts);
  console.log('已写入 ' + OUT);
} else {
  console.log('（dry-run，加 --write 生成）');
}