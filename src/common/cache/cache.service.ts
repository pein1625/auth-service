import { Inject, Injectable } from '@nestjs/common';
import type { CacheAdapter } from './cache.interface';

@Injectable()
export class CacheService {
  constructor(
    @Inject('CACHE_ADAPTER')
    private readonly adapter: CacheAdapter,
  ) {}

  async get(key: string): Promise<string | null> {
    return await this.adapter.get(key);
  }

  async set(key: string, value: string, ttl = 60 * 60 * 2): Promise<void> {
    await this.adapter.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.adapter.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return await this.adapter.exists(key);
  }
}
