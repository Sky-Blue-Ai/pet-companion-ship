/**
 * 语音索引生成（W7）
 *
 * 从语料里抽取所有句子 → voiceId = sha1(text) 前 12 位 → 输出索引表与缺失清单。
 * 真正的 TTS 合成由外部命令完成（保持供应商可替换），本工具只负责「契约」。
 *
 * 用法：
 *   node --experimental-strip-types tools/build-voice.ts            # 生成索引（dry-run）
 *   node --experimental-strip-types tools/build-voice.ts --write    # 写入 voice/index.json
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

interface CorpusIntent { tiers?: Record<string, string[]> }
interface Corpus { species: string; intents: Record<string, CorpusIntent> }

const FILES = ['corpus/cat_orange.json', 'corpus/dog_shiba.json'];
const OUT = 'voice/index.json';

const sha = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 12);

function linesOf(c: Corpus): string[] {
  const out = new Set<string>();
  for (const intent of Object.values(c.intents)) {
    for (const arr of Object.values(intent.tiers ?? {})) {
      for (const t of arr) out.add(t);
    }
  }
  return [...out];
}

const index: Record<string, { species: string; text: string; file: string; status: 'pending' | 'ready' }> = {};
const stats: { species: string; lines: number; unique: number }[] = [];

for (const f of FILES) {
  if (!existsSync(f)) { console.error('缺少语料：' + f); process.exit(2); }
  const c = JSON.parse(readFileSync(f, 'utf8')) as Corpus;
  const lines = linesOf(c);
  for (const text of lines) {
    const id = sha(text);
    if (!index[id]) {
      index[id] = { species: c.species, text, file: `voice/${c.species}/${id}.mp3`, status: 'pending' };
    }
  }
  stats.push({ species: c.species, lines: lines.length, unique: lines.length });
}

const total = Object.keys(index).length;
console.log('语音条目（去重后）：' + total);
for (const s of stats) console.log(`  ${s.species}: ${s.lines} 条`);
console.log('提示：含槽位的句子（如 {name}）需要「槽位替换后」再合成，或在运行时拼接。');

if (process.argv.includes('--write')) {
  mkdirSync('voice', { recursive: true });
  writeFileSync(OUT, JSON.stringify({ generatedAt: Date.now(), total, index }, null, 1));
  console.log('已写入 ' + OUT);
} else {
  console.log('（dry-run，未写文件；加 --write 写入）');
}