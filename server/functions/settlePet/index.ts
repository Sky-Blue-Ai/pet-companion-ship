/**
 * 云函数：settlePet —— 宠物状态结算的权威入口
 *
 * 设计：把「业务逻辑」和「平台适配」分开
 *  - settlePetCore()：纯业务，注入依赖（读写 + 时间），可在本地用假 db 单测
 *  - wxAdapter()：微信云开发适配（云数据库 collections）
 *
 * 这样以后换后端（云开发 → 自建）只换 adapter，核心不动。
 */
import { settle } from '../../../shared/formulas.ts';
import type { PetState } from '../../../shared/types.ts';

export interface SettleDeps {
  loadPet(openid: string): Promise<PetState | null>;
  savePet(openid: string, pet: PetState): Promise<void>;
  now(): number;
  tzOffsetMin(openid: string): Promise<number>;
}

export interface SettleOk {
  ok: true;
  pet: PetState;
  view: {
    stageDays: number;
    sick: boolean;
    gapDays: number;
  };
}

export interface SettleErr {
  ok: false;
  error: { code: 'NO_PET' | 'INTERNAL'; message: string };
}

/**
 * 结算核心：所有读接口（getPet / act / talk / claimAdReward）内部都要先调它
 * 保证「只读也推进」，避免用户不操作时数值僵住
 */
export async function settlePetCore(
  openid: string,
  deps: SettleDeps
): Promise<SettleOk | SettleErr> {
  try {
    const pet = await deps.loadPet(openid);
    if (!pet) {
      return { ok: false, error: { code: 'NO_PET', message: '还没有领养宠物' } };
    }

    const now = deps.now();
    const tzOffsetMin = await deps.tzOffsetMin(openid);
    const result = settle({ pet, now, tzOffsetMin });

    // 只有真的推进了时间才写库，避免无意义的写放大
    if (result.effectiveHours > 0) {
      await deps.savePet(openid, result.pet);
    }

    return {
      ok: true,
      pet: result.pet,
      view: {
        stageDays: Math.floor((now - result.pet.adoptAt) / 86_400_000),
        sick: result.pet.sick,
        gapDays: result.gapDays
      }
    };
  } catch (e) {
    return {
      ok: false,
      error: { code: 'INTERNAL', message: e instanceof Error ? e.message : 'unknown' }
    };
  }
}