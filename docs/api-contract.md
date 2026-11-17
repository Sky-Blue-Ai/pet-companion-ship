# 接口契约（G-02）

所有云函数统一返回 `{ ok, data?, error? }`；`error.code` 见文末。写接口的幂等键 = `openid + 业务键`。

| # | 函数 | 入参 | 出参 | 说明 |
|---|---|---|---|---|
| 1 | `login` | `{ tzOffset }` | `{ account, pet? }` | 首次建档 + 时区校准 |
| 2 | `getPet` | `{}` | `{ pet, view }` | 内部先 settle 再返回（只读也推进） |
| 3 | `settlePet` | `{}` | `{ pet }` | 显式结算，定时触发器也调它 |
| 4 | `act` | `{ action: 'feed'|'clean'|'play'|'touch', itemId? }` | `{ pet, delta, lines, newMilestones }` | 所有交互写入口 |
| 5 | `talk` | `{ text }` | `{ lines, intent, tier, voiceIds }` | 语料引擎在本机/服务端同一份 |
| 6 | `claimAdReward` | `{ slot, nonce }` | `{ granted, pet, reason? }` | 校验日限额、nonce 唯一、免广告期 |
| 7 | `getGrowth` | `{}` | `{ milestones, events, shareCardUrl }` | 成长档案 |
| 8 | `saveSettings` | `{ settings }` | `{ settings }` | 通知 / 免打扰 / 定位 |
| 9 | `reportMetrics` | `{ events[] }` | `{ ok }` | 批量埋点，单次 ≤ 50 条 |
| 10 | `notify`（定时触发） | `{ type }` | `{ sent: number }` | 饿了 / 24h 未登录 / 里程碑 |

## 错误码

| code | 含义 | 客户端处理 |
|---|---|---|
| `NO_PET` | 还没领养 | 跳领养流程 |
| `NO_ENERGY` | 精力不足 | 弹广告或提示明日 |
| `DAILY_CAP` | 广告达上限 | 置灰按钮 |
| `UNKNOWN_FOOD` | 食物 id 非法 | 静默忽略并上报 |
| `TIMEOUT` / `NETWORK` | 网络 | 降级为本地只读，排队重试 |
| `INTERNAL` | 服务端异常 | 上报 + 提示稍后 |

## 三条约束

1. **写接口必须服务端权威**：`act` / `talk` / `claimAdReward` 的数值变化都以服务端返回为准，客户端只做动画。
2. **`nonce` 唯一**：同一 nonce 重复请求返回 `granted:false, reason:'dup'`（不进错误码，属正常拒绝）。
3. **限流**：单用户 `act` 5 次/秒、`talk` 1 次/2 秒，超出返回 `INTERNAL` 并记日志（防脚本刷）。