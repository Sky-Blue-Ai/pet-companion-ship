import { settle } from '../../../shared/formulas.ts';
import type { Adapters } from '../../adapters/index.ts';

/** 读宠物：内部先结算，保证「只读也推进」 */
export async function getPet(openid: string, deps: Adapters) {
  const pet = await deps.loadPet(openid);
  if (!pet) return { ok: false as const, error: { code: 'NO_PET' as const, message: '还没有领养宠物' } };
  const now = deps.now();
  const r = settle({ pet, now, tzOffsetMin: await deps.tzOffset(openid) });
  if (r.effectiveHours > 0) await deps.savePet(openid, r.pet);
  return {
    ok: true as const,
    data: {
      pet: r.pet,
      view: { stageDays: Math.floor((now - r.pet.adoptAt) / 86_400_000), sick: r.pet.sick, gapDays: r.gapDays }
    }
  };
}