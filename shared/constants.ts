/**
 * 结算参数 —— 唯一来源
 * 服务端（云函数）与客户端（展示预测）都必须引用这里，禁止各写一套
 */

export const HOUR_MS = 3_600_000;
export const DAY_MS = 86_400_000;

/** 东八区 */
export const DEFAULT_TZ_OFFSET_MIN = 480;

export const STAT_CFG = {
  /** 饱食度衰减：每小时 */
  fullnessDecayPerHour: 8,
  /** 清洁度衰减：每小时 */
  cleanDecayPerHour: 3,
  /** 精力恢复：每小时（封顶 100） */
  energyRecoverPerHour: 6,
  /** 心情向目标值逼近的时间常数（小时） */
  moodTauHours: 6,
  /** 单次结算封顶小时数，避免长期不登录数值崩到底 */
  maxSettleHours: 72,
  /** 夜间衰减系数（00:00–07:00 减半） */
  nightFactor: 0.5,
  nightStartHour: 0,
  nightEndHour: 7,
  /** 心情目标值的权重（合计 100） */
  moodWeights: {
    fullness: 40,
    clean: 30,
    playedRecently: 20,
    niceWeather: 10
  },
  /** 生病判定与恢复 */
  sick: {
    cleanBelow: 20,
    cleanHours: 24,
    fullnessBelow: 15,
    fullnessHours: 36,
    recoverCleanAbove: 55,
    recoverFullnessAbove: 30
  },
  /** 成长阶段天数边界：[0,14) 幼年，[14,45) 少年，[45,∞) 成熟 */
  stageDays: { teen: 14, adult: 45 }
} as const;