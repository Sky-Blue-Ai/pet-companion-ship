/**
 * 可点 demo：用仓库里真实的引擎跑（不是另写一套逻辑）
 *  - 结算：shared/formulas.ts（与服务端同一份）
 *  - 对话：shared/dialogue/engine.ts + corpus/*.json（1200 条资料库语料）
 *  - 动作：server/core/actions.ts（投喂/玩耍/清洁/广告发奖）
 *
 * 构建：npx esbuild demo/main.ts --bundle --outfile=demo/dist/app.js --loader:.json=json
 */
import { settle, stageFor } from '../shared/formulas.ts';
import { STAGE_LABEL } from '../shared/types.ts';
import type { PetState } from '../shared/types.ts';
import { respond } from '../shared/dialogue/engine.ts';
import type { Corpus } from '../shared/dialogue/types.ts';
import { feedPet, playWithPet, cleanPet, claimAdReward, FOODS } from '../server/core/actions.ts';

import catJson from '../corpus/cat_orange.json';
import dogJson from '../corpus/dog_shiba.json';

const CORPORA: Record<string, Corpus> = {
  cat_orange: catJson as unknown as Corpus,
  dog_shiba: dogJson as unknown as Corpus
};

const KEY = 'pudding.demo.v1';
const HOUR = 3_600_000;

interface Store {
  screen: 'boot' | 'adopt' | 'home' | 'talk' | 'growth';
  overlay: null | 'feed' | 'play' | 'ad' | 'settings';
  pet: PetState;
  memory: Record<string, string | number>;
  ads: { dayKey: string; rewarded: number };
  lines: Array<{ who: 'me' | 'pet'; text: string; meta?: string }>;
  log: string[];
}

const dayKey = (ts: number) => new Date(ts + 480 * 60_000).toISOString().slice(0, 10);

function newPet(): PetState {
  const now = Date.now();
  return {
    species: 'cat_orange', name: '', adoptAt: now, lastSettleAt: now,
    stats: { fullness: 62, clean: 70, mood: 55, energy: 34, intimacy: 0 },
    sick: false, lowCleanSince: null, lowFullnessSince: null,
    milestones: [], counts: { feed: 0, play: 0, talk: 0 }, lastPlayAt: null
  };
}

function blank(): Store {
  return {
    screen: 'boot', overlay: null, pet: newPet(),
    memory: { name: '布丁', favFood: '冻干', hateFood: '牛奶', daysTogether: 0, adoptDate: '11 月 20 日' },
    ads: { dayKey: dayKey(Date.now()), rewarded: 0 }, lines: [], log: []
  };
}

let S: Store = load();
function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const s = JSON.parse(raw) as Store;
    const base = blank();
    return { ...base, ...s, pet: { ...base.pet, ...s.pet } };
  } catch { return blank(); }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }

const app = document.getElementById('app')!;
const fmt = (n: number) => Math.round(n);
const el = (html: string) => html;

function settleNow() {
  const r = settle({ pet: S.pet, now: Date.now(), tzOffsetMin: 480 });
  S.pet = r.pet;
  save();
  return r;
}

/* ---------------- 渲染 ---------------- */
function render() {
  settleNow();
  const body =
    S.screen === 'boot' ? bootView() :
    S.screen === 'adopt' ? adoptView() :
    S.screen === 'talk' ? talkView() :
    S.screen === 'growth' ? growthView() :
    homeView();

  app.innerHTML = statusBar() + `<div class="screen">${body}</div>` +
    (S.overlay ? overlayView() : '') +
    `<div class="toast" id="toast"></div>`;
  if (S.screen === 'talk') scrollTalk();
}

const statusBar = () => `<div class="st"><span>9:41</span><span class="r"><span>5G</span><span class="batt"><i></i></span></span></div>`;

function bootView() {
  return `
  <div class="flex" style="justify-content:center;padding-top:26px"><div class="badge"><i></i>${S.pet.name || '它'} · 在门口等你</div></div>
  <div class="boot-main">
    <div class="avatar breathe" style="width:180px;height:180px">${petSvg(128)}</div>
    <div style="height:34px"></div>
    <div class="title" style="text-align:center">它听见你推门了</div>
    <div class="sub" style="text-align:center;margin-top:10px;max-width:250px">
      ${S.pet.name ? '它一直在门口。' : '先选一只，它会等你回家。'}</div>
    <div style="height:26px"></div>
    <button class="btn dark" style="width:236px" data-go="${S.pet.name ? 'home' : 'adopt'}">
      ${S.pet.name ? '推门进去' : '开始领养'} <span style="font-size:15px">→</span></button>
  </div>
  <div class="bar-wrap"><div class="bar"><i style="width:100%"></i></div>
    <div class="bar-meta"><span class="note"><span class="dot"></span>已就绪 · 轻触即可见面</span><span class="note mono">100%</span></div></div>
  <div style="height:22px"></div>`;
}

