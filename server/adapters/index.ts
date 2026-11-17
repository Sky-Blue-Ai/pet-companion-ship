/**
 * 平台适配接口：云函数只依赖这个接口，不直接碰 wx-server-sdk
 * 本地测试用 memory 实现，线上用 cloudbase 实现（待补）
 */
import type { PetState } from '../../shared/types.ts';

export interface AdState { dayKey: string; rewarded: number; impression: number }
export interface Settings { notify: boolean; quiet: boolean; quietStart: string; quietEnd: string; locateAllowed: boolean }

export interface Adapters {
  now(): number;
  /** 读取宠物（不存在返回 null） */
  loadPet(openid: string): Promise<PetState | null>;
  savePet(openid: string, pet: PetState): Promise<void>;
  getAdState(openid: string): Promise<AdState>;
  saveAdState(openid: string, state: AdState): Promise<void>;
  getSettings(openid: string): Promise<Settings>;
  saveSettings(openid: string, s: Settings): Promise<void>;
  appendEvent(openid: string, e: { type: string; key: string; at: number; payload?: unknown }): Promise<void>;
  listEvents(openid: string, limit: number): Promise<Array<{ type: string; key: string; at: number }>>;
  metrics(openid: string, events: Array<{ name: string; at: number; props?: unknown }>): Promise<void>;
  /** 时区偏移（分钟） */
  tzOffset(openid: string): Promise<number>;
}
