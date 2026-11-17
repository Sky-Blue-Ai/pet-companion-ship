# 数据字典（G-03）

云数据库 6 个集合。所有时间字段存 ms 时间戳（number），时区只在展示层处理。

## accounts
| 字段 | 类型 | 索引 | 说明 |
|---|---|---|---|
| _id | string | — | 自动 |
| openid | string | 唯一 | 用户标识 |
| created_at | number | — | 首次登录 |
| tz_offset | number | — | 分钟，默认 480 |
| settings | object | — | `{ notify, quiet, quietStart, quietEnd, locateAllowed }` |
| ad_state | object | — | `{ dayKey, rewarded, impression }` |

## pets
| 字段 | 类型 | 索引 | 说明 |
|---|---|---|---|
| openid | string | 索引 | |
| species | string | — | `cat_orange` / `dog_shiba` |
| name | string | — | 用户取名 |
| adoptAt | number | — | 领养时间 |
| lastSettleAt | number | — | **权威结算时间** |
| stats | object | — | 五维 0–100 |
| sick / lowCleanSince / lowFullnessSince | bool / number\|null | — | 生病判定 |
| milestones | string[] | — | 已达成 id |
| counts | object | — | `{ feed, play, talk }` |
| lastPlayAt | number\|null | — | 心情目标用 |

## events
`{ openid, type: 'milestone'|'daily'|'reunion'|'sick'|'dialogue', key, at, payload }`
- `type=daily` 最多 7 条/日，供「它今天做了什么」与重逢叙事
- 对话只存摘要（意图 + 情绪标签），**不存原始长文本**

## ad_views
`{ openid, slot, nonce, at, granted }` — nonce 唯一索引，发奖对账

## metrics
`{ openid, name, at, props }` — 按日导出，保留 90 天

## 索引与容量

| 集合 | 索引 | 预估（5000 DAU） |
|---|---|---|
| accounts | openid 唯一 | 5k 文档 |
| pets | openid 唯一 | 5k |
| events | (openid, at) | 约 15 万/月 |
| ad_views | (openid, at)、nonce 唯一 | 约 6 万/月 |
| metrics | (at) | 约 150 万/月（按月分表） |