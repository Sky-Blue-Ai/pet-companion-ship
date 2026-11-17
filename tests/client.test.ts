import test from 'node:test';
import assert from 'node:assert/strict';

import { CloudApi } from '../client-src/core/CloudApi.ts';
import { predict, adjustClock } from '../client-src/pet/StatePredictor.ts';
import { RewardLedger } from '../client-src/ad/RewardLedger.ts';
import { Telemetry } from '../client-src/telemetry/Telemetry.ts';
import type { PetState } from '../shared/types.ts';

const T0 = Date.parse('2026-11-17T10:00:00+08:00');

function pet(): PetState {
  return {
    species: 'cat_orange', name: '布丁', adoptAt: T0, lastSettleAt: T0,
    stats: { fullness: 80, clean: 80, mood: 60, energy: 50, intimacy: 10 },
    sick: false, lowCleanSince: null, lowFullnessSince: null,
    milestones: [], counts: { feed: 0, play: 0, talk: 0 }, lastPlayAt: null
  };
}

test('CloudApi：成功透传 data', async () => {
  const api = new CloudApi({ call: async () => ({ ok: true, data: { hello: 1 } }) });
  const r = await api.invoke<{ hello: number }>('x');
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.data.hello, 1);
});

test('CloudApi：服务端 ok:false 直接归一为错误，不重试', async () => {
  let calls = 0;
  const api = new CloudApi({ retries: 2, call: async () => { calls++; return { ok: false, error: { code: 'NO_PET', message: '还没有领养宠物' } }; } });
  const r = await api.invoke('getPet');
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.error.code, 'NO_PET');
  assert.equal(calls, 1);
});

test('CloudApi：超时会重试一次后返回 TIMEOUT', async () => {
  let calls = 0;
  const api = new CloudApi({
    timeoutMs: 20, retries: 1,
    call: () => { calls++; return new Promise((res) => setTimeout(() => res({ ok: true }), 200)); }
  });
  const r = await api.invoke('slow');
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.error.code, 'TIMEOUT');
  assert.equal(calls, 2);
});

test('StatePredictor：显示值按真实经过时间推进，但不改写快照', () => {
  const snap = pet();
  const v = predict(snap, T0 + 3 * 3_600_000);
  assert.equal(Math.round(v.stats.fullness), 56);
  assert.equal(snap.stats.fullness, 80, '快照不得被改写');
  assert.equal(v.hoursSinceSettle, 3);
});

test('StatePredictor：时钟偏差 > 5 分钟时信任服务端', () => {
  assert.equal(adjustClock(1000, 1000 + 60_000).trustServer, false);
  assert.equal(adjustClock(1000, 1000 + 10 * 60_000).trustServer, true);
});

test('RewardLedger：同一 nonce 不能提交两次', () => {
  const l = new RewardLedger();
  const n = l.issue('energy', T0);
  assert.equal(l.markSent(n), true);
  assert.equal(l.markSent(n), false);
  assert.equal(l.has(n), true);
  l.rollback(n);
  assert.equal(l.markSent(n), true, '回滚后允许重试');
});

test('Telemetry：攒够 maxSize 立即上报，失败保留并限量', async () => {
  let sent: number[] = [];
  let ok = false;
  const t = new Telemetry(async (evts) => { sent.push(evts.length); return ok; }, { maxSize: 3 });
  t.track('app_open'); t.track('home_ready'); t.track('act');
  await new Promise((r) => setTimeout(r, 10));
  assert.deepEqual(sent, [3], '满 3 条立即上报');
  assert.equal(t.size(), 3, '失败时保留');

  ok = true;
  await t.flush();
  assert.equal(t.size(), 0, '成功后清空');
});