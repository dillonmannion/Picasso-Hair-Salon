import { z } from 'zod';
import type { VercelKV } from '@vercel/kv';

const RateLimiterConfigSchema = z.object({
  maxAttempts: z.number().positive(),
  windowSeconds: z.number().positive(),
  keyPrefix: z.string().optional(),
});

const RateLimitResultSchema = z.object({
  allowed: z.boolean(),
  remaining: z.number().nonnegative(),
  resetAt: z.date(),
});

export type RateLimiterConfig = z.infer<typeof RateLimiterConfigSchema>;
export type RateLimitResult = z.infer<typeof RateLimitResultSchema>;

export class EdgeRateLimiter {
  private readonly config: RateLimiterConfig;
  private readonly kv: VercelKV;

  constructor(kv: VercelKV, config: RateLimiterConfig) {
    this.config = RateLimiterConfigSchema.parse(config);
    this.kv = kv;
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = this.buildKey(identifier);
    
    try {
      const count = await this.kv.incr(key);
      
      if (count === 1) {
        await this.kv.expire(key, this.config.windowSeconds);
      }
      
      return this.buildResult(count);
    } catch {
      return this.buildResult(0);
    }
  }

  getResultSchema() {
    return RateLimitResultSchema;
  }

  getConfig() {
    return this.config;
  }

  private buildKey(identifier: string): string {
    const prefix = this.config.keyPrefix || '';
    return prefix ? `${prefix}:rate_limit:${identifier}` : `rate_limit:${identifier}`;
  }

  private buildResult(count: number): RateLimitResult {
    const allowed = count === 0 || count <= this.config.maxAttempts;
    const remaining = count === 0 
      ? this.config.maxAttempts 
      : Math.max(0, this.config.maxAttempts - count);
    const resetAt = new Date(Date.now() + this.config.windowSeconds * 1000);
    
    return { allowed, remaining, resetAt };
  }
}