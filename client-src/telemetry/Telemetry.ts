/**
 * 埋点缓冲：客户端批量上报，弱网不丢
 */
export interface MetricEvent {
  name: string;
  at: number;
  props?: Record<string, string | number | boolean>;
}

export class Telemetry {
  private buffer: MetricEvent[] = [];
  private readonly maxSize: number;
  private readonly flushMs: number;
  private timer: ReturnType<typeof setTimeout> | null = null;

  private readonly send: (events: MetricEvent[]) => Promise<boolean>;

  constructor(
    send: (events: MetricEvent[]) => Promise<boolean>,
    opts: { maxSize?: number; flushMs?: number } = {}
  ) {
    this.send = send;
    this.maxSize = opts.maxSize ?? 20;
    this.flushMs = opts.flushMs ?? 15_000;
  }

  track(name: string, props?: MetricEvent['props'], at = Date.now()): void {
    this.buffer.push({ name, at, props });
    if (this.buffer.length >= this.maxSize) void this.flush();
    else if (!this.timer) this.timer = setTimeout(() => void this.flush(), this.flushMs);
  }

  /** 上报成功就清空；失败保留（下次重试），最多保留 3 倍 maxSize */
  async flush(): Promise<boolean> {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    if (!this.buffer.length) return true;
    const batch = this.buffer.slice();
    try {
      const ok = await this.send(batch);
      if (ok) {
        this.buffer = this.buffer.filter((e) => !batch.includes(e));
        return true;
      }
      this.buffer = this.buffer.slice(-this.maxSize * 3);
      return false;
    } catch {
      this.buffer = this.buffer.slice(-this.maxSize * 3);
      return false;
    }
  }

  size(): number { return this.buffer.length; }
  peek(): MetricEvent[] { return [...this.buffer]; }
}