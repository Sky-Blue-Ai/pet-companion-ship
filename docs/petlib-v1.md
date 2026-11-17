# AI 宠物资产预料库 · 小猫 & 小狗（v1.0）

> 面向「AI 虚拟宠物陪伴成长」赛道：宠物养成小游戏 / 内容 IP 的**语料、美术、语音、设计令牌**四件套。
> 语音 ID 规则：`voiceId = sha1(text) 前 8 位`；语料与语音一一对应，可增量追加。

| 资产 | 规模 | 状态 |
|---|---|---|
| G-10 语料库 v1 | 20 意图 × 3 语气档 ≈ 1200 条 + 槽位表 + lint 规则 | ✅ 本文档 |
| G-11 美术切图 | 2 品种 × 6 动作 × 3–5 帧，含图集与命名规范 | 📋 规格见第二节 |
| G-12 语音包 | 400 条，voiceId = hash(text)，CDN 目录 + 索引表 | 📋 规格见第三节 |
| G-13 设计令牌落地 | DESIGN.md → design-tokens.json → Cocos 常量 | 📋 规格见第四节 |

## 一、语料库 v1（1200 条）

### 1.1 槽位表

| 槽位 | 含义 | 取值 | 说明 |
|---|---|---|---|
| {call} | 叫声词 | cat=喵 / dog=汪 | 每句必带，保证物种听感 |
| {soft} | 软萌语气词 | cat=呜 / dog=呜呜 | soft 语气档高频出现 |
| {purr} | 满足声 | cat=呼噜呼噜 / dog=哼哼唧唧 | after_eat / petted / sleepy 常用 |
| {act} | 动作词 | cat=蹭蹭 / dog=扑过来 | 与动画切图动作对齐 |
| {tail} | 身体部位 | 尾巴 | 动作演出参考 |
| {sp} | 自称 | 猫 / 狗 | vivid 语气档自夸句式 |
| {pet} | 互动动作 | 摸摸头 | petted 意图专用 |
| {food} | 食物槽 | 小鱼干/罐罐/鸡胸肉/肉肉/磨牙棒… | 随机填充，语音包 TTS 合成后按槽归一 |
| {toy} | 玩具槽 | 毛线球/逗猫棒/飞盘/磨牙玩具… | 随机填充 |
| {name} | 宠物名 | 团团/小团子/毛球 | 预留个性化：接入后替换为用户自定义名 |

### 1.2 语气档定义

| 档位 | 名称 | 风格 | 使用场景 |
|---|---|---|---|
| soft | 软萌粘人 | 弱声、依赖感强 | 默认陪伴、深夜、独处 |
| vivid | 元气活泼 | 高能量、感叹号多 | 玩耍、被夸奖、出门 |
| gentle | 温柔治愈 | 平静、安心感 | 晚安、节日、日常问候 |

### 1.3 lint 规则（入库/合成前必须通过）

| 规则 | 说明 | 校验 |
|---|---|---|
| 长度 | 正文 4–24 字（不含 ID/标注列），超长拆句 | `len(text) < 4 or len(text) > 24` → 拒绝 |
| 叫声词 | 每条必须含物种叫声词（猫「喵」/ 狗「汪」），保证语音听感归属 | `("喵" in t) if sp=="cat" else ("汪" in t)` → 否则拒绝 |
| 禁词表 | 禁止：钱/支付/红包/抽奖/破解/微信/QQ/加V/永久/包治/100%/最第一等极限词与平台敏感词 | 命中任意禁词 → 拒绝并记录 |
| 标点 | 句尾必须为。～！？…之一；句内禁止出现竖线 | 与换行 | `t[-1] in "。～！？…"`, `"|" not in t` |
| 槽位平衡 | 槽位必须成对出现且不嵌套：`{xx}` 可解析；非法槽位（不在槽位表）→ 拒绝 | `set(re.findall(r"{(\w+)}", t)) <= set(VALID_SLOTS)` |
| 语气一致性 | soft 档应以 {soft}/{purr} 类弱声开场或收尾；vivid 档必须含「！」；gentle 档禁止连续感叹 | 按档位正则校验 |
| 去重 | 语料全文去重（同文不同 ID 视为脏数据） | hash(text) 唯一 |
| 空格 | 首尾无空格；连续空格折叠为 1 个 | `t == t.strip()` |

### 1.4 语料全文（按意图分组）

#### 打招呼（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| greet-soft-cat-d4a2c979 | soft | 猫 | 喵～主人回来啦，蹭蹭你一下哦 | d4a2c979 |
| greet-soft-cat-eecca483 | soft | 猫 | 又主人主人！我一直在门口蹲着等你呀喵 | eecca483 |
| greet-soft-cat-51b31f6e | soft | 猫 | 好啦好啦，喵～主人回来啦，蹭蹭你一下哦 | 51b31f6e |
| greet-soft-cat-9329e3c2 | soft | 猫 | 咦，主人主人！我一直在门口蹲着等你呀喵 | 9329e3c2 |
| greet-soft-cat-69931cfa | soft | 猫 | 今天毛球喵～主人回来啦，蹭蹭你一下哦 | 69931cfa |
| greet-soft-cat-17e096a0 | soft | 猫 | 主人主人！我一直在门口蹲着等你呀喵 | 17e096a0 |
| greet-soft-cat-6576a95d | soft | 猫 | 又喵～主人回来啦，蹭蹭你一下哦 | 6576a95d |
| greet-soft-cat-ba0a2775 | soft | 猫 | 好啦好啦，主人主人！我一直在门口蹲着等你呀喵 | ba0a2775 |
| greet-soft-cat-1bf9e2e2 | soft | 猫 | 咦，喵～主人回来啦，蹭蹭你一下哦 | 1bf9e2e2 |
| greet-soft-cat-21b3a316 | soft | 猫 | 今天团团主人主人！我一直在门口蹲着等你呀喵 | 21b3a316 |
| greet-soft-dog-7a7fe6b7 | soft | 狗 | 汪～主人回来啦，扑过来你一下哦 | 7a7fe6b7 |
| greet-soft-dog-53f4971b | soft | 狗 | 又主人主人！我一直在门口蹲着等你呀汪 | 53f4971b |
| greet-soft-dog-ed628105 | soft | 狗 | 好啦好啦，汪～主人回来啦，扑过来你一下哦 | ed628105 |
| greet-soft-dog-0c674a7f | soft | 狗 | 咦，主人主人！我一直在门口蹲着等你呀汪 | 0c674a7f |
| greet-soft-dog-6f581180 | soft | 狗 | 今天毛球汪～主人回来啦，扑过来你一下哦 | 6f581180 |
| greet-soft-dog-1a588ccd | soft | 狗 | 主人主人！我一直在门口蹲着等你呀汪 | 1a588ccd |
| greet-soft-dog-4a4d62aa | soft | 狗 | 又汪～主人回来啦，扑过来你一下哦 | 4a4d62aa |
| greet-soft-dog-eef3df30 | soft | 狗 | 好啦好啦，主人主人！我一直在门口蹲着等你呀汪 | eef3df30 |
| greet-soft-dog-2dbdb28d | soft | 狗 | 咦，汪～主人回来啦，扑过来你一下哦 | 2dbdb28d |
| greet-soft-dog-eba64917 | soft | 狗 | 今天团团主人主人！我一直在门口蹲着等你呀汪 | eba64917 |
| greet-vivid-cat-cdb84e42 | vivid | 猫 | 喵！今天也要元气满满哦！ | cdb84e42 |
| greet-vivid-cat-0f266f42 | vivid | 猫 | 又嘿嘿，我帮你把拖鞋叼过来啦喵！ | 0f266f42 |
| greet-vivid-cat-b4e63c72 | vivid | 猫 | 好啦好啦，喵！今天也要元气满满哦！ | b4e63c72 |
| greet-vivid-cat-d36140f2 | vivid | 猫 | 咦，嘿嘿，我帮你把拖鞋叼过来啦喵！ | d36140f2 |
| greet-vivid-cat-8ae3ba47 | vivid | 猫 | 今天毛球喵！今天也要元气满满哦！ | 8ae3ba47 |
| greet-vivid-cat-cfaeafe1 | vivid | 猫 | 嘿嘿，我帮你把拖鞋叼过来啦喵！ | cfaeafe1 |
| greet-vivid-cat-52478194 | vivid | 猫 | 又喵！今天也要元气满满哦！ | 52478194 |
| greet-vivid-cat-78c589d8 | vivid | 猫 | 好啦好啦，嘿嘿，我帮你把拖鞋叼过来啦喵！ | 78c589d8 |
| greet-vivid-cat-b62fbfe4 | vivid | 猫 | 咦，喵！今天也要元气满满哦！ | b62fbfe4 |
| greet-vivid-cat-9e8eb9a3 | vivid | 猫 | 今天团团嘿嘿，我帮你把拖鞋叼过来啦喵！ | 9e8eb9a3 |
| greet-vivid-dog-18b9ce30 | vivid | 狗 | 汪！今天也要元气满满哦！ | 18b9ce30 |
| greet-vivid-dog-a02c062c | vivid | 狗 | 又嘿嘿，我帮你把拖鞋叼过来啦汪！ | a02c062c |
| greet-vivid-dog-d4be4216 | vivid | 狗 | 好啦好啦，汪！今天也要元气满满哦！ | d4be4216 |
| greet-vivid-dog-a1276017 | vivid | 狗 | 咦，嘿嘿，我帮你把拖鞋叼过来啦汪！ | a1276017 |
| greet-vivid-dog-9dc8fc8a | vivid | 狗 | 今天毛球汪！今天也要元气满满哦！ | 9dc8fc8a |
| greet-vivid-dog-155fd85c | vivid | 狗 | 嘿嘿，我帮你把拖鞋叼过来啦汪！ | 155fd85c |
| greet-vivid-dog-f47d4e3f | vivid | 狗 | 又汪！今天也要元气满满哦！ | f47d4e3f |
| greet-vivid-dog-1974712f | vivid | 狗 | 好啦好啦，嘿嘿，我帮你把拖鞋叼过来啦汪！ | 1974712f |
| greet-vivid-dog-27df1829 | vivid | 狗 | 咦，汪！今天也要元气满满哦！ | 27df1829 |
| greet-vivid-dog-90585f58 | vivid | 狗 | 今天团团嘿嘿，我帮你把拖鞋叼过来啦汪！ | 90585f58 |
| greet-gentle-cat-f2172968 | gentle | 猫 | 喵～今天天气很好呢 | f2172968 |
| greet-gentle-cat-71f02903 | gentle | 猫 | 又主人今天辛苦啦，来抱抱 | 71f02903 |
| greet-gentle-cat-de52e598 | gentle | 猫 | 好啦好啦，喵～今天天气很好呢 | de52e598 |
| greet-gentle-cat-739aa5a8 | gentle | 猫 | 咦，主人今天辛苦啦，来抱抱 | 739aa5a8 |
| greet-gentle-cat-76800d35 | gentle | 猫 | 今天毛球喵～今天天气很好呢 | 76800d35 |
| greet-gentle-cat-ab6db866 | gentle | 猫 | 主人今天辛苦啦，来抱抱 | ab6db866 |
| greet-gentle-cat-8aaee576 | gentle | 猫 | 又喵～今天天气很好呢 | 8aaee576 |
| greet-gentle-cat-31bef6ae | gentle | 猫 | 好啦好啦，主人今天辛苦啦，来抱抱 | 31bef6ae |
| greet-gentle-cat-7cf2afa5 | gentle | 猫 | 咦，喵～今天天气很好呢 | 7cf2afa5 |
| greet-gentle-cat-84a538df | gentle | 猫 | 今天团团主人今天辛苦啦，来抱抱 | 84a538df |
| greet-gentle-dog-bfaf3dbc | gentle | 狗 | 汪～今天天气很好呢 | bfaf3dbc |
| greet-gentle-dog-287c313d | gentle | 狗 | 汪～看到你就安心了 | 287c313d |
| greet-gentle-dog-f4b5bc3f | gentle | 狗 | 又欢迎回家，我一直在等你哦 | f4b5bc3f |
| greet-gentle-dog-5bb140fe | gentle | 狗 | 好啦好啦，汪～看到你就安心了 | 5bb140fe |
| greet-gentle-dog-9cd7b126 | gentle | 狗 | 咦，欢迎回家，我一直在等你哦 | 9cd7b126 |
| greet-gentle-dog-8abfe2c2 | gentle | 狗 | 今天毛球汪～看到你就安心了 | 8abfe2c2 |
| greet-gentle-dog-f3c38b8f | gentle | 狗 | 欢迎回家，我一直在等你哦 | f3c38b8f |
| greet-gentle-dog-c72c5a1e | gentle | 狗 | 又汪～看到你就安心了 | c72c5a1e |
| greet-gentle-dog-300ddea9 | gentle | 狗 | 好啦好啦，欢迎回家，我一直在等你哦 | 300ddea9 |
| greet-gentle-dog-21fbf9a2 | gentle | 狗 | 咦，汪～看到你就安心了 | 21fbf9a2 |

#### 饿了求喂（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| hungry-soft-cat-0cdb38f8 | soft | 猫 | 肚子咕咕叫了喵…想吃小鱼干嘛 | 0cdb38f8 |
| hungry-soft-cat-e9098949 | soft | 猫 | 主人…可以加一点肉肉吗，就一点点 | e9098949 |
| hungry-soft-cat-73a41bb3 | soft | 猫 | 又呜，饭碗空空的，好可怜喵 | 73a41bb3 |
| hungry-soft-cat-e8f6fc6e | soft | 猫 | 喵…闻到狗粮的味道了，馋馋 | e8f6fc6e |
| hungry-soft-cat-2d006350 | soft | 猫 | 咦，呜，饭碗空空的，好可怜喵 | 2d006350 |
| hungry-soft-cat-20507ca5 | soft | 猫 | 肚子咕咕叫了喵…想吃磨牙棒嘛 | 20507ca5 |
| hungry-soft-cat-77505372 | soft | 猫 | 主人…可以加一点罐罐吗，就一点点 | 77505372 |
| hungry-soft-cat-7a0820b5 | soft | 猫 | 今天毛球呜，饭碗空空的，好可怜喵 | 7a0820b5 |
| hungry-soft-cat-d42de1e3 | soft | 猫 | 喵…闻到鸡胸肉的味道了，馋馋 | d42de1e3 |
| hungry-soft-cat-97fe4804 | soft | 猫 | 主人…可以加一点小鱼干吗，就一点点 | 97fe4804 |
| hungry-soft-dog-bc49c9e6 | soft | 狗 | 肚子咕咕叫了汪…想吃小鱼干嘛 | bc49c9e6 |
| hungry-soft-dog-99d4256c | soft | 狗 | 汪…闻到狗粮的味道了，馋馋 | 99d4256c |
| hungry-soft-dog-597cbb4b | soft | 狗 | 又呜呜，饭碗空空的，好可怜汪 | 597cbb4b |
| hungry-soft-dog-feff4364 | soft | 狗 | 肚子咕咕叫了汪…想吃磨牙棒嘛 | feff4364 |
| hungry-soft-dog-d70d5f50 | soft | 狗 | 汪…闻到鸡胸肉的味道了，馋馋 | d70d5f50 |
| hungry-soft-dog-aa1c8c9a | soft | 狗 | 好啦好啦，呜呜，饭碗空空的，好可怜汪 | aa1c8c9a |
| hungry-soft-dog-e041476d | soft | 狗 | 肚子咕咕叫了汪…想吃肉肉嘛 | e041476d |
| hungry-soft-dog-58658f3d | soft | 狗 | 汪…闻到猫粮的味道了，馋馋 | 58658f3d |
| hungry-soft-dog-8c0a4a08 | soft | 狗 | 咦，呜呜，饭碗空空的，好可怜汪 | 8c0a4a08 |
| hungry-soft-dog-1b0eff85 | soft | 狗 | 肚子咕咕叫了汪…想吃罐罐嘛 | 1b0eff85 |
| hungry-vivid-cat-35b4299c | vivid | 猫 | 喵！饭饭饭！我要小鱼干！ | 35b4299c |
| hungry-vivid-cat-2b377ccb | vivid | 猫 | 又咦？饭碗怎么又空了喵！ | 2b377ccb |
| hungry-vivid-cat-53797cd5 | vivid | 猫 | 又干饭时间到！冲鸭！蹭蹭饭碗！ | 53797cd5 |
| hungry-vivid-cat-4e160b8d | vivid | 猫 | 狗粮！狗粮！本猫要开饭！ | 4e160b8d |
| hungry-vivid-cat-966f29c6 | vivid | 猫 | 咦，干饭时间到！冲鸭！蹭蹭饭碗！ | 966f29c6 |
| hungry-vivid-cat-175ef353 | vivid | 猫 | 喵！饭饭饭！我要磨牙棒！ | 175ef353 |
| hungry-vivid-cat-dd96e3ad | vivid | 猫 | 今天毛球咦？饭碗怎么又空了喵！ | dd96e3ad |
| hungry-vivid-cat-f0a3e575 | vivid | 猫 | 今天毛球干饭时间到！冲鸭！蹭蹭饭碗！ | f0a3e575 |
| hungry-vivid-cat-4b0aea9c | vivid | 猫 | 鸡胸肉！鸡胸肉！本猫要开饭！ | 4b0aea9c |
| hungry-vivid-cat-c1d4e059 | vivid | 猫 | 咦？饭碗怎么又空了喵！ | c1d4e059 |
| hungry-vivid-dog-84ba7d1d | vivid | 狗 | 汪！饭饭饭！我要小鱼干！ | 84ba7d1d |
| hungry-vivid-dog-779dd093 | vivid | 狗 | 又咦？饭碗怎么又空了汪！ | 779dd093 |
| hungry-vivid-dog-a184d4d2 | vivid | 狗 | 又干饭时间到！冲鸭！扑过来饭碗！ | a184d4d2 |
| hungry-vivid-dog-bfa5b9a3 | vivid | 狗 | 狗粮！狗粮！本狗要开饭！ | bfa5b9a3 |
| hungry-vivid-dog-ae6edc90 | vivid | 狗 | 咦，干饭时间到！冲鸭！扑过来饭碗！ | ae6edc90 |
| hungry-vivid-dog-efbece7e | vivid | 狗 | 汪！饭饭饭！我要磨牙棒！ | efbece7e |
| hungry-vivid-dog-6ac78fd2 | vivid | 狗 | 今天毛球咦？饭碗怎么又空了汪！ | 6ac78fd2 |
| hungry-vivid-dog-9c0ef35e | vivid | 狗 | 今天毛球干饭时间到！冲鸭！扑过来饭碗！ | 9c0ef35e |
| hungry-vivid-dog-7851a8b7 | vivid | 狗 | 鸡胸肉！鸡胸肉！本狗要开饭！ | 7851a8b7 |
| hungry-vivid-dog-11cf6717 | vivid | 狗 | 咦？饭碗怎么又空了汪！ | 11cf6717 |
| hungry-gentle-cat-101b3248 | gentle | 猫 | 到饭点了呢喵，慢慢吃不着急 | 101b3248 |
| hungry-gentle-cat-3adc030d | gentle | 猫 | 又主人，我有点饿了哦喵 | 3adc030d |
| hungry-gentle-cat-577c9c83 | gentle | 猫 | 好啦好啦，到饭点了呢喵，慢慢吃不着急 | 577c9c83 |
| hungry-gentle-cat-3fc959e7 | gentle | 猫 | 咦，主人，我有点饿了哦喵 | 3fc959e7 |
| hungry-gentle-cat-45f02bd7 | gentle | 猫 | 今天毛球到饭点了呢喵，慢慢吃不着急 | 45f02bd7 |
| hungry-gentle-cat-e0a2bb7d | gentle | 猫 | 主人，我有点饿了哦喵 | e0a2bb7d |
| hungry-gentle-cat-73722a8a | gentle | 猫 | 又到饭点了呢喵，慢慢吃不着急 | 73722a8a |
| hungry-gentle-cat-dfb1dbb6 | gentle | 猫 | 好啦好啦，主人，我有点饿了哦喵 | dfb1dbb6 |
| hungry-gentle-cat-0497f95b | gentle | 猫 | 咦，到饭点了呢喵，慢慢吃不着急 | 0497f95b |
| hungry-gentle-cat-a81d4622 | gentle | 猫 | 今天团团主人，我有点饿了哦喵 | a81d4622 |
| hungry-gentle-dog-61c01e88 | gentle | 狗 | 到饭点了呢汪，慢慢吃不着急 | 61c01e88 |
| hungry-gentle-dog-feb9fd70 | gentle | 狗 | 又主人，我有点饿了哦汪 | feb9fd70 |
| hungry-gentle-dog-19a150ee | gentle | 狗 | 好啦好啦，到饭点了呢汪，慢慢吃不着急 | 19a150ee |
| hungry-gentle-dog-94e04146 | gentle | 狗 | 咦，主人，我有点饿了哦汪 | 94e04146 |
| hungry-gentle-dog-27277ae6 | gentle | 狗 | 今天毛球到饭点了呢汪，慢慢吃不着急 | 27277ae6 |
| hungry-gentle-dog-7836f627 | gentle | 狗 | 主人，我有点饿了哦汪 | 7836f627 |
| hungry-gentle-dog-347a5252 | gentle | 狗 | 又到饭点了呢汪，慢慢吃不着急 | 347a5252 |
| hungry-gentle-dog-164e0622 | gentle | 狗 | 好啦好啦，主人，我有点饿了哦汪 | 164e0622 |
| hungry-gentle-dog-7eb7febd | gentle | 狗 | 咦，到饭点了呢汪，慢慢吃不着急 | 7eb7febd |
| hungry-gentle-dog-a49ba7a1 | gentle | 狗 | 今天团团主人，我有点饿了哦汪 | a49ba7a1 |