function adoptView() {
  const sp = [
    { id: 'cat_orange', n: '橘猫', d: '慵懒 · 贪吃' },
    { id: 'dog_shiba', n: '柴犬', d: '傲娇 · 嘴硬' }
  ];
  return `
  <div class="head"><span class="tagl">领养</span><span class="note">品种之后不可更换</span></div>
  <div class="pad"><div class="title sm">先选一个它</div>
    <div class="sub" style="margin-top:6px">首版开放两只，另外四只会随版本陆续来。</div></div>
  <div style="padding:16px 18px 0;display:grid;grid-template-columns:1fr 1fr;gap:10px">
    ${sp.map((s) => `<button class="food" data-pick="${s.id}" style="text-align:center;${S.pet.species === s.id ? 'border:1.5px solid var(--orange);background:#fff' : ''}">
      <div style="height:70px;display:flex;align-items:center;justify-content:center">${s.id === 'cat_orange' ? CAT(64) : DOG(64)}</div>
      <div class="nm" style="margin-top:6px">${s.n}</div><div class="dsc">${s.d}</div></button>`).join('')}
  </div>
  <div class="spacer"></div>
  <div class="pad" style="padding-bottom:22px">
    <input id="nameInput" value="${S.pet.name || '布丁'}" maxlength="6" class="name-input" placeholder="给它取个名字">
    <div class="note" style="margin:8px 0 14px">最多 6 个字 · 它会记住这个名字</div>
    <button class="btn dark" data-finish="1">带它回家 <span style="font-size:15px">→</span></button>
  </div>`;
}

function homeView() {
  const p = S.pet;
  const stage = stageFor(p.adoptAt, Date.now());
  return `
  <div class="head" style="padding-bottom:8px;gap:10px">
    <div class="avatar" style="width:30px;height:30px;border-radius:10px;background:var(--orange-l);box-shadow:none;border:none">${petSvg(24)}</div>
    <div style="flex:1"><div style="font-size:12.5px;font-weight:700">${p.name}
      <span class="note">${p.species === 'cat_orange' ? '橘猫' : '柴犬'} · ${STAGE_LABEL[stage]}</span></div>
      <div class="note">相识第 ${Math.floor((Date.now() - p.adoptAt) / 86_400_000)} 天 · ${p.sick ? '有点不舒服' : '杭州 · 小雨'}</div></div>
    <div class="badge" style="padding:4px 9px;font-size:9.5px"><i></i>羁绊 ${fmt(p.stats.intimacy)}</div>
    <button class="round" data-overlay="settings" style="background:#fff;border:1px solid var(--line)">设</button>
  </div>
  <div class="room">
    <div class="win"></div><div class="note" style="position:absolute;left:48px;top:100px">小雨</div>
    <div class="tree"></div><div class="pet" id="pet">${petSvg(126)}</div>
    <div class="speech"><div class="txt" id="speech">${ambientLine()}</div>
      <button class="round" data-speak="1">▶</button></div>
  </div>
  <div class="stats">
    ${[['饱食', p.stats.fullness], ['心情', p.stats.mood], ['精力', p.stats.energy]].map(([k, v]) => `
      <div class="stat"><div class="note">${k}</div><div class="v mono">${fmt(v as number)}
        <span style="font-size:8.5px;font-weight:500;color:var(--muted)">/100</span></div></div>`).join('')}
  </div>
  <div class="adslot">Banner 广告位 · 不遮挡宠物与操作区</div>
  <div class="actions">
    <button class="action" data-overlay="feed"><div class="ico">碗</div><span>喂食</span></button>
    <button class="action" data-overlay="play"><div class="ico">球</div><span>玩耍</span></button>
    <button class="action" data-go="talk"><div class="ico">话</div><span>说话</span></button>
    <button class="action" data-go="growth"><div class="ico">档</div><span>档案</span></button>
  </div>`;
}

