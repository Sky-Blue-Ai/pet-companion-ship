/**
 * 结算引擎单元测试（12 例）
 * 运行：npm test
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { settle, decayWeights, stageFor, localHour, dayKey, moodTarget } from '../shared/formulas.ts';
import { STAT_CFG, HOUR_MS, DAY_MS } from '../shared/constants.ts';
import type { PetState } from '../shared/types.ts';

const TZ = 480; // 东八区

/** 固定基准时间：2026-11-17 10:00 (+08:00) */
const T0 = Date.parse('2026-11-17T10:00:00+08:00');
const at = (iso: string) => Date.parse(iso);

function makePet(overrides: Partial<PetState> = {}): PetState {
  return {
    species: 'cat_orange',
    name: '布丁',
    adoptAt: T0,
    lastSettleAt: T0,
    stats: { fullness: 80, clean: 80, mood: 60, energy: 50, intimacy: 10 },
    sick: false,
    lowCleanSince: null,
    lowFullnessSince: null,
    milestones: [],
    counts: { feed: 0, play: 0, talk: 0 },
    lastPlayAt: null,
    ...overrides
  };
}

const round = (n: number) => Math.round(n * 1000) / 1000;

test('01 三小时白天结算：饱食 -24、清洁 -9、精力 +18', () => {
  const r = settle({ pet: makePet(), now: T0 + 3 * HOUR_MS, tzOffsetMin: TZ });
  assert.equal(round(r.pet.stats.fullness), 56);
  assert.equal(round(r.pet.stats.clean), 71);
  assert.equal(round(r.pet.stats.energy), 68);
  assert.equal(r.effectiveHours, 3);
});

test('02 跨零点：精力重置为 100，且夜间衰减减半', () => {
  // 23:00 → 01:00 共 2 小时，其中 1 小时白天（23 时）、1 小时夜间（0 时）
  const start = at('2026-11-17T23:00:00+08:00');
  const pet = makePet({ lastSettleAt: start, stats: { fullness: 80, clean: 80, mood: 60, energy: 20, intimacy: 10 } });
  const r = settle({ pet, now: start + 2 * HOUR_MS, tzOffsetMin: TZ });

  assert.equal(r.crossedMidnight, true);
  assert.equal(round(r.pet.stats.energy), 100, '跨零点应重置为 100');
  // 加权：1h 白天 + 1h 夜间×0.5 = 1.5h → 饱食 -12
  assert.equal(round(r.pet.stats.fullness), 68);
  assert.equal(round(r.pet.stats.clean), round(80 - 3 * 1.5));
});

test('03 昼夜权重切分正确（22:00→02:00 = 2 天 + 2 夜）', () => {
  const from = at('2026-11-17T22:00:00+08:00');
  const to = at('2026-11-18T02:00:00+08:00');
  const w = decayWeights(from, to, TZ);
  assert.equal(round(w.dayHours), 2);
  assert.equal(round(w.nightHours), 2);
});

test('04 长时间不登录：封顶 72 小时，不会把数值算成负数', () => {
  const r = settle({ pet: makePet(), now: T0 + 200 * HOUR_MS, tzOffsetMin: TZ });
  assert.equal(r.hours, 200);
  assert.equal(r.effectiveHours, STAT_CFG.maxSettleHours);
  assert.equal(r.pet.stats.fullness, 0);
  assert.equal(r.pet.stats.clean, 0);
  assert.ok(r.pet.stats.mood >= 0 && r.pet.stats.mood <= 100);
});

test('05 100 小时与 72 小时结算结果一致（封顶幂等）', () => {
  const a = settle({ pet: makePet(), now: T0 + 72 * HOUR_MS, tzOffsetMin: TZ });
  const b = settle({ pet: makePet(), now: T0 + 100 * HOUR_MS, tzOffsetMin: TZ });
  assert.equal(round(a.pet.stats.fullness), round(b.pet.stats.fullness));
  assert.equal(round(a.pet.stats.clean), round(b.pet.stats.clean));
  assert.equal(round(a.pet.stats.mood), round(b.pet.stats.mood));
});