#### 吃完满足（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| after_eat-soft-cat-2fab7bb5 | soft | 猫 | 唔…小鱼干好好吃，呼噜呼噜～ | 2fab7bb5 |
| after_eat-soft-cat-849e16f6 | soft | 猫 | 又谢谢你喂我喵～最喜欢主人了 | 849e16f6 |
| after_eat-soft-cat-6b2f6038 | soft | 猫 | 又吃饱饱了，想枕着主人睡午觉喵 | 6b2f6038 |
| after_eat-soft-cat-3b0f3634 | soft | 猫 | 好啦好啦，呼噜呼噜…肚子圆圆的好幸福 | 3b0f3634 |
| after_eat-soft-cat-ac46ae5e | soft | 猫 | 咦，吃饱饱了，想枕着主人睡午觉喵 | ac46ae5e |
| after_eat-soft-cat-b1262292 | soft | 猫 | 今天毛球呼噜呼噜…肚子圆圆的好幸福 | b1262292 |
| after_eat-soft-cat-943b7824 | soft | 猫 | 吃饱饱了，想枕着主人睡午觉喵 | 943b7824 |
| after_eat-soft-cat-1b3df7b8 | soft | 猫 | 又呼噜呼噜…肚子圆圆的好幸福 | 1b3df7b8 |
| after_eat-soft-cat-da2233a9 | soft | 猫 | 好啦好啦，吃饱饱了，想枕着主人睡午觉喵 | da2233a9 |
| after_eat-soft-cat-d13d5f28 | soft | 猫 | 咦，呼噜呼噜…肚子圆圆的好幸福 | d13d5f28 |
| after_eat-soft-dog-d2f548f2 | soft | 狗 | 唔…小鱼干好好吃，哼哼唧唧～ | d2f548f2 |
| after_eat-soft-dog-37b14116 | soft | 狗 | 又谢谢你喂我汪～最喜欢主人了 | 37b14116 |
| after_eat-soft-dog-fdf88409 | soft | 狗 | 又吃饱饱了，想枕着主人睡午觉汪 | fdf88409 |
| after_eat-soft-dog-fbf9f8d3 | soft | 狗 | 好啦好啦，哼哼唧唧…肚子圆圆的好幸福 | fbf9f8d3 |
| after_eat-soft-dog-4761c1a1 | soft | 狗 | 咦，吃饱饱了，想枕着主人睡午觉汪 | 4761c1a1 |
| after_eat-soft-dog-1f3bb17f | soft | 狗 | 今天毛球哼哼唧唧…肚子圆圆的好幸福 | 1f3bb17f |
| after_eat-soft-dog-52aebd92 | soft | 狗 | 吃饱饱了，想枕着主人睡午觉汪 | 52aebd92 |
| after_eat-soft-dog-a6890b62 | soft | 狗 | 又哼哼唧唧…肚子圆圆的好幸福 | a6890b62 |
| after_eat-soft-dog-5992b574 | soft | 狗 | 好啦好啦，吃饱饱了，想枕着主人睡午觉汪 | 5992b574 |
| after_eat-soft-dog-73ad4889 | soft | 狗 | 咦，哼哼唧唧…肚子圆圆的好幸福 | 73ad4889 |
| after_eat-vivid-cat-83ed0db9 | vivid | 猫 | 嗝～小鱼干完美光盘！喵！ | 83ed0db9 |
| after_eat-vivid-cat-259c9788 | vivid | 猫 | 今天也是被肉肉治愈的一天喵！ | 259c9788 |
| after_eat-vivid-cat-ec1a137f | vivid | 猫 | 又吃饱了力量+100，接下来玩什么！ | ec1a137f |
| after_eat-vivid-cat-7d128a16 | vivid | 猫 | 喵！谁还有狗粮，再来一口！ | 7d128a16 |
| after_eat-vivid-cat-2c2df3aa | vivid | 猫 | 咦，吃饱了力量+100，接下来玩什么！ | 2c2df3aa |
| after_eat-vivid-cat-7d12a309 | vivid | 猫 | 嗝～磨牙棒完美光盘！喵！ | 7d12a309 |
| after_eat-vivid-cat-2aec2db8 | vivid | 猫 | 今天也是被罐罐治愈的一天喵！ | 2aec2db8 |
| after_eat-vivid-cat-762ae7ae | vivid | 猫 | 今天毛球吃饱了力量+100，接下来玩什么！ | 762ae7ae |
| after_eat-vivid-cat-a66ad3c9 | vivid | 猫 | 喵！谁还有鸡胸肉，再来一口！ | a66ad3c9 |
| after_eat-vivid-cat-d0d384ff | vivid | 猫 | 今天也是被小鱼干治愈的一天喵！ | d0d384ff |
| after_eat-vivid-dog-975326c5 | vivid | 狗 | 嗝～小鱼干完美光盘！汪！ | 975326c5 |
| after_eat-vivid-dog-104d8f93 | vivid | 狗 | 今天也是被肉肉治愈的一天汪！ | 104d8f93 |
| after_eat-vivid-dog-6c8d340a | vivid | 狗 | 今天也是被罐罐治愈的一天汪！ | 6c8d340a |
| after_eat-vivid-dog-7c72dd34 | vivid | 狗 | 嗝～磨牙棒完美光盘！汪！ | 7c72dd34 |
| after_eat-vivid-dog-e3027f58 | vivid | 狗 | 汪！谁还有鸡胸肉，再来一口！ | e3027f58 |
| after_eat-vivid-dog-3bf9e0ef | vivid | 狗 | 好啦好啦，吃饱了力量+100，接下来玩什么！ | 3bf9e0ef |
| after_eat-vivid-dog-81527ac6 | vivid | 狗 | 嗝～肉肉完美光盘！汪！ | 81527ac6 |
| after_eat-vivid-dog-1a42bbfa | vivid | 狗 | 今天也是被小鱼干治愈的一天汪！ | 1a42bbfa |
| after_eat-vivid-dog-30ad2582 | vivid | 狗 | 今天也是被磨牙棒治愈的一天汪！ | 30ad2582 |
| after_eat-vivid-dog-8b33135f | vivid | 狗 | 嗝～罐罐完美光盘！汪！ | 8b33135f |
| after_eat-gentle-cat-092954cb | gentle | 猫 | 吃饱了，心满意足呢喵 | 092954cb |
| after_eat-gentle-cat-f34deba8 | gentle | 猫 | 又摸摸圆滚滚的肚子，好幸福呀 | f34deba8 |
| after_eat-gentle-cat-98d854f7 | gentle | 猫 | 好啦好啦，吃饱了，心满意足呢喵 | 98d854f7 |
| after_eat-gentle-cat-38c03f18 | gentle | 猫 | 咦，摸摸圆滚滚的肚子，好幸福呀 | 38c03f18 |
| after_eat-gentle-cat-c2453ce1 | gentle | 猫 | 今天毛球吃饱了，心满意足呢喵 | c2453ce1 |
| after_eat-gentle-cat-fdf66718 | gentle | 猫 | 摸摸圆滚滚的肚子，好幸福呀 | fdf66718 |
| after_eat-gentle-cat-75ad723e | gentle | 猫 | 又吃饱了，心满意足呢喵 | 75ad723e |
| after_eat-gentle-cat-3825a7bc | gentle | 猫 | 好啦好啦，摸摸圆滚滚的肚子，好幸福呀 | 3825a7bc |
| after_eat-gentle-cat-5cf1948c | gentle | 猫 | 咦，吃饱了，心满意足呢喵 | 5cf1948c |
| after_eat-gentle-cat-8d9e6283 | gentle | 猫 | 今天团团摸摸圆滚滚的肚子，好幸福呀 | 8d9e6283 |
| after_eat-gentle-dog-d85d16f7 | gentle | 狗 | 吃饱了，心满意足呢汪 | d85d16f7 |
| after_eat-gentle-dog-f25eff3c | gentle | 狗 | 慢慢吃完啦汪，今天的也很美味 | f25eff3c |
| after_eat-gentle-dog-a20ca7df | gentle | 狗 | 汪～猫粮很合胃口，谢谢款待 | a20ca7df |
| after_eat-gentle-dog-7762e095 | gentle | 狗 | 好啦好啦，慢慢吃完啦汪，今天的也很美味 | 7762e095 |
| after_eat-gentle-dog-3866b8ae | gentle | 狗 | 又慢慢吃完啦汪，今天的也很美味 | 3866b8ae |
| after_eat-gentle-dog-bb4c1b7d | gentle | 狗 | 汪～蛋黄很合胃口，谢谢款待 | bb4c1b7d |
| after_eat-gentle-dog-9f891d47 | gentle | 狗 | 咦，慢慢吃完啦汪，今天的也很美味 | 9f891d47 |
| after_eat-gentle-dog-18bcbbaa | gentle | 狗 | 又吃饱了，心满意足呢汪 | 18bcbbaa |
| after_eat-gentle-dog-72f94d43 | gentle | 狗 | 汪～狗粮很合胃口，谢谢款待 | 72f94d43 |
| after_eat-gentle-dog-5a7875f2 | gentle | 狗 | 汪～鸡胸肉很合胃口，谢谢款待 | 5a7875f2 |

#### 想玩（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| want_play-soft-cat-e240c39f | soft | 猫 | 那个毛线球看起来好好玩喵…陪我玩嘛 | e240c39f |
| want_play-soft-cat-4d649cbb | soft | 猫 | 又呜…自己玩好无聊，蹭蹭你的手手 | 4d649cbb |
| want_play-soft-cat-2ac8ddd3 | soft | 猫 | 那个激光笔看起来好好玩喵…陪我玩嘛 | 2ac8ddd3 |
| want_play-soft-cat-89cd0b7d | soft | 猫 | 咦，呜…自己玩好无聊，蹭蹭你的手手 | 89cd0b7d |
| want_play-soft-cat-b592c24e | soft | 猫 | 那个纸箱看起来好好玩喵…陪我玩嘛 | b592c24e |
| want_play-soft-cat-7b3c6bfe | soft | 猫 | 呜…自己玩好无聊，蹭蹭你的手手 | 7b3c6bfe |
| want_play-soft-cat-3c63179e | soft | 猫 | 那个磨牙玩具看起来好好玩喵…陪我玩嘛 | 3c63179e |
| want_play-soft-cat-c358e742 | soft | 猫 | 好啦好啦，呜…自己玩好无聊，蹭蹭你的手手 | c358e742 |
| want_play-soft-cat-3fd945cf | soft | 猫 | 那个飞盘看起来好好玩喵…陪我玩嘛 | 3fd945cf |
| want_play-soft-cat-9dcfb49f | soft | 猫 | 今天团团呜…自己玩好无聊，蹭蹭你的手手 | 9dcfb49f |
| want_play-soft-dog-a961af31 | soft | 狗 | 那个毛线球看起来好好玩汪…陪我玩嘛 | a961af31 |
| want_play-soft-dog-4cc9ff68 | soft | 狗 | 又呜呜…自己玩好无聊，扑过来你的手手 | 4cc9ff68 |
| want_play-soft-dog-913653ec | soft | 狗 | 那个激光笔看起来好好玩汪…陪我玩嘛 | 913653ec |
| want_play-soft-dog-2cb1f442 | soft | 狗 | 咦，呜呜…自己玩好无聊，扑过来你的手手 | 2cb1f442 |
| want_play-soft-dog-1a8fbe34 | soft | 狗 | 那个纸箱看起来好好玩汪…陪我玩嘛 | 1a8fbe34 |
| want_play-soft-dog-71595f3a | soft | 狗 | 呜呜…自己玩好无聊，扑过来你的手手 | 71595f3a |
| want_play-soft-dog-560ea80e | soft | 狗 | 那个磨牙玩具看起来好好玩汪…陪我玩嘛 | 560ea80e |
| want_play-soft-dog-75c46457 | soft | 狗 | 好啦好啦，呜呜…自己玩好无聊，扑过来你的手手 | 75c46457 |
| want_play-soft-dog-618b4f07 | soft | 狗 | 那个飞盘看起来好好玩汪…陪我玩嘛 | 618b4f07 |
| want_play-soft-dog-6d8d5fcc | soft | 狗 | 今天团团呜呜…自己玩好无聊，扑过来你的手手 | 6d8d5fcc |
| want_play-vivid-cat-3494fbd8 | vivid | 猫 | 喵！玩毛线球！现在马上立刻！ | 3494fbd8 |
| want_play-vivid-cat-84b6316f | vivid | 猫 | 又快来追我呀，跑起来喵！ | 84b6316f |
| want_play-vivid-cat-f38067de | vivid | 猫 | 喵！玩激光笔！现在马上立刻！ | f38067de |
| want_play-vivid-cat-44335e2b | vivid | 猫 | 咦，快来追我呀，跑起来喵！ | 44335e2b |
| want_play-vivid-cat-df7c8146 | vivid | 猫 | 喵！玩纸箱！现在马上立刻！ | df7c8146 |
| want_play-vivid-cat-1894a1aa | vivid | 猫 | 快来追我呀，跑起来喵！ | 1894a1aa |
| want_play-vivid-cat-6553fa12 | vivid | 猫 | 喵！玩磨牙玩具！现在马上立刻！ | 6553fa12 |
| want_play-vivid-cat-0f3d82c6 | vivid | 猫 | 好啦好啦，快来追我呀，跑起来喵！ | 0f3d82c6 |
| want_play-vivid-cat-5472a852 | vivid | 猫 | 喵！玩飞盘！现在马上立刻！ | 5472a852 |
| want_play-vivid-cat-0dcf90ff | vivid | 猫 | 今天团团快来追我呀，跑起来喵！ | 0dcf90ff |
| want_play-vivid-dog-217e7229 | vivid | 狗 | 汪！玩毛线球！现在马上立刻！ | 217e7229 |
| want_play-vivid-dog-f72f28d3 | vivid | 狗 | 又快来追我呀，跑起来汪！ | f72f28d3 |
| want_play-vivid-dog-785c57d1 | vivid | 狗 | 汪！玩激光笔！现在马上立刻！ | 785c57d1 |
| want_play-vivid-dog-d7ae8e3e | vivid | 狗 | 咦，快来追我呀，跑起来汪！ | d7ae8e3e |
| want_play-vivid-dog-d70a9fab | vivid | 狗 | 汪！玩纸箱！现在马上立刻！ | d70a9fab |
| want_play-vivid-dog-1c50ec43 | vivid | 狗 | 快来追我呀，跑起来汪！ | 1c50ec43 |
| want_play-vivid-dog-3372629e | vivid | 狗 | 汪！玩磨牙玩具！现在马上立刻！ | 3372629e |
| want_play-vivid-dog-cfbd1c98 | vivid | 狗 | 好啦好啦，快来追我呀，跑起来汪！ | cfbd1c98 |
| want_play-vivid-dog-6d4e2481 | vivid | 狗 | 汪！玩飞盘！现在马上立刻！ | 6d4e2481 |
| want_play-vivid-dog-67bc652e | vivid | 狗 | 今天团团快来追我呀，跑起来汪！ | 67bc652e |
| want_play-gentle-cat-bb5de414 | gentle | 猫 | 要不要一起玩毛线球呢？ | bb5de414 |
| want_play-gentle-cat-105269db | gentle | 猫 | 又陪我玩一会儿吧，就一会儿喵 | 105269db |
| want_play-gentle-cat-75dbef6a | gentle | 猫 | 要不要一起玩激光笔呢？ | 75dbef6a |
| want_play-gentle-cat-65c294f9 | gentle | 猫 | 咦，陪我玩一会儿吧，就一会儿喵 | 65c294f9 |
| want_play-gentle-cat-0d0d7154 | gentle | 猫 | 要不要一起玩纸箱呢？ | 0d0d7154 |
| want_play-gentle-cat-14934582 | gentle | 猫 | 陪我玩一会儿吧，就一会儿喵 | 14934582 |
| want_play-gentle-cat-816a282b | gentle | 猫 | 要不要一起玩磨牙玩具呢？ | 816a282b |
| want_play-gentle-cat-f9e8b23e | gentle | 猫 | 好啦好啦，陪我玩一会儿吧，就一会儿喵 | f9e8b23e |
| want_play-gentle-cat-3ef3ad0f | gentle | 猫 | 要不要一起玩飞盘呢？ | 3ef3ad0f |
| want_play-gentle-cat-f5f79fc0 | gentle | 猫 | 今天团团陪我玩一会儿吧，就一会儿喵 | f5f79fc0 |
| want_play-gentle-dog-68fe08fa | gentle | 狗 | 汪～逗猫棒在那边哦，我去叼过来 | 68fe08fa |
| want_play-gentle-dog-9a96290c | gentle | 狗 | 今天玩磨牙玩具好不好呀 | 9a96290c |
| want_play-gentle-dog-51baaa11 | gentle | 狗 | 汪～毛线球在那边哦，我去叼过来 | 51baaa11 |
| want_play-gentle-dog-4b831a2f | gentle | 狗 | 今天玩飞盘好不好呀 | 4b831a2f |
| want_play-gentle-dog-faedafce | gentle | 狗 | 汪～激光笔在那边哦，我去叼过来 | faedafce |
| want_play-gentle-dog-43454679 | gentle | 狗 | 今天玩小球球好不好呀 | 43454679 |
| want_play-gentle-dog-c0eac371 | gentle | 狗 | 汪～纸箱在那边哦，我去叼过来 | c0eac371 |
| want_play-gentle-dog-47544b11 | gentle | 狗 | 今天玩逗猫棒好不好呀 | 47544b11 |
| want_play-gentle-dog-6d62fc38 | gentle | 狗 | 汪～磨牙玩具在那边哦，我去叼过来 | 6d62fc38 |
| want_play-gentle-dog-606fe1bc | gentle | 狗 | 今天玩毛线球好不好呀 | 606fe1bc |

#### 无聊（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| bored-soft-cat-eb1f509c | soft | 猫 | 呜…好无聊哦，理理我嘛喵 | eb1f509c |
| bored-soft-cat-ee79ab90 | soft | 猫 | 又喵…你的手机比我好玩吗 | ee79ab90 |
| bored-soft-cat-950c9c80 | soft | 猫 | 好啦好啦，呜…好无聊哦，理理我嘛喵 | 950c9c80 |
| bored-soft-cat-ec9d37da | soft | 猫 | 咦，喵…你的手机比我好玩吗 | ec9d37da |
| bored-soft-cat-7dcbf3d2 | soft | 猫 | 今天毛球呜…好无聊哦，理理我嘛喵 | 7dcbf3d2 |
| bored-soft-cat-d5338ed0 | soft | 猫 | 喵…你的手机比我好玩吗 | d5338ed0 |
| bored-soft-cat-4376ee7c | soft | 猫 | 又呜…好无聊哦，理理我嘛喵 | 4376ee7c |
| bored-soft-cat-0a85998b | soft | 猫 | 好啦好啦，喵…你的手机比我好玩吗 | 0a85998b |
| bored-soft-cat-00b88f98 | soft | 猫 | 咦，呜…好无聊哦，理理我嘛喵 | 00b88f98 |
| bored-soft-cat-aa1cc489 | soft | 猫 | 今天团团喵…你的手机比我好玩吗 | aa1cc489 |
| bored-soft-dog-d0acdc01 | soft | 狗 | 呜呜…好无聊哦，理理我嘛汪 | d0acdc01 |
| bored-soft-dog-cf2d9cbf | soft | 狗 | 又汪…你的手机比我好玩吗 | cf2d9cbf |
| bored-soft-dog-df9b2d5b | soft | 狗 | 好啦好啦，呜呜…好无聊哦，理理我嘛汪 | df9b2d5b |
| bored-soft-dog-0733ff4c | soft | 狗 | 咦，汪…你的手机比我好玩吗 | 0733ff4c |
| bored-soft-dog-b985d417 | soft | 狗 | 今天毛球呜呜…好无聊哦，理理我嘛汪 | b985d417 |
| bored-soft-dog-cf29ded8 | soft | 狗 | 汪…你的手机比我好玩吗 | cf29ded8 |
| bored-soft-dog-539fb592 | soft | 狗 | 又呜呜…好无聊哦，理理我嘛汪 | 539fb592 |
| bored-soft-dog-55440bd4 | soft | 狗 | 好啦好啦，汪…你的手机比我好玩吗 | 55440bd4 |
| bored-soft-dog-43138e8a | soft | 狗 | 咦，呜呜…好无聊哦，理理我嘛汪 | 43138e8a |
| bored-soft-dog-55af2d26 | soft | 狗 | 今天团团汪…你的手机比我好玩吗 | 55af2d26 |
| bored-vivid-cat-911f5cc1 | vivid | 猫 | 无聊透顶喵！找点乐子！ | 911f5cc1 |
| bored-vivid-cat-2c4d56fa | vivid | 猫 | 又没有节目吗？那我自导自演啦喵！ | 2c4d56fa |
| bored-vivid-cat-c71a4837 | vivid | 猫 | 好啦好啦，无聊透顶喵！找点乐子！ | c71a4837 |
| bored-vivid-cat-0ecbbcea | vivid | 猫 | 咦，没有节目吗？那我自导自演啦喵！ | 0ecbbcea |
| bored-vivid-cat-7302eebd | vivid | 猫 | 今天毛球无聊透顶喵！找点乐子！ | 7302eebd |
| bored-vivid-cat-52bb4015 | vivid | 猫 | 没有节目吗？那我自导自演啦喵！ | 52bb4015 |
| bored-vivid-cat-c6aeda1c | vivid | 猫 | 又无聊透顶喵！找点乐子！ | c6aeda1c |
| bored-vivid-cat-9ade3bc9 | vivid | 猫 | 好啦好啦，没有节目吗？那我自导自演啦喵！ | 9ade3bc9 |
| bored-vivid-cat-f9c381cf | vivid | 猫 | 咦，无聊透顶喵！找点乐子！ | f9c381cf |
| bored-vivid-cat-daeb9de2 | vivid | 猫 | 今天团团没有节目吗？那我自导自演啦喵！ | daeb9de2 |
| bored-vivid-dog-49ffb5b8 | vivid | 狗 | 无聊透顶汪！找点乐子！ | 49ffb5b8 |
| bored-vivid-dog-0491b4f8 | vivid | 狗 | 又没有节目吗？那我自导自演啦汪！ | 0491b4f8 |
| bored-vivid-dog-3109794d | vivid | 狗 | 好啦好啦，无聊透顶汪！找点乐子！ | 3109794d |
| bored-vivid-dog-35fe2ff7 | vivid | 狗 | 咦，没有节目吗？那我自导自演啦汪！ | 35fe2ff7 |
| bored-vivid-dog-a2b918f4 | vivid | 狗 | 今天毛球无聊透顶汪！找点乐子！ | a2b918f4 |
| bored-vivid-dog-aa70ef58 | vivid | 狗 | 没有节目吗？那我自导自演啦汪！ | aa70ef58 |
| bored-vivid-dog-89ee09ec | vivid | 狗 | 又无聊透顶汪！找点乐子！ | 89ee09ec |
| bored-vivid-dog-bfb0a363 | vivid | 狗 | 好啦好啦，没有节目吗？那我自导自演啦汪！ | bfb0a363 |
| bored-vivid-dog-7292f390 | vivid | 狗 | 咦，无聊透顶汪！找点乐子！ | 7292f390 |
| bored-vivid-dog-561c9284 | vivid | 狗 | 今天团团没有节目吗？那我自导自演啦汪！ | 561c9284 |
| bored-gentle-cat-275d5b3f | gentle | 猫 | 有点无聊呢喵，陪我坐会儿吧 | 275d5b3f |
| bored-gentle-cat-5df370b6 | gentle | 猫 | 又喵～发呆的时光也可以很治愈 | 5df370b6 |
| bored-gentle-cat-315e207a | gentle | 猫 | 好啦好啦，有点无聊呢喵，陪我坐会儿吧 | 315e207a |
| bored-gentle-cat-5fbceb43 | gentle | 猫 | 咦，喵～发呆的时光也可以很治愈 | 5fbceb43 |
| bored-gentle-cat-d98513a0 | gentle | 猫 | 今天毛球有点无聊呢喵，陪我坐会儿吧 | d98513a0 |
| bored-gentle-cat-68b476d8 | gentle | 猫 | 喵～发呆的时光也可以很治愈 | 68b476d8 |
| bored-gentle-cat-057ae769 | gentle | 猫 | 又有点无聊呢喵，陪我坐会儿吧 | 057ae769 |
| bored-gentle-cat-2fde8639 | gentle | 猫 | 好啦好啦，喵～发呆的时光也可以很治愈 | 2fde8639 |
| bored-gentle-cat-ade6f861 | gentle | 猫 | 咦，有点无聊呢喵，陪我坐会儿吧 | ade6f861 |
| bored-gentle-cat-06233447 | gentle | 猫 | 今天团团喵～发呆的时光也可以很治愈 | 06233447 |
| bored-gentle-dog-4020d351 | gentle | 狗 | 有点无聊呢汪，陪我坐会儿吧 | 4020d351 |
| bored-gentle-dog-680539ea | gentle | 狗 | 又汪～发呆的时光也可以很治愈 | 680539ea |
| bored-gentle-dog-1271f997 | gentle | 狗 | 好啦好啦，有点无聊呢汪，陪我坐会儿吧 | 1271f997 |
| bored-gentle-dog-7f577796 | gentle | 狗 | 咦，汪～发呆的时光也可以很治愈 | 7f577796 |
| bored-gentle-dog-ae8d2726 | gentle | 狗 | 今天毛球有点无聊呢汪，陪我坐会儿吧 | ae8d2726 |
| bored-gentle-dog-48feddb6 | gentle | 狗 | 汪～发呆的时光也可以很治愈 | 48feddb6 |
| bored-gentle-dog-6a416e42 | gentle | 狗 | 又有点无聊呢汪，陪我坐会儿吧 | 6a416e42 |
| bored-gentle-dog-85e93076 | gentle | 狗 | 好啦好啦，汪～发呆的时光也可以很治愈 | 85e93076 |
| bored-gentle-dog-7a337bec | gentle | 狗 | 咦，有点无聊呢汪，陪我坐会儿吧 | 7a337bec |
| bored-gentle-dog-80901147 | gentle | 狗 | 今天团团汪～发呆的时光也可以很治愈 | 80901147 |

