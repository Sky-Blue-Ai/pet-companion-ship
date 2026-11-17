/**
 * 云函数调用封装（客户端）
 * - 统一超时、重试、错误归一
 * - 不可用时降级为本地只读快照（不写回服务端）
 */
export interface CloudApiOptions {
  timeoutMs?: number;
  retries?: number;
  call: (name: string, payload: unknown) => Promise<unknown>;
  onError?: (e: ApiError) => void;
}

export interface ApiError {
  code: 'TIMEOUT' | 'NETWORK' | 'SERVER' | 'NO_PET' | 'INTERNAL';
  message: string;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export class CloudApi {
  private readonly timeoutMs: number;
  private readonly retries: number;
  private readonly opts: CloudApiOptions;
  constructor(opts: CloudApiOptions) {
    this.opts = opts;
    this.timeoutMs = opts.timeoutMs ?? 6000;
    this.retries = opts.retries ?? 1;
  }

  async invoke<T>(name: string, payload: unknown = {}): Promise<ApiResult<T>> {
    let lastErr: ApiError = { code: 'NETWORK', message: 'unknown' };
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const raw = await this.withTimeout(this.opts.call(name, payload));
        const res = raw as { ok?: boolean; data?: T; error?: { code?: string; message?: string } };
        if (res && res.ok === false) {
          const err: ApiError = {
            code: (res.error?.code as ApiError['code']) ?? 'SERVER',
            message: res.error?.message ?? '服务端返回失败'
          };
          this.opts.onError?.(err);
          return { ok: false, error: err };
        }
        return { ok: true, data: (res?.data ?? (res as unknown)) as T };
      } catch (e) {
        lastErr = e as ApiError;
        if (attempt < this.retries) await this.sleep(120 * (attempt + 1));
      }
    }
    this.opts.onError?.(lastErr);
    return { ok: false, error: lastErr };
  }

  private withTimeout<T>(p: Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const t = setTimeout(
        () => reject({ code: 'TIMEOUT', message: `调用超时 ${this.timeoutMs}ms` } as ApiError),
        this.timeoutMs
      );
      p.then((v) => { clearTimeout(t); resolve(v); })
       .catch((e) => {
         clearTimeout(t);
         reject(typeof e === 'object' && e && 'code' in e ? e : { code: 'NETWORK', message: String(e) });
       });
    });
  }

  private sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
}