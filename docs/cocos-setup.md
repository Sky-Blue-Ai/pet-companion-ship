# Cocos 3D 工程搭建（W4 起，需在你 Mac 上操作）

这台 Linux 机器装不了 Cocos 编辑器，所以场景与 Prefab 需要你在编辑器里生成；代码已就绪，直接接。

## 1. 建工程

1. Cocos Dashboard → 新建 → **Cocos Creator 3.8.x（3D 模板）**，路径 `pet-companion-ship/client`。
2. 建好后把仓库 `shared/`、`server/`、`client-src/` 保留在原位置（不要复制进 `client/assets`，避免两份公式）。
3. `client/tsconfig.json` 增加 `"paths": { "@shared/*": ["../shared/*"], "@client/*": ["../client-src/*"] }`。

## 2. 建四个场景

| 场景 | 内容 | 出口 |
|---|---|---|
| `Boot.scene` | 加载条 + 品牌帧（未领养时三只宠物并排） | 3 秒内进 Home |
| `Home.scene` | 3D 房间 + 宠物 + HUD + 四个动作入口 | 打开就能看到它 |
| `Growth.scene` | 阶段卡 + 里程碑时间轴 | 数据来自 `getGrowth` |
| `Settings.scene` | 开关列表 + 开发者快进 | 通知/隐私可改 |

## 3. 相机与动画

- 新建 `CameraDirector` 节点脚本，挂三个机位：`idle`（默认）、`welcome`（宠物走向镜头时推进）、`closeup`（动作特写）。
- 宠物用 **Animation Controller**：`idle / walk / eat / play / sleep / rub / sick` 七个状态，转移规则写在 `PetAnimator.ts`（待建）。
- 每个动作 = 机位 + 动画 + 语音 + 数值四段，缺一段不算完成。

## 4. 分包

`assets/models3d`、`assets/animations`、`assets/audio` 设为分包；首包只留 Home 房间与 `idle`。

## 5. 联调

云开发环境建好后，`client/assets/scripts/core/CloudApi.ts` 的 `call` 指向 `wx.cloud.callFunction`，其余逻辑直接用 `client-src/` 下的模块（它们已有单测）。