# client · Cocos Creator 3D 工程

v1.0 采用 3D 表现（Cocos Creator 3.x）。这个目录放 Cocos 工程本体，等场景骨架开始时由 Cocos 编辑器在此生成。

## 约定

- **不在这里写结算逻辑**：所有数值推进都调 `server/functions/settlePet`，客户端只做展示预测（引用 `shared/formulas.ts` 的同一套函数）。
- 目录规划（待生成）：

```
client/
  assets/
    scenes/      Boot / Home / Growth / Settings
    scripts/
      core/      GameApp  EventBus  TimeService  CloudApi
      pet/       PetController  PetAnimator(骨骼状态机)  StatePredictor
      camera/    CameraDirector（待机/迎接/特写 三机位）
      dialogue/  DialogueEngine（语料库）
      ui/        HudView  BubbleView  BagPanel  SettingsPanel
      ad/        AdService  RewardLedger
    prefabs/     Pet  FoodItem  Furniture  Toy  Bubble
    models3d/    房间与宠物模型（分包）
```

## 3D 约束（来自 G-21 性能与包体预算）

- 低端安卓 30fps，drawcall ≤ 80，同屏三角面 ≤ 8 万（待目标机型校准后固化）
- 首包只放「房间 + 宠物待机 + UI」，模型与动画走分包 + CDN
- 同屏光源 ≤ 2；昼夜与天气只换光照参数与天空盒，不换场景
- 质量档位：高 / 中 / 低（阴影开关、渲染分辨率、材质简化）