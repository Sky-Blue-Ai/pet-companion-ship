/**
 * 语料加载（服务端）
 * 打包时把 corpus/*.json 一并部署；本地测试直接读文件。
 */
import { readFileSync } from 'node:fs';
import type { Corpus } from '../../shared/dialogue/types.ts';

const cache = new Map<string, Corpus>();

export function loadCorpus(species: string): Corpus {
  const hit = cache.get(species);
  if (hit) return hit;
  const path = `corpus/${species}.json`;
  const c = JSON.parse(readFileSync(path, 'utf8')) as Corpus;
  cache.set(species, c);
  return c;
}
