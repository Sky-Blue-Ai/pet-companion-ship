import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { feedPet, playWithPet, cleanPet, talkToPet, claimAdReward, FOODS } from '../server/core/actions.ts';
import type { Corpus } from '../shared/dialogue/types.ts';
import type { PetState } from '../shared/types.ts';

const CAT: Corpus = JSON.parse(readFileSync('corpus/cat_orange.json', 'utf8'));
const T0 = Date.parse('2026-11-17T10:00:00+08:00');

function pet(over: Partial<PetState> = {}): PetState {
  return {
    species: 'cat_orange', name: '布丁', adoptAt: T0, lastSettleAt: T0,
    stats: { fullness: 50, clean: 70, mood: 50, energy: 40, intimacy: 10 },
    sick: false, lowCleanSince: null, lowFullnessSince: null,
    milestones: [], counts: { feed: 0, play: 0, talk: 0 }, lastPlayAt: null,
    ...over
  };
}

test('投喂：8 种食物齐备，偏爱有 1.4 倍加成', () => {
  assert.equal(FOODS.length, 8);
  const normal = feedPet(pet(), 'freeze_dry', {});
  const fav = feedPet(pet(), 'freeze_dry', { fav: '冻干' });
  assert.equal(normal.pet.stats.fullness, 60);
  assert.equal(fav.pet.stats.fullness, 64); // 10 * 1.4 = 14
});

test('投喂：讨厌的食物扣心情双倍且不涨亲密', () => {
  const r = feedPet(pet(), 'milk', { hate: '牛奶' });
  assert.equal(r.pet.stats.mood, 50 - 28);
  assert.equal(r.pet.stats.intimacy, 10);
  assert.match(r.lines[0]!, /嫌弃/);
});

test('投喂：未知食物被拒绝', () => {
  const r = feedPet(pet(), 'pizza', {});
  assert.equal(r.rejected, 'UNKNOWN_FOOD');
  assert.equal(r.pet.stats.fullness, 50);
});

test('玩耍：精力不足被拒绝，且不扣数值', () => {
  const r = playWithPet(pet({ stats: { fullness: 50, clean: 70, mood: 50, energy: 5, intimacy: 10 } }), T0);
  assert.equal(r.rejected, 'NO_ENERGY');
  assert.equal(r.pet.stats.energy, 5);
  assert.equal(r.pet.counts.play, 0);
});

test('玩耍：扣 12 精力，涨 8 心情与 4 亲密，并记 first_play', () => {
  const r = playWithPet(pet(), T0);
  assert.equal(r.pet.stats.energy, 28);
  assert.equal(r.pet.stats.mood, 58);
  assert.equal(r.pet.stats.intimacy, 14);
  assert.deepEqual(r.newMilestones, ['first_play']);
});

test('里程碑只发一次', () => {
  const first = playWithPet(pet(), T0);
  const second = playWithPet(first.pet, T0);
  assert.deepEqual(second.newMilestones, []);
});

test('清洁：+30 并清除低清洁计时，清洁 >55 时解除生病', () => {
  const p = pet({ sick: true, lowCleanSince: T0, stats: { fullness: 60, clean: 30, mood: 40, energy: 40, intimacy: 10 } });
  const r = cleanPet(p);
  assert.equal(r.pet.stats.clean, 60);
  assert.equal(r.pet.lowCleanSince, null);
  assert.equal(r.pet.sick, false);
});

test('对话：返回意图与语气档，亲密 +0.6 并记 first_talk', () => {
  const r = talkToPet(pet(), '你还记得我们第一次见面吗', CAT, {
    memory: { name: '布丁', adoptDate: '11 月 20 日', daysTogether: 7 }
  });
  assert.equal(r.intent, 'remember');
  assert.equal(r.tier, 'low');
  assert.equal(Math.round(r.pet.stats.intimacy * 10) / 10, 10.6);
  assert.deepEqual(r.newMilestones, ['first_talk']);
  assert.ok(r.lines[0]!.length > 0);

  // 高亲密档才会引用具体日期（记忆槽位只出现在 mid/high 档）
  const high = talkToPet(
    pet({ stats: { fullness: 50, clean: 70, mood: 50, energy: 40, intimacy: 80 } }),
    '你还记得我们第一次见面吗',
    CAT,
    { memory: { name: '布丁', adoptDate: '11 月 20 日', daysTogether: 7 } }
  );
  assert.equal(high.tier, 'high');
  const highPool = CAT.intents.remember!.tiers!.high!;
  assert.ok(highPool.some((l) => l.includes('{adoptDate}')), '高档语料应至少有一条引用具体日期');
  assert.ok(highPool.some((l) => l === high.lines[0] || l.replace('{adoptDate}', '11 月 20 日') === high.lines[0]),
    '返回句必须来自高档语料：' + high.lines[0]);
});

test('广告发奖：每日上限 4 次，超限返回 DAILY_CAP', () => {
  const ok = claimAdReward(pet(), { dayKey: '2026-11-17', rewarded: 3 }, '2026-11-17');
  assert.equal(ok.granted, true);
  assert.equal(ok.pet.stats.energy, 70);

  const capped = claimAdReward(pet(), { dayKey: '2026-11-17', rewarded: 4 }, '2026-11-17');
  assert.equal(capped.granted, false);
  assert.equal(capped.reason, 'DAILY_CAP');

  const newDay = claimAdReward(pet(), { dayKey: '2026-11-16', rewarded: 4 }, '2026-11-17');
  assert.equal(newDay.granted, true, '跨天应重置次数');
});