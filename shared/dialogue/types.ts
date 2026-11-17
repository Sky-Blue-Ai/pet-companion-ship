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
}

export interface Corpus {
  species: string;
  version?: string;
  persona?: CorpusPersona;
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
  tier: Tier;
  line: string;
}