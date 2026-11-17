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

## 已实现（W1）

| 项 | 状态 | 说明 |
|---|---|---|
| 结算引擎 | ✅ | `shared/formulas.ts`，纯函数、参数注入（时间/时区），客户端与服务端共用 |
| 结算参数 | ✅ | `shared/constants.ts`，衰减 8/3 每小时、夜间 0.5、封顶 72h、生病阈值 |
| 单元测试 | ✅ 13 例 | `tests/settle.test.ts`，覆盖跨零点、封顶幂等、时钟回拨、生病全程 |
| 云函数骨架 | ✅ | `server/functions/settlePet`，业务 `settlePetCore` 与 `wxAdapter` 解耦 |
| 仓库骨架 | ✅ | README / tsconfig / .gitignore / 目录约定 |

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