import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { respond, respondToEvent, tierOf, fillTemplate, matchIntent, applyPersona } from '../shared/dialogue/engine.ts';
import type { Corpus } from '../shared/dialogue/types.ts';

const CAT: Corpus = JSON.parse(readFileSync('corpus/cat_orange.json', 'utf8'));
const DOG: Corpus = JSON.parse(readFileSync('corpus/dog_shiba.json', 'utf8'));

const ctx = (intimacy: number, extra: Record<string, string | number> = {}) => ({
  memory: { name: '布丁', daysTogether: 7, favFood: '冻干', hateFood: '牛奶', adoptDate: '11 月 20 日', weather: '小雨', todayEvent: '把纸箱挖了个洞', ...extra },
  calls: '喵',
  intimacy,
  rng: () => 0
});

test('语料：20 个意图在两个品种里都齐', () => {
  const required = ['greet_home','night','pet_head','praise','scold','feed_ask','doing','name_ask','weather_ask','tired','miss','remember','program','bye','ask_food_pref','sick_comfort','play_invite','praise_body','anniversary','fallback_pet'];
  for (const c of [CAT, DOG]) {
    for (const id of required) assert.ok(c.intents[id], `${c.species} 缺 ${id}`);
  }
});

test('语气档：亲密度 <20 陌生 / <60 熟 / >=60 亲', () => {
  assert.equal(tierOf(0), 'low');
  assert.equal(tierOf(19.9), 'low');
  assert.equal(tierOf(20), 'mid');
  assert.equal(tierOf(59.9), 'mid');
  assert.equal(tierOf(60), 'high');
});

test('意图匹配：命中关键词，取最长关键词优先', () => {
  assert.equal(matchIntent(CAT, '我回来了'), 'greet_home');
  assert.equal(matchIntent(CAT, '你还记得我们第一次见面吗'), 'remember');
  assert.equal(matchIntent(CAT, '今天好累'), 'tired');
  assert.equal(matchIntent(CAT, '你只是程序吧'), 'program');
});

test('未命中 → 走 fallback_pet，不硬答', () => {
  const r = respond(CAT, '帮我把明天的会议纪要整理一下', ctx(30));
  assert.equal(r.intent, 'fallback_pet');
  assert.ok(r.line.length > 0);
});

test('槽位缺失 → 换变体，绝不泄漏 {name}', () => {
  // name 缺失时，含 {name} 的句子必须被过滤掉
  const r = respond(CAT, '我回来了', { memory: {}, calls: '喵', intimacy: 90, rng: () => 0 });
  assert.ok(!r.line.includes('{'), '不得出现未填充槽位：' + r.line);
});

test('fillTemplate：缺值返回 null，非法槽位返回 null', () => {
  assert.equal(fillTemplate('{name}你好', { memory: {}, intimacy: 0 }), null);
  assert.equal(fillTemplate('{unknown}你好', { memory: { unknown: 'x' }, intimacy: 0 }), null);
  assert.equal(fillTemplate('{name}你好', { memory: { name: '布丁' }, intimacy: 0 }), '布丁你好');
});

test('人格滤镜：柴犬短句不超过 22 字', () => {
  const long = '我今天在门口等了你一整天从早上等到现在都没有动过地方你终于回来了';
  const out = applyPersona(long, DOG);
  assert.ok(out.length <= 22, `柴犬台词超长：${out.length}`);
  assert.ok(out.length > 0);
});

test('20 个意图兜底命中率 ≥ 90%（每意图 3 句样输入）', () => {
  const samples: Record<string, string[]> = {
    greet_home: ['我回来了', '回来了', '哈喽'],
    night: ['晚安', '我困了', '睡觉吧'],
    pet_head: ['摸摸头', '抱抱', '蹭蹭'],
    praise: ['真棒', '好可爱', '喜欢你'],
    scold: ['你好笨', '讨厌', '烦死了'],
    feed_ask: ['饿了吗', '吃饭了没', '饭'],
    doing: ['在干嘛', '在干什么', '忙什么'],
    name_ask: ['你叫什么', '你的名字', '你是谁'],
    weather_ask: ['今天天气', '下雨了吗', '冷不冷'],
    tired: ['今天好累', '烦', '压力好大'],
    miss: ['想你', '想我吗', '惦记你'],
    remember: ['你还记得我们第一次见面吗', '还记得吗', '记得'],
    program: ['你只是程序吧', '你是机器', '假的吧'],
    bye: ['我出门了', '上班去了', '拜拜'],
    ask_food_pref: ['你爱吃什么', '你喜欢什么', '最爱哪个'],
    sick_comfort: ['你生病了吗', '不舒服吗', '吃药'],
    play_invite: ['要玩吗', '来玩', '一起玩'],
    praise_body: ['毛好软', '肚子好胖', '你好香'],
    anniversary: ['纪念日到了', '多少天了', '多久了']
  };
  let hit = 0, total = 0;
  for (const [intent, arr] of Object.entries(samples)) {
    for (const s of arr) {
      total++;
      if (matchIntent(CAT, s) === intent) hit++;
    }
  }
  const rate = hit / total;
  assert.ok(rate >= 0.9, `命中率 ${(rate * 100).toFixed(1)}% < 90%`);
});

test('事件驱动：重逢与里程碑也能出话术', () => {
  const r = respondToEvent(CAT, 'greet_home', ctx(70));
  assert.ok(r.line.length > 0);
  const miss = respondToEvent(DOG, 'miss', ctx(70));
  assert.ok(miss.line.length > 0 && miss.line.length <= 22);
});