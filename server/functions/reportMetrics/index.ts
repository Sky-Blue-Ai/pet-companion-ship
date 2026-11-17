import type { Adapters } from '../../adapters/index.ts';

export async function reportMetrics(
  openid: string,
  input: { events: Array<{ name: string; at: number; props?: unknown }> },
  deps: Adapters
) {
  const batch = (input.events ?? []).slice(0, 50);
  await deps.metrics(openid, batch);
  return { ok: true as const, data: { accepted: batch.length } };
}