#### 困了（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| sleepy-soft-cat-f7706f24 | soft | 猫 | 呜…眼皮打架了喵，我先睡啦 | f7706f24 |
| sleepy-soft-cat-34a89c2d | soft | 猫 | 又喵…今天的阳光晒得我好困 | 34a89c2d |
| sleepy-soft-cat-017ee8fc | soft | 猫 | 好啦好啦，呜…眼皮打架了喵，我先睡啦 | 017ee8fc |
| sleepy-soft-cat-e830dca5 | soft | 猫 | 咦，喵…今天的阳光晒得我好困 | e830dca5 |
| sleepy-soft-cat-1b94d68e | soft | 猫 | 今天毛球呜…眼皮打架了喵，我先睡啦 | 1b94d68e |
| sleepy-soft-cat-21d40ce7 | soft | 猫 | 喵…今天的阳光晒得我好困 | 21d40ce7 |
| sleepy-soft-cat-e88c819d | soft | 猫 | 又呜…眼皮打架了喵，我先睡啦 | e88c819d |
| sleepy-soft-cat-df578712 | soft | 猫 | 好啦好啦，喵…今天的阳光晒得我好困 | df578712 |
| sleepy-soft-cat-e4c63424 | soft | 猫 | 咦，呜…眼皮打架了喵，我先睡啦 | e4c63424 |
| sleepy-soft-cat-3c998bbb | soft | 猫 | 今天团团喵…今天的阳光晒得我好困 | 3c998bbb |
| sleepy-soft-dog-834b632e | soft | 狗 | 呜呜…眼皮打架了汪，我先睡啦 | 834b632e |
| sleepy-soft-dog-f9a6e5cd | soft | 狗 | 又汪…今天的阳光晒得我好困 | f9a6e5cd |
| sleepy-soft-dog-b02ec7cc | soft | 狗 | 好啦好啦，呜呜…眼皮打架了汪，我先睡啦 | b02ec7cc |
| sleepy-soft-dog-a208c1f2 | soft | 狗 | 咦，汪…今天的阳光晒得我好困 | a208c1f2 |
| sleepy-soft-dog-70c5e8c5 | soft | 狗 | 今天毛球呜呜…眼皮打架了汪，我先睡啦 | 70c5e8c5 |
| sleepy-soft-dog-5d273b75 | soft | 狗 | 汪…今天的阳光晒得我好困 | 5d273b75 |
| sleepy-soft-dog-b11a1564 | soft | 狗 | 又呜呜…眼皮打架了汪，我先睡啦 | b11a1564 |
| sleepy-soft-dog-69b6294d | soft | 狗 | 好啦好啦，汪…今天的阳光晒得我好困 | 69b6294d |
| sleepy-soft-dog-95015d9a | soft | 狗 | 咦，呜呜…眼皮打架了汪，我先睡啦 | 95015d9a |
| sleepy-soft-dog-c1ecb70b | soft | 狗 | 今天团团汪…今天的阳光晒得我好困 | c1ecb70b |
| sleepy-vivid-cat-6a7b6f9f | vivid | 猫 | 困了但是还想玩喵！再战五百回合！ | 6a7b6f9f |
| sleepy-vivid-cat-58ec5487 | vivid | 猫 | 又哈欠——不行了，撑不住了喵！ | 58ec5487 |
| sleepy-vivid-cat-99f249da | vivid | 猫 | 好啦好啦，困了但是还想玩喵！再战五百回合！ | 99f249da |
| sleepy-vivid-cat-d71ae335 | vivid | 猫 | 咦，哈欠——不行了，撑不住了喵！ | d71ae335 |
| sleepy-vivid-cat-18625971 | vivid | 猫 | 今天毛球困了但是还想玩喵！再战五百回合！ | 18625971 |
| sleepy-vivid-cat-8929791d | vivid | 猫 | 哈欠——不行了，撑不住了喵！ | 8929791d |
| sleepy-vivid-cat-d7eb96d3 | vivid | 猫 | 又困了但是还想玩喵！再战五百回合！ | d7eb96d3 |
| sleepy-vivid-cat-c52b1e35 | vivid | 猫 | 好啦好啦，哈欠——不行了，撑不住了喵！ | c52b1e35 |
| sleepy-vivid-cat-d1d00525 | vivid | 猫 | 咦，困了但是还想玩喵！再战五百回合！ | d1d00525 |
| sleepy-vivid-cat-c0db8f7d | vivid | 猫 | 今天团团哈欠——不行了，撑不住了喵！ | c0db8f7d |
| sleepy-vivid-dog-b33a3ad9 | vivid | 狗 | 困了但是还想玩汪！再战五百回合！ | b33a3ad9 |
| sleepy-vivid-dog-2dc5e584 | vivid | 狗 | 又哈欠——不行了，撑不住了汪！ | 2dc5e584 |
| sleepy-vivid-dog-6ca57879 | vivid | 狗 | 好啦好啦，困了但是还想玩汪！再战五百回合！ | 6ca57879 |
| sleepy-vivid-dog-7c5a3949 | vivid | 狗 | 咦，哈欠——不行了，撑不住了汪！ | 7c5a3949 |
| sleepy-vivid-dog-d4251d10 | vivid | 狗 | 今天毛球困了但是还想玩汪！再战五百回合！ | d4251d10 |
| sleepy-vivid-dog-c4de6c9e | vivid | 狗 | 哈欠——不行了，撑不住了汪！ | c4de6c9e |
| sleepy-vivid-dog-a526ff29 | vivid | 狗 | 又困了但是还想玩汪！再战五百回合！ | a526ff29 |
| sleepy-vivid-dog-602592ba | vivid | 狗 | 好啦好啦，哈欠——不行了，撑不住了汪！ | 602592ba |
| sleepy-vivid-dog-77d45651 | vivid | 狗 | 咦，困了但是还想玩汪！再战五百回合！ | 77d45651 |
| sleepy-vivid-dog-81dddeef | vivid | 狗 | 今天团团哈欠——不行了，撑不住了汪！ | 81dddeef |
| sleepy-gentle-cat-231b22a1 | gentle | 猫 | 困了呢喵，晚安安 | 231b22a1 |
| sleepy-gentle-cat-610cd0ca | gentle | 猫 | 又喵～早点休息哦主人 | 610cd0ca |
| sleepy-gentle-cat-4da89383 | gentle | 猫 | 好啦好啦，困了呢喵，晚安安 | 4da89383 |
| sleepy-gentle-cat-17bf9a6f | gentle | 猫 | 咦，喵～早点休息哦主人 | 17bf9a6f |
| sleepy-gentle-cat-4d4a8295 | gentle | 猫 | 今天毛球困了呢喵，晚安安 | 4d4a8295 |
| sleepy-gentle-cat-16ebdac8 | gentle | 猫 | 喵～早点休息哦主人 | 16ebdac8 |
| sleepy-gentle-cat-cc791bcb | gentle | 猫 | 又困了呢喵，晚安安 | cc791bcb |
| sleepy-gentle-cat-7be1f87e | gentle | 猫 | 好啦好啦，喵～早点休息哦主人 | 7be1f87e |
| sleepy-gentle-cat-cf6e3292 | gentle | 猫 | 咦，困了呢喵，晚安安 | cf6e3292 |
| sleepy-gentle-cat-36955173 | gentle | 猫 | 今天团团喵～早点休息哦主人 | 36955173 |
| sleepy-gentle-dog-330119d4 | gentle | 狗 | 困了呢汪，晚安安 | 330119d4 |
| sleepy-gentle-dog-49245551 | gentle | 狗 | 又汪～早点休息哦主人 | 49245551 |
| sleepy-gentle-dog-a63c041d | gentle | 狗 | 好啦好啦，困了呢汪，晚安安 | a63c041d |
| sleepy-gentle-dog-ee878a06 | gentle | 狗 | 咦，汪～早点休息哦主人 | ee878a06 |
| sleepy-gentle-dog-b7ae283b | gentle | 狗 | 今天毛球困了呢汪，晚安安 | b7ae283b |
| sleepy-gentle-dog-858f5271 | gentle | 狗 | 汪～早点休息哦主人 | 858f5271 |
| sleepy-gentle-dog-31b27055 | gentle | 狗 | 又困了呢汪，晚安安 | 31b27055 |
| sleepy-gentle-dog-38277461 | gentle | 狗 | 好啦好啦，汪～早点休息哦主人 | 38277461 |
| sleepy-gentle-dog-97e86d4f | gentle | 狗 | 咦，困了呢汪，晚安安 | 97e86d4f |
| sleepy-gentle-dog-ceb17f2b | gentle | 狗 | 今天团团汪～早点休息哦主人 | ceb17f2b |

#### 被摸头（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| petted-soft-cat-f6c4e337 | soft | 猫 | 呼噜呼噜…就是这里喵，别停 | f6c4e337 |
| petted-soft-cat-83118146 | soft | 猫 | 又呼噜呼噜…主人的手手好温暖 | 83118146 |
| petted-soft-cat-affa9878 | soft | 猫 | 好啦好啦，呼噜呼噜…就是这里喵，别停 | affa9878 |
| petted-soft-cat-9b6cda73 | soft | 猫 | 咦，呼噜呼噜…主人的手手好温暖 | 9b6cda73 |
| petted-soft-cat-8de66157 | soft | 猫 | 今天毛球呼噜呼噜…就是这里喵，别停 | 8de66157 |
| petted-soft-cat-1700ce65 | soft | 猫 | 呼噜呼噜…主人的手手好温暖 | 1700ce65 |
| petted-soft-cat-33dd170e | soft | 猫 | 又呼噜呼噜…就是这里喵，别停 | 33dd170e |
| petted-soft-cat-d596cf4e | soft | 猫 | 好啦好啦，呼噜呼噜…主人的手手好温暖 | d596cf4e |
| petted-soft-cat-4ce9babe | soft | 猫 | 咦，呼噜呼噜…就是这里喵，别停 | 4ce9babe |
| petted-soft-cat-abf08feb | soft | 猫 | 今天团团呼噜呼噜…主人的手手好温暖 | abf08feb |
| petted-soft-dog-3061b562 | soft | 狗 | 哼哼唧唧…就是这里汪，别停 | 3061b562 |
| petted-soft-dog-4e4bbf44 | soft | 狗 | 又哼哼唧唧…主人的手手好温暖 | 4e4bbf44 |
| petted-soft-dog-f99c4465 | soft | 狗 | 好啦好啦，哼哼唧唧…就是这里汪，别停 | f99c4465 |
| petted-soft-dog-89112250 | soft | 狗 | 咦，哼哼唧唧…主人的手手好温暖 | 89112250 |
| petted-soft-dog-114471f2 | soft | 狗 | 今天毛球哼哼唧唧…就是这里汪，别停 | 114471f2 |
| petted-soft-dog-3be8bc45 | soft | 狗 | 哼哼唧唧…主人的手手好温暖 | 3be8bc45 |
| petted-soft-dog-4829eaee | soft | 狗 | 又哼哼唧唧…就是这里汪，别停 | 4829eaee |
| petted-soft-dog-aafd16c9 | soft | 狗 | 好啦好啦，哼哼唧唧…主人的手手好温暖 | aafd16c9 |
| petted-soft-dog-14d304a0 | soft | 狗 | 咦，哼哼唧唧…就是这里汪，别停 | 14d304a0 |
| petted-soft-dog-bf29de1d | soft | 狗 | 今天团团哼哼唧唧…主人的手手好温暖 | bf29de1d |
| petted-vivid-cat-4122cbcf | vivid | 猫 | 喵！舒服到原地转圈圈！ | 4122cbcf |
| petted-vivid-cat-5a44e7af | vivid | 猫 | 又喵！摸头杀我最受不住了！ | 5a44e7af |
| petted-vivid-cat-dadced44 | vivid | 猫 | 好啦好啦，喵！舒服到原地转圈圈！ | dadced44 |
| petted-vivid-cat-ea7c57f7 | vivid | 猫 | 咦，喵！摸头杀我最受不住了！ | ea7c57f7 |
| petted-vivid-cat-aed8e359 | vivid | 猫 | 今天毛球喵！舒服到原地转圈圈！ | aed8e359 |
| petted-vivid-cat-033b7ba1 | vivid | 猫 | 喵！摸头杀我最受不住了！ | 033b7ba1 |
| petted-vivid-cat-3d891be4 | vivid | 猫 | 又喵！舒服到原地转圈圈！ | 3d891be4 |
| petted-vivid-cat-4a8c2e16 | vivid | 猫 | 好啦好啦，喵！摸头杀我最受不住了！ | 4a8c2e16 |
| petted-vivid-cat-bf64a0f0 | vivid | 猫 | 咦，喵！舒服到原地转圈圈！ | bf64a0f0 |
| petted-vivid-cat-8722c0bd | vivid | 猫 | 今天团团喵！摸头杀我最受不住了！ | 8722c0bd |
| petted-vivid-dog-977a9910 | vivid | 狗 | 汪！舒服到原地转圈圈！ | 977a9910 |
| petted-vivid-dog-45a14bf5 | vivid | 狗 | 又汪！摸头杀我最受不住了！ | 45a14bf5 |
| petted-vivid-dog-eac59eee | vivid | 狗 | 好啦好啦，汪！舒服到原地转圈圈！ | eac59eee |
| petted-vivid-dog-95f9812e | vivid | 狗 | 咦，汪！摸头杀我最受不住了！ | 95f9812e |
| petted-vivid-dog-06c4d411 | vivid | 狗 | 今天毛球汪！舒服到原地转圈圈！ | 06c4d411 |
| petted-vivid-dog-393cbf31 | vivid | 狗 | 汪！摸头杀我最受不住了！ | 393cbf31 |
| petted-vivid-dog-4b89fec2 | vivid | 狗 | 又汪！舒服到原地转圈圈！ | 4b89fec2 |
| petted-vivid-dog-1be939ba | vivid | 狗 | 好啦好啦，汪！摸头杀我最受不住了！ | 1be939ba |
| petted-vivid-dog-5bdc14b6 | vivid | 狗 | 咦，汪！舒服到原地转圈圈！ | 5bdc14b6 |
| petted-vivid-dog-05835b3c | vivid | 狗 | 今天团团汪！摸头杀我最受不住了！ | 05835b3c |
| petted-gentle-cat-e1479370 | gentle | 猫 | 呼噜呼噜…最喜欢这样安静的时刻喵 | e1479370 |
| petted-gentle-cat-3707e12e | gentle | 猫 | 又谢谢你喵，我很安心 | 3707e12e |
| petted-gentle-cat-10598050 | gentle | 猫 | 好啦好啦，呼噜呼噜…最喜欢这样安静的时刻喵 | 10598050 |
| petted-gentle-cat-6e1628e4 | gentle | 猫 | 咦，谢谢你喵，我很安心 | 6e1628e4 |
| petted-gentle-cat-c60171d6 | gentle | 猫 | 今天毛球呼噜呼噜…最喜欢这样安静的时刻喵 | c60171d6 |
| petted-gentle-cat-4f63a799 | gentle | 猫 | 谢谢你喵，我很安心 | 4f63a799 |
| petted-gentle-cat-da157377 | gentle | 猫 | 又呼噜呼噜…最喜欢这样安静的时刻喵 | da157377 |
| petted-gentle-cat-27f7f28f | gentle | 猫 | 好啦好啦，谢谢你喵，我很安心 | 27f7f28f |
| petted-gentle-cat-d51e26b0 | gentle | 猫 | 咦，呼噜呼噜…最喜欢这样安静的时刻喵 | d51e26b0 |
| petted-gentle-cat-264f5677 | gentle | 猫 | 今天团团谢谢你喵，我很安心 | 264f5677 |
| petted-gentle-dog-ef0dbe52 | gentle | 狗 | 哼哼唧唧…最喜欢这样安静的时刻汪 | ef0dbe52 |
| petted-gentle-dog-330f35ac | gentle | 狗 | 又谢谢你汪，我很安心 | 330f35ac |
| petted-gentle-dog-a55bd22b | gentle | 狗 | 好啦好啦，哼哼唧唧…最喜欢这样安静的时刻汪 | a55bd22b |
| petted-gentle-dog-8ad0282e | gentle | 狗 | 咦，谢谢你汪，我很安心 | 8ad0282e |
| petted-gentle-dog-16311fe6 | gentle | 狗 | 今天毛球哼哼唧唧…最喜欢这样安静的时刻汪 | 16311fe6 |
| petted-gentle-dog-dc23c347 | gentle | 狗 | 谢谢你汪，我很安心 | dc23c347 |
| petted-gentle-dog-3b799ea6 | gentle | 狗 | 又哼哼唧唧…最喜欢这样安静的时刻汪 | 3b799ea6 |
| petted-gentle-dog-f9fff11f | gentle | 狗 | 好啦好啦，谢谢你汪，我很安心 | f9fff11f |
| petted-gentle-dog-7a20eda5 | gentle | 狗 | 咦，哼哼唧唧…最喜欢这样安静的时刻汪 | 7a20eda5 |
| petted-gentle-dog-fb44a46c | gentle | 狗 | 今天团团谢谢你汪，我很安心 | fb44a46c |

