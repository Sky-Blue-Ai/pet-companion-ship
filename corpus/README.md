# 语料库规范（v1）— 给生成语料的会话照这个产出

目标：20 个意图 × 3 个语气档，每档 3–5 个变体，总量约 1200 条。产出物是 **`corpus/cat_orange.json` 与 `corpus/dog_shiba.json`** 两个文件，`tools/corpus-lint.ts` 会校验。

## 文件结构

```json
{
  "species": "cat_orange",
  "version": "v1",
  "persona": {
    "tone": "lazy",
    "sentenceMax": 34,
    "tic": "……嗯",
    "calls": "喵",
    "forbidden": ["你是真人", "我会死", "给我钱"]
  },
  "intents": {
    "greet_home": {
      "keywords": ["我回来了", "回来了", "回来啦", "哈喽"],
      "tiers": {
        "low":  ["……喵？（抬头看了你一眼）"],
        "mid":  ["喵！（从窗台跳下来）你回来啦。"],
        "high": ["{name}！我等了一整天……先摸会儿，再吃饭。"]
      }
    }
  }
}
```

## 20 个意图（必须全覆盖，缺一个 lint 就失败）

| 意图 | 关键词示例 | 说明 |
|---|---|---|
| greet_home | 我回来了 / 回来了 / 哈喽 | 回家问候 |
| night | 晚安 / 睡了 / 困了 | 睡前 |
| pet_head | 摸摸 / 撸 / 抱抱 | 身体接触 |
| praise | 好可爱 / 真棒 / 喜欢你 | 夸奖 |
| scold | 笨 / 讨厌 / 烦 | 责备（不能反击伤人） |
| feed_ask | 饿 / 吃饭 / 吃了没 | 讨食 |
| doing | 在干嘛 / 做什么 | 它今天做了什么（可引 {todayEvent}） |
| name_ask | 你叫什么 / 名字 | 自我介绍 |
| weather_ask | 天气 / 下雨 / 冷 | 天气话题（引 {weather}） |
| tired | 累 / 难过 / 不开心 / 压力 | 情绪低落（语气放缓，不说教） |
| miss | 想你 / 想我 | 依恋表达 |
| remember | 记得 / 第一次见 | 记忆引用（引 {adoptDate}） |
| program | 程序 / 机器 / 假的 | 「你只是程序」的坦诚回应 |
| bye | 出门 / 上班 / 走了 | 道别 |
| ask_food_pref | 你爱吃什么 / 喜欢什么 | 偏好（引 {favFood}） |
| sick_comfort | 生病 / 不舒服 / 难受 | 生病时的互动 |
| play_invite | 玩吗 / 来玩 / 逗你 | 邀请玩耍 |
| praise_body | 毛好软 / 好胖 / 肚子 | 身体赞美 |
| anniversary | 纪念日 / 多少天了 | 相伴天数（引 {daysTogether}） |
| fallback_pet | — | 兜底：不硬答，宠物式反应（歪头/一声叫） |

## 槽位（可用变量，只准用这些）

| 槽位 | 含义 | 缺失时行为 |
|---|---|---|
| {name} | 宠物名 | 变体里必须有不含该槽位的兄弟句 |
| {daysTogether} | 相识天数 | 同上 |
| {favFood} | 偏爱食物 | 同上 |
| {adoptDate} | 领养日期（11 月 20 日） | 同上 |
| {weather} | 当前天气 | 同上 |
| {todayEvent} | 今天它做的一件事 | 同上 |
| {calls} | 拟声词（喵/汪） | 品种固定，不会缺 |

## 三条硬规则

1. **每条变体 ≤ 40 字**（柴犬 ≤ 22 字），超过 lint 报警。
2. **禁止空话与万能句**：「我在这里陪你」「有什么我能帮你」这类一律不收，必须是具体动作或具体记忆。
3. **情绪红线**：不许用「你不来我就消失 / 我会死」施压；不许索取金钱、真实姓名、住址；不许提供医疗、心理治疗建议。

## 校验

```bash
node --experimental-strip-types tools/corpus-lint.ts
```

通过标准：20 意图全覆盖、每意图每档 ≥ 3 个变体、无未定义槽位、单条长度达标、重复度 < 20%。