test('06 心情向目标值逼近，且不越界', () => {
  const pet = makePet({ stats: { fullness: 100, clean: 100, mood: 0, energy: 50, intimacy: 0 }, lastPlayAt: T0 });
  const one = settle({ pet, now: T0 + 6 * HOUR_MS, tzOffsetMin: TZ });
  assert.ok(one.pet.stats.mood > 0, '应向上逼近');
  assert.ok(one.pet.stats.mood <= 100);

  const many = settle({ pet: makePet({ stats: { fullness: 100, clean: 100, mood: 100, energy: 50, intimacy: 0 } }), now: T0 + 72 * HOUR_MS, tzOffsetMin: TZ });
  assert.ok(many.pet.stats.mood >= 0 && many.pet.stats.mood <= 100);
});

test('07 清洁度低于 20 持续 24 小时 → 生病', () => {
  const pet = makePet({
    stats: { fullness: 80, clean: 10, mood: 50, energy: 50, intimacy: 10 },
    lowCleanSince: T0 - 23 * HOUR_MS
  });
  const r = settle({ pet, now: T0 + 2 * HOUR_MS, tzOffsetMin: TZ });
  assert.equal(r.pet.sick, true);
  assert.equal(r.becameSick, true);
});

test('08 清洁度回不到阈值 → 不生病（未满 24 小时）', () => {
  const pet = makePet({
    stats: { fullness: 80, clean: 10, mood: 50, energy: 50, intimacy: 10 },
    lowCleanSince: T0 - 5 * HOUR_MS
  });
  const r = settle({ pet, now: T0 + 2 * HOUR_MS, tzOffsetMin: TZ });
  assert.equal(r.pet.sick, false);
  assert.equal(r.becameSick, false);
});

test('09 生病后清洁与饱食回到安全线 → 恢复', () => {
  const pet = makePet({
    sick: true,
    stats: { fullness: 90, clean: 90, mood: 50, energy: 50, intimacy: 10 }
  });
  const r = settle({ pet, now: T0 + 1 * HOUR_MS, tzOffsetMin: TZ });
  assert.equal(r.pet.sick, false);
  assert.equal(r.recovered, true);
});

test('10 成长阶段边界：13 天幼年 / 14 天少年 / 44 天少年 / 45 天成熟', () => {
  assert.equal(stageFor(T0, T0 + 13 * DAY_MS), 'baby');
  assert.equal(stageFor(T0, T0 + 14 * DAY_MS), 'teen');
  assert.equal(stageFor(T0, T0 + 44 * DAY_MS), 'teen');
  assert.equal(stageFor(T0, T0 + 45 * DAY_MS), 'adult');
});

test('11 亲密度不随时间衰减；同一 now 重复结算幂等', () => {
  const pet = makePet({ stats: { fullness: 60, clean: 60, mood: 50, energy: 40, intimacy: 42 } });
  const now = T0 + 8 * HOUR_MS;
  const first = settle({ pet, now, tzOffsetMin: TZ });
  const second = settle({ pet: first.pet, now, tzOffsetMin: TZ });

  assert.equal(first.pet.stats.intimacy, 42);
  assert.equal(second.hours, 0);
  assert.equal(round(second.pet.stats.fullness), round(first.pet.stats.fullness));
  assert.equal(round(second.pet.stats.mood), round(first.pet.stats.mood));
});

test('12 时钟回拨：不产生负衰减，也不改写 lastSettleAt', () => {
  const pet = makePet();
  const r = settle({ pet, now: T0 - 5 * HOUR_MS, tzOffsetMin: TZ });
  assert.equal(r.effectiveHours, 0);
  assert.equal(r.pet.stats.fullness, 80);
  assert.equal(r.pet.lastSettleAt, T0);
});

/** 附带校验：时区与日期键工具函数 */
test('99 工具函数：localHour / dayKey / moodTarget 上界', () => {
  assert.equal(localHour(at('2026-11-17T03:00:00+08:00'), TZ), 3);
  assert.notEqual(dayKey(at('2026-11-17T23:59:00+08:00'), TZ), dayKey(at('2026-11-18T00:01:00+08:00'), TZ));
  const t = moodTarget({ fullness: 100, clean: 100, mood: 0, energy: 0, intimacy: 0 }, T0, T0);
  assert.ok(t <= 100 && t > 60);
});