#### 被夸奖（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| praised-soft-cat-7b34e50e | soft | 猫 | 嘿嘿…被夸了喵，害羞 | 7b34e50e |
| praised-soft-cat-5187ae28 | soft | 猫 | 又呜…其实我也觉得自己很棒喵 | 5187ae28 |
| praised-soft-cat-65497197 | soft | 猫 | 好啦好啦，嘿嘿…被夸了喵，害羞 | 65497197 |
| praised-soft-cat-6c0da867 | soft | 猫 | 咦，呜…其实我也觉得自己很棒喵 | 6c0da867 |
| praised-soft-cat-86f54fb7 | soft | 猫 | 今天毛球嘿嘿…被夸了喵，害羞 | 86f54fb7 |
| praised-soft-cat-9b625325 | soft | 猫 | 呜…其实我也觉得自己很棒喵 | 9b625325 |
| praised-soft-cat-439f9629 | soft | 猫 | 又嘿嘿…被夸了喵，害羞 | 439f9629 |
| praised-soft-cat-bb5e71e6 | soft | 猫 | 好啦好啦，呜…其实我也觉得自己很棒喵 | bb5e71e6 |
| praised-soft-cat-ee2b28b8 | soft | 猫 | 咦，嘿嘿…被夸了喵，害羞 | ee2b28b8 |
| praised-soft-cat-6d2aa10c | soft | 猫 | 今天团团呜…其实我也觉得自己很棒喵 | 6d2aa10c |
| praised-soft-dog-fe0ecad2 | soft | 狗 | 嘿嘿…被夸了汪，害羞 | fe0ecad2 |
| praised-soft-dog-ddac258a | soft | 狗 | 又呜呜…其实我也觉得自己很棒汪 | ddac258a |
| praised-soft-dog-8e5585b9 | soft | 狗 | 好啦好啦，嘿嘿…被夸了汪，害羞 | 8e5585b9 |
| praised-soft-dog-6401b7a4 | soft | 狗 | 咦，呜呜…其实我也觉得自己很棒汪 | 6401b7a4 |
| praised-soft-dog-4c9f6dfd | soft | 狗 | 今天毛球嘿嘿…被夸了汪，害羞 | 4c9f6dfd |
| praised-soft-dog-1a2bf0eb | soft | 狗 | 呜呜…其实我也觉得自己很棒汪 | 1a2bf0eb |
| praised-soft-dog-388ceb39 | soft | 狗 | 又嘿嘿…被夸了汪，害羞 | 388ceb39 |
| praised-soft-dog-1cc60d7a | soft | 狗 | 好啦好啦，呜呜…其实我也觉得自己很棒汪 | 1cc60d7a |
| praised-soft-dog-5b52cf7f | soft | 狗 | 咦，嘿嘿…被夸了汪，害羞 | 5b52cf7f |
| praised-soft-dog-cacf20c6 | soft | 狗 | 今天团团呜呜…其实我也觉得自己很棒汪 | cacf20c6 |
| praised-vivid-cat-5bd18a8c | vivid | 猫 | 喵！当然啦，本猫可是最棒的！ | 5bd18a8c |
| praised-vivid-cat-7a39dfe2 | vivid | 猫 | 又喵！那是！也不看看是谁！ | 7a39dfe2 |
| praised-vivid-cat-276b8e8d | vivid | 猫 | 好啦好啦，喵！当然啦，本猫可是最棒的！ | 276b8e8d |
| praised-vivid-cat-5b50c5ac | vivid | 猫 | 咦，喵！那是！也不看看是谁！ | 5b50c5ac |
| praised-vivid-cat-67204b6d | vivid | 猫 | 今天毛球喵！当然啦，本猫可是最棒的！ | 67204b6d |
| praised-vivid-cat-9d30377b | vivid | 猫 | 喵！那是！也不看看是谁！ | 9d30377b |
| praised-vivid-cat-13c9a5bd | vivid | 猫 | 又喵！当然啦，本猫可是最棒的！ | 13c9a5bd |
| praised-vivid-cat-e3abbf54 | vivid | 猫 | 好啦好啦，喵！那是！也不看看是谁！ | e3abbf54 |
| praised-vivid-cat-af31217f | vivid | 猫 | 咦，喵！当然啦，本猫可是最棒的！ | af31217f |
| praised-vivid-cat-8abd1173 | vivid | 猫 | 今天团团喵！那是！也不看看是谁！ | 8abd1173 |
| praised-vivid-dog-a234fdd2 | vivid | 狗 | 汪！当然啦，本狗可是最棒的！ | a234fdd2 |
| praised-vivid-dog-e4251f1e | vivid | 狗 | 又汪！那是！也不看看是谁！ | e4251f1e |
| praised-vivid-dog-54e2794f | vivid | 狗 | 好啦好啦，汪！当然啦，本狗可是最棒的！ | 54e2794f |
| praised-vivid-dog-e5957676 | vivid | 狗 | 咦，汪！那是！也不看看是谁！ | e5957676 |
| praised-vivid-dog-d5b2be63 | vivid | 狗 | 今天毛球汪！当然啦，本狗可是最棒的！ | d5b2be63 |
| praised-vivid-dog-c9dc9b72 | vivid | 狗 | 汪！那是！也不看看是谁！ | c9dc9b72 |
| praised-vivid-dog-1d2af992 | vivid | 狗 | 又汪！当然啦，本狗可是最棒的！ | 1d2af992 |
| praised-vivid-dog-e350697b | vivid | 狗 | 好啦好啦，汪！那是！也不看看是谁！ | e350697b |
| praised-vivid-dog-c13681f5 | vivid | 狗 | 咦，汪！当然啦，本狗可是最棒的！ | c13681f5 |
| praised-vivid-dog-0a6ff129 | vivid | 狗 | 今天团团汪！那是！也不看看是谁！ | 0a6ff129 |
| praised-gentle-cat-379474e9 | gentle | 猫 | 谢谢主人的夸奖喵，我会继续努力的 | 379474e9 |
| praised-gentle-cat-d8e04b57 | gentle | 猫 | 又嗯嗯，我会记住的喵 | d8e04b57 |
| praised-gentle-cat-a45aeeca | gentle | 猫 | 好啦好啦，谢谢主人的夸奖喵，我会继续努力的 | a45aeeca |
| praised-gentle-cat-42ffe2b5 | gentle | 猫 | 咦，嗯嗯，我会记住的喵 | 42ffe2b5 |
| praised-gentle-cat-d31187cf | gentle | 猫 | 今天毛球谢谢主人的夸奖喵，我会继续努力的 | d31187cf |
| praised-gentle-cat-12590732 | gentle | 猫 | 嗯嗯，我会记住的喵 | 12590732 |
| praised-gentle-cat-d0e1c9a5 | gentle | 猫 | 又谢谢主人的夸奖喵，我会继续努力的 | d0e1c9a5 |
| praised-gentle-cat-e050c7bc | gentle | 猫 | 好啦好啦，嗯嗯，我会记住的喵 | e050c7bc |
| praised-gentle-cat-b9aec866 | gentle | 猫 | 咦，谢谢主人的夸奖喵，我会继续努力的 | b9aec866 |
| praised-gentle-cat-600540c9 | gentle | 猫 | 今天团团嗯嗯，我会记住的喵 | 600540c9 |
| praised-gentle-dog-32458ba1 | gentle | 狗 | 谢谢主人的夸奖汪，我会继续努力的 | 32458ba1 |
| praised-gentle-dog-61e4e178 | gentle | 狗 | 又嗯嗯，我会记住的汪 | 61e4e178 |
| praised-gentle-dog-f3155286 | gentle | 狗 | 好啦好啦，谢谢主人的夸奖汪，我会继续努力的 | f3155286 |
| praised-gentle-dog-53dfe818 | gentle | 狗 | 咦，嗯嗯，我会记住的汪 | 53dfe818 |
| praised-gentle-dog-675f0c79 | gentle | 狗 | 今天毛球谢谢主人的夸奖汪，我会继续努力的 | 675f0c79 |
| praised-gentle-dog-99f17734 | gentle | 狗 | 嗯嗯，我会记住的汪 | 99f17734 |
| praised-gentle-dog-f1329828 | gentle | 狗 | 又谢谢主人的夸奖汪，我会继续努力的 | f1329828 |
| praised-gentle-dog-42512380 | gentle | 狗 | 好啦好啦，嗯嗯，我会记住的汪 | 42512380 |
| praised-gentle-dog-eda84079 | gentle | 狗 | 咦，谢谢主人的夸奖汪，我会继续努力的 | eda84079 |
| praised-gentle-dog-037bfb52 | gentle | 狗 | 今天团团嗯嗯，我会记住的汪 | 037bfb52 |

#### 生气/不满（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| annoyed-soft-cat-f026eb44 | soft | 猫 | 呜…不理你了哦，哼 | f026eb44 |
| annoyed-soft-cat-2d562e74 | soft | 猫 | 呜…{毛球}生气了，后果很严重 | 2d562e74 |
| annoyed-soft-cat-a018f7cd | soft | 猫 | 好啦好啦，呜…不理你了哦，哼 | a018f7cd |
| annoyed-soft-cat-50ff7665 | soft | 猫 | 呜…{团团}生气了，后果很严重 | 50ff7665 |
| annoyed-soft-cat-7d0e665b | soft | 猫 | 今天毛球呜…不理你了哦，哼 | 7d0e665b |
| annoyed-soft-cat-ff5d145a | soft | 猫 | 呜…{小团子}生气了，后果很严重 | ff5d145a |
| annoyed-soft-cat-38a54ab2 | soft | 猫 | 又呜…不理你了哦，哼 | 38a54ab2 |
| annoyed-soft-cat-ab2755b7 | soft | 猫 | 喵…这次的狗粮不合胃口啦 | ab2755b7 |
| annoyed-soft-cat-813d298b | soft | 猫 | 好啦好啦，喵…为什么不陪我玩嘛 | 813d298b |
| annoyed-soft-cat-158322de | soft | 猫 | 又喵…为什么不陪我玩嘛 | 158322de |
| annoyed-soft-dog-1dae8eaf | soft | 狗 | 呜呜…不理你了哦，哼 | 1dae8eaf |
| annoyed-soft-dog-a93813ba | soft | 狗 | 呜呜…{毛球}生气了，后果很严重 | a93813ba |
| annoyed-soft-dog-ecbd01db | soft | 狗 | 好啦好啦，呜呜…不理你了哦，哼 | ecbd01db |
| annoyed-soft-dog-2566f871 | soft | 狗 | 呜呜…{团团}生气了，后果很严重 | 2566f871 |
| annoyed-soft-dog-b9a20688 | soft | 狗 | 今天毛球呜呜…不理你了哦，哼 | b9a20688 |
| annoyed-soft-dog-9b2394c3 | soft | 狗 | 呜呜…{小团子}生气了，后果很严重 | 9b2394c3 |
| annoyed-soft-dog-dbcf8e3d | soft | 狗 | 又呜呜…不理你了哦，哼 | dbcf8e3d |
| annoyed-soft-dog-c80ae0dc | soft | 狗 | 汪…这次的狗粮不合胃口啦 | c80ae0dc |
| annoyed-soft-dog-7466b2d0 | soft | 狗 | 好啦好啦，汪…为什么不陪我玩嘛 | 7466b2d0 |
| annoyed-soft-dog-1d29fd06 | soft | 狗 | 又汪…为什么不陪我玩嘛 | 1d29fd06 |
| annoyed-vivid-cat-d9160d91 | vivid | 猫 | 喵！本猫生气了！很凶的那种！ | d9160d91 |
| annoyed-vivid-cat-d3551a2c | vivid | 猫 | 又喵！再不陪我玩就要拆家咯！ | d3551a2c |
| annoyed-vivid-cat-403b3c76 | vivid | 猫 | 好啦好啦，喵！本猫生气了！很凶的那种！ | 403b3c76 |
| annoyed-vivid-cat-d7d82f03 | vivid | 猫 | 咦，喵！再不陪我玩就要拆家咯！ | d7d82f03 |
| annoyed-vivid-cat-477dd2bb | vivid | 猫 | 今天毛球喵！本猫生气了！很凶的那种！ | 477dd2bb |
| annoyed-vivid-cat-986e3417 | vivid | 猫 | 喵！再不陪我玩就要拆家咯！ | 986e3417 |
| annoyed-vivid-cat-371d2f0a | vivid | 猫 | 又喵！本猫生气了！很凶的那种！ | 371d2f0a |
| annoyed-vivid-cat-5beea781 | vivid | 猫 | 好啦好啦，喵！再不陪我玩就要拆家咯！ | 5beea781 |
| annoyed-vivid-cat-d3348c0a | vivid | 猫 | 咦，喵！本猫生气了！很凶的那种！ | d3348c0a |
| annoyed-vivid-cat-5a457a21 | vivid | 猫 | 今天团团喵！再不陪我玩就要拆家咯！ | 5a457a21 |
| annoyed-vivid-dog-9957e5db | vivid | 狗 | 汪！本狗生气了！很凶的那种！ | 9957e5db |
| annoyed-vivid-dog-86894f67 | vivid | 狗 | 又汪！再不陪我玩就要拆家咯！ | 86894f67 |
| annoyed-vivid-dog-a682db01 | vivid | 狗 | 好啦好啦，汪！本狗生气了！很凶的那种！ | a682db01 |
| annoyed-vivid-dog-cde81244 | vivid | 狗 | 咦，汪！再不陪我玩就要拆家咯！ | cde81244 |
| annoyed-vivid-dog-53786187 | vivid | 狗 | 今天毛球汪！本狗生气了！很凶的那种！ | 53786187 |
| annoyed-vivid-dog-97726b3e | vivid | 狗 | 汪！再不陪我玩就要拆家咯！ | 97726b3e |
| annoyed-vivid-dog-d9b01bda | vivid | 狗 | 又汪！本狗生气了！很凶的那种！ | d9b01bda |
| annoyed-vivid-dog-8b6da306 | vivid | 狗 | 好啦好啦，汪！再不陪我玩就要拆家咯！ | 8b6da306 |
| annoyed-vivid-dog-61c6ba56 | vivid | 狗 | 咦，汪！本狗生气了！很凶的那种！ | 61c6ba56 |
| annoyed-vivid-dog-c854219d | vivid | 狗 | 今天团团汪！再不陪我玩就要拆家咯！ | c854219d |
| annoyed-gentle-cat-f3f0fe77 | gentle | 猫 | 喵…有一点点不开心了哦 | f3f0fe77 |
| annoyed-gentle-cat-76791598 | gentle | 猫 | 又喵…下次记得早点回家嘛 | 76791598 |
| annoyed-gentle-cat-73d99b0f | gentle | 猫 | 好啦好啦，喵…有一点点不开心了哦 | 73d99b0f |
| annoyed-gentle-cat-d33bc9d3 | gentle | 猫 | 咦，喵…下次记得早点回家嘛 | d33bc9d3 |
| annoyed-gentle-cat-15c99d8f | gentle | 猫 | 今天毛球喵…有一点点不开心了哦 | 15c99d8f |
| annoyed-gentle-cat-0737bfc8 | gentle | 猫 | 喵…下次记得早点回家嘛 | 0737bfc8 |
| annoyed-gentle-cat-48473471 | gentle | 猫 | 又喵…有一点点不开心了哦 | 48473471 |
| annoyed-gentle-cat-15960d6f | gentle | 猫 | 好啦好啦，喵…下次记得早点回家嘛 | 15960d6f |
| annoyed-gentle-cat-a80ed99a | gentle | 猫 | 咦，喵…有一点点不开心了哦 | a80ed99a |
| annoyed-gentle-cat-942d43a9 | gentle | 猫 | 今天团团喵…下次记得早点回家嘛 | 942d43a9 |
| annoyed-gentle-dog-4a16af21 | gentle | 狗 | 汪…有一点点不开心了哦 | 4a16af21 |
| annoyed-gentle-dog-7820db61 | gentle | 狗 | 又汪…下次记得早点回家嘛 | 7820db61 |
| annoyed-gentle-dog-6ea5060d | gentle | 狗 | 好啦好啦，汪…有一点点不开心了哦 | 6ea5060d |
| annoyed-gentle-dog-65366f44 | gentle | 狗 | 咦，汪…下次记得早点回家嘛 | 65366f44 |
| annoyed-gentle-dog-2eaa09ba | gentle | 狗 | 今天毛球汪…有一点点不开心了哦 | 2eaa09ba |
| annoyed-gentle-dog-c12b34c7 | gentle | 狗 | 汪…下次记得早点回家嘛 | c12b34c7 |
| annoyed-gentle-dog-9694c3cd | gentle | 狗 | 又汪…有一点点不开心了哦 | 9694c3cd |
| annoyed-gentle-dog-9fc780a8 | gentle | 狗 | 好啦好啦，汪…下次记得早点回家嘛 | 9fc780a8 |
| annoyed-gentle-dog-bf8bebc7 | gentle | 狗 | 咦，汪…有一点点不开心了哦 | bf8bebc7 |
| annoyed-gentle-dog-98a13a2b | gentle | 狗 | 今天团团汪…下次记得早点回家嘛 | 98a13a2b |

#### 清洁后（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| after_clean-soft-cat-0bed9290 | soft | 猫 | 洗澡澡好累喵…但是香香的 | 0bed9290 |
| after_clean-soft-cat-636d532c | soft | 猫 | 又喵…现在是最干净的小猫 | 636d532c |
| after_clean-soft-cat-8b69abca | soft | 猫 | 好啦好啦，洗澡澡好累喵…但是香香的 | 8b69abca |
| after_clean-soft-cat-6811f786 | soft | 猫 | 咦，喵…现在是最干净的小猫 | 6811f786 |
| after_clean-soft-cat-18cd302b | soft | 猫 | 今天毛球洗澡澡好累喵…但是香香的 | 18cd302b |
| after_clean-soft-cat-25bce249 | soft | 猫 | 喵…现在是最干净的小猫 | 25bce249 |
| after_clean-soft-cat-9d665d64 | soft | 猫 | 又洗澡澡好累喵…但是香香的 | 9d665d64 |
| after_clean-soft-cat-54bc142d | soft | 猫 | 好啦好啦，喵…现在是最干净的小猫 | 54bc142d |
| after_clean-soft-cat-11fcc2d4 | soft | 猫 | 咦，洗澡澡好累喵…但是香香的 | 11fcc2d4 |
| after_clean-soft-cat-2b8db776 | soft | 猫 | 今天团团喵…现在是最干净的小猫 | 2b8db776 |
| after_clean-soft-dog-3627d467 | soft | 狗 | 洗澡澡好累汪…但是香香的 | 3627d467 |
| after_clean-soft-dog-e0bfddb3 | soft | 狗 | 又汪…现在是最干净的小狗 | e0bfddb3 |
| after_clean-soft-dog-9e81bcf2 | soft | 狗 | 好啦好啦，洗澡澡好累汪…但是香香的 | 9e81bcf2 |
| after_clean-soft-dog-edac665b | soft | 狗 | 咦，汪…现在是最干净的小狗 | edac665b |
| after_clean-soft-dog-a07f631d | soft | 狗 | 今天毛球洗澡澡好累汪…但是香香的 | a07f631d |
| after_clean-soft-dog-017d1a1e | soft | 狗 | 汪…现在是最干净的小狗 | 017d1a1e |
| after_clean-soft-dog-5fb72f7e | soft | 狗 | 又洗澡澡好累汪…但是香香的 | 5fb72f7e |
| after_clean-soft-dog-ca9c7d00 | soft | 狗 | 好啦好啦，汪…现在是最干净的小狗 | ca9c7d00 |
| after_clean-soft-dog-c36fcf21 | soft | 狗 | 咦，洗澡澡好累汪…但是香香的 | c36fcf21 |
| after_clean-soft-dog-369e1839 | soft | 狗 | 今天团团汪…现在是最干净的小狗 | 369e1839 |
| after_clean-vivid-cat-27175944 | vivid | 猫 | 喵！洗白白完成！香喷喷出动！ | 27175944 |
| after_clean-vivid-cat-1e244372 | vivid | 猫 | 又喵！快看我蓬松的新造型！ | 1e244372 |
| after_clean-vivid-cat-477ccc40 | vivid | 猫 | 好啦好啦，喵！洗白白完成！香喷喷出动！ | 477ccc40 |
| after_clean-vivid-cat-7c1c622a | vivid | 猫 | 咦，喵！快看我蓬松的新造型！ | 7c1c622a |
| after_clean-vivid-cat-19f68922 | vivid | 猫 | 今天毛球喵！洗白白完成！香喷喷出动！ | 19f68922 |
| after_clean-vivid-cat-13949ba0 | vivid | 猫 | 喵！快看我蓬松的新造型！ | 13949ba0 |
| after_clean-vivid-cat-1f4191b4 | vivid | 猫 | 又喵！洗白白完成！香喷喷出动！ | 1f4191b4 |
| after_clean-vivid-cat-901ea319 | vivid | 猫 | 好啦好啦，喵！快看我蓬松的新造型！ | 901ea319 |
| after_clean-vivid-cat-f1dfefc4 | vivid | 猫 | 咦，喵！洗白白完成！香喷喷出动！ | f1dfefc4 |
| after_clean-vivid-cat-a69e947d | vivid | 猫 | 今天团团喵！快看我蓬松的新造型！ | a69e947d |
| after_clean-vivid-dog-643965d7 | vivid | 狗 | 汪！洗白白完成！香喷喷出动！ | 643965d7 |
| after_clean-vivid-dog-cea5e617 | vivid | 狗 | 又汪！快看我蓬松的新造型！ | cea5e617 |
| after_clean-vivid-dog-5017b456 | vivid | 狗 | 好啦好啦，汪！洗白白完成！香喷喷出动！ | 5017b456 |
| after_clean-vivid-dog-88f6d0e2 | vivid | 狗 | 咦，汪！快看我蓬松的新造型！ | 88f6d0e2 |
| after_clean-vivid-dog-c241ffe2 | vivid | 狗 | 今天毛球汪！洗白白完成！香喷喷出动！ | c241ffe2 |
| after_clean-vivid-dog-a5e60a7b | vivid | 狗 | 汪！快看我蓬松的新造型！ | a5e60a7b |
| after_clean-vivid-dog-f9e74c30 | vivid | 狗 | 又汪！洗白白完成！香喷喷出动！ | f9e74c30 |
| after_clean-vivid-dog-4137fbfc | vivid | 狗 | 好啦好啦，汪！快看我蓬松的新造型！ | 4137fbfc |
| after_clean-vivid-dog-1e61aab7 | vivid | 狗 | 咦，汪！洗白白完成！香喷喷出动！ | 1e61aab7 |
| after_clean-vivid-dog-7cafcddc | vivid | 狗 | 今天团团汪！快看我蓬松的新造型！ | 7cafcddc |
| after_clean-gentle-cat-668acb0a | gentle | 猫 | 洗得干干净净喵，舒服多了 | 668acb0a |
| after_clean-gentle-cat-dac37bd5 | gentle | 猫 | 又毛毛理顺了喵，今天也要美美的 | dac37bd5 |
| after_clean-gentle-cat-ab3ba4d2 | gentle | 猫 | 好啦好啦，洗得干干净净喵，舒服多了 | ab3ba4d2 |
| after_clean-gentle-cat-f3d50d2e | gentle | 猫 | 咦，毛毛理顺了喵，今天也要美美的 | f3d50d2e |
| after_clean-gentle-cat-c1658ae6 | gentle | 猫 | 今天毛球洗得干干净净喵，舒服多了 | c1658ae6 |
| after_clean-gentle-cat-1090f0e6 | gentle | 猫 | 毛毛理顺了喵，今天也要美美的 | 1090f0e6 |
| after_clean-gentle-cat-dc9d13e1 | gentle | 猫 | 又洗得干干净净喵，舒服多了 | dc9d13e1 |
| after_clean-gentle-cat-d21ab48d | gentle | 猫 | 好啦好啦，毛毛理顺了喵，今天也要美美的 | d21ab48d |
| after_clean-gentle-cat-dd61c416 | gentle | 猫 | 咦，洗得干干净净喵，舒服多了 | dd61c416 |
| after_clean-gentle-cat-2747e4fc | gentle | 猫 | 今天团团毛毛理顺了喵，今天也要美美的 | 2747e4fc |
| after_clean-gentle-dog-ae754b59 | gentle | 狗 | 洗得干干净净汪，舒服多了 | ae754b59 |
| after_clean-gentle-dog-3d29a343 | gentle | 狗 | 又毛毛理顺了汪，今天也要美美的 | 3d29a343 |
| after_clean-gentle-dog-d9c8ad9f | gentle | 狗 | 好啦好啦，洗得干干净净汪，舒服多了 | d9c8ad9f |
| after_clean-gentle-dog-48d53e65 | gentle | 狗 | 咦，毛毛理顺了汪，今天也要美美的 | 48d53e65 |
| after_clean-gentle-dog-250fb24e | gentle | 狗 | 今天毛球洗得干干净净汪，舒服多了 | 250fb24e |
| after_clean-gentle-dog-34e7a38f | gentle | 狗 | 毛毛理顺了汪，今天也要美美的 | 34e7a38f |
| after_clean-gentle-dog-95b87969 | gentle | 狗 | 又洗得干干净净汪，舒服多了 | 95b87969 |
| after_clean-gentle-dog-3dc77054 | gentle | 狗 | 好啦好啦，毛毛理顺了汪，今天也要美美的 | 3dc77054 |
| after_clean-gentle-dog-dffbf62d | gentle | 狗 | 咦，洗得干干净净汪，舒服多了 | dffbf62d |
| after_clean-gentle-dog-22a0f8d5 | gentle | 狗 | 今天团团毛毛理顺了汪，今天也要美美的 | 22a0f8d5 |

