/**
 * 客户端状态预测：只用于「显示」，绝不写回服务端
 * 用的是 shared/formulas 的同一套公式，所以显示值与服务端结算值的偏差只来自网络时延
 */
import { settle } from '../../shared/formulas.ts';
import type { PetState } from '../../shared/types.ts';

export interface PredictedView {
  stats: PetState['stats'];
  hoursSinceSettle: number;
  stageDays: number;
}

export function predict(
  snapshot: PetState,
  nowClient: number,
  tzOffsetMin = 480
): PredictedView {
  const { pet } = settle({ pet: snapshot, now: nowClient, tzOffsetMin });
  return {
    stats: pet.stats,
    hoursSinceSettle: Math.max(0, (nowClient - snapshot.lastSettleAt) / 3_600_000),
    stageDays: Math.floor((nowClient - snapshot.adoptAt) / 86_400_000)
  };
}

/** 客户端时钟与服务端偏差 > 5 分钟时，静默校正为服务端时间（不提示、不阻断） */
export function adjustClock(serverNow: number, clientNow: number): { offsetMs: number; trustServer: boolean } {
  const offsetMs = serverNow - clientNow;
  return { offsetMs, trustServer: Math.abs(offsetMs) > 5 * 60_000 };
}