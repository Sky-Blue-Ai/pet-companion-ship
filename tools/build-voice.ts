/**
 * 语音包选料 + 索引生成（G-12）
 *
 * 规则（与《AI 宠物资产预料库 v1.0》第三节一致）：
 *  - 每意图 × 每物种取 10 条 → 20 × 2 × 10 = 400 条
 *  - 配额：soft 4 / vivid 3 / gentle 3
 *  - 同意图内最长与最短各保留 1 条（保语音节奏多样性）
 *  - voiceId = sha1(text) 前 8 位；CDN 路径 {species}/{intent}/{voiceId}.mp3
 *
 * 真正的 TTS 合成由外部命令完成（保持供应商可替换），本工具只负责「选料 + 契约」。
 *
 * 用法：
 *   node --experimental-strip-types tools/build-voice.ts          # 只统计
 *   node --experimental-strip-types tools/build-voice.ts --write  # 产出 voice/index.json + voice/select-list.md
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

interface Corpus {
  species: string;
  intents: Record<string, { tiers?: Record<string, string[]> }>;
}

const FILES: Array<{ path: string; sp: 'cat' | 'dog' }> = [
  { path: 'corpus/cat_orange.json', sp: 'cat' },
  { path: 'corpus/dog_shiba.json', sp: 'dog' }
];
const QUOTA = { soft: 4, vivid: 3, gentle: 3 } as const;
const PER_INTENT = 10;
const TTS_BY_TONE: Record<string, string> = {
  soft: 'voice-soft-0.9x',
  vivid: 'voice-vivid-1.1x',
  gentle: 'voice-gentle-0.95x'
};

const sha8 = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 8);

interface Entry {
  id: string;
  intent: string;
  tone: string;
  species: string;
  text: string;
  voiceId: string;
  url: string;
  tts: string;
}

/** 从池里按长度均匀取 n 条（确定性，便于复现） */
function evenly(pool: string[], n: number, taken: Set<string>): string[] {
  const rest = pool.filter((t) => !taken.has(t)).sort((a, b) => a.length - b.length || a.localeCompare(b));
  if (rest.length <= n) return rest;
  const out: string[] = [];
  const step = rest.length / n;
  for (let i = 0; i < n; i++) out.push(rest[Math.floor(i * step)]!);
  return [...new Set(out)];
}

const entries: Entry[] = [];
const missing: string[] = [];

for (const { path, sp } of FILES) {
  if (!existsSync(path)) {
    console.error('缺少语料：' + path);
    process.exit(2);
  }
  const corpus = JSON.parse(readFileSync(path, 'utf8')) as Corpus;

  for (const [intent, data] of Object.entries(corpus.intents)) {
    if (intent === 'fallback_pet') continue; // 兜底句不做语音，运行时用文字
    const tiers = data.tiers ?? {};
    const all = Object.values(tiers).flat();
    if (!all.length) {
      missing.push(`${sp}/${intent}: 无台词`);
      continue;
    }

    const taken = new Set<string>();
    const sorted = [...all].sort((a, b) => a.length - b.length || a.localeCompare(b));
    const picked: Array<{ text: string; tone: string }> = [];

    // 强制：最短与最长各一条
    for (const text of [sorted[0]!, sorted[sorted.length - 1]!]) {
      if (taken.has(text)) continue;
      taken.add(text);
      const tone = Object.keys(tiers).find((k) => tiers[k]!.includes(text)) ?? 'soft';
      picked.push({ text, tone });
    }

    // 按配额补
    for (const [tone, quota] of Object.entries(QUOTA)) {
      const already = picked.filter((p) => p.tone === tone).length;
      const need = Math.max(0, quota - already);
      if (!need) continue;
      for (const text of evenly(tiers[tone] ?? [], need, taken)) {
        taken.add(text);
        picked.push({ text, tone });
      }
    }

    // 档位不足时用其它档补齐到 10 条
    if (picked.length < PER_INTENT) {
      const rest = all.filter((t) => !taken.has(t));
      for (const text of evenly(rest, PER_INTENT - picked.length, taken)) {
        const tone = Object.keys(tiers).find((k) => tiers[k]!.includes(text)) ?? 'soft';
        picked.push({ text, tone });
      }
    }

    for (const { text, tone } of picked.slice(0, PER_INTENT)) {
      const voiceId = sha8(text);
      entries.push({
        id: `${intent}-${tone}-${sp}-${voiceId}`,
        intent,
        tone,
        species: sp,
        text,
        voiceId,
        url: `${sp}/${intent}/${voiceId}.mp3`,
        tts: TTS_BY_TONE[tone] ?? 'voice-soft-0.9x'
      });
    }
  }
}

const byTone = entries.reduce<Record<string, number>>((m, e) => {
  m[e.tone] = (m[e.tone] ?? 0) + 1;
  return m;
}, {});
console.log(`选料 ${entries.length} 条（目标 400）`);
console.log('档位分布', byTone);
if (missing.length) console.warn('缺料', missing);

if (process.argv.includes('--write')) {
  mkdirSync('voice', { recursive: true });
  writeFileSync(
    'voice/index.json',
    JSON.stringify(
      { version: 'v1', generatedAt: new Date().toISOString().slice(0, 10), total: entries.length, entries },
      null,
      1
    )
  );
  const rows = entries.map((e) => `| ${e.id} | ${e.tone} | ${e.species} | ${e.text} | ${e.voiceId} |`).join('\n');
  writeFileSync(
    'voice/select-list.md',
    `# 语音包选料清单（${entries.length} 条）\n\n> 由 tools/build-voice.ts 生成；voiceId = sha1(text) 前 8 位，与《资料库》规则一致。\n\n| ID | 档位 | 物种 | 文本 | voiceId |\n|---|---|---|---|---|\n${rows}\n`
  );
  console.log('已写入 voice/index.json 与 voice/select-list.md');
} else {
  console.log('（dry-run，加 --write 产出文件）');
}