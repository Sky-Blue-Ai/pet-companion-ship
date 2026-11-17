import { settle } from '../../../shared/formulas.ts';
import { feedPet, playWithPet, cleanPet } from '../../core/actions.ts';
import type { Adapters } from '../../adapters/index.ts';

export type ActInput = { action: 'feed' | 'clean' | 'play' | 'touch'; itemId?: string };

/** 所有交互的写入口：先结算，再执行动作，最后落库 */
export async function act(openid: string, input: ActInput, deps: Adapters) {
  const pet = await deps.loadPet(openid);
  if (!pet) return { ok: false as const, error: { code: 'NO_PET' as const, message: '还没有领养宠物' } };

  const now = deps.now();
  const settled = settle({ pet, now, tzOffsetMin: await deps.tzOffset(openid) }).pet;

  let outcome;
  if (input.action === 'feed') {
    const prefs = (settled as unknown as { prefs?: { fav?: string; hate?: string } }).prefs ?? {};
    outcome = feedPet(settled, input.itemId ?? '', prefs);
  } else if (input.action === 'play') {
    outcome = playWithPet(settled, now);
  } else {
    outcome = cleanPet(settled);
  }

  await deps.savePet(openid, outcome.pet);
  for (const m of outcome.newMilestones) {
    await deps.appendEvent(openid, { type: 'milestone', key: m, at: now });
  }
  return {
    ok: true as const,
    data: { pet: outcome.pet, delta: outcome.delta, lines: outcome.lines, newMilestones: outcome.newMilestones, rejected: outcome.rejected }
  };
}