function talkView() {
  return `
  <div class="head" style="gap:8px">
    <button class="round" data-go="home" style="background:#fff;border:1px solid var(--line);font-size:14px">‹</button>
    <span class="h2" style="flex:1">和${S.pet.name}说话</span>
    <span class="tagl">今日 ${S.pet.counts.talk} 轮</span></div>
  <div class="bubbles" id="bubbles">
    ${S.lines.length === 0 ? `<div class="row"><div class="b-pet">${ambientLine()}</div></div>` : ''}
    ${S.lines.map((l) => l.who === 'me'
      ? `<div class="row me"><div class="b-me">${esc(l.text)}</div></div>`
      : `<div class="row"><div class="b-pet">${esc(l.text)}${l.meta ? `<div class="meta">${l.meta}</div>` : ''}</div></div>`).join('')}
  </div>
  <div class="chips">${['我回来了', '晚安', '摸摸头', '我有点饿', '我好无聊'].map((q) => `<button class="chip" data-say="${q}">${q}</button>`).join('')}</div>
  <div class="input-row">
    <input id="talkInput" placeholder="说点什么…">
    <button class="round" data-send="1" style="width:42px;height:42px;background:var(--ink);color:#fff">话</button>
  </div>`;
}

function growthView() {
  const p = S.pet;
  const stage = stageFor(p.adoptAt, Date.now());
  const ms = p.milestones.length
    ? p.milestones.map((m) => `<div class="tl"><div class="axis"><div class="d"></div><div class="l"></div></div>
        <div class="body"><div class="t">${MILESTONE_CN[m] ?? m}</div></div></div>`).join('')
    : `<div class="note" style="padding:8px 0 12px">还没有里程碑。喂它、陪它玩、和它说话，都会留下记录。</div>`;
  return `
  <div class="head"><span class="title sm">成长档案</span><span class="tagl">第 ${Math.floor((Date.now() - p.adoptAt) / 86_400_000)} 天</span></div>
  <div class="pad" style="padding-bottom:10px"><div class="card" style="padding:13px;display:flex;gap:11px;align-items:center">
    <div style="width:50px;height:50px;border-radius:15px;background:var(--orange-l);display:flex;align-items:center;justify-content:center;font-weight:700;color:#C9703A;font-size:10.5px">${STAGE_LABEL[stage]}</div>
    <div style="flex:1"><div style="font-weight:700;font-size:12.5px">亲密度 ${fmt(p.stats.intimacy)} · 里程碑 ${p.milestones.length}</div>
    <div class="note" style="margin-top:3px">投喂 ${p.counts.feed} · 玩耍 ${p.counts.play} · 对话 ${p.counts.talk}</div></div></div></div>
  <div style="flex:1;padding:0 16px;overflow:auto"><div class="card" style="padding:13px 13px 4px">${ms}</div></div>
  <div style="padding:10px 16px 20px"><button class="btn line sm" data-go="home">回房间</button></div>`;
}

function overlayView() {
  if (S.overlay === 'feed') {
    return `<div class="sheet-mask" data-close="1"><div class="sheet" data-stop="1">
      <div class="flex" style="justify-content:space-between;margin-bottom:12px"><div class="h2">给它吃点东西</div>
        <span class="note">金币 ${1280 - S.pet.counts.feed * 10}</span></div>
      <div class="grid4">${FOODS.map((f) => `<button class="food ${f.name === S.memory.favFood ? 'like' : ''}" data-feed="${f.id}">
        <div class="thumb">${f.name[0]}</div><div class="nm">${f.name}</div>
        <div class="dsc">饱食 +${f.fullness} · 心情 ${f.mood >= 0 ? '+' : ''}${f.mood}</div></button>`).join('')}</div>
      <div class="note" style="margin-top:12px">它偏爱 ${S.memory.favFood}，讨厌 ${S.memory.hateFood}</div>
    </div></div>`;
  }
  if (S.overlay === 'play') {
    return `<div class="sheet-mask" data-close="1"><div class="sheet" data-stop="1">
      <div class="flex" style="justify-content:space-between"><div class="h2">逗它玩</div><span class="note">精力 −12</span></div>
      <div style="height:150px;margin:12px 0;border-radius:16px;background:linear-gradient(180deg,#F2EAF4,#F7EEE2);display:flex;align-items:center;justify-content:center">${petSvg(96)}</div>
      <button class="btn dark sm" data-play="1">追一轮逗猫棒</button>
    </div></div>`;
  }
  if (S.overlay === 'ad') {
    return `<div class="modal-mask" data-close="1"><div class="modal" data-stop="1">
      <div style="font-weight:700;font-size:14px">它有点困了</div>
      <div class="sub" style="margin-top:6px">今天的精力用完了。可以明天再来，也可以看个视频多玩两轮。</div>
      <div class="note" style="margin-top:8px">今日激励 ${S.ads.rewarded} / 4</div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn line sm" style="flex:1" data-close="1">明天再来</button>
        <button class="btn dark sm" style="flex:1.4" data-ad="1">看视频 +30</button></div>
    </div></div>`;
  }
  return `<div class="sheet-mask" data-close="1"><div class="sheet" data-stop="1">
    <div class="flex" style="justify-content:space-between;margin-bottom:10px"><div class="h2">设置</div><span class="note">demo</span></div>
    <div class="card" style="padding:12px"><div class="note" style="line-height:1.8">
      结算引擎：shared/formulas.ts（与服务端同一份）<br>
      对话引擎：shared/dialogue/engine.ts + 1200 条语料<br>
      动作核心：server/core/actions.ts</div></div>
    <div class="note" style="margin-top:10px">开发者：快进用于验证时间推进与重逢</div>
    <div style="display:flex;gap:8px;margin-top:8px">
      <button class="btn line sm" data-fast="6" style="height:40px">快进 6 小时</button>
      <button class="btn line sm" data-fast="72" style="height:40px">快进 3 天</button>
      <button class="btn line sm" data-reset="1" style="height:40px">重置</button></div>
    <div style="margin-top:10px"><button class="btn dark sm" data-close="1">关闭</button></div>
  </div></div>`;
}

