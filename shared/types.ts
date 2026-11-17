/**
 * 宠物状态与结算相关的类型定义
 * 客户端与服务端共用（同一份类型，避免两边对不上）
 */

/** 五维数值，全部 0–100；亲密度为累计值，不随时间衰减 */
export interface PetStats {
  fullness: number;   // 饱食度
  clean: number;      // 清洁度
  mood: number;       // 心情
  energy: number;     // 精力（跨零点重置）
  intimacy: number;   // 亲密度（不衰减）
}

/** 服务端权威的宠物状态（云数据库 pets 集合的单条文档） */
export interface PetState {
  species: string;
  name: string;
  /** 领养时间（ms） */
  adoptAt: number;
  /** 上次结算时间（ms）—— 权威字段，客户端不可写 */
  lastSettleAt: number;
  stats: PetStats;
  sick: boolean;
  /** 低于阈值的起始时间（ms），用于生病判定；正常时为 null */
  lowCleanSince: number | null;
  lowFullnessSince: number | null;
  milestones: string[];
  counts: { feed: number; play: number; talk: number };
  /** 最近一次玩耍时间（ms），用于心情目标计算 */
  lastPlayAt?: number | null;
}

export interface SettleInput {
  pet: PetState;
  /** 结算基准时间（ms），服务端时间 */
  now: number;
  /** 用户时区偏移（分钟，东八区为 480），默认 480 */
  tzOffsetMin?: number;
}

export interface SettleResult {
  pet: PetState;
  /** 本次结算的小时数（未封顶） */
  hours: number;
  /** 实际生效的小时数（封顶 72） */
  effectiveHours: number;
  /** 是否跨零点（跨零点精力重置） */
  crossedMidnight: boolean;
  /** 本次结算是否新进入生病状态 */
  becameSick: boolean;
  /** 本次结算是否从生病恢复 */
  recovered: boolean;
  /** 距上次结算的整天数（用于重逢叙事） */
  gapDays: number;
}

export type Stage = 'baby' | 'teen' | 'adult';

export const STAGE_LABEL: Record<Stage, string> = {
  baby: '幼年期',
  teen: '少年期',
  adult: '成熟期'
};