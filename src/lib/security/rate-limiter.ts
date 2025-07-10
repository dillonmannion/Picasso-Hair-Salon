type RequestRecord = {
  count: number;
  firstRequestTime: number;
};

const DEFAULT_LIMIT = 100;
const DEFAULT_WINDOW_MINUTES = 15;
const MINUTES_TO_MS = 60 * 1000;

export class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map();
  private readonly limit = DEFAULT_LIMIT;
  private readonly windowMs = DEFAULT_WINDOW_MINUTES * MINUTES_TO_MS;
  private lastCleanup = Date.now();
  private readonly cleanupIntervalMs = this.windowMs;

  checkLimit(ip: string): boolean {
    const now = Date.now();
    
    this.cleanupOldEntries(now);
    
    const record = this.requests.get(ip);

    if (!record) {
      this.requests.set(ip, { count: 1, firstRequestTime: now });
      return true;
    }

    const timeSinceFirst = now - record.firstRequestTime;

    if (timeSinceFirst >= this.windowMs) {
      this.requests.set(ip, { count: 1, firstRequestTime: now });
      return true;
    }

    if (record.count >= this.limit) {
      return false;
    }

    record.count++;
    return true;
  }

  private cleanupOldEntries(now: number): void {
    if (now - this.lastCleanup < this.cleanupIntervalMs) {
      return;
    }

    this.lastCleanup = now;

    for (const [ip, record] of this.requests.entries()) {
      if (now - record.firstRequestTime >= this.windowMs) {
        this.requests.delete(ip);
      }
    }
  }
}