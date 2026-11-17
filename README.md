# 布丁 · AI 虚拟宠物陪伴成长（微信小游戏 · 3D）

一个「每天等你回家」的 AI 宠物养成小游戏：用户领养一只猫或狗，按真实时间照顾它（喂食 / 玩耍 / 说话 / 抱抱），它会长大、会生病、会记得你说过的话。

- 载体：**微信小游戏**（Cocos Creator 3D + 微信云开发）
- 表现：**3D**（3D 场景 + 骨骼动画，2D 稿仅作布局与文案基准）
- 范围：**v1.0 只做 V1（MVP）**，V2（抽卡 / 订阅）与 V3（短片 / 漫剧）不在本次范围
- 变现：v1.0 纯广告（IAA），个人主体、免版号

## 目录结构

```
shared/            客户端与服务端共用（唯一的真相来源）
  constants.ts     结算参数（衰减率、阈值、阶段天数）
  types.ts         PetState / SettleResult 等类型
  formulas.ts      结算引擎（纯函数，可单测）
server/functions/  微信云函数
  settlePet/       状态结算入口（业务与平台适配分离）
client/            Cocos Creator 工程（待建）
tests/             单元测试（node:test，零依赖）
tools/             语料 lint、语音批量生成等工具（待建）
```

## 快速开始

```bash
npm test          # 结算引擎 13 例单测，零依赖
```

需要 Node ≥ 22（用到 TypeScript 类型擦除直接跑 .ts）。

类型检查（可选，需要先装依赖）：

```bash
npm i -D typescript @types/node
npm run typecheck
```

## 进度（今晚完成 W1–W3 代码侧，W4–W7 见下）

| W | 内容 | 状态 |
|---|---|---|
| W1 | 结算引擎、参数、类型、仓库骨架、15 例单测 | ✅ 完成 |
| W2 | 动作核心（投喂/玩耍/清洁/对话/广告）、8 个云函数入口、适配器接口、接口契约、数据字典、端到端串联测试 | ✅ 代码完成（云开发适配器待你在控制台填 env） |
| W3 | 对话引擎（意图→语气档→槽位安全→变体避重→人格滤镜）、两品种 seed 语料 342 条、corpus-lint | ✅ 完成（等另一会话扩充到 1200 条） |
| W4 | Cocos 3D 四场景、CameraDirector | ⏳ 需你在 Mac 上用编辑器搭（步骤见 docs/cocos-setup.md） |
| W5 | 骨骼动画接入、动作四段协同 | ⏳ 依赖 3D 资产 |
| W6 | 广告接入（客户端 AdService + 服务端发奖校验）、埋点 | 🟡 服务端发奖与 Telemetry 已完成；wx 广告 SDK 绑定待接 |
| W7 | 3D 资产替换、语音包 | 🟡 语音索引工具已完成（329 条待合成）；3D 资产待美术 |

测试：`npm test` → **41 例全过**（结算 13 / 云函数 2 / 动作 9 / 对话 10 / 客户端 6 / 端到端 1）。

## 结算引擎的三条硬规则

1. **时间只信服务端**：`settle()` 不读系统时间，`now` 由调用方注入；客户端只做展示预测，不写回。
2. **夜间按小时加权**：22:00→02:00 这种跨夜区间，只有夜间那 2 小时按 0.5 衰减，不是整段打折。
3. **封顶 72 小时**：长期不登录数值触底但**不死亡**，回来照顾 2–3 次即可恢复。

## 约定

- 分支：`main` 直接开发（单人）；语料、文档类改动走同一个 PR 检查清单。
- 提交：`feat(scope): ...` / `fix(scope): ...` / `docs(scope): ...`，scope ∈ `client|server|shared|corpus|docs`。
- 命名：动画 `cat_idle` / `dog_eat`；云函数目录小驼峰；常量集中在 `shared/constants.ts`，禁止散落魔法数字。
- 单位：3D 场景 1 单位 = 1 米。

## 相关文档（飞书）

- 需求（V1 MVP）：https://my.feishu.cn/wiki/OIAGwpM3NiA6sikiScIcSmgpnNc
- 技术方案：https://my.feishu.cn/wiki/Lp8BwJvkni7MmtkBTOZc19Wxn1d
- 原型稿 v2（含 3D 视觉参考）：https://my.feishu.cn/wiki/U3RGwGOILiiI5gk4MvpcYpapnxb
- v1.0 缺口与推进计划：https://my.feishu.cn/wiki/EerswFvXdimBPhkdW58cmMYznge

## 下一步

1. 云函数 10 个 + 接口契约（G-02）与数据字典（G-03）
2. Cocos 3D 场景骨架（房间 + 相机 + 待机）与 `CameraDirector`
3. 语料库 v1 + corpus-lint（另一会话产出，接进来后跑 lint）
4. 3D 资产规范 / 性能预算 / 镜头脚本（G-20 / 21 / 22），美术外包开工前必须交付