/**
 * 语料库校验（corpus-lint）
 *
 * 以语料自身声明为口径：
 *  - 档位：persona.tierMap 的值（资料库用 soft/vivid/gentle），否则 low/mid/high
 *  - 槽位：corpus.slots 的键 + 记忆槽位白名单
 *  - 长度：persona.sentenceMax（缺省猫 40 / 狗 22）
 *  - 必须含 fallback_pet；意图数 ≥ 20；每个档位 ≥ 3 条；重复度 < 20%
 *
 * 用法：node --experimental-strip-types tools/corpus-lint.ts [文件...]
 * 退出码：0 通过；1 有错误；2 没有语料文件
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const MEMORY_SLOTS = new Set([
  'name', 'daysTogether', 'favFood', 'hateFood', 'adoptDate', 'weather', 'todayEvent',
  'calls', 'call', 'soft', 'purr', 'act', 'tail', 'sp', 'pet', 'food', 'toy'
]);

const MIN_INTENTS = 20;
const MIN_VARIANTS = 3;

interface CorpusFile {
  species?: string;
  persona?: { sentenceMax?: number; tierMap?: Record<string, string> };
  slots?: Record<string, string>;
  intents?: Record<string, { keywords?: string[]; tiers?: Record<string, string[]> }>;
}

const errors: string[] = [];
const warnings: string[] = [];

function checkFile(path: string): { species: string; total: number; intents: number } | null {
  let raw: CorpusFile;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8')) as CorpusFile;
  } catch (e) {
    errors.push(`${path}: JSON 解析失败（${e instanceof Error ? e.message : 'unknown'}）`);
    return null;
  }

  const species = raw.species ?? 'unknown';
  const maxLen = raw.persona?.sentenceMax ?? (species.startsWith('dog') ? 22 : 40);
  const expectedTiers = raw.persona?.tierMap
    ? Object.values(raw.persona.tierMap)
    : ['low', 'mid', 'high'];
  const allowed = new Set([...MEMORY_SLOTS, ...Object.keys(raw.slots ?? {})]);
  const intents = raw.intents ?? {};

  if (Object.keys(intents).length < MIN_INTENTS) {
    errors.push(`${species}: 只有 ${Object.keys(intents).length} 个意图（需 ≥ ${MIN_INTENTS}）`);
  }
  if (!intents.fallback_pet) errors.push(`${species}: 缺 fallback_pet（兜底意图）`);

  const seen = new Map<string, number>();
  let total = 0;

  for (const [id, intent] of Object.entries(intents)) {
    if (!intent.keywords?.length && id !== 'fallback_pet') {
      warnings.push(`${species}/${id}: 没有关键词，永远不会被命中`);
    }
    const tiers = intent.tiers ?? {};
    const tierList = id === 'fallback_pet' ? ['default'] : expectedTiers;
    for (const tier of tierList) {
      const list = tiers[tier];
      if (!list) {
        errors.push(`${species}/${id}: 缺档位 ${tier}`);
        continue;
      }
      if (list.length < MIN_VARIANTS) {
        errors.push(`${species}/${id}/${tier}: 只有 ${list.length} 条（需 ≥ ${MIN_VARIANTS}）`);
      }
      for (const line of list) {
        total++;
        for (const m of line.matchAll(/\{(\w+)\}/g)) {
          if (!allowed.has(m[1]!)) errors.push(`${species}/${id}: 未定义槽位 {${m[1]}} → ${line}`);
        }
        if (line.length > maxLen) {
          errors.push(`${species}/${id}: 过长 ${line.length} 字（上限 ${maxLen}）→ ${line}`);
        }
        if (line !== line.trim()) errors.push(`${species}/${id}: 首尾有空格 → ${line}`);
        seen.set(line, (seen.get(line) ?? 0) + 1);
      }
    }
  }

  if (total > 0) {
    const dupes = [...seen.values()].filter((n) => n > 1).reduce((a, b) => a + b, 0);
    if (dupes / total >= 0.2) errors.push(`${species}: 重复度 ${((dupes / total) * 100).toFixed(0)}%（需 < 20%）`);
  } else {
    errors.push(`${species}: 没有任何句子`);
  }

  return { species, total, intents: Object.keys(intents).length };
}

const args = process.argv.slice(2);
const files = args.length ? args : ['corpus/cat_orange.json', 'corpus/dog_shiba.json'].map((p) => resolve(p));
const existing = files.filter((f) => existsSync(f));
if (existing.length === 0) {
  console.error('没有找到语料文件：' + files.join(', '));
  process.exit(2);
}

let grand = 0;
for (const f of existing) {
  const r = checkFile(f);
  if (r) { console.log(`${join(f)} → ${r.species}，${r.total} 条 / ${r.intents} 意图`); grand += r.total; }
}
for (const w of warnings) console.warn('WARN  ' + w);
for (const e of errors.slice(0, 30)) console.error('ERROR ' + e);
if (errors.length > 30) console.error(`...另外 ${errors.length - 30} 条错误未显示`);
console.log(`\n合计 ${grand} 条，错误 ${errors.length}，警告 ${warnings.length}`);
process.exit(errors.length > 0 ? 1 : 0);