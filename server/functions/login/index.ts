import type { Adapters } from '../../adapters/index.ts';

/** 登录：首次建档 + 时区校准（幂等） */
export async function login(
  openid: string,
  payload: { tzOffset?: number },
  deps: Adapters
): Promise<{ ok: true; data: { pet: unknown; isNew: boolean } }> {
  const pet = await deps.loadPet(openid);
  // 首次登录建档在 cloudbase 适配器里完成（accounts 集合）；这里只回现状
  return { ok: true, data: { pet, isNew: !pet } };
}