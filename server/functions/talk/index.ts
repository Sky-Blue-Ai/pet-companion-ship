import { settle } from '../../../shared/formulas.ts';
import { talkToPet } from '../../core/actions.ts';
import { loadCorpus } from '../../core/corpus.ts';
import type { Adapters } from '../../adapters/index.ts';

/** 对话：服务端权威，客户端不可直连语料外部 */
export async function talk(openid: string, input: { text: string }, deps: Adapters) {
  const pet = await deps.loadPet(openid);
  if (!pet) return { ok: false as const, error: { code: 'NO_PET' as const, message: '还没有领养宠物' } };

  const now = deps.now();
  const settled = settle({ pet, now, tzOffsetMin: await deps.tzOffset(openid) }).pet;
  const corpus = loadCorpus(settled.species);

  const memory = {
    name: settled.name,
    daysTogether: Math.floor((now - settled.adoptAt) / 86_400_000),
    favFood: '冻干',
    hateFood: '牛奶',
    adoptDate: new Date(settled.adoptAt + 480 * 60_000).toISOString().slice(5, 10).replace('-', ' 月 ') + ' 日',
    weather: '小雨',
    todayEvent: '把纸箱挖了个洞'
  };

  const r = talkToPet(settled, input.text, corpus, { memory });
  await deps.savePet(openid, r.pet);
  for (const m of r.newMilestones) await deps.appendEvent(openid, { type: 'milestone', key: m, at: now });

  return { ok: true as const, data: { lines: r.lines, intent: r.intent, tier: r.tier, voiceIds: [] as string[] } };
}