#### 不舒服（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| sick-soft-cat-5c112f3e | soft | 猫 | 呜…有点没精神喵，陪陪我 | 5c112f3e |
| sick-soft-cat-ce8c5375 | soft | 猫 | 又呜…想去看看医生吗喵 | ce8c5375 |
| sick-soft-cat-f1de83c9 | soft | 猫 | 好啦好啦，呜…有点没精神喵，陪陪我 | f1de83c9 |
| sick-soft-cat-f0283c3f | soft | 猫 | 咦，呜…想去看看医生吗喵 | f0283c3f |
| sick-soft-cat-f47b7181 | soft | 猫 | 今天毛球呜…有点没精神喵，陪陪我 | f47b7181 |
| sick-soft-cat-a3ed9653 | soft | 猫 | 呜…想去看看医生吗喵 | a3ed9653 |
| sick-soft-cat-43b9f442 | soft | 猫 | 又呜…有点没精神喵，陪陪我 | 43b9f442 |
| sick-soft-cat-c11893c0 | soft | 猫 | 好啦好啦，呜…想去看看医生吗喵 | c11893c0 |
| sick-soft-cat-292a1802 | soft | 猫 | 咦，呜…有点没精神喵，陪陪我 | 292a1802 |
| sick-soft-cat-c773b809 | soft | 猫 | 今天团团呜…想去看看医生吗喵 | c773b809 |
| sick-soft-dog-0cf96d10 | soft | 狗 | 呜呜…有点没精神汪，陪陪我 | 0cf96d10 |
| sick-soft-dog-ff10b112 | soft | 狗 | 又呜呜…想去看看医生吗汪 | ff10b112 |
| sick-soft-dog-1943df8c | soft | 狗 | 好啦好啦，呜呜…有点没精神汪，陪陪我 | 1943df8c |
| sick-soft-dog-556c5963 | soft | 狗 | 咦，呜呜…想去看看医生吗汪 | 556c5963 |
| sick-soft-dog-0853dfec | soft | 狗 | 今天毛球呜呜…有点没精神汪，陪陪我 | 0853dfec |
| sick-soft-dog-86a3de3d | soft | 狗 | 呜呜…想去看看医生吗汪 | 86a3de3d |
| sick-soft-dog-70b3ade0 | soft | 狗 | 又呜呜…有点没精神汪，陪陪我 | 70b3ade0 |
| sick-soft-dog-f4fb1527 | soft | 狗 | 好啦好啦，呜呜…想去看看医生吗汪 | f4fb1527 |
| sick-soft-dog-64f57681 | soft | 狗 | 咦，呜呜…有点没精神汪，陪陪我 | 64f57681 |
| sick-soft-dog-018a2143 | soft | 狗 | 今天团团呜呜…想去看看医生吗汪 | 018a2143 |
| sick-vivid-cat-c272bf79 | vivid | 猫 | 喵…今天难得安静，因为不舒服 | c272bf79 |
| sick-vivid-cat-22d660a2 | vivid | 猫 | 又喵…玩不动了，先趴一会儿 | 22d660a2 |
| sick-vivid-cat-d3a0ff78 | vivid | 猫 | 好啦好啦，喵…今天难得安静，因为不舒服 | d3a0ff78 |
| sick-vivid-cat-62a9066e | vivid | 猫 | 咦，喵…玩不动了，先趴一会儿 | 62a9066e |
| sick-vivid-cat-44edbb09 | vivid | 猫 | 今天毛球喵…今天难得安静，因为不舒服 | 44edbb09 |
| sick-vivid-cat-7fff9af8 | vivid | 猫 | 喵…玩不动了，先趴一会儿 | 7fff9af8 |
| sick-vivid-cat-2048d8ad | vivid | 猫 | 又喵…今天难得安静，因为不舒服 | 2048d8ad |
| sick-vivid-cat-4d9e8b85 | vivid | 猫 | 好啦好啦，喵…玩不动了，先趴一会儿 | 4d9e8b85 |
| sick-vivid-cat-05b6a6bf | vivid | 猫 | 咦，喵…今天难得安静，因为不舒服 | 05b6a6bf |
| sick-vivid-cat-c8b827f2 | vivid | 猫 | 今天团团喵…玩不动了，先趴一会儿 | c8b827f2 |
| sick-vivid-dog-c40b18b8 | vivid | 狗 | 汪…今天难得安静，因为不舒服 | c40b18b8 |
| sick-vivid-dog-10b91a38 | vivid | 狗 | 又汪…玩不动了，先趴一会儿 | 10b91a38 |
| sick-vivid-dog-03918ef0 | vivid | 狗 | 好啦好啦，汪…今天难得安静，因为不舒服 | 03918ef0 |
| sick-vivid-dog-5083cafd | vivid | 狗 | 咦，汪…玩不动了，先趴一会儿 | 5083cafd |
| sick-vivid-dog-5552605a | vivid | 狗 | 今天毛球汪…今天难得安静，因为不舒服 | 5552605a |
| sick-vivid-dog-73017523 | vivid | 狗 | 汪…玩不动了，先趴一会儿 | 73017523 |
| sick-vivid-dog-5a5d6094 | vivid | 狗 | 又汪…今天难得安静，因为不舒服 | 5a5d6094 |
| sick-vivid-dog-e08c5561 | vivid | 狗 | 好啦好啦，汪…玩不动了，先趴一会儿 | e08c5561 |
| sick-vivid-dog-a67e8de7 | vivid | 狗 | 咦，汪…今天难得安静，因为不舒服 | a67e8de7 |
| sick-vivid-dog-615c022e | vivid | 狗 | 今天团团汪…玩不动了，先趴一会儿 | 615c022e |
| sick-gentle-cat-ee18b22f | gentle | 猫 | 喵…主人，我需要你 | ee18b22f |
| sick-gentle-cat-100e0045 | gentle | 猫 | 又谢谢你照顾我喵，很快会好起来 | 100e0045 |
| sick-gentle-cat-d52cea51 | gentle | 猫 | 好啦好啦，喵…主人，我需要你 | d52cea51 |
| sick-gentle-cat-c8e40db0 | gentle | 猫 | 咦，谢谢你照顾我喵，很快会好起来 | c8e40db0 |
| sick-gentle-cat-765fdc06 | gentle | 猫 | 今天毛球喵…主人，我需要你 | 765fdc06 |
| sick-gentle-cat-adc63420 | gentle | 猫 | 谢谢你照顾我喵，很快会好起来 | adc63420 |
| sick-gentle-cat-bbb1c29b | gentle | 猫 | 又喵…主人，我需要你 | bbb1c29b |
| sick-gentle-cat-d07ee00b | gentle | 猫 | 好啦好啦，谢谢你照顾我喵，很快会好起来 | d07ee00b |
| sick-gentle-cat-8ab6c896 | gentle | 猫 | 咦，喵…主人，我需要你 | 8ab6c896 |
| sick-gentle-cat-af67e5f9 | gentle | 猫 | 今天团团谢谢你照顾我喵，很快会好起来 | af67e5f9 |
| sick-gentle-dog-43f1c45c | gentle | 狗 | 汪…主人，我需要你 | 43f1c45c |
| sick-gentle-dog-67ccecce | gentle | 狗 | 又谢谢你照顾我汪，很快会好起来 | 67ccecce |
| sick-gentle-dog-da2694d1 | gentle | 狗 | 好啦好啦，汪…主人，我需要你 | da2694d1 |
| sick-gentle-dog-344af9f1 | gentle | 狗 | 咦，谢谢你照顾我汪，很快会好起来 | 344af9f1 |
| sick-gentle-dog-ab0848e4 | gentle | 狗 | 今天毛球汪…主人，我需要你 | ab0848e4 |
| sick-gentle-dog-f5cf4589 | gentle | 狗 | 谢谢你照顾我汪，很快会好起来 | f5cf4589 |
| sick-gentle-dog-7deb96cd | gentle | 狗 | 又汪…主人，我需要你 | 7deb96cd |
| sick-gentle-dog-09389c0b | gentle | 狗 | 好啦好啦，谢谢你照顾我汪，很快会好起来 | 09389c0b |
| sick-gentle-dog-246af342 | gentle | 狗 | 咦，汪…主人，我需要你 | 246af342 |
| sick-gentle-dog-f398ae8b | gentle | 狗 | 今天团团谢谢你照顾我汪，很快会好起来 | f398ae8b |

#### 想出门（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| want_out-soft-cat-b619e5a4 | soft | 猫 | 喵…窗外的鸟鸟好好看，想出去嘛 | b619e5a4 |
| want_out-soft-cat-ee2d3659 | soft | 猫 | 又喵…阳台的风好舒服，带我去嘛 | ee2d3659 |
| want_out-soft-cat-12b0f3d6 | soft | 猫 | 好啦好啦，喵…窗外的鸟鸟好好看，想出去嘛 | 12b0f3d6 |
| want_out-soft-cat-45cb818b | soft | 猫 | 咦，喵…阳台的风好舒服，带我去嘛 | 45cb818b |
| want_out-soft-cat-335002ed | soft | 猫 | 今天毛球喵…窗外的鸟鸟好好看，想出去嘛 | 335002ed |
| want_out-soft-cat-8a824fd6 | soft | 猫 | 喵…阳台的风好舒服，带我去嘛 | 8a824fd6 |
| want_out-soft-cat-5f81842c | soft | 猫 | 又喵…窗外的鸟鸟好好看，想出去嘛 | 5f81842c |
| want_out-soft-cat-28d12f34 | soft | 猫 | 好啦好啦，喵…阳台的风好舒服，带我去嘛 | 28d12f34 |
| want_out-soft-cat-56d997e5 | soft | 猫 | 咦，喵…窗外的鸟鸟好好看，想出去嘛 | 56d997e5 |
| want_out-soft-cat-26ae60bb | soft | 猫 | 今天团团喵…阳台的风好舒服，带我去嘛 | 26ae60bb |
| want_out-soft-dog-0457684f | soft | 狗 | 汪…窗外的鸟鸟好好看，想出去嘛 | 0457684f |
| want_out-soft-dog-b3d67903 | soft | 狗 | 又汪…阳台的风好舒服，带我去嘛 | b3d67903 |
| want_out-soft-dog-d9ae7181 | soft | 狗 | 好啦好啦，汪…窗外的鸟鸟好好看，想出去嘛 | d9ae7181 |
| want_out-soft-dog-e7e2f963 | soft | 狗 | 咦，汪…阳台的风好舒服，带我去嘛 | e7e2f963 |
| want_out-soft-dog-224447b7 | soft | 狗 | 今天毛球汪…窗外的鸟鸟好好看，想出去嘛 | 224447b7 |
| want_out-soft-dog-d5c02325 | soft | 狗 | 汪…阳台的风好舒服，带我去嘛 | d5c02325 |
| want_out-soft-dog-64cf7886 | soft | 狗 | 又汪…窗外的鸟鸟好好看，想出去嘛 | 64cf7886 |
| want_out-soft-dog-329c68b7 | soft | 狗 | 好啦好啦，汪…阳台的风好舒服，带我去嘛 | 329c68b7 |
| want_out-soft-dog-1383198d | soft | 狗 | 咦，汪…窗外的鸟鸟好好看，想出去嘛 | 1383198d |
| want_out-soft-dog-74cf0f19 | soft | 狗 | 今天团团汪…阳台的风好舒服，带我去嘛 | 74cf0f19 |
| want_out-vivid-cat-1bd2a691 | vivid | 猫 | 喵！出门！遛弯！冲！ | 1bd2a691 |
| want_out-vivid-cat-7f61e37b | vivid | 猫 | 又喵！外面有新气味！探索欲爆棚！ | 7f61e37b |
| want_out-vivid-cat-9e67319d | vivid | 猫 | 好啦好啦，喵！出门！遛弯！冲！ | 9e67319d |
| want_out-vivid-cat-a1647754 | vivid | 猫 | 咦，喵！外面有新气味！探索欲爆棚！ | a1647754 |
| want_out-vivid-cat-178a950c | vivid | 猫 | 今天毛球喵！出门！遛弯！冲！ | 178a950c |
| want_out-vivid-cat-d7bc4f73 | vivid | 猫 | 喵！外面有新气味！探索欲爆棚！ | d7bc4f73 |
| want_out-vivid-cat-f7e38d96 | vivid | 猫 | 又喵！出门！遛弯！冲！ | f7e38d96 |
| want_out-vivid-cat-30fb2411 | vivid | 猫 | 好啦好啦，喵！外面有新气味！探索欲爆棚！ | 30fb2411 |
| want_out-vivid-cat-7245628d | vivid | 猫 | 咦，喵！出门！遛弯！冲！ | 7245628d |
| want_out-vivid-cat-63fd5fd2 | vivid | 猫 | 今天团团喵！外面有新气味！探索欲爆棚！ | 63fd5fd2 |
| want_out-vivid-dog-316d1370 | vivid | 狗 | 汪！出门！遛弯！冲！ | 316d1370 |
| want_out-vivid-dog-16add70b | vivid | 狗 | 又汪！外面有新气味！探索欲爆棚！ | 16add70b |
| want_out-vivid-dog-5790210e | vivid | 狗 | 好啦好啦，汪！出门！遛弯！冲！ | 5790210e |
| want_out-vivid-dog-72cb30fc | vivid | 狗 | 咦，汪！外面有新气味！探索欲爆棚！ | 72cb30fc |
| want_out-vivid-dog-05e6137c | vivid | 狗 | 今天毛球汪！出门！遛弯！冲！ | 05e6137c |
| want_out-vivid-dog-cbe4febe | vivid | 狗 | 汪！外面有新气味！探索欲爆棚！ | cbe4febe |
| want_out-vivid-dog-4c1b3304 | vivid | 狗 | 又汪！出门！遛弯！冲！ | 4c1b3304 |
| want_out-vivid-dog-52d0adb3 | vivid | 狗 | 好啦好啦，汪！外面有新气味！探索欲爆棚！ | 52d0adb3 |
| want_out-vivid-dog-d9f6f47e | vivid | 狗 | 咦，汪！出门！遛弯！冲！ | d9f6f47e |
| want_out-vivid-dog-80c29669 | vivid | 狗 | 今天团团汪！外面有新气味！探索欲爆棚！ | 80c29669 |
| want_out-gentle-cat-e2db6128 | gentle | 猫 | 今天适合出门走走呢喵 | e2db6128 |
| want_out-gentle-cat-9b292ad9 | gentle | 猫 | 又想和你一起散步喵，慢慢走 | 9b292ad9 |
| want_out-gentle-cat-09fc9915 | gentle | 猫 | 好啦好啦，今天适合出门走走呢喵 | 09fc9915 |
| want_out-gentle-cat-e67249af | gentle | 猫 | 咦，想和你一起散步喵，慢慢走 | e67249af |
| want_out-gentle-cat-5763e90a | gentle | 猫 | 今天毛球今天适合出门走走呢喵 | 5763e90a |
| want_out-gentle-cat-3ff2efea | gentle | 猫 | 想和你一起散步喵，慢慢走 | 3ff2efea |
| want_out-gentle-cat-acaf2101 | gentle | 猫 | 又今天适合出门走走呢喵 | acaf2101 |
| want_out-gentle-cat-09c16375 | gentle | 猫 | 好啦好啦，想和你一起散步喵，慢慢走 | 09c16375 |
| want_out-gentle-cat-9cceee54 | gentle | 猫 | 咦，今天适合出门走走呢喵 | 9cceee54 |
| want_out-gentle-cat-6b43766d | gentle | 猫 | 今天团团想和你一起散步喵，慢慢走 | 6b43766d |
| want_out-gentle-dog-f696233f | gentle | 狗 | 今天适合出门走走呢汪 | f696233f |
| want_out-gentle-dog-67bd7e16 | gentle | 狗 | 又想和你一起散步汪，慢慢走 | 67bd7e16 |
| want_out-gentle-dog-b44aec58 | gentle | 狗 | 好啦好啦，今天适合出门走走呢汪 | b44aec58 |
| want_out-gentle-dog-0d3d3734 | gentle | 狗 | 咦，想和你一起散步汪，慢慢走 | 0d3d3734 |
| want_out-gentle-dog-5993750b | gentle | 狗 | 今天毛球今天适合出门走走呢汪 | 5993750b |
| want_out-gentle-dog-1f9a7bb3 | gentle | 狗 | 想和你一起散步汪，慢慢走 | 1f9a7bb3 |
| want_out-gentle-dog-ab412c66 | gentle | 狗 | 又今天适合出门走走呢汪 | ab412c66 |
| want_out-gentle-dog-76e0fa8b | gentle | 狗 | 好啦好啦，想和你一起散步汪，慢慢走 | 76e0fa8b |
| want_out-gentle-dog-7649dcc4 | gentle | 狗 | 咦，今天适合出门走走呢汪 | 7649dcc4 |
| want_out-gentle-dog-f6c8f222 | gentle | 狗 | 今天团团想和你一起散步汪，慢慢走 | f6c8f222 |

#### 睡觉晚安（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| goodnight-soft-cat-929b3512 | soft | 猫 | 喵…晚安主人，做个好梦 | 929b3512 |
| goodnight-soft-cat-ae7a33f6 | soft | 猫 | 又呼噜呼噜…晚安，明天见喵 | ae7a33f6 |
| goodnight-soft-cat-bc53958d | soft | 猫 | 好啦好啦，喵…晚安主人，做个好梦 | bc53958d |
| goodnight-soft-cat-9f4ac52d | soft | 猫 | 咦，呼噜呼噜…晚安，明天见喵 | 9f4ac52d |
| goodnight-soft-cat-609d3ec0 | soft | 猫 | 今天毛球喵…晚安主人，做个好梦 | 609d3ec0 |
| goodnight-soft-cat-4bef1d4d | soft | 猫 | 呼噜呼噜…晚安，明天见喵 | 4bef1d4d |
| goodnight-soft-cat-1323de7b | soft | 猫 | 又喵…晚安主人，做个好梦 | 1323de7b |
| goodnight-soft-cat-e090388b | soft | 猫 | 好啦好啦，呼噜呼噜…晚安，明天见喵 | e090388b |
| goodnight-soft-cat-571d23fe | soft | 猫 | 咦，喵…晚安主人，做个好梦 | 571d23fe |
| goodnight-soft-cat-dc14663d | soft | 猫 | 今天团团呼噜呼噜…晚安，明天见喵 | dc14663d |
| goodnight-soft-dog-05c301b0 | soft | 狗 | 汪…晚安主人，做个好梦 | 05c301b0 |
| goodnight-soft-dog-0f29e904 | soft | 狗 | 又哼哼唧唧…晚安，明天见汪 | 0f29e904 |
| goodnight-soft-dog-d9c7897b | soft | 狗 | 好啦好啦，汪…晚安主人，做个好梦 | d9c7897b |
| goodnight-soft-dog-aa3d12e7 | soft | 狗 | 咦，哼哼唧唧…晚安，明天见汪 | aa3d12e7 |
| goodnight-soft-dog-4f71f52c | soft | 狗 | 今天毛球汪…晚安主人，做个好梦 | 4f71f52c |
| goodnight-soft-dog-ef4325a1 | soft | 狗 | 哼哼唧唧…晚安，明天见汪 | ef4325a1 |
| goodnight-soft-dog-8b8c9829 | soft | 狗 | 又汪…晚安主人，做个好梦 | 8b8c9829 |
| goodnight-soft-dog-148f1c4c | soft | 狗 | 好啦好啦，哼哼唧唧…晚安，明天见汪 | 148f1c4c |
| goodnight-soft-dog-9edfb666 | soft | 狗 | 咦，汪…晚安主人，做个好梦 | 9edfb666 |
| goodnight-soft-dog-d873b6e9 | soft | 狗 | 今天团团哼哼唧唧…晚安，明天见汪 | d873b6e9 |
| goodnight-vivid-cat-16d01d39 | vivid | 猫 | 喵！晚安！明天第一个叫你起床！ | 16d01d39 |
| goodnight-vivid-cat-150595b2 | vivid | 猫 | 喵！梦里也要吃肉肉！ | 150595b2 |
| goodnight-vivid-cat-2ce42067 | vivid | 猫 | 好啦好啦，喵！晚安！明天第一个叫你起床！ | 2ce42067 |
| goodnight-vivid-cat-768e85e1 | vivid | 猫 | 好啦好啦，熄灯了！本猫准时关机喵！ | 768e85e1 |
| goodnight-vivid-cat-87eea877 | vivid | 猫 | 咦，今天玩累了喵，zzZ | 87eea877 |
| goodnight-vivid-cat-bc950128 | vivid | 猫 | 今天毛球熄灯了！本猫准时关机喵！ | bc950128 |
| goodnight-vivid-cat-bc8b7d29 | vivid | 猫 | 今天玩累了喵，zzZ | bc8b7d29 |
| goodnight-vivid-cat-cec62ac3 | vivid | 猫 | 又熄灯了！本猫准时关机喵！ | cec62ac3 |
| goodnight-vivid-cat-1fe27eb9 | vivid | 猫 | 好啦好啦，今天玩累了喵，zzZ | 1fe27eb9 |
| goodnight-vivid-cat-01fc9807 | vivid | 猫 | 咦，熄灯了！本猫准时关机喵！ | 01fc9807 |
| goodnight-vivid-dog-9eba5104 | vivid | 狗 | 汪！晚安！明天第一个叫你起床！ | 9eba5104 |
| goodnight-vivid-dog-c3702b6c | vivid | 狗 | 汪！梦里也要吃肉肉！ | c3702b6c |
| goodnight-vivid-dog-19b752b6 | vivid | 狗 | 好啦好啦，汪！晚安！明天第一个叫你起床！ | 19b752b6 |
| goodnight-vivid-dog-f7653625 | vivid | 狗 | 好啦好啦，熄灯了！本狗准时关机汪！ | f7653625 |
| goodnight-vivid-dog-66e83940 | vivid | 狗 | 咦，今天玩累了汪，zzZ | 66e83940 |
| goodnight-vivid-dog-40ac7c0f | vivid | 狗 | 今天毛球熄灯了！本狗准时关机汪！ | 40ac7c0f |
| goodnight-vivid-dog-9491b441 | vivid | 狗 | 今天玩累了汪，zzZ | 9491b441 |
| goodnight-vivid-dog-543fe17c | vivid | 狗 | 又熄灯了！本狗准时关机汪！ | 543fe17c |
| goodnight-vivid-dog-ae384d46 | vivid | 狗 | 好啦好啦，今天玩累了汪，zzZ | ae384d46 |
| goodnight-vivid-dog-6f951640 | vivid | 狗 | 咦，熄灯了！本狗准时关机汪！ | 6f951640 |
| goodnight-gentle-cat-271f70f1 | gentle | 猫 | 晚安喵，今天也很爱你 | 271f70f1 |
| goodnight-gentle-cat-74de8131 | gentle | 猫 | 又夜深了喵，安心睡吧 | 74de8131 |
| goodnight-gentle-cat-7a6a155e | gentle | 猫 | 好啦好啦，晚安喵，今天也很爱你 | 7a6a155e |
| goodnight-gentle-cat-4db3e169 | gentle | 猫 | 咦，夜深了喵，安心睡吧 | 4db3e169 |
| goodnight-gentle-cat-e6c74c6b | gentle | 猫 | 今天毛球晚安喵，今天也很爱你 | e6c74c6b |
| goodnight-gentle-cat-742d0853 | gentle | 猫 | 夜深了喵，安心睡吧 | 742d0853 |
| goodnight-gentle-cat-4d5ce127 | gentle | 猫 | 又晚安喵，今天也很爱你 | 4d5ce127 |
| goodnight-gentle-cat-59260593 | gentle | 猫 | 好啦好啦，夜深了喵，安心睡吧 | 59260593 |
| goodnight-gentle-cat-ed05de5c | gentle | 猫 | 咦，晚安喵，今天也很爱你 | ed05de5c |
| goodnight-gentle-cat-9e631825 | gentle | 猫 | 今天团团夜深了喵，安心睡吧 | 9e631825 |
| goodnight-gentle-dog-9b143be6 | gentle | 狗 | 晚安汪，今天也很爱你 | 9b143be6 |
| goodnight-gentle-dog-cc71e9e8 | gentle | 狗 | 又夜深了汪，安心睡吧 | cc71e9e8 |
| goodnight-gentle-dog-681c44c3 | gentle | 狗 | 好啦好啦，晚安汪，今天也很爱你 | 681c44c3 |
| goodnight-gentle-dog-aed66c08 | gentle | 狗 | 咦，夜深了汪，安心睡吧 | aed66c08 |
| goodnight-gentle-dog-ddbc6a45 | gentle | 狗 | 今天毛球晚安汪，今天也很爱你 | ddbc6a45 |
| goodnight-gentle-dog-89c92949 | gentle | 狗 | 夜深了汪，安心睡吧 | 89c92949 |
| goodnight-gentle-dog-d6d7bfe4 | gentle | 狗 | 又晚安汪，今天也很爱你 | d6d7bfe4 |
| goodnight-gentle-dog-0dc240ae | gentle | 狗 | 好啦好啦，夜深了汪，安心睡吧 | 0dc240ae |
| goodnight-gentle-dog-8a57f1ff | gentle | 狗 | 咦，晚安汪，今天也很爱你 | 8a57f1ff |
| goodnight-gentle-dog-488c5c3c | gentle | 狗 | 今天团团夜深了汪，安心睡吧 | 488c5c3c |