/* ---------------- 交互 ---------------- */
function ambientLine(): string {
  const p = S.pet;
  const corpus = CORPORA[p.species];
  const r = respond(corpus, p.stats.fullness < 30 ? '饿' : p.stats.energy < 20 ? '困' : '我回来了', {
    memory: { ...S.memory, name: p.name }, intimacy: p.stats.intimacy, rng: () => 0.5
  });
  return r.line;
}

function petSvg(size: number): string {
  return S.pet.species === 'dog_shiba' ? DOG(size) : CAT(size);
}

const CAT = (s: number) => `<svg width="${s}" height="${s}" viewBox="0 0 150 150">
  <ellipse cx="75" cy="140" rx="42" ry="6" fill="#ED8A4C" opacity=".12"/>
  <path d="M36 52c-2-16 2-28 4-30 8 2 20 12 26 20z" fill="#ED8A4C"/><path d="M114 52c2-16-2-28-4-30-8 2-20 12-26 20z" fill="#ED8A4C"/>
  <path d="M43 46c-1-9 1-17 2-19 5 2 13 8 17 13z" fill="#FBB98E"/><path d="M107 46c1-9-1-17-2-19-5 2-13 8-17 13z" fill="#FBB98E"/>
  <ellipse cx="75" cy="78" rx="46" ry="44" fill="#F5A463"/>
  <ellipse cx="60" cy="76" rx="4" ry="4.6" fill="#4A2E1A"/><ellipse cx="90" cy="76" rx="4" ry="4.6" fill="#4A2E1A"/>
  <path d="M75 88l-4 4h8z" fill="#C9703A"/><path d="M75 92c-2 5-7 5-8 1M75 92c2 5 7 5 8 1" stroke="#C9703A" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <path d="M44 82l-12-3M45 89l-12 3M106 82l12-3M105 89l12 3" stroke="#E0A279" stroke-width="1.3" stroke-linecap="round"/></svg>`;

