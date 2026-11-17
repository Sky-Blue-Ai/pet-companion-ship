/**
 * 端到端串联测试：用内存适配器把 W2 的 8 个云函数跑一遍
 * 目的是证明「适配器接口 + 业务核心」这份契约真的能跑通，而不只是单测好看。
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import type { Adapters, AdState, Settings } from '../server/adapters/index.ts';
import type { PetState } from '../shared/types.ts';
import { act } from '../server/functions/act/index.ts';
import { talk } from '../server/functions/talk/index.ts';
import { claimAdRewardFn } from '../server/functions/claimAdReward/index.ts';
import { getPet } from '../server/functions/getPet/index.ts';
import { getGrowth } from '../server/functions/getGrowth/index.ts';
import { saveSettings } from '../server/functions/saveSettings/index.ts';
import { reportMetrics } from '../server/functions/reportMetrics/index.ts';

const T0 = Date.parse('2026-11-17T10:00:00+08:00');

function memoryAdapters(): Adapters & { clock: { now: number }; pets: Map<string, PetState> } {
  const pets = new Map<string, PetState>();
  const ads = new Map<string, AdState>();
  const settings = new Map<string, Settings>();
  const events: Array<{ type: string; key: string; at: number }> = [];
  const metrics: unknown[] = [];
  const clock = { now: T0 };

  const pet: PetState = {
    species: 'cat_orange', name: '布丁', adoptAt: T0, lastSettleAt: T0,
    stats: { fullness: 50, clean: 70, mood: 50, energy: 40, intimacy: 10 },
    sick: false, lowCleanSince: null, lowFullnessSince: null,
    milestones: [], counts: { feed: 0, play: 0, talk: 0 }, lastPlayAt: null
  };

  return {
    clock,
    pets,
    now: () => clock.now,
    loadPet: async (o) => pets.get(o) ?? null,
    savePet: async (o, p) => { pets.set(o, p); },
    getAdState: async (o) => ads.get(o) ?? { dayKey: '', rewarded: 0, impression: 0 },
    saveAdState: async (o, s) => { ads.set(o, s); },
    getSettings: async (o) => settings.get(o) ?? { notify: true, quiet: true, quietStart: '22:30', quietEnd: '08:00', locateAllowed: true },
    saveSettings: async (o, s) => { settings.set(o, s); },
    appendEvent: async (_o, e) => { events.push({ type: e.type, key: e.key, at: e.at }); },
    listEvents: async (_o, limit) => events.slice(-limit),
    metrics: async () => { metrics.push(1); },
    tzOffset: async () => 480,
    _seed: () => pets.set('u1', { ...pet, stats: { ...pet.stats }, milestones: [], counts: { ...pet.counts } })
  } as Adapters & { clock: { now: number }; pets: Map<string, PetState> } & { _seed: () => void };
}

test('端到端：领养→投喂→玩耍→对话→广告→档案→设置→埋点', async () => {
  const deps = memoryAdapters() as ReturnType<typeof memoryAdapters> & { _seed: () => void };
  deps._seed();

  // 1) 读宠物：内部结算，3 小时后饱食下降
  deps.clock.now = T0 + 3 * 3_600_000;
  const got = await getPet('u1', deps);
  assert.equal(got.ok, true);
  if (got.ok) assert.equal(Math.round(got.data.pet.stats.fullness), 26); // 50 - 24

  // 2) 投喂冻干
  const fed = await act('u1', { action: 'feed', itemId: 'freeze_dry' }, deps);
  assert.equal(fed.ok, true);
  if (fed.ok) {
    assert.ok(fed.data.pet.stats.fullness > 26);
    assert.deepEqual(fed.data.newMilestones, ['first_feed']);
  }

  // 3) 玩耍
  const played = await act('u1', { action: 'play' }, deps);
  assert.equal(played.ok, true);
  if (played.ok) assert.equal(played.data.pet.counts.play, 1);

  // 4) 对话：命中意图并返回语气档
  const said = await talk('u1', { text: '晚安' }, deps);
  assert.equal(said.ok, true);
  if (said.ok) {
    assert.equal(said.data.intent, 'night');
    assert.ok(said.data.lines[0]!.length > 0);
  }

  // 5) 广告：一天 5 次只发 4 次
  const results: boolean[] = [];
  for (let i = 0; i < 5; i++) {
    const r = await claimAdRewardFn('u1', { slot: 'energy', nonce: 'n' + i }, deps);
    assert.equal(r.ok, true);
    if (r.ok) results.push(r.data.granted);
  }
  assert.deepEqual(results, [true, true, true, true, false], '第 5 次应被日限拦下');

  // 6) 成长档案
  const growth = await getGrowth('u1', deps);
  assert.equal(growth.ok, true);
  if (growth.ok) assert.ok(growth.data.milestones.includes('first_feed'));

  // 7) 设置
  const saved = await saveSettings('u1', { settings: { notify: false, quiet: true, quietStart: '23:00', quietEnd: '07:00', locateAllowed: false } }, deps);
  assert.equal(saved.ok, true);
  if (saved.ok) assert.equal(saved.data.settings.notify, false);

  // 8) 埋点：超过 50 条只收 50
  const many = Array.from({ length: 60 }, (_, i) => ({ name: 'evt', at: T0 + i }));
  const rep = await reportMetrics('u1', { events: many }, deps);
  assert.equal(rep.ok, true);
  if (rep.ok) assert.equal(rep.data.accepted, 50);
});