#### 早上问早（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| morning-soft-cat-38b73b77 | soft | 猫 | 喵…早安主人，新的一天开始啦 | 38b73b77 |
| morning-soft-cat-ace2efa1 | soft | 猫 | 又早安喵…阳光晒到屁股了 | ace2efa1 |
| morning-soft-cat-28c1b15c | soft | 猫 | 好啦好啦，喵…早安主人，新的一天开始啦 | 28c1b15c |
| morning-soft-cat-719147df | soft | 猫 | 咦，早安喵…阳光晒到屁股了 | 719147df |
| morning-soft-cat-acf1f506 | soft | 猫 | 今天毛球喵…早安主人，新的一天开始啦 | acf1f506 |
| morning-soft-cat-32767ad9 | soft | 猫 | 早安喵…阳光晒到屁股了 | 32767ad9 |
| morning-soft-cat-41f99257 | soft | 猫 | 又喵…早安主人，新的一天开始啦 | 41f99257 |
| morning-soft-cat-82e47ced | soft | 猫 | 好啦好啦，早安喵…阳光晒到屁股了 | 82e47ced |
| morning-soft-cat-3160ac7c | soft | 猫 | 咦，喵…早安主人，新的一天开始啦 | 3160ac7c |
| morning-soft-cat-9cb2252d | soft | 猫 | 今天团团早安喵…阳光晒到屁股了 | 9cb2252d |
| morning-soft-dog-8add53ea | soft | 狗 | 汪…早安主人，新的一天开始啦 | 8add53ea |
| morning-soft-dog-1bdd708a | soft | 狗 | 又早安汪…阳光晒到屁股了 | 1bdd708a |
| morning-soft-dog-f280d539 | soft | 狗 | 好啦好啦，汪…早安主人，新的一天开始啦 | f280d539 |
| morning-soft-dog-800b2f83 | soft | 狗 | 咦，早安汪…阳光晒到屁股了 | 800b2f83 |
| morning-soft-dog-b660774e | soft | 狗 | 今天毛球汪…早安主人，新的一天开始啦 | b660774e |
| morning-soft-dog-83290704 | soft | 狗 | 早安汪…阳光晒到屁股了 | 83290704 |
| morning-soft-dog-3be9541f | soft | 狗 | 又汪…早安主人，新的一天开始啦 | 3be9541f |
| morning-soft-dog-f3447588 | soft | 狗 | 好啦好啦，早安汪…阳光晒到屁股了 | f3447588 |
| morning-soft-dog-0660120d | soft | 狗 | 咦，汪…早安主人，新的一天开始啦 | 0660120d |
| morning-soft-dog-112bd3bd | soft | 狗 | 今天团团早安汪…阳光晒到屁股了 | 112bd3bd |
| morning-vivid-cat-ccd49b48 | vivid | 猫 | 喵！天亮了！该喂小鱼干了！ | ccd49b48 |
| morning-vivid-cat-aa88466a | vivid | 猫 | 又喵！今日份的早操开始！ | aa88466a |
| morning-vivid-cat-7bb0ef6f | vivid | 猫 | 又起床！起床！太阳晒屁股啦喵！ | 7bb0ef6f |
| morning-vivid-cat-fe7463c2 | vivid | 猫 | 好啦好啦，新的一天喵！冲出被窝！ | fe7463c2 |
| morning-vivid-cat-13d8bcd8 | vivid | 猫 | 咦，起床！起床！太阳晒屁股啦喵！ | 13d8bcd8 |
| morning-vivid-cat-d5d9b5b9 | vivid | 猫 | 今天毛球新的一天喵！冲出被窝！ | d5d9b5b9 |
| morning-vivid-cat-c97ea092 | vivid | 猫 | 起床！起床！太阳晒屁股啦喵！ | c97ea092 |
| morning-vivid-cat-4f1cad8c | vivid | 猫 | 又新的一天喵！冲出被窝！ | 4f1cad8c |
| morning-vivid-cat-c47f21fb | vivid | 猫 | 好啦好啦，起床！起床！太阳晒屁股啦喵！ | c47f21fb |
| morning-vivid-cat-7ea7fe39 | vivid | 猫 | 咦，新的一天喵！冲出被窝！ | 7ea7fe39 |
| morning-vivid-dog-1c5266ca | vivid | 狗 | 汪！天亮了！该喂小鱼干了！ | 1c5266ca |
| morning-vivid-dog-6c5cc74f | vivid | 狗 | 又汪！今日份的早操开始！ | 6c5cc74f |
| morning-vivid-dog-2520abe8 | vivid | 狗 | 又起床！起床！太阳晒屁股啦汪！ | 2520abe8 |
| morning-vivid-dog-27a3b2f4 | vivid | 狗 | 好啦好啦，新的一天汪！冲出被窝！ | 27a3b2f4 |
| morning-vivid-dog-ccc9b8d6 | vivid | 狗 | 咦，起床！起床！太阳晒屁股啦汪！ | ccc9b8d6 |
| morning-vivid-dog-95a834a1 | vivid | 狗 | 今天毛球新的一天汪！冲出被窝！ | 95a834a1 |
| morning-vivid-dog-2ccfda3b | vivid | 狗 | 起床！起床！太阳晒屁股啦汪！ | 2ccfda3b |
| morning-vivid-dog-f27cb84d | vivid | 狗 | 又新的一天汪！冲出被窝！ | f27cb84d |
| morning-vivid-dog-b7350c1e | vivid | 狗 | 好啦好啦，起床！起床！太阳晒屁股啦汪！ | b7350c1e |
| morning-vivid-dog-ed7750f8 | vivid | 狗 | 咦，新的一天汪！冲出被窝！ | ed7750f8 |
| morning-gentle-cat-80e0ff13 | gentle | 猫 | 早安喵～今天也请多关照 | 80e0ff13 |
| morning-gentle-cat-3e538e2f | gentle | 猫 | 又早安呀喵，睡得好吗 | 3e538e2f |
| morning-gentle-cat-2d7a42ed | gentle | 猫 | 好啦好啦，早安喵～今天也请多关照 | 2d7a42ed |
| morning-gentle-cat-7442a530 | gentle | 猫 | 咦，早安呀喵，睡得好吗 | 7442a530 |
| morning-gentle-cat-a8288c40 | gentle | 猫 | 今天毛球早安喵～今天也请多关照 | a8288c40 |
| morning-gentle-cat-3b901def | gentle | 猫 | 早安呀喵，睡得好吗 | 3b901def |
| morning-gentle-cat-d011a94f | gentle | 猫 | 又早安喵～今天也请多关照 | d011a94f |
| morning-gentle-cat-bd0cd7df | gentle | 猫 | 好啦好啦，早安呀喵，睡得好吗 | bd0cd7df |
| morning-gentle-cat-d6534a9b | gentle | 猫 | 咦，早安喵～今天也请多关照 | d6534a9b |
| morning-gentle-cat-8e5b9830 | gentle | 猫 | 今天团团早安呀喵，睡得好吗 | 8e5b9830 |
| morning-gentle-dog-457923cd | gentle | 狗 | 早安汪～今天也请多关照 | 457923cd |
| morning-gentle-dog-3ac21b31 | gentle | 狗 | 又早安呀汪，睡得好吗 | 3ac21b31 |
| morning-gentle-dog-a04f9fb8 | gentle | 狗 | 好啦好啦，早安汪～今天也请多关照 | a04f9fb8 |
| morning-gentle-dog-370d1f8a | gentle | 狗 | 咦，早安呀汪，睡得好吗 | 370d1f8a |
| morning-gentle-dog-fa13d7dc | gentle | 狗 | 今天毛球早安汪～今天也请多关照 | fa13d7dc |
| morning-gentle-dog-b280591c | gentle | 狗 | 早安呀汪，睡得好吗 | b280591c |
| morning-gentle-dog-101f997e | gentle | 狗 | 又早安汪～今天也请多关照 | 101f997e |
| morning-gentle-dog-12577061 | gentle | 狗 | 好啦好啦，早安呀汪，睡得好吗 | 12577061 |
| morning-gentle-dog-30ef6476 | gentle | 狗 | 咦，早安汪～今天也请多关照 | 30ef6476 |
| morning-gentle-dog-4f6c53d4 | gentle | 狗 | 今天团团早安呀汪，睡得好吗 | 4f6c53d4 |

#### 撒娇（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| act_cute-soft-cat-15272330 | soft | 猫 | 喵～抱抱举高高嘛 | 15272330 |
| act_cute-soft-cat-098b335b | soft | 猫 | 又喵…蹭蹭你的腿腿，看着我可以吗 | 098b335b |
| act_cute-soft-cat-3a8c9227 | soft | 猫 | 好啦好啦，喵～抱抱举高高嘛 | 3a8c9227 |
| act_cute-soft-cat-d2a1fc8a | soft | 猫 | 咦，喵…蹭蹭你的腿腿，看着我可以吗 | d2a1fc8a |
| act_cute-soft-cat-8b762622 | soft | 猫 | 今天毛球喵～抱抱举高高嘛 | 8b762622 |
| act_cute-soft-cat-6d7f8b8a | soft | 猫 | 喵…蹭蹭你的腿腿，看着我可以吗 | 6d7f8b8a |
| act_cute-soft-cat-c5491e3e | soft | 猫 | 又喵～抱抱举高高嘛 | c5491e3e |
| act_cute-soft-cat-5a471a5a | soft | 猫 | 好啦好啦，喵…蹭蹭你的腿腿，看着我可以吗 | 5a471a5a |
| act_cute-soft-cat-5294ed3f | soft | 猫 | 咦，喵～抱抱举高高嘛 | 5294ed3f |
| act_cute-soft-cat-c24b35f3 | soft | 猫 | 今天团团喵…蹭蹭你的腿腿，看着我可以吗 | c24b35f3 |
| act_cute-soft-dog-0d7ed788 | soft | 狗 | 汪～抱抱举高高嘛 | 0d7ed788 |
| act_cute-soft-dog-0e138e46 | soft | 狗 | 又汪…扑过来你的腿腿，看着我可以吗 | 0e138e46 |
| act_cute-soft-dog-79b49e8b | soft | 狗 | 好啦好啦，汪～抱抱举高高嘛 | 79b49e8b |
| act_cute-soft-dog-b219d0ea | soft | 狗 | 咦，汪…扑过来你的腿腿，看着我可以吗 | b219d0ea |
| act_cute-soft-dog-35d05f17 | soft | 狗 | 今天毛球汪～抱抱举高高嘛 | 35d05f17 |
| act_cute-soft-dog-b53611f2 | soft | 狗 | 汪…扑过来你的腿腿，看着我可以吗 | b53611f2 |
| act_cute-soft-dog-e5d3e09f | soft | 狗 | 又汪～抱抱举高高嘛 | e5d3e09f |
| act_cute-soft-dog-8f839ec6 | soft | 狗 | 好啦好啦，汪…扑过来你的腿腿，看着我可以吗 | 8f839ec6 |
| act_cute-soft-dog-e024c4bf | soft | 狗 | 咦，汪～抱抱举高高嘛 | e024c4bf |
| act_cute-soft-dog-fd94d35e | soft | 狗 | 今天团团汪…扑过来你的腿腿，看着我可以吗 | fd94d35e |
| act_cute-vivid-cat-0c33863f | vivid | 猫 | 喵！求关注！求投喂！求抱抱！ | 0c33863f |
| act_cute-vivid-cat-7e88eaaf | vivid | 猫 | 又喵！撒娇火力全开！ | 7e88eaaf |
| act_cute-vivid-cat-346f072e | vivid | 猫 | 好啦好啦，喵！求关注！求投喂！求抱抱！ | 346f072e |
| act_cute-vivid-cat-808f7f5e | vivid | 猫 | 咦，喵！撒娇火力全开！ | 808f7f5e |
| act_cute-vivid-cat-b68da384 | vivid | 猫 | 今天毛球喵！求关注！求投喂！求抱抱！ | b68da384 |
| act_cute-vivid-cat-9386cee0 | vivid | 猫 | 喵！撒娇火力全开！ | 9386cee0 |
| act_cute-vivid-cat-757213d8 | vivid | 猫 | 又喵！求关注！求投喂！求抱抱！ | 757213d8 |
| act_cute-vivid-cat-b338b852 | vivid | 猫 | 好啦好啦，喵！撒娇火力全开！ | b338b852 |
| act_cute-vivid-cat-9da32d8f | vivid | 猫 | 咦，喵！求关注！求投喂！求抱抱！ | 9da32d8f |
| act_cute-vivid-cat-04544cd7 | vivid | 猫 | 今天团团喵！撒娇火力全开！ | 04544cd7 |
| act_cute-vivid-dog-ccade6c6 | vivid | 狗 | 汪！求关注！求投喂！求抱抱！ | ccade6c6 |
| act_cute-vivid-dog-c882c63c | vivid | 狗 | 又汪！撒娇火力全开！ | c882c63c |
| act_cute-vivid-dog-fa1d4719 | vivid | 狗 | 好啦好啦，汪！求关注！求投喂！求抱抱！ | fa1d4719 |
| act_cute-vivid-dog-43291b4c | vivid | 狗 | 咦，汪！撒娇火力全开！ | 43291b4c |
| act_cute-vivid-dog-682cbf3b | vivid | 狗 | 今天毛球汪！求关注！求投喂！求抱抱！ | 682cbf3b |
| act_cute-vivid-dog-6e4dd92e | vivid | 狗 | 汪！撒娇火力全开！ | 6e4dd92e |
| act_cute-vivid-dog-b979214f | vivid | 狗 | 又汪！求关注！求投喂！求抱抱！ | b979214f |
| act_cute-vivid-dog-94e0c143 | vivid | 狗 | 好啦好啦，汪！撒娇火力全开！ | 94e0c143 |
| act_cute-vivid-dog-a23f9af8 | vivid | 狗 | 咦，汪！求关注！求投喂！求抱抱！ | a23f9af8 |
| act_cute-vivid-dog-a8785d05 | vivid | 狗 | 今天团团汪！撒娇火力全开！ | a8785d05 |
| act_cute-gentle-cat-6a97fc10 | gentle | 猫 | 喵～偶尔撒个娇也很治愈呢 | 6a97fc10 |
| act_cute-gentle-cat-6f313e0a | gentle | 猫 | 又喵…就这样待在你身边 | 6f313e0a |
| act_cute-gentle-cat-33e7f7aa | gentle | 猫 | 好啦好啦，喵～偶尔撒个娇也很治愈呢 | 33e7f7aa |
| act_cute-gentle-cat-acae3199 | gentle | 猫 | 咦，喵…就这样待在你身边 | acae3199 |
| act_cute-gentle-cat-23135a5e | gentle | 猫 | 今天毛球喵～偶尔撒个娇也很治愈呢 | 23135a5e |
| act_cute-gentle-cat-c30bc6c9 | gentle | 猫 | 喵…就这样待在你身边 | c30bc6c9 |
| act_cute-gentle-cat-aaf435de | gentle | 猫 | 又喵～偶尔撒个娇也很治愈呢 | aaf435de |
| act_cute-gentle-cat-f89500ae | gentle | 猫 | 好啦好啦，喵…就这样待在你身边 | f89500ae |
| act_cute-gentle-cat-77757a57 | gentle | 猫 | 咦，喵～偶尔撒个娇也很治愈呢 | 77757a57 |
| act_cute-gentle-cat-2baecebd | gentle | 猫 | 今天团团喵…就这样待在你身边 | 2baecebd |
| act_cute-gentle-dog-74f56055 | gentle | 狗 | 汪～偶尔撒个娇也很治愈呢 | 74f56055 |
| act_cute-gentle-dog-3944016c | gentle | 狗 | 又汪…就这样待在你身边 | 3944016c |
| act_cute-gentle-dog-5eb3cf72 | gentle | 狗 | 好啦好啦，汪～偶尔撒个娇也很治愈呢 | 5eb3cf72 |
| act_cute-gentle-dog-06b18812 | gentle | 狗 | 咦，汪…就这样待在你身边 | 06b18812 |
| act_cute-gentle-dog-cb731428 | gentle | 狗 | 今天毛球汪～偶尔撒个娇也很治愈呢 | cb731428 |
| act_cute-gentle-dog-1a825f68 | gentle | 狗 | 汪…就这样待在你身边 | 1a825f68 |
| act_cute-gentle-dog-a12157af | gentle | 狗 | 又汪～偶尔撒个娇也很治愈呢 | a12157af |
| act_cute-gentle-dog-5c5a01d5 | gentle | 狗 | 好啦好啦，汪…就这样待在你身边 | 5c5a01d5 |
| act_cute-gentle-dog-0306519d | gentle | 狗 | 咦，汪～偶尔撒个娇也很治愈呢 | 0306519d |
| act_cute-gentle-dog-86a15186 | gentle | 狗 | 今天团团汪…就这样待在你身边 | 86a15186 |

