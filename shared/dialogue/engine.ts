/**
 * 语料库对话引擎（零大模型）
 *
 * 管线：意图匹配 → 语气档 → 模板填充（槽位安全）→ 变体选择（避重）→ 人格滤镜
 * 三条硬规则：
 *  1. 槽位缺值就换变体，绝不输出 {name} 原文
 *  2. 未命中不硬答，走宠物式兜底
 *  3. 柴犬短句上限更低（persona.sentenceMax）
 */
import type { Corpus, DialogueContext, DialogueResult, Tier } from './types.ts';

export const TIERS: Tier[] = ['low', 'mid', 'high'];

/** 亲密度 → 语气档：<20 陌生，<60 熟，>=60 亲 */
export function tierOf(intimacy: number): Tier {
  if (intimacy < 20) return 'low';
  if (intimacy < 60) return 'mid';
  return 'high';
}

/** 槽位白名单，防止语料里写错变量名却静默通过 */
export const ALLOWED_SLOTS = new Set([
  'name', 'daysTogether', 'favFood', 'hateFood', 'adoptDate', 'weather', 'todayEvent', 'calls'
]);

/** 填充槽位：返回 null 表示缺值（调用方必须换变体） */
export function fillTemplate(template: string, ctx: DialogueContext): string | null {
  const memory = { ...ctx.memory, calls: ctx.calls };
  let missing = false;
  const out = template.replace(/\{(\w+)\}/g, (_m, key: string) => {
    if (!ALLOWED_SLOTS.has(key)) { missing = true; return ''; }
    const v = memory[key];
    if (v === undefined || v === null || v === '') { missing = true; return ''; }
    return String(v);
  });
  return missing ? null : out;
}

/** 意图匹配：关键词命中即算，多个命中取关键词最长者（更具体优先） */
export function matchIntent(corpus: Corpus, text: string): string {
  let best = 'fallback_pet';
  let bestLen = 0;
  for (const [id, intent] of Object.entries(corpus.intents)) {
    if (id === 'fallback_pet') continue;
    for (const kw of intent.keywords ?? []) {
      if (kw && text.includes(kw) && kw.length > bestLen) {
        best = id;
        bestLen = kw.length;
      }
    }
  }
  return best;
}

/** 变体选择：先过滤不可渲染的，再避开「最近用过」的，最后随机 */
export function pickVariant(
  lines: string[] | undefined,
  ctx: DialogueContext
): string | null {
  if (!lines?.length) return null;
  const renderable = lines
    .map((t) => fillTemplate(t, ctx))
    .filter((x): x is string => x !== null);
  if (!renderable.length) return null;
  const fresh = renderable.filter((l) => !ctx.usedLines?.has(l));
  const pool = fresh.length ? fresh : renderable;
  const rnd = ctx.rng ?? Math.random;
  return pool[Math.floor(rnd() * pool.length)] ?? pool[0]!;
}

/** 人格滤镜：柴犬拆短句、过长截断、句尾口癖 */
export function applyPersona(line: string, corpus: Corpus): string {
  const persona = corpus.persona ?? {};
  let out = line;
  const max = persona.sentenceMax;
  if (persona.tone === 'tsun' && out.length > (max ?? 22)) {
    // 柴犬：在第一个标点处断开，保留前半句
    const cut = out.search(/[，。……]/);
    if (cut > 2) out = out.slice(0, cut);
  }
  if (max && out.length > max) out = out.slice(0, max);
  if (persona.tic && out.length <= (max ?? 40) - 4 && !out.includes(persona.tic) && Math.random() < 0.25) {
    out = out + persona.tic;
  }
  return out;
}

/** 主入口：给一句用户输入，产出它的一句回应 */
export function respond(corpus: Corpus, text: string, ctx: DialogueContext): DialogueResult {
  const intent = matchIntent(corpus, text);
  const tier = tierOf(ctx.intimacy);
  const tiers = corpus.intents[intent]?.tiers ?? {};
  const line =
    pickVariant(tiers[tier], ctx) ??        // 当前语气档
    pickVariant(tiers.mid, ctx) ??          // 退化到中档
    pickVariant(tiers.low, ctx) ??          // 再退化
    pickVariant(tiers.default, ctx) ??      // 兜底档
    (corpus.intents.fallback_pet ? pickVariant(corpus.intents.fallback_pet.tiers.default, ctx) : null);

  return {
    intent,
    tier,
    line: applyPersona(line ?? '（歪头看了看你）', corpus)
  };
}

/** 事件驱动（里程碑/重逢/生病）：不依赖用户输入 */
export function respondToEvent(
  corpus: Corpus,
  eventIntent: string,
  ctx: DialogueContext
): DialogueResult {
  const tier = tierOf(ctx.intimacy);
  const tiers = corpus.intents[eventIntent]?.tiers ?? {};
  const line =
    pickVariant(tiers[tier], ctx) ??
    pickVariant(tiers.default, ctx) ??
    pickVariant(corpus.intents.fallback_pet?.tiers.default, ctx);
  return { intent: eventIntent, tier, line: applyPersona(line ?? '（安静地看着你）', corpus) };
}
