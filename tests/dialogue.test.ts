import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { respond, respondToEvent, tierOf, fillTemplate, matchIntent, applyPersona, resolveTierKey } from '../shared/dialogue/engine.ts';
import type { Corpus } from '../shared/dialogue/types.ts';

const CAT: Corpus = JSON.parse(readFileSync('corpus/cat_orange.json', 'utf8'));
const DOG: Corpus = JSON.parse(readFileSync('corpus/dog_shiba.json', 'utf8'));

const ctx = (intimacy: number, extra: Record<string, string | number> = {}) => ({
  memory: { name: '团子', ...extra },
  intimacy,
  rng: () => 0.5
});

const lineCount = (c: Corpus) =>
  Object.values(c.intents).reduce((n, i) => n + Object.values(i.tiers ?? {}).reduce((m, arr) => m + arr.length, 0), 0);

test('资料库语料：两品种各 600 条 / 21 意图（含兜底）', () => {
  assert.equal(lineCount(CAT), 603);   // 600 条资料库 + 3 条兜底
  assert.equal(lineCount(DOG), 603);
  assert.equal(Object.keys(CAT.intents).length, 21);
  assert.ok(CAT.intents.fallback_pet);
});

test('档位映射：亲密度档 → 语料的 soft/vivid/gentle', () => {
  assert.equal(tierOf(10), 'low');
  assert.equal(resolveTierKey(CAT, 'low'), 'gentle');
  assert.equal(resolveTierKey(CAT, 'mid'), 'soft');
  assert.equal(resolveTierKey(CAT, 'high'), 'vivid');
});

test('意图匹配：关键词命中', () => {
  assert.equal(matchIntent(CAT, '我回来了'), 'greet_home');
  assert.equal(matchIntent(CAT, '晚安'), 'night');
  assert.equal(matchIntent(CAT, '摸摸头'), 'pet_head');
  assert.equal(matchIntent(CAT, '我有点饿'), 'feed_ask');
  assert.equal(matchIntent(CAT, '我好无聊'), 'bored');
});

test('未命中 → fallback_pet，不硬答', () => {
  const r = respond(CAT, '帮我把明天的会议纪要整理一下', ctx(30));
  assert.equal(r.intent, 'fallback_pet');
  assert.ok(r.line.length > 0);
});

test('槽位安全：返回句绝不包含未填充的 {xxx}', () => {
  const inputs = ['我回来了', '晚安', '摸摸头', '饿了', '我爱你'];
  for (const intimacy of [5, 40, 90]) {
    for (const text of inputs) {
      const r = respond(CAT, text, ctx(intimacy));
      assert.ok(!r.line.includes('{'), `出现未填充槽位：${r.line}`);
    }
  }
});

test('fillTemplate：缺值 / 非法槽位返回 null', () => {
  assert.equal(fillTemplate('{name}你好', { memory: {}, intimacy: 0 }), null);
  assert.equal(fillTemplate('{nobody}你好', { memory: { nobody: 'x' }, intimacy: 0 }), null);
  assert.equal(fillTemplate('{name}你好', { memory: { name: '团子' }, intimacy: 0 }), '团子你好');
});

test('物种槽位：{call} 自动取语料里的喵/汪', () => {
  const c = respond(CAT, '我回来了', ctx(40));
  const d = respond(DOG, '我回来了', ctx(40));
  assert.ok(c.line.includes('喵') || !c.line.includes('汪'));
  assert.ok(d.line.includes('汪') || !d.line.includes('喵'));
});

test('人格滤镜：柴犬台词不超过 sentenceMax', () => {
  const out = applyPersona('汪我今天在门口等了你一整天从早上等到现在都没有动过地方你终于回来了哦', DOG, () => 0.9);
  assert.ok(out.length <= (DOG.persona?.sentenceMax ?? 22), `超长：${out.length}`);
});

test('关键词命中率 ≥ 90%（每个意图取自己的首个关键词）', () => {
  let hit = 0;
  let total = 0;
  for (const [id, intent] of Object.entries(CAT.intents)) {
    if (id === 'fallback_pet') continue;
    const kw = intent.keywords?.[0];
    if (!kw) continue;
    total++;
    if (matchIntent(CAT, kw) === id) hit++;
  }
  const rate = hit / total;
  assert.ok(total >= 20, '意图数不足');
  assert.ok(rate >= 0.9, `命中率 ${(rate * 100).toFixed(1)}% < 90%`);
});

test('事件驱动：回家与晚间也能出话术', () => {
  for (const id of ['greet_home', 'night', 'wait_home']) {
    const r = respondToEvent(CAT, id, ctx(70));
    assert.ok(r.line.length > 0, id + ' 无台词');
  }
});