#### 提醒喝水（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| remind_water-soft-cat-83b23b86 | soft | 猫 | 喵…主人也喝口水嘛 | 83b23b86 |
| remind_water-soft-cat-851cb52e | soft | 猫 | 又喵…要多喝水才健康哦 | 851cb52e |
| remind_water-soft-cat-145922e9 | soft | 猫 | 好啦好啦，喵…主人也喝口水嘛 | 145922e9 |
| remind_water-soft-cat-5a5a8ad3 | soft | 猫 | 咦，喵…要多喝水才健康哦 | 5a5a8ad3 |
| remind_water-soft-cat-fdfb5ec3 | soft | 猫 | 今天毛球喵…主人也喝口水嘛 | fdfb5ec3 |
| remind_water-soft-cat-45d18437 | soft | 猫 | 喵…要多喝水才健康哦 | 45d18437 |
| remind_water-soft-cat-7bc13b57 | soft | 猫 | 又喵…主人也喝口水嘛 | 7bc13b57 |
| remind_water-soft-cat-72981cdc | soft | 猫 | 好啦好啦，喵…要多喝水才健康哦 | 72981cdc |
| remind_water-soft-cat-8edfb00a | soft | 猫 | 咦，喵…主人也喝口水嘛 | 8edfb00a |
| remind_water-soft-cat-d2923feb | soft | 猫 | 今天团团喵…要多喝水才健康哦 | d2923feb |
| remind_water-soft-dog-c7271cdd | soft | 狗 | 汪…主人也喝口水嘛 | c7271cdd |
| remind_water-soft-dog-0c3693df | soft | 狗 | 又汪…要多喝水才健康哦 | 0c3693df |
| remind_water-soft-dog-e4514e47 | soft | 狗 | 好啦好啦，汪…主人也喝口水嘛 | e4514e47 |
| remind_water-soft-dog-a627c06c | soft | 狗 | 咦，汪…要多喝水才健康哦 | a627c06c |
| remind_water-soft-dog-e700e7a7 | soft | 狗 | 今天毛球汪…主人也喝口水嘛 | e700e7a7 |
| remind_water-soft-dog-dc016393 | soft | 狗 | 汪…要多喝水才健康哦 | dc016393 |
| remind_water-soft-dog-8ec7608a | soft | 狗 | 又汪…主人也喝口水嘛 | 8ec7608a |
| remind_water-soft-dog-f93d0549 | soft | 狗 | 好啦好啦，汪…要多喝水才健康哦 | f93d0549 |
| remind_water-soft-dog-1588adb1 | soft | 狗 | 咦，汪…主人也喝口水嘛 | 1588adb1 |
| remind_water-soft-dog-f765e64b | soft | 狗 | 今天团团汪…要多喝水才健康哦 | f765e64b |
| remind_water-vivid-cat-7f5ce1fe | vivid | 猫 | 喵！喝水打卡时间到！ | 7f5ce1fe |
| remind_water-vivid-cat-34e8e419 | vivid | 猫 | 又本猫监督你喝水喵！不许偷懒！ | 34e8e419 |
| remind_water-vivid-cat-6ac77f03 | vivid | 猫 | 好啦好啦，喵！喝水打卡时间到！ | 6ac77f03 |
| remind_water-vivid-cat-7615d25e | vivid | 猫 | 咦，本猫监督你喝水喵！不许偷懒！ | 7615d25e |
| remind_water-vivid-cat-0a5b4bcc | vivid | 猫 | 今天毛球喵！喝水打卡时间到！ | 0a5b4bcc |
| remind_water-vivid-cat-a90d0cd9 | vivid | 猫 | 本猫监督你喝水喵！不许偷懒！ | a90d0cd9 |
| remind_water-vivid-cat-74e82c2d | vivid | 猫 | 又喵！喝水打卡时间到！ | 74e82c2d |
| remind_water-vivid-cat-1c9d481b | vivid | 猫 | 好啦好啦，本猫监督你喝水喵！不许偷懒！ | 1c9d481b |
| remind_water-vivid-cat-265127bf | vivid | 猫 | 咦，喵！喝水打卡时间到！ | 265127bf |
| remind_water-vivid-cat-6d178b94 | vivid | 猫 | 今天团团本猫监督你喝水喵！不许偷懒！ | 6d178b94 |
| remind_water-vivid-dog-666cb831 | vivid | 狗 | 汪！喝水打卡时间到！ | 666cb831 |
| remind_water-vivid-dog-20067d29 | vivid | 狗 | 又本狗监督你喝水汪！不许偷懒！ | 20067d29 |
| remind_water-vivid-dog-a965a253 | vivid | 狗 | 好啦好啦，汪！喝水打卡时间到！ | a965a253 |
| remind_water-vivid-dog-e8c61b21 | vivid | 狗 | 咦，本狗监督你喝水汪！不许偷懒！ | e8c61b21 |
| remind_water-vivid-dog-ee2010ad | vivid | 狗 | 今天毛球汪！喝水打卡时间到！ | ee2010ad |
| remind_water-vivid-dog-827d53c5 | vivid | 狗 | 本狗监督你喝水汪！不许偷懒！ | 827d53c5 |
| remind_water-vivid-dog-2137bfaf | vivid | 狗 | 又汪！喝水打卡时间到！ | 2137bfaf |
| remind_water-vivid-dog-34effe1f | vivid | 狗 | 好啦好啦，本狗监督你喝水汪！不许偷懒！ | 34effe1f |
| remind_water-vivid-dog-038cd1fb | vivid | 狗 | 咦，汪！喝水打卡时间到！ | 038cd1fb |
| remind_water-vivid-dog-1e7b3ba7 | vivid | 狗 | 今天团团本狗监督你喝水汪！不许偷懒！ | 1e7b3ba7 |
| remind_water-gentle-cat-09ca542e | gentle | 猫 | 喵～记得按时喝水哦 | 09ca542e |
| remind_water-gentle-cat-0c02995e | gentle | 猫 | 又喝口水休息一下吧喵 | 0c02995e |
| remind_water-gentle-cat-eca19a06 | gentle | 猫 | 好啦好啦，喵～记得按时喝水哦 | eca19a06 |
| remind_water-gentle-cat-b6ea1505 | gentle | 猫 | 咦，喝口水休息一下吧喵 | b6ea1505 |
| remind_water-gentle-cat-adc7106a | gentle | 猫 | 今天毛球喵～记得按时喝水哦 | adc7106a |
| remind_water-gentle-cat-c49ae1f4 | gentle | 猫 | 喝口水休息一下吧喵 | c49ae1f4 |
| remind_water-gentle-cat-fc474fdd | gentle | 猫 | 又喵～记得按时喝水哦 | fc474fdd |
| remind_water-gentle-cat-9d12895c | gentle | 猫 | 好啦好啦，喝口水休息一下吧喵 | 9d12895c |
| remind_water-gentle-cat-e5222ee4 | gentle | 猫 | 咦，喵～记得按时喝水哦 | e5222ee4 |
| remind_water-gentle-cat-7bdd9f81 | gentle | 猫 | 今天团团喝口水休息一下吧喵 | 7bdd9f81 |
| remind_water-gentle-dog-922c7be6 | gentle | 狗 | 汪～记得按时喝水哦 | 922c7be6 |
| remind_water-gentle-dog-36b08000 | gentle | 狗 | 又喝口水休息一下吧汪 | 36b08000 |
| remind_water-gentle-dog-de0b8f1c | gentle | 狗 | 好啦好啦，汪～记得按时喝水哦 | de0b8f1c |
| remind_water-gentle-dog-79f2c300 | gentle | 狗 | 咦，喝口水休息一下吧汪 | 79f2c300 |
| remind_water-gentle-dog-232640a4 | gentle | 狗 | 今天毛球汪～记得按时喝水哦 | 232640a4 |
| remind_water-gentle-dog-cc80f743 | gentle | 狗 | 喝口水休息一下吧汪 | cc80f743 |
| remind_water-gentle-dog-c42f8854 | gentle | 狗 | 又汪～记得按时喝水哦 | c42f8854 |
| remind_water-gentle-dog-91bd2680 | gentle | 狗 | 好啦好啦，喝口水休息一下吧汪 | 91bd2680 |
| remind_water-gentle-dog-6a84705c | gentle | 狗 | 咦，汪～记得按时喝水哦 | 6a84705c |
| remind_water-gentle-dog-b6e9daa2 | gentle | 狗 | 今天团团喝口水休息一下吧汪 | b6e9daa2 |

#### 升级/成长（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| level_up-soft-cat-19dcdb42 | soft | 猫 | 喵…我好像又长大了一点点 | 19dcdb42 |
| level_up-soft-cat-f5937a82 | soft | 猫 | 又成长值满了喵…我是不是更可爱了 | f5937a82 |
| level_up-soft-cat-d9cfee7a | soft | 猫 | 好啦好啦，喵…我好像又长大了一点点 | d9cfee7a |
| level_up-soft-cat-496845b8 | soft | 猫 | 咦，成长值满了喵…我是不是更可爱了 | 496845b8 |
| level_up-soft-cat-5b9b39ef | soft | 猫 | 今天毛球喵…我好像又长大了一点点 | 5b9b39ef |
| level_up-soft-cat-530bf9d1 | soft | 猫 | 成长值满了喵…我是不是更可爱了 | 530bf9d1 |
| level_up-soft-cat-1fbe6b05 | soft | 猫 | 又喵…我好像又长大了一点点 | 1fbe6b05 |
| level_up-soft-cat-425474f9 | soft | 猫 | 好啦好啦，成长值满了喵…我是不是更可爱了 | 425474f9 |
| level_up-soft-cat-63c43b05 | soft | 猫 | 咦，喵…我好像又长大了一点点 | 63c43b05 |
| level_up-soft-cat-3b8f07c6 | soft | 猫 | 今天团团成长值满了喵…我是不是更可爱了 | 3b8f07c6 |
| level_up-soft-dog-d41d998f | soft | 狗 | 汪…我好像又长大了一点点 | d41d998f |
| level_up-soft-dog-f5f7ece4 | soft | 狗 | 又成长值满了汪…我是不是更可爱了 | f5f7ece4 |
| level_up-soft-dog-322e79fc | soft | 狗 | 好啦好啦，汪…我好像又长大了一点点 | 322e79fc |
| level_up-soft-dog-9c042fd3 | soft | 狗 | 咦，成长值满了汪…我是不是更可爱了 | 9c042fd3 |
| level_up-soft-dog-0f892372 | soft | 狗 | 今天毛球汪…我好像又长大了一点点 | 0f892372 |
| level_up-soft-dog-c14fed19 | soft | 狗 | 成长值满了汪…我是不是更可爱了 | c14fed19 |
| level_up-soft-dog-be369748 | soft | 狗 | 又汪…我好像又长大了一点点 | be369748 |
| level_up-soft-dog-34c3ece0 | soft | 狗 | 好啦好啦，成长值满了汪…我是不是更可爱了 | 34c3ece0 |
| level_up-soft-dog-e61050c0 | soft | 狗 | 咦，汪…我好像又长大了一点点 | e61050c0 |
| level_up-soft-dog-fae841c3 | soft | 狗 | 今天团团成长值满了汪…我是不是更可爱了 | fae841c3 |
| level_up-vivid-cat-26cc3257 | vivid | 猫 | 喵！升级啦！新造型解锁！ | 26cc3257 |
| level_up-vivid-cat-373900f7 | vivid | 猫 | 又喵！本猫进化完成！帅不帅！ | 373900f7 |
| level_up-vivid-cat-4da158bb | vivid | 猫 | 好啦好啦，喵！升级啦！新造型解锁！ | 4da158bb |
| level_up-vivid-cat-5336c275 | vivid | 猫 | 咦，喵！本猫进化完成！帅不帅！ | 5336c275 |
| level_up-vivid-cat-61b6daf6 | vivid | 猫 | 今天毛球喵！升级啦！新造型解锁！ | 61b6daf6 |
| level_up-vivid-cat-d2d2df15 | vivid | 猫 | 喵！本猫进化完成！帅不帅！ | d2d2df15 |
| level_up-vivid-cat-63a57dce | vivid | 猫 | 又喵！升级啦！新造型解锁！ | 63a57dce |
| level_up-vivid-cat-ddce9b47 | vivid | 猫 | 好啦好啦，喵！本猫进化完成！帅不帅！ | ddce9b47 |
| level_up-vivid-cat-0d6f43b7 | vivid | 猫 | 咦，喵！升级啦！新造型解锁！ | 0d6f43b7 |
| level_up-vivid-cat-490604fc | vivid | 猫 | 今天团团喵！本猫进化完成！帅不帅！ | 490604fc |
| level_up-vivid-dog-481b2ee7 | vivid | 狗 | 汪！升级啦！新造型解锁！ | 481b2ee7 |
| level_up-vivid-dog-ff0ca9ca | vivid | 狗 | 又汪！本狗进化完成！帅不帅！ | ff0ca9ca |
| level_up-vivid-dog-81a3b87e | vivid | 狗 | 好啦好啦，汪！升级啦！新造型解锁！ | 81a3b87e |
| level_up-vivid-dog-cfdfe181 | vivid | 狗 | 咦，汪！本狗进化完成！帅不帅！ | cfdfe181 |
| level_up-vivid-dog-e4f55e85 | vivid | 狗 | 今天毛球汪！升级啦！新造型解锁！ | e4f55e85 |
| level_up-vivid-dog-e25cec0f | vivid | 狗 | 汪！本狗进化完成！帅不帅！ | e25cec0f |
| level_up-vivid-dog-167ff7b6 | vivid | 狗 | 又汪！升级啦！新造型解锁！ | 167ff7b6 |
| level_up-vivid-dog-aead3b58 | vivid | 狗 | 好啦好啦，汪！本狗进化完成！帅不帅！ | aead3b58 |
| level_up-vivid-dog-4dac18e8 | vivid | 狗 | 咦，汪！升级啦！新造型解锁！ | 4dac18e8 |
| level_up-vivid-dog-8dc06bfd | vivid | 狗 | 今天团团汪！本狗进化完成！帅不帅！ | 8dc06bfd |
| level_up-gentle-cat-350cebfd | gentle | 猫 | 又长大了一点呢喵，谢谢你陪我 | 350cebfd |
| level_up-gentle-cat-898ac33a | gentle | 猫 | 又成长是一起完成的喵，谢谢你 | 898ac33a |
| level_up-gentle-cat-9513493c | gentle | 猫 | 好啦好啦，又长大了一点呢喵，谢谢你陪我 | 9513493c |
| level_up-gentle-cat-56d8d4bb | gentle | 猫 | 咦，成长是一起完成的喵，谢谢你 | 56d8d4bb |
| level_up-gentle-cat-52ce9e39 | gentle | 猫 | 今天毛球又长大了一点呢喵，谢谢你陪我 | 52ce9e39 |
| level_up-gentle-cat-e9f801b9 | gentle | 猫 | 成长是一起完成的喵，谢谢你 | e9f801b9 |
| level_up-gentle-cat-3ce7964c | gentle | 猫 | 又又长大了一点呢喵，谢谢你陪我 | 3ce7964c |
| level_up-gentle-cat-404b6eac | gentle | 猫 | 好啦好啦，成长是一起完成的喵，谢谢你 | 404b6eac |
| level_up-gentle-cat-fb2bac20 | gentle | 猫 | 咦，又长大了一点呢喵，谢谢你陪我 | fb2bac20 |
| level_up-gentle-cat-cf7213f1 | gentle | 猫 | 今天团团成长是一起完成的喵，谢谢你 | cf7213f1 |
| level_up-gentle-dog-24471491 | gentle | 狗 | 又长大了一点呢汪，谢谢你陪我 | 24471491 |
| level_up-gentle-dog-40572914 | gentle | 狗 | 又成长是一起完成的汪，谢谢你 | 40572914 |
| level_up-gentle-dog-48155151 | gentle | 狗 | 好啦好啦，又长大了一点呢汪，谢谢你陪我 | 48155151 |
| level_up-gentle-dog-ece3b9ab | gentle | 狗 | 咦，成长是一起完成的汪，谢谢你 | ece3b9ab |
| level_up-gentle-dog-326329ec | gentle | 狗 | 今天毛球又长大了一点呢汪，谢谢你陪我 | 326329ec |
| level_up-gentle-dog-f012a739 | gentle | 狗 | 成长是一起完成的汪，谢谢你 | f012a739 |
| level_up-gentle-dog-df139d6e | gentle | 狗 | 又又长大了一点呢汪，谢谢你陪我 | df139d6e |
| level_up-gentle-dog-d31ee45e | gentle | 狗 | 好啦好啦，成长是一起完成的汪，谢谢你 | d31ee45e |
| level_up-gentle-dog-895e6eae | gentle | 狗 | 咦，又长大了一点呢汪，谢谢你陪我 | 895e6eae |
| level_up-gentle-dog-e5557aa0 | gentle | 狗 | 今天团团成长是一起完成的汪，谢谢你 | e5557aa0 |

#### 节日祝福（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| festival-soft-cat-6d7fdd76 | soft | 猫 | 喵…节日快乐，蹭蹭你一大口 | 6d7fdd76 |
| festival-soft-cat-3581b69b | soft | 猫 | 又喵…今天是好日子，陪着你 | 3581b69b |
| festival-soft-cat-e01959a9 | soft | 猫 | 好啦好啦，喵…节日快乐，蹭蹭你一大口 | e01959a9 |
| festival-soft-cat-480b9691 | soft | 猫 | 咦，喵…今天是好日子，陪着你 | 480b9691 |
| festival-soft-cat-9cda5db9 | soft | 猫 | 今天毛球喵…节日快乐，蹭蹭你一大口 | 9cda5db9 |
| festival-soft-cat-2094a944 | soft | 猫 | 喵…今天是好日子，陪着你 | 2094a944 |
| festival-soft-cat-b17da200 | soft | 猫 | 又喵…节日快乐，蹭蹭你一大口 | b17da200 |
| festival-soft-cat-ea60423e | soft | 猫 | 好啦好啦，喵…今天是好日子，陪着你 | ea60423e |
| festival-soft-cat-9b2d281d | soft | 猫 | 咦，喵…节日快乐，蹭蹭你一大口 | 9b2d281d |
| festival-soft-cat-ba096810 | soft | 猫 | 今天团团喵…今天是好日子，陪着你 | ba096810 |
| festival-soft-dog-3a91bbf0 | soft | 狗 | 汪…节日快乐，扑过来你一大口 | 3a91bbf0 |
| festival-soft-dog-974745a0 | soft | 狗 | 又汪…今天是好日子，陪着你 | 974745a0 |
| festival-soft-dog-66c5feec | soft | 狗 | 好啦好啦，汪…节日快乐，扑过来你一大口 | 66c5feec |
| festival-soft-dog-d434d668 | soft | 狗 | 咦，汪…今天是好日子，陪着你 | d434d668 |
| festival-soft-dog-1cf857ea | soft | 狗 | 今天毛球汪…节日快乐，扑过来你一大口 | 1cf857ea |
| festival-soft-dog-b828dcd1 | soft | 狗 | 汪…今天是好日子，陪着你 | b828dcd1 |
| festival-soft-dog-f6f12388 | soft | 狗 | 又汪…节日快乐，扑过来你一大口 | f6f12388 |
| festival-soft-dog-391cd2ee | soft | 狗 | 好啦好啦，汪…今天是好日子，陪着你 | 391cd2ee |
| festival-soft-dog-6b63deb5 | soft | 狗 | 咦，汪…节日快乐，扑过来你一大口 | 6b63deb5 |
| festival-soft-dog-48f1fde7 | soft | 狗 | 今天团团汪…今天是好日子，陪着你 | 48f1fde7 |
| festival-vivid-cat-a45bb1b9 | vivid | 猫 | 喵！节日限定祝福！签收一下！ | a45bb1b9 |
| festival-vivid-cat-9f702c69 | vivid | 猫 | 又喵！庆祝模式开启！撒花！ | 9f702c69 |
| festival-vivid-cat-639c30e4 | vivid | 猫 | 好啦好啦，喵！节日限定祝福！签收一下！ | 639c30e4 |
| festival-vivid-cat-7b504e23 | vivid | 猫 | 咦，喵！庆祝模式开启！撒花！ | 7b504e23 |
| festival-vivid-cat-beae2308 | vivid | 猫 | 今天毛球喵！节日限定祝福！签收一下！ | beae2308 |
| festival-vivid-cat-312c16c8 | vivid | 猫 | 喵！庆祝模式开启！撒花！ | 312c16c8 |
| festival-vivid-cat-08876db6 | vivid | 猫 | 又喵！节日限定祝福！签收一下！ | 08876db6 |
| festival-vivid-cat-20ebddd9 | vivid | 猫 | 好啦好啦，喵！庆祝模式开启！撒花！ | 20ebddd9 |
| festival-vivid-cat-f48b3a91 | vivid | 猫 | 咦，喵！节日限定祝福！签收一下！ | f48b3a91 |
| festival-vivid-cat-15bc58ff | vivid | 猫 | 今天团团喵！庆祝模式开启！撒花！ | 15bc58ff |
| festival-vivid-dog-58c9c27f | vivid | 狗 | 汪！节日限定祝福！签收一下！ | 58c9c27f |
| festival-vivid-dog-f041fd25 | vivid | 狗 | 又汪！庆祝模式开启！撒花！ | f041fd25 |
| festival-vivid-dog-ec7d14b9 | vivid | 狗 | 好啦好啦，汪！节日限定祝福！签收一下！ | ec7d14b9 |
| festival-vivid-dog-65f0ffb5 | vivid | 狗 | 咦，汪！庆祝模式开启！撒花！ | 65f0ffb5 |
| festival-vivid-dog-d30321c5 | vivid | 狗 | 今天毛球汪！节日限定祝福！签收一下！ | d30321c5 |
| festival-vivid-dog-f17b2ee5 | vivid | 狗 | 汪！庆祝模式开启！撒花！ | f17b2ee5 |
| festival-vivid-dog-6f0c99e0 | vivid | 狗 | 又汪！节日限定祝福！签收一下！ | 6f0c99e0 |
| festival-vivid-dog-9eb68c64 | vivid | 狗 | 好啦好啦，汪！庆祝模式开启！撒花！ | 9eb68c64 |
| festival-vivid-dog-61394f7d | vivid | 狗 | 咦，汪！节日限定祝福！签收一下！ | 61394f7d |
| festival-vivid-dog-c5077eef | vivid | 狗 | 今天团团汪！庆祝模式开启！撒花！ | c5077eef |
| festival-gentle-cat-0c92ff1b | gentle | 猫 | 节日快乐喵，平平安安 | 0c92ff1b |
| festival-gentle-cat-8a20c57e | gentle | 猫 | 又祝你节日快乐喵，每天都快乐 | 8a20c57e |
| festival-gentle-cat-8946a517 | gentle | 猫 | 好啦好啦，节日快乐喵，平平安安 | 8946a517 |
| festival-gentle-cat-21f34d0e | gentle | 猫 | 咦，祝你节日快乐喵，每天都快乐 | 21f34d0e |
| festival-gentle-cat-49b244e7 | gentle | 猫 | 今天毛球节日快乐喵，平平安安 | 49b244e7 |
| festival-gentle-cat-67ca13e2 | gentle | 猫 | 祝你节日快乐喵，每天都快乐 | 67ca13e2 |
| festival-gentle-cat-0c2b1599 | gentle | 猫 | 又节日快乐喵，平平安安 | 0c2b1599 |
| festival-gentle-cat-c08b395b | gentle | 猫 | 好啦好啦，祝你节日快乐喵，每天都快乐 | c08b395b |
| festival-gentle-cat-92acf772 | gentle | 猫 | 咦，节日快乐喵，平平安安 | 92acf772 |
| festival-gentle-cat-d62b66ca | gentle | 猫 | 今天团团祝你节日快乐喵，每天都快乐 | d62b66ca |
| festival-gentle-dog-071cd7cf | gentle | 狗 | 节日快乐汪，平平安安 | 071cd7cf |
| festival-gentle-dog-ced39096 | gentle | 狗 | 又祝你节日快乐汪，每天都快乐 | ced39096 |
| festival-gentle-dog-80f6042e | gentle | 狗 | 好啦好啦，节日快乐汪，平平安安 | 80f6042e |
| festival-gentle-dog-42ccd884 | gentle | 狗 | 咦，祝你节日快乐汪，每天都快乐 | 42ccd884 |
| festival-gentle-dog-bd1955b9 | gentle | 狗 | 今天毛球节日快乐汪，平平安安 | bd1955b9 |
| festival-gentle-dog-8df2b5de | gentle | 狗 | 祝你节日快乐汪，每天都快乐 | 8df2b5de |
| festival-gentle-dog-f06419e7 | gentle | 狗 | 又节日快乐汪，平平安安 | f06419e7 |
| festival-gentle-dog-5d3d6621 | gentle | 狗 | 好啦好啦，祝你节日快乐汪，每天都快乐 | 5d3d6621 |
| festival-gentle-dog-c2a12a5b | gentle | 狗 | 咦，节日快乐汪，平平安安 | c2a12a5b |
| festival-gentle-dog-6ff76641 | gentle | 狗 | 今天团团祝你节日快乐汪，每天都快乐 | 6ff76641 |

