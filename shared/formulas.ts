/**
 * 结算引擎（唯一来源）
 *
 * 设计要点：
 * 1. 纯函数：不读系统时间、不读时区、不碰数据库，全部由参数注入 → 可单测、可重放
 * 2. 夜间衰减按「小时区间加权」积分，而不是拿结算时刻的 hour 代表整段
 * 3. 时钟回拨（now <= lastSettleAt）不产生负衰减，也不回写时间
 * 4. 生病用「低于阈值的持续时长」判定，不靠单次数值
 */
import { STAT_CFG, HOUR_MS, DAY_MS, DEFAULT_TZ_OFFSET_MIN } from './constants.ts';
import type { PetState, PetStats, SettleInput, SettleResult, Stage } from './types.ts';

export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

/** 本地小时（0–23），按注入的时区偏移计算，不依赖服务器时区 */
export function localHour(ts: number, tzOffsetMin: number = DEFAULT_TZ_OFFSET_MIN): number {
  return new Date(ts + tzOffsetMin * 60_000).getUTCHours();
}

/** 本地日期键，用于跨零点判定 */
export function dayKey(ts: number, tzOffsetMin: number = DEFAULT_TZ_OFFSET_MIN): string {
  const d = new Date(ts + tzOffsetMin * 60_000);
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

function isNight(ts: number, tzOffsetMin: number): boolean {
  const h = localHour(ts, tzOffsetMin);
  return h >= STAT_CFG.nightStartHour && h < STAT_CFG.nightEndHour;
}

/**
 * 把 [from, to) 按「本地整点」切成桶，分别累计白天小时与夜间小时
 * 这样跨夜的一段（例如 22:00 → 02:00）只让夜间那 2 小时按 0.5 衰减
 */
export function decayWeights(
  from: number,
  to: number,
  tzOffsetMin: number = DEFAULT_TZ_OFFSET_MIN
): { dayHours: number; nightHours: number } {
  let dayHours = 0;
  let nightHours = 0;
  let cursor = from;

  while (cursor < to) {
    // 下一个本地整点边界
    const offset = tzOffsetMin * 60_000;
    const nextBoundary = (Math.floor((cursor + offset) / HOUR_MS) + 1) * HOUR_MS - offset;
    const segEnd = Math.min(to, nextBoundary > cursor ? nextBoundary : cursor + HOUR_MS);
    const h = (segEnd - cursor) / HOUR_MS;
    if (h > 0) {
      if (isNight(cursor, tzOffsetMin)) nightHours += h;
      else dayHours += h;
    }
    cursor = segEnd;
  }

  return { dayHours, nightHours };
}

/** 心情目标值：由饱食、清洁、最近是否玩耍、天气共同决定 */
export function moodTarget(stats: PetStats, lastPlayAt: number | null | undefined, now: number): number {
  const w = STAT_CFG.moodWeights;
  const playedRecently = lastPlayAt != null && now - lastPlayAt <= 6 * HOUR_MS ? 1 : 0;
  const niceWeather = 1; // 天气系统接入前恒为「不错」
  return (
    w.fullness * (stats.fullness / 100) +
    w.clean * (stats.clean / 100) +
    w.playedRecently * playedRecently +
    w.niceWeather * niceWeather
  );
}

/** 成长阶段 */
export function stageFor(adoptAt: number, now: number): Stage {
  const days = Math.floor((now - adoptAt) / DAY_MS);
  if (days < STAT_CFG.stageDays.teen) return 'baby';
  if (days < STAT_CFG.stageDays.adult) return 'teen';
  return 'adult';
}

/** 距领养天数 */
export function daysSince(adoptAt: number, now: number): number {
  return Math.max(0, Math.floor((now - adoptAt) / DAY_MS));
}

const clonePet = (pet: PetState): PetState => ({
  ...pet,
  stats: { ...pet.stats },
  milestones: [...pet.milestones],
  counts: { ...pet.counts }
});

/**
 * 结算：把宠物状态推进到 now
 * 幂等：同一个 now 重复调用，结果不变（lastSettleAt 已等于 now 时 hours = 0）
 */
export function settle(input: SettleInput): SettleResult {
  const tz = input.tzOffsetMin ?? DEFAULT_TZ_OFFSET_MIN;
  const pet = clonePet(input.pet);

  const rawHours = (input.now - pet.lastSettleAt) / HOUR_MS;

  // 时钟回拨：不产生负衰减，也不改写 lastSettleAt
  if (rawHours <= 0) {
    return {
      pet,
      hours: Math.max(0, rawHours),
      effectiveHours: 0,
      crossedMidnight: false,
      becameSick: false,
      recovered: false,
      gapDays: 0
    };
  }

  const effectiveHours = Math.min(rawHours, STAT_CFG.maxSettleHours);
  const from = pet.lastSettleAt;
  const to = from + effectiveHours * HOUR_MS;
  const crossedMidnight = dayKey(from, tz) !== dayKey(to, tz);

  const { dayHours, nightHours } = decayWeights(from, to, tz);
  const weightedHours = dayHours + nightHours * STAT_CFG.nightFactor;

  // 饱食 / 清洁：按加权小时衰减
  pet.stats.fullness = clamp(
    pet.stats.fullness - STAT_CFG.fullnessDecayPerHour * weightedHours,
    0,
    100
  );
  pet.stats.clean = clamp(
    pet.stats.clean - STAT_CFG.cleanDecayPerHour * weightedHours,
    0,
    100
  );

  // 精力：跨零点重置为 100，之后按小时恢复
  const energyBase = crossedMidnight ? 100 : pet.stats.energy;
  pet.stats.energy = clamp(
    energyBase + STAT_CFG.energyRecoverPerHour * effectiveHours,
    0,
    100
  );

  // 心情：向目标值指数逼近
  const target = moodTarget(pet.stats, pet.lastPlayAt ?? null, to);
  pet.stats.mood = clamp(
    target + (pet.stats.mood - target) * Math.exp(-effectiveHours / STAT_CFG.moodTauHours),
    0,
    100
  );

  // 生病判定：低值持续时长
  const sick = STAT_CFG.sick;
  if (pet.stats.clean < sick.cleanBelow) {
    if (pet.lowCleanSince == null) pet.lowCleanSince = to;
  } else {
    pet.lowCleanSince = null;
  }
  if (pet.stats.fullness < sick.fullnessBelow) {
    if (pet.lowFullnessSince == null) pet.lowFullnessSince = to;
  } else {
    pet.lowFullnessSince = null;
  }

  const sickByClean =
    pet.lowCleanSince != null && to - pet.lowCleanSince >= sick.cleanHours * HOUR_MS;
  const sickByFullness =
    pet.lowFullnessSince != null && to - pet.lowFullnessSince >= sick.fullnessHours * HOUR_MS;

  const wasSick = pet.sick;
  if (!pet.sick && (sickByClean || sickByFullness)) pet.sick = true;

  // 恢复条件：清洁与饱食都回到安全线以上
  if (pet.sick && pet.stats.clean > sick.recoverCleanAbove && pet.stats.fullness > sick.recoverFullnessAbove) {
    pet.sick = false;
  }

  pet.lastSettleAt = to;
  pet.stats.intimacy = clamp(pet.stats.intimacy, 0, 100);

  return {
    pet,
    hours: rawHours,
    effectiveHours,
    crossedMidnight,
    becameSick: !wasSick && pet.sick,
    recovered: wasSick && !pet.sick,
    gapDays: Math.floor(effectiveHours / 24)
  };
}