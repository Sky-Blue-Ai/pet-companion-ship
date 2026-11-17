/**
 * 语料库校验（corpus-lint）
 *
 * 校验口径与 corpus/README.md 一致：
 *  1. 20 个意图全覆盖
 *  2. 每个语气档（low/mid/high）≥ 3 个变体
 *  3. 槽位只能是白名单里的
 *  4. 单条长度 ≤ 40 字（狗 ≤ 22 字）
 *  5. 重复度 < 20%（同文件内完全相同句子占比）
 *
 * 用法：node --experimental-strip-types tools/corpus-lint.ts [文件...]
 * 退出码：0 通过；1 有错误；2 没有语料文件（还没产出）
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REQUIRED_INTENTS = [
  'greet_home', 'night', 'pet_head', 'praise', 'scold',
  'feed_ask', 'doing', 'name_ask', 'weather_ask', 'tired',
  'miss', 'remember', 'program', 'bye', 'ask_food_pref',
  'sick_comfort', 'play_invite', 'praise_body', 'anniversary', 'fallback_pet'
];

const ALLOWED_SLOTS = new Set([
  'name', 'daysTogether', 'favFood', 'hateFood', 'adoptDate', 'weather', 'todayEvent', 'calls'
]);

const TIERS = ['low', 'mid', 'high'] as const;
const MIN_VARIANTS = 3;

interface CorpusFile {
  species?: string;
  persona?: { sentenceMax?: number };
  intents?: Record<string, { keywords?: string[]; tiers?: Record<string, string[]> }>;
}

const errors: string[] = [];
const warnings: string[] = [];

function checkFile(path: string): { species: string; total: number } | null {
  let raw: CorpusFile;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8')) as CorpusFile;
  } catch (e) {
    errors.push(`${path}: JSON 解析失败（${e instanceof Error ? e.message : 'unknown'}）`);
    return null;
  }

  const species = raw.species ?? 'unknown';
  const maxLen = species.startsWith('dog') ? 22 : 40;
  const intents = raw.intents ?? {};

  // 1) 意图覆盖
  for (const id of REQUIRED_INTENTS) {
    if (!intents[id]) errors.push(`${species}: 缺意图 ${id}`);
  }
  for (const id of Object.keys(intents)) {
    if (!REQUIRED_INTENTS.includes(id)) warnings.push(`${species}: 多出的意图 ${id}`);
  }

  // 2) 变体数量 + 3) 槽位 + 4) 长度 + 5) 重复
  const seen = new Map<string, number>();
  let total = 0;

  for (const [id, intent] of Object.entries(intents)) {
    const tiers = intent.tiers ?? {};
    for (const tier of TIERS) {
      const list = tiers[tier];
      if (!list) continue; // fallback_pet 可以只有 default
      if (list.length < MIN_VARIANTS) {
        errors.push(`${species}/${id}/${tier}: 只有 ${list.length} 个变体（需 ≥ ${MIN_VARIANTS}）`);
      }
      for (const line of list) {
        total++;
        const slots = [...line.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!);
        for (const s of slots) {
          if (!ALLOWED_SLOTS.has(s)) errors.push(`${species}/${id}: 未定义槽位 {${s}} → ${line}`);
        }
        if (line.length > maxLen) {
          errors.push(`${species}/${id}: 过长 ${line.length} 字（上限 ${maxLen}）→ ${line}`);
        }
        seen.set(line, (seen.get(line) ?? 0) + 1);
      }
    }
  }

  if (total > 0) {
    const dupes = [...seen.values()].filter((n) => n > 1).reduce((a, b) => a + b, 0);
    const ratio = dupes / total;
    if (ratio >= 0.2) errors.push(`${species}: 重复度 ${(ratio * 100).toFixed(0)}%（需 < 20%）`);
  } else {
    errors.push(`${species}: 没有任何句子`);
  }

  return { species, total };
}

// ---- main ----
const args = process.argv.slice(2);
const files = args.length ? args : ['corpus/cat_orange.json', 'corpus/dog_shiba.json'].map((p) => resolve(p));

const existing = files.filter((f) => existsSync(f));
if (existing.length === 0) {
  console.error('没有找到语料文件：' + files.join(', '));
  console.error('先按 corpus/README.md 的规范产出，再跑一次。');
  process.exit(2);
}

let grandTotal = 0;
for (const f of existing) {
  const r = checkFile(f);
  if (r) {
    console.log(`${join(f)} → ${r.species}，${r.total} 条`);
    grandTotal += r.total;
  }
}

for (const w of warnings) console.warn('WARN  ' + w);
for (const e of errors) console.error('ERROR ' + e);

console.log(`\n合计 ${grandTotal} 条，错误 ${errors.length}，警告 ${warnings.length}`);
process.exit(errors.length > 0 ? 1 : 0);