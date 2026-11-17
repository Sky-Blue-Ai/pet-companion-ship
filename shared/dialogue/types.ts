export type Tier = 'low' | 'mid' | 'high';

export interface CorpusIntent {
  keywords?: string[];
  tiers?: Record<string, string[]>;
}

export interface CorpusPersona {
  tone?: string;
  sentenceMax?: number;
  tic?: string;
  calls?: string;
  forbidden?: string[];
  /** 亲密度档 → 语料档位（如 { low: 'gentle', mid: 'soft', high: 'vivid' }） */
  tierMap?: Record<string, string>;
}

export interface Corpus {
  species: string;
  version?: string;
  source?: string;
  persona?: CorpusPersona;
  /** 物种槽位默认值（call/purr/food/toy 等） */
  slots?: Record<string, string>;
  intents: Record<string, CorpusIntent>;
}

export interface DialogueContext {
  /** 记忆槽位（name / daysTogether / favFood / adoptDate / weather / todayEvent） */
  memory: Record<string, string | number | null | undefined>;
  /** 拟声词（喵 / 汪） */
  calls?: string;
  intimacy: number;
  mood?: number;
  /** 最近用过的句子，用于避重 */
  usedLines?: Set<string>;
  rng?: () => number;
}

export interface DialogueResult {
  intent: string;
  /** 亲密度档（low/mid/high） */
  tier: Tier;
  /** 语料里实际使用的档位（soft/vivid/gentle 或 low/mid/high） */
  tierKey?: string;
  line: string;
}