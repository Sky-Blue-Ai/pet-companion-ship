/**
 * settlePet 云函数核心的测试：验证「业务逻辑与平台适配解耦」这件事真的成立
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { settlePetCore } from '../server/functions/settlePet/index.ts';
import { HOUR_MS } from '../shared/constants.ts';
import type { PetState } from '../shared/types.ts';

const TZ = 480;
const T0 = Date.parse('2026-11-17T10:00:00+08:00');

function basePet(): PetState {
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
    lastPlayAt: null
  };
}

test('settlePetCore：没有宠物时返回 NO_PET', async () => {
  const r = await settlePetCore('openid-x', {
    loadPet: async () => null,
    savePet: async () => {},
    now: () => T0 + HOUR_MS,
    tzOffsetMin: async () => TZ
  });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.error.code, 'NO_PET');
});

test('settlePetCore：时间推进时结算并落库一次，未推进时不写库', async () => {
  let saves = 0;
  let stored = basePet();

  const deps = {
    loadPet: async () => stored,
    savePet: async (_o: string, p: PetState) => {
      saves++;
      stored = p;
    },
    now: () => T0 + 3 * HOUR_MS,
    tzOffsetMin: async () => TZ
  };

  const first = await settlePetCore('openid-x', deps);
  assert.equal(first.ok, true);
  assert.equal(saves, 1, '推进 3 小时应写库一次');
  if (first.ok) {
    assert.equal(Math.round(first.pet.stats.fullness), 56);
    assert.equal(first.view.gapDays, 0);
  }

  // 同一时刻再调一次：不应再写库
  const second = await settlePetCore('openid-x', deps);
  assert.equal(second.ok, true);
  assert.equal(saves, 1, '无时间推进时不应写库');
});