import type { Adapters } from '../../adapters/index.ts';

/** 成长档案：里程碑 + 最近事件 */
export async function getGrowth(openid: string, deps: Adapters) {
  const pet = await deps.loadPet(openid);
  if (!pet) return { ok: false as const, error: { code: 'NO_PET' as const, message: '还没有领养宠物' } };
  const events = await deps.listEvents(openid, 30);
  return {
    ok: true as const,
    data: { milestones: pet.milestones, events, counts: pet.counts, shareCardUrl: '' }
  };
}