/**
 * 交互动作核心（纯函数）
 *
 * 约定：每个动作接收「已结算过的 pet + 时间 + 输入」，返回新的 pet 与反馈文案。
 * 结算（settle）由调用方在动作之前完成，动作本身不再推进时间，避免双重衰减。
 */
import { respond } from '../../shared/dialogue/engine.ts';
import type { Corpus } from '../../shared/dialogue/types.ts';
import type { PetState } from '../../shared/types.ts';

export interface FoodItem {
  id: string;
  name: string;
  fullness: number;
  mood: number;
}

/** 首版 8 种食物（与需求文档一致） */
export const FOODS: FoodItem[] = [
  { id: 'kibble', name: '干粮', fullness: 4, mood: 0 },
  { id: 'can', name: '罐头', fullness: 12, mood: 6 },
  { id: 'stick', name: '猫条', fullness: 8, mood: 10 },
  { id: 'freeze_dry', name: '冻干', fullness: 10, mood: 14 },
  { id: 'chicken', name: '鸡肉', fullness: 9, mood: 8 },
  { id: 'fish', name: '小鱼干', fullness: 7, mood: 9 },
  { id: 'milk', name: '牛奶', fullness: 5, mood: -14 },
  { id: 'carrot', name: '胡萝卜', fullness: 3, mood: -6 }
];

/** 里程碑表（条件驱动，不写死在流程里） */
export const MILESTONES = [
  { id: 'first_feed', label: '第一次投喂' },
  { id: 'first_play', label: '第一次玩耍' },
  { id: 'first_talk', label: '第一次说话' },
  { id: 'first_teach', label: '第一次握手' },
  { id: 'sick_first', label: '第一次生病' }
] as const;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function grant(pet: PetState, id: string): boolean {
  if (pet.milestones.includes(id)) return false;
  pet.milestones.push(id);
  return true;
}

export interface ActionOutcome {
  pet: PetState;
  delta: { fullness?: number; mood?: number; energy?: number; intimacy?: number };
  lines: string[];
  newMilestones: string[];
  rejected?: 'NO_ENERGY' | 'UNKNOWN_FOOD';
}

const clone = (p: PetState): PetState => ({
  ...p,
  stats: { ...p.stats },
  milestones: [...p.milestones],
  counts: { ...p.counts }
});

/** 投喂：偏爱加成 1.4；讨厌扣心情（双倍）且不涨亲密 */
export function feedPet(
  pet: PetState,
  foodId: string,
  prefs: { fav?: string; hate?: string }
): ActionOutcome {
  const pet2 = clone(pet);
  const food = FOODS.find((f) => f.id === foodId);
  if (!food) {
    return { pet: pet2, delta: {}, lines: [], newMilestones: [], rejected: 'UNKNOWN_FOOD' };
  }
  const isFav = prefs.fav === food.name;
  const isHate = prefs.hate === food.name;

  const dFull = food.fullness * (isFav ? 1.4 : 1);
  const dMood = food.mood * (isHate ? 2 : 1);

  const before = { ...pet2.stats };
  pet2.stats.fullness = clamp(pet2.stats.fullness + dFull, 0, 100);
  pet2.stats.mood = clamp(pet2.stats.mood + dMood, 0, 100);
  if (!isHate) pet2.stats.intimacy = clamp(pet2.stats.intimacy + 1.2, 0, 100);
  pet2.counts.feed += 1;

  const newMilestones: string[] = [];
  if (grant(pet2, 'first_feed')) newMilestones.push('first_feed');

  const lines = [
    isHate
      ? `（闻了闻${food.name}，一脸嫌弃地走开）`
      : isFav
        ? `（一口气吃完${food.name}，还舔了舔盘子）`
        : `（把${food.name}吃完了）`
  ];

  return {
    pet: pet2,
    delta: {
      fullness: pet2.stats.fullness - before.fullness,
      mood: pet2.stats.mood - before.mood,
      intimacy: isHate ? 0 : 1.2
    },
    lines,
    newMilestones
  };
}

/** 玩耍：消耗精力 12，涨心情 8 与亲密 4；精力不足直接拒绝 */
export function playWithPet(pet: PetState, now: number): ActionOutcome {
  const pet2 = clone(pet);
  if (pet2.stats.energy < 12) {
    return {
      pet: pet2,
      delta: {},
      lines: ['（打了个哈欠，趴下去了）'],
      newMilestones: [],
      rejected: 'NO_ENERGY'
    };
  }
  const before = { ...pet2.stats };
  pet2.stats.energy = clamp(pet2.stats.energy - 12, 0, 100);
  pet2.stats.mood = clamp(pet2.stats.mood + 8, 0, 100);
  pet2.stats.intimacy = clamp(pet2.stats.intimacy + 4, 0, 100);
  pet2.counts.play += 1;
  pet2.lastPlayAt = now;

  const newMilestones: string[] = [];
  if (grant(pet2, 'first_play')) newMilestones.push('first_play');

  return {
    pet: pet2,
    delta: {
      energy: -12,
      mood: pet2.stats.mood - before.mood,
      intimacy: 4
    },
    lines: ['（追着逗猫棒跑了三个来回，尾巴翘得很高）'],
    newMilestones
  };
}

/** 清洁：一次 +30；清洁回到 55 以上清除「低清洁」计时 */
export function cleanPet(pet: PetState): ActionOutcome {
  const pet2 = clone(pet);
  pet2.stats.clean = clamp(pet2.stats.clean + 30, 0, 100);
  pet2.stats.mood = clamp(pet2.stats.mood + 3, 0, 100);
  if (pet2.stats.clean > 55) {
    pet2.lowCleanSince = null;
    if (pet2.stats.fullness > 30) pet2.sick = false;
  }
  return {
    pet: pet2,
    delta: { mood: 3 },
    lines: ['（被擦干净了，毛蓬松了一圈）'],
    newMilestones: []
  };
}

/** 对话：调语料引擎，涨 0.6 亲密并记一次对话 */
export function talkToPet(
  pet: PetState,
  text: string,
  corpus: Corpus,
  ctx: { memory: Record<string, string | number | null | undefined>; usedLines?: Set<string>; rng?: () => number }
): ActionOutcome & { intent: string; tier: string; tierKey?: string } {
  const pet2 = clone(pet);
  const res = respond(corpus, text, {
    memory: ctx.memory,
    calls: corpus.persona?.calls,
    intimacy: pet2.stats.intimacy,
    usedLines: ctx.usedLines,
    rng: ctx.rng
  });
  pet2.stats.intimacy = clamp(pet2.stats.intimacy + 0.6, 0, 100);
  pet2.counts.talk += 1;

  const newMilestones: string[] = [];
  if (grant(pet2, 'first_talk')) newMilestones.push('first_talk');

  return {
    pet: pet2,
    delta: { intimacy: 0.6 },
    lines: [res.line],
    newMilestones,
    intent: res.intent,
    tier: res.tier,
    tierKey: res.tierKey
  };
}

/** 广告发奖：每日 4 次上限，精力 +30 */
export function claimAdReward(
  pet: PetState,
  adState: { dayKey: string; rewarded: number },
  todayKey: string
): ActionOutcome & { granted: boolean; reason?: 'DAILY_CAP' } {
  const pet2 = clone(pet);
  const state = adState.dayKey === todayKey ? adState : { dayKey: todayKey, rewarded: 0 };
  if (state.rewarded >= 4) {
    return {
      pet: pet2,
      delta: {},
      lines: [],
      newMilestones: [],
      granted: false,
      reason: 'DAILY_CAP'
    };
  }
  pet2.stats.energy = clamp(pet2.stats.energy + 30, 0, 100);
  return {
    pet: pet2,
    delta: { energy: 30 },
    lines: ['（精力回来了，扑了一下空气）'],
    newMilestones: [],
    granted: true
  };
}