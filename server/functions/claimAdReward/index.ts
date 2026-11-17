import { claimAdReward } from '../../core/actions.ts';
import type { Adapters } from '../../adapters/index.ts';

const dayKey = (ts: number) => new Date(ts + 480 * 60_000).toISOString().slice(0, 10);

/** 广告发奖：以服务端次数与 nonce 为准 */
export async function claimAdRewardFn(
  openid: string,
  input: { slot: string; nonce: string },
  deps: Adapters
) {
  const pet = await deps.loadPet(openid);
  if (!pet) return { ok: false as const, error: { code: 'NO_PET' as const, message: '还没有领养宠物' } };

  const now = deps.now();
  const today = dayKey(now);
  const adState = await deps.getAdState(openid);
  const r = claimAdReward(pet, adState, today);

  if (r.granted) {
    await deps.savePet(openid, r.pet);
    await deps.saveAdState(openid, { ...adState, dayKey: today, rewarded: (adState.dayKey === today ? adState.rewarded : 0) + 1 });
    await deps.appendEvent(openid, { type: 'ad', key: input.slot, at: now, payload: { nonce: input.nonce } });
  }
  return { ok: true as const, data: { granted: r.granted, pet: r.pet, reason: r.reason } };
}