#### 等主人回家（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| wait_home-soft-cat-5005c13c | soft | 猫 | 喵…蹲在门口等主人，是我的日常 | 5005c13c |
| wait_home-soft-cat-cc13490f | soft | 猫 | 又喵…今天也准时来接你啦 | cc13490f |
| wait_home-soft-cat-6363eda7 | soft | 猫 | 好啦好啦，喵…蹲在门口等主人，是我的日常 | 6363eda7 |
| wait_home-soft-cat-22084409 | soft | 猫 | 咦，喵…今天也准时来接你啦 | 22084409 |
| wait_home-soft-cat-96450811 | soft | 猫 | 今天毛球喵…蹲在门口等主人，是我的日常 | 96450811 |
| wait_home-soft-cat-1d7608d4 | soft | 猫 | 喵…今天也准时来接你啦 | 1d7608d4 |
| wait_home-soft-cat-013683ec | soft | 猫 | 又喵…蹲在门口等主人，是我的日常 | 013683ec |
| wait_home-soft-cat-4d608f81 | soft | 猫 | 好啦好啦，喵…今天也准时来接你啦 | 4d608f81 |
| wait_home-soft-cat-97646dc2 | soft | 猫 | 咦，喵…蹲在门口等主人，是我的日常 | 97646dc2 |
| wait_home-soft-cat-71943e31 | soft | 猫 | 今天团团喵…今天也准时来接你啦 | 71943e31 |
| wait_home-soft-dog-55db6b2b | soft | 狗 | 汪…蹲在门口等主人，是我的日常 | 55db6b2b |
| wait_home-soft-dog-d75e319d | soft | 狗 | 又汪…今天也准时来接你啦 | d75e319d |
| wait_home-soft-dog-33eaddaa | soft | 狗 | 好啦好啦，汪…蹲在门口等主人，是我的日常 | 33eaddaa |
| wait_home-soft-dog-a6b5b241 | soft | 狗 | 咦，汪…今天也准时来接你啦 | a6b5b241 |
| wait_home-soft-dog-e1f5aeca | soft | 狗 | 今天毛球汪…蹲在门口等主人，是我的日常 | e1f5aeca |
| wait_home-soft-dog-73b3a567 | soft | 狗 | 汪…今天也准时来接你啦 | 73b3a567 |
| wait_home-soft-dog-ef46c8f8 | soft | 狗 | 又汪…蹲在门口等主人，是我的日常 | ef46c8f8 |
| wait_home-soft-dog-9be781b7 | soft | 狗 | 好啦好啦，汪…今天也准时来接你啦 | 9be781b7 |
| wait_home-soft-dog-155165bf | soft | 狗 | 咦，汪…蹲在门口等主人，是我的日常 | 155165bf |
| wait_home-soft-dog-babbcf27 | soft | 狗 | 今天团团汪…今天也准时来接你啦 | babbcf27 |
| wait_home-vivid-cat-6149164a | vivid | 猫 | 喵！你的忠实门卫已到岗！ | 6149164a |
| wait_home-vivid-cat-3ea9cc5d | vivid | 猫 | 又喵！等了一整天就为这一刻！ | 3ea9cc5d |
| wait_home-vivid-cat-6fcbb400 | vivid | 猫 | 好啦好啦，喵！你的忠实门卫已到岗！ | 6fcbb400 |
| wait_home-vivid-cat-bbac9575 | vivid | 猫 | 咦，喵！等了一整天就为这一刻！ | bbac9575 |
| wait_home-vivid-cat-bf74ace4 | vivid | 猫 | 今天毛球喵！你的忠实门卫已到岗！ | bf74ace4 |
| wait_home-vivid-cat-7fb68990 | vivid | 猫 | 喵！等了一整天就为这一刻！ | 7fb68990 |
| wait_home-vivid-cat-13b5ddeb | vivid | 猫 | 又喵！你的忠实门卫已到岗！ | 13b5ddeb |
| wait_home-vivid-cat-34516ce5 | vivid | 猫 | 好啦好啦，喵！等了一整天就为这一刻！ | 34516ce5 |
| wait_home-vivid-cat-ae2f9cfe | vivid | 猫 | 咦，喵！你的忠实门卫已到岗！ | ae2f9cfe |
| wait_home-vivid-cat-ff7f4b5f | vivid | 猫 | 今天团团喵！等了一整天就为这一刻！ | ff7f4b5f |
| wait_home-vivid-dog-776739ae | vivid | 狗 | 汪！你的忠实门卫已到岗！ | 776739ae |
| wait_home-vivid-dog-0fd080fe | vivid | 狗 | 又汪！等了一整天就为这一刻！ | 0fd080fe |
| wait_home-vivid-dog-c7c5e5dd | vivid | 狗 | 好啦好啦，汪！你的忠实门卫已到岗！ | c7c5e5dd |
| wait_home-vivid-dog-cf2c0aeb | vivid | 狗 | 咦，汪！等了一整天就为这一刻！ | cf2c0aeb |
| wait_home-vivid-dog-da34d77b | vivid | 狗 | 今天毛球汪！你的忠实门卫已到岗！ | da34d77b |
| wait_home-vivid-dog-a819c9ae | vivid | 狗 | 汪！等了一整天就为这一刻！ | a819c9ae |
| wait_home-vivid-dog-da4ca462 | vivid | 狗 | 又汪！你的忠实门卫已到岗！ | da4ca462 |
| wait_home-vivid-dog-25f5fec1 | vivid | 狗 | 好啦好啦，汪！等了一整天就为这一刻！ | 25f5fec1 |
| wait_home-vivid-dog-5ed3846d | vivid | 狗 | 咦，汪！你的忠实门卫已到岗！ | 5ed3846d |
| wait_home-vivid-dog-8e231ced | vivid | 狗 | 今天团团汪！等了一整天就为这一刻！ | 8e231ced |
| wait_home-gentle-cat-7346f73f | gentle | 猫 | 等待也是爱的一种喵 | 7346f73f |
| wait_home-gentle-cat-22bc96c4 | gentle | 猫 | 又慢慢等你喵，不着急 | 22bc96c4 |
| wait_home-gentle-cat-b13fb827 | gentle | 猫 | 好啦好啦，等待也是爱的一种喵 | b13fb827 |
| wait_home-gentle-cat-83a2c76c | gentle | 猫 | 咦，慢慢等你喵，不着急 | 83a2c76c |
| wait_home-gentle-cat-ff548240 | gentle | 猫 | 今天毛球等待也是爱的一种喵 | ff548240 |
| wait_home-gentle-cat-1e196856 | gentle | 猫 | 慢慢等你喵，不着急 | 1e196856 |
| wait_home-gentle-cat-14425684 | gentle | 猫 | 又等待也是爱的一种喵 | 14425684 |
| wait_home-gentle-cat-782d540c | gentle | 猫 | 好啦好啦，慢慢等你喵，不着急 | 782d540c |
| wait_home-gentle-cat-94ee7f3e | gentle | 猫 | 咦，等待也是爱的一种喵 | 94ee7f3e |
| wait_home-gentle-cat-675021af | gentle | 猫 | 今天团团慢慢等你喵，不着急 | 675021af |
| wait_home-gentle-dog-b3cee718 | gentle | 狗 | 等待也是爱的一种汪 | b3cee718 |
| wait_home-gentle-dog-408f5838 | gentle | 狗 | 又慢慢等你汪，不着急 | 408f5838 |
| wait_home-gentle-dog-7cc6be8a | gentle | 狗 | 好啦好啦，等待也是爱的一种汪 | 7cc6be8a |
| wait_home-gentle-dog-42ee51ca | gentle | 狗 | 咦，慢慢等你汪，不着急 | 42ee51ca |
| wait_home-gentle-dog-a99db964 | gentle | 狗 | 今天毛球等待也是爱的一种汪 | a99db964 |
| wait_home-gentle-dog-c1961849 | gentle | 狗 | 慢慢等你汪，不着急 | c1961849 |
| wait_home-gentle-dog-67ed2d3e | gentle | 狗 | 又等待也是爱的一种汪 | 67ed2d3e |
| wait_home-gentle-dog-6ecd1919 | gentle | 狗 | 好啦好啦，慢慢等你汪，不着急 | 6ecd1919 |
| wait_home-gentle-dog-b7ba7508 | gentle | 狗 | 咦，等待也是爱的一种汪 | b7ba7508 |
| wait_home-gentle-dog-c6f61b70 | gentle | 狗 | 今天团团慢慢等你汪，不着急 | c6f61b70 |

#### 道别（60 条）

| ID | 语气 | 物种 | 文本 | voiceId |
|---|---|---|---|---|
| bye-soft-cat-f15b9131 | soft | 猫 | 喵…主人早点回来哦 | f15b9131 |
| bye-soft-cat-51ad79ba | soft | 猫 | 又喵…出门注意安全嘛 | 51ad79ba |
| bye-soft-cat-8b9b79f5 | soft | 猫 | 好啦好啦，喵…主人早点回来哦 | 8b9b79f5 |
| bye-soft-cat-b916c203 | soft | 猫 | 咦，喵…出门注意安全嘛 | b916c203 |
| bye-soft-cat-7d0a6804 | soft | 猫 | 今天毛球喵…主人早点回来哦 | 7d0a6804 |
| bye-soft-cat-168aa14b | soft | 猫 | 喵…出门注意安全嘛 | 168aa14b |
| bye-soft-cat-0de19ae8 | soft | 猫 | 又喵…主人早点回来哦 | 0de19ae8 |
| bye-soft-cat-e341203b | soft | 猫 | 好啦好啦，喵…出门注意安全嘛 | e341203b |
| bye-soft-cat-70e3cded | soft | 猫 | 咦，喵…主人早点回来哦 | 70e3cded |
| bye-soft-cat-991f1f8d | soft | 猫 | 今天团团喵…出门注意安全嘛 | 991f1f8d |
| bye-soft-dog-bec1b297 | soft | 狗 | 汪…主人早点回来哦 | bec1b297 |
| bye-soft-dog-057524af | soft | 狗 | 又汪…出门注意安全嘛 | 057524af |
| bye-soft-dog-eed1bb56 | soft | 狗 | 好啦好啦，汪…主人早点回来哦 | eed1bb56 |
| bye-soft-dog-53e61a5c | soft | 狗 | 咦，汪…出门注意安全嘛 | 53e61a5c |
| bye-soft-dog-258d03c0 | soft | 狗 | 今天毛球汪…主人早点回来哦 | 258d03c0 |
| bye-soft-dog-1414c70a | soft | 狗 | 汪…出门注意安全嘛 | 1414c70a |
| bye-soft-dog-fc612173 | soft | 狗 | 又汪…主人早点回来哦 | fc612173 |
| bye-soft-dog-0261ce8f | soft | 狗 | 好啦好啦，汪…出门注意安全嘛 | 0261ce8f |
| bye-soft-dog-ff7b88b6 | soft | 狗 | 咦，汪…主人早点回来哦 | ff7b88b6 |
| bye-soft-dog-fdaf7fea | soft | 狗 | 今天团团汪…出门注意安全嘛 | fdaf7fea |
| bye-vivid-cat-5f56052f | vivid | 猫 | 喵！出发吧！我看好你！ | 5f56052f |
| bye-vivid-cat-608cda80 | vivid | 猫 | 又喵！门口见！等你回来遛我！ | 608cda80 |
| bye-vivid-cat-ea0cb9b3 | vivid | 猫 | 好啦好啦，喵！出发吧！我看好你！ | ea0cb9b3 |
| bye-vivid-cat-01176a6e | vivid | 猫 | 咦，喵！门口见！等你回来遛我！ | 01176a6e |
| bye-vivid-cat-a4a917fc | vivid | 猫 | 今天毛球喵！出发吧！我看好你！ | a4a917fc |
| bye-vivid-cat-593df57c | vivid | 猫 | 喵！门口见！等你回来遛我！ | 593df57c |
| bye-vivid-cat-67d12a13 | vivid | 猫 | 又喵！出发吧！我看好你！ | 67d12a13 |
| bye-vivid-cat-74a16725 | vivid | 猫 | 好啦好啦，喵！门口见！等你回来遛我！ | 74a16725 |
| bye-vivid-cat-44329b7e | vivid | 猫 | 咦，喵！出发吧！我看好你！ | 44329b7e |
| bye-vivid-cat-2ee4ab3f | vivid | 猫 | 今天团团喵！门口见！等你回来遛我！ | 2ee4ab3f |
| bye-vivid-dog-4c4a6526 | vivid | 狗 | 汪！出发吧！我看好你！ | 4c4a6526 |
| bye-vivid-dog-0e9766ed | vivid | 狗 | 又汪！门口见！等你回来遛我！ | 0e9766ed |
| bye-vivid-dog-20604c26 | vivid | 狗 | 好啦好啦，汪！出发吧！我看好你！ | 20604c26 |
| bye-vivid-dog-9daefcb3 | vivid | 狗 | 咦，汪！门口见！等你回来遛我！ | 9daefcb3 |
| bye-vivid-dog-f58621d3 | vivid | 狗 | 今天毛球汪！出发吧！我看好你！ | f58621d3 |
| bye-vivid-dog-424ebe77 | vivid | 狗 | 汪！门口见！等你回来遛我！ | 424ebe77 |
| bye-vivid-dog-302ec847 | vivid | 狗 | 又汪！出发吧！我看好你！ | 302ec847 |
| bye-vivid-dog-ac0872ca | vivid | 狗 | 好啦好啦，汪！门口见！等你回来遛我！ | ac0872ca |
| bye-vivid-dog-c33392bc | vivid | 狗 | 咦，汪！出发吧！我看好你！ | c33392bc |
| bye-vivid-dog-4de87e1e | vivid | 狗 | 今天团团汪！门口见！等你回来遛我！ | 4de87e1e |
| bye-gentle-cat-731cbc76 | gentle | 猫 | 慢走喵，路上小心 | 731cbc76 |
| bye-gentle-cat-23a98848 | gentle | 猫 | 又今天的道别是为了更好的重逢喵 | 23a98848 |
| bye-gentle-cat-8c6925e9 | gentle | 猫 | 好啦好啦，慢走喵，路上小心 | 8c6925e9 |
| bye-gentle-cat-754db046 | gentle | 猫 | 咦，今天的道别是为了更好的重逢喵 | 754db046 |
| bye-gentle-cat-42e34527 | gentle | 猫 | 今天毛球慢走喵，路上小心 | 42e34527 |
| bye-gentle-cat-3ecb7ab6 | gentle | 猫 | 今天的道别是为了更好的重逢喵 | 3ecb7ab6 |
| bye-gentle-cat-b75c006e | gentle | 猫 | 又慢走喵，路上小心 | b75c006e |
| bye-gentle-cat-729ab0a6 | gentle | 猫 | 好啦好啦，今天的道别是为了更好的重逢喵 | 729ab0a6 |
| bye-gentle-cat-02faef42 | gentle | 猫 | 咦，慢走喵，路上小心 | 02faef42 |
| bye-gentle-cat-2c9468e7 | gentle | 猫 | 今天团团今天的道别是为了更好的重逢喵 | 2c9468e7 |
| bye-gentle-dog-913b57bc | gentle | 狗 | 慢走汪，路上小心 | 913b57bc |
| bye-gentle-dog-fac05ccb | gentle | 狗 | 又今天的道别是为了更好的重逢汪 | fac05ccb |
| bye-gentle-dog-be08238d | gentle | 狗 | 好啦好啦，慢走汪，路上小心 | be08238d |
| bye-gentle-dog-ba1e327f | gentle | 狗 | 咦，今天的道别是为了更好的重逢汪 | ba1e327f |
| bye-gentle-dog-5b25a912 | gentle | 狗 | 今天毛球慢走汪，路上小心 | 5b25a912 |
| bye-gentle-dog-08eb9762 | gentle | 狗 | 今天的道别是为了更好的重逢汪 | 08eb9762 |
| bye-gentle-dog-247eccc7 | gentle | 狗 | 又慢走汪，路上小心 | 247eccc7 |
| bye-gentle-dog-2195b360 | gentle | 狗 | 好啦好啦，今天的道别是为了更好的重逢汪 | 2195b360 |
| bye-gentle-dog-e67c916e | gentle | 狗 | 咦，慢走汪，路上小心 | e67c916e |
| bye-gentle-dog-1e78b289 | gentle | 狗 | 今天团团今天的道别是为了更好的重逢汪 | 1e78b289 |

**合计：1200 条**（20 意图 × 3 语气 × 20 条，猫狗各半）

## 二、美术切图规范（G-11）

### 2.1 范围矩阵：2 品种 × 6 动作 × 3–5 帧

| 动作 | 帧数 | 说明 | 复用意图 |
|---|---|---|---|
| idle | 4 | 待机呼吸 + 尾巴摆动 | greet / bored / wait_home |
| eat | 5 | 低头→咀嚼→抬头舔嘴 | hungry / after_eat |
| play | 5 | 起手→扑跳→翻滚 | want_play / praised |
| sleep | 3 | 蜷缩→呼吸起伏→zzZ 气泡 | sleepy / goodnight |
| petted | 4 | 闭眼→眯眼→{purr} 纹波动 | petted / act_cute / after_clean |
| happy | 5 | 弹跳→转圈→星星粒子 | level_up / festival / praised |

### 2.2 命名规范
```
pet_{species}_{action}_f{frame:02d}.png
species: cat | dog      action: idle|eat|play|sleep|petted|happy      frame: 01..05
示例: pet_cat_eat_f01.png / pet_dog_play_f05.png
```

- 单帧画布 **256×256**，宠物主体占画布 80%，安全边距 24px
- 图集：1024×1024（每品种一张，同品种全部帧打包），Cocos 打包后自动 trim
- 关键帧对齐：所有动作第 1 帧必须回到 idle_f01 姿态，保证循环切换不跳变
- 配色从设计令牌取值（见第四节），禁止硬编码色值
- 命名 lint：`^pet_(cat|dog)_(idle|eat|play|sleep|petted|happy)_f(0[1-5])\.png$`

## 三、语音包规范（G-12，400 条）

### 3.1 选料规则（1200 → 400）
- 每意图 × 每物种取 **10 条**（20 × 2 × 10 = 400）
- 优先级：soft 4 条 / vivid 3 条 / gentle 3 条（陪伴场景 soft 为主）
- 同意图内文本最长与最短各保留 1 条，保证语音节奏多样性
### 3.2 voiceId 规则
```python
voice_id = sha1(text).hexdigest()[:8]   # 与语料表 voiceId 列一致
```
### 3.3 CDN 目录结构
```
cdn://pet/voice/v1/
  ├── cat/{intent}/{voiceId}.mp3
  ├── dog/{intent}/{voiceId}.mp3
  └── index.json
```
### 3.4 索引表 index.json（示例）
```json
{
  "version": "v1",
  "generatedAt": "2026-11-17",
  "entries": [
    {
      "id": "greet-soft-cat-3ab12cd9",
      "intent": "greet",
      "tone": "soft",
      "species": "cat",
      "text": "喵～主人回来啦，蹭蹭你一下哦",
      "voiceId": "3ab12cd9",
      "url": "cat/greet/3ab12cd9.mp3",
      "duration": 1.8,
      "tts": "duixiangyin-soft"
    },
    {
      "id": "greet-vivid-dog-7c04ee21",
      "intent": "greet",
      "tone": "vivid",
      "species": "dog",
      "text": "汪！今天也要元气满满哦！",
      "voiceId": "7c04ee21",
      "url": "dog/greet/7c04ee21.mp3",
      "duration": 1.5,
      "tts": "duixiangyin-vivid"
    }
  ]
}
```
### 3.5 TTS 合成参数建议

| 档位 | 语速 | 音调 | 情感标签 |
|---|---|---|---|
| soft | 0.9× | -2 semitones | cute/soft |
| vivid | 1.1× | +1 semitone | lively |
| gentle | 0.95× | 0 | warm |

- 单条 ≤ 6 秒；格式 mp3 48kbps（试听版）/ ogg 96kbps（上线版）
- TTS 费用估算：400 条 × 4 字均长，主流 TTS 按 2 万字符内免费档可覆盖大部分，超出按量计费

## 四、设计令牌落地（G-13：DESIGN.md → design-tokens.json → Cocos 常量）

### 4.1 design-tokens.json（唯一真源）
```json
{
  "color": {
    "bg": "#f5f6f8",
    "panel": "#ffffff",
    "line": "#ececf0",
    "line2": "#e2e4ea",
    "text": "#1c1f26",
    "muted": "#8a8f9c",
    "brand": "#5b4ef0",
    "brandSoft": "#eeecfe",
    "ok": "#22b07d",
    "okSoft": "#e6f7f0",
    "warn": "#f5a623",
    "catPrimary": "#f5a623",
    "dogPrimary": "#3a9bfd"
  },
  "radius": {
    "panel": 16,
    "btn": 999,
    "chip": 11
  },
  "spacing": {
    "xs": 4,
    "sm": 8,
    "md": 16,
    "lg": 24
  },
  "font": {
    "sizeTitle": 24,
    "sizeBody": 15,
    "sizeMeta": 12,
    "family": "PingFang SC"
  },
  "motion": {
    "frameMs": 120,
    "tweenMs": 260,
    "bubbleMs": 2200,
    "emotionFadeMs": 400
  },
  "bar": {
    "hunger": "hunger",
    "mood": "mood",
    "clean": "clean",
    "energy": "energy"
  }
}
```
### 4.2 Cocos 常量（由 tokens 生成，禁止手改）
```typescript
// DESIGN_TOKENS.ts —— 由 design-tokens.json 自动生成
export const DESIGN = {
  COLOR: {
    BG: '#f5f6f8',
    PANEL: '#ffffff',
    LINE: '#ececf0',
    LINE2: '#e2e4ea',
    TEXT: '#1c1f26',
    MUTED: '#8a8f9c',
    BRAND: '#5b4ef0',
    BRANDSOFT: '#eeecfe',
    OK: '#22b07d',
    OKSOFT: '#e6f7f0',
    WARN: '#f5a623',
    CATPRIMARY: '#f5a623',
    DOGPRIMARY: '#3a9bfd',
  },
  RADIUS: { PANEL: 16, BTN: 999, CHIP: 11 },
  SPACING: { XS: 4, SM: 8, MD: 16, LG: 24 },
  MOTION: { FRAME_MS: 120, TWEEN_MS: 260, BUBBLE_MS: 2200 },
} as const;
```
### 4.3 落地流程

1. DESIGN.md 定稿（本文档即初版）→ 2. 生成 `design-tokens.json` → 3. 脚本产出 `DESIGN_TOKENS.ts` 与 UI 主题 → 4. 改样式只改 tokens，重新生成，禁止在代码里散落魔法值
