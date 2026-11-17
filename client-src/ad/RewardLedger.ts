/**
 * 广告发奖凭据（客户端侧去重）
 * 服务端以 nonce 唯一性为准，这里只防止客户端重复发起同一笔请求
 */
export class RewardLedger {
  private readonly seen = new Set<string>();
  private pending: string[] = [];

  issue(slot: string, now: number): string {
    const nonce = `${slot}-${now}-${Math.random().toString(36).slice(2, 8)}`;
    this.pending.push(nonce);
    return nonce;
  }

  /** 标记已提交（防止同一 nonce 重复发） */
  markSent(nonce: string): boolean {
    if (this.seen.has(nonce)) return false;
    this.seen.add(nonce);
    this.pending = this.pending.filter((n) => n !== nonce);
    return true;
  }

  /** 被服务端拒绝（超限等）时回滚，允许用户下次重试 */
  rollback(nonce: string): void {
    this.seen.delete(nonce);
  }

  pendingNonces(): string[] { return [...this.pending]; }
  has(nonce: string): boolean { return this.seen.has(nonce); }
}