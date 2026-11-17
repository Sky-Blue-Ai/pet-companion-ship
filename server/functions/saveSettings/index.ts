import type { Adapters, Settings } from '../../adapters/index.ts';

export async function saveSettings(openid: string, input: { settings: Settings }, deps: Adapters) {
  await deps.saveSettings(openid, input.settings);
  return { ok: true as const, data: { settings: input.settings } };
}