const DOG = (s: number) => `<svg width="${s}" height="${s}" viewBox="0 0 150 150">
  <ellipse cx="75" cy="142" rx="36" ry="6" fill="#C79A6A" opacity=".12"/>
  <path d="M46 62L20 8l46 30z" fill="#CE8850"/><path d="M104 62L130 8l-46 30z" fill="#CE8850"/>
  <path d="M48 58L29 18l28 22z" fill="#F6D9BC"/><path d="M102 58L121 18l-28 22z" fill="#F6D9BC"/>
  <path d="M75 40c18 0 30 14 30 32 0 20-13 34-30 34S45 92 45 72c0-18 12-32 30-32z" fill="#E7A969"/>
  <path d="M75 94c11 0 20 7 20 15 0 7-9 11-20 11s-20-4-20-11c0-8 9-15 20-15z" fill="#FBEBD8"/>
  <path d="M47 74c5 11 16 19 28 19s23-8 28-19c2 15-9 31-28 31S45 89 47 74z" fill="#FBEBD8"/>
  <ellipse cx="62" cy="68" rx="3.8" ry="4.4" fill="#3E2716"/><ellipse cx="88" cy="68" rx="3.8" ry="4.4" fill="#3E2716"/>
  <path d="M75 80l-5 4h10z" fill="#3E2716"/><path d="M75 84v5M75 89c-2 5-7 5-8 1M75 89c2 5 7 5 8 1" stroke="#8A5C3A" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;

const MILESTONE_CN: Record<string, string> = {
  first_feed: '第一次投喂', first_play: '第一次玩耍', first_talk: '第一次说话',
  first_teach: '第一次握手', sick_first: '第一次生病'
};

function esc(s: string) { return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!)); }
function toast(msg: string) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1600);
}
function scrollTalk() {
  const b = document.getElementById('bubbles');
  if (b) requestAnimationFrame(() => { b.scrollTop = b.scrollHeight; });
}

app.addEventListener('click', (e) => {
  const t = (e.target as HTMLElement).closest('[data-go],[data-pick],[data-finish],[data-overlay],[data-close],[data-feed],[data-play],[data-say],[data-send],[data-ad],[data-fast],[data-reset],[data-speak]') as HTMLElement | null;
  if (!t) return;

  if (t.dataset.go) { S.screen = t.dataset.go as Store['screen']; S.overlay = null; save(); render(); return; }
  if (t.dataset.pick) { S.pet.species = t.dataset.pick; save(); render(); return; }
  if (t.hasAttribute('data-finish')) {
    const input = document.getElementById('nameInput') as HTMLInputElement | null;
    S.pet.name = (input?.value || '布丁').slice(0, 6);
    S.memory.name = S.pet.name;
    S.screen = 'home'; save(); render(); toast('它现在是你的了'); return;
  }
  if (t.dataset.overlay) { S.overlay = t.dataset.overlay as Store['overlay']; render(); return; }
  if (t.dataset.close) { S.overlay = null; render(); return; }

  if (t.dataset.feed) {
    const food = FOODS.find((f) => f.id === t.dataset.feed)!;
    const out = feedPet(S.pet, food.id, { fav: String(S.memory.favFood), hate: String(S.memory.hateFood) });
    S.pet = out.pet; S.overlay = null; save(); render();
    toast(out.lines[0] ?? '');
    return;
  }
  if (t.hasAttribute('data-play')) {
    const out = playWithPet(S.pet, Date.now());
    if (out.rejected === 'NO_ENERGY') { S.overlay = 'ad'; save(); render(); return; }
    S.pet = out.pet; S.overlay = null; save(); render(); toast(out.lines[0] ?? '');
    return;
  }
  if (t.dataset.say) { say(t.dataset.say); return; }
  if (t.hasAttribute('data-send')) {
    const input = document.getElementById('talkInput') as HTMLInputElement | null;
    if (input?.value.trim()) { say(input.value.trim()); input.value = ''; }
    return;
  }
  if (t.dataset.ad) {
    const today = dayKey(Date.now());
    if (S.ads.dayKey !== today) S.ads = { dayKey: today, rewarded: 0 };
    const out = claimAdReward(S.pet, S.ads, today);
    if (!out.granted) { toast('今天的激励次数用完了'); return; }
    S.ads.rewarded += 1; S.pet = out.pet; S.overlay = null; save(); render();
    toast('精力 +30');
    return;
  }
  if (t.dataset.fast) {
    S.pet.lastSettleAt -= Number(t.dataset.fast) * HOUR;
    S.overlay = null; save(); render();
    toast(`已快进 ${t.dataset.fast} 小时`);
    return;
  }
  if (t.dataset.reset) { localStorage.removeItem(KEY); S = blank(); render(); return; }
  if (t.hasAttribute('data-speak')) { toast('demo 未接语音'); return; }
});

function say(text: string) {
  const corpus = CORPORA[S.pet.species];
  const r = respond(corpus, text, {
    memory: { ...S.memory, name: S.pet.name }, intimacy: S.pet.stats.intimacy, rng: () => 0.5
  });
  S.lines.push({ who: 'me', text });
  S.lines.push({ who: 'pet', text: r.line, meta: `意图 ${r.intent} · 档位 ${r.tierKey ?? r.tier}` });
  S.pet.counts.talk += 1;
  S.pet.stats.intimacy = Math.min(100, S.pet.stats.intimacy + 0.6);
  if (!S.pet.milestones.includes('first_talk')) S.pet.milestones.push('first_talk');
  save(); render();
}

render();
console.log('demo ready');