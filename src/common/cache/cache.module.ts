import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RedisService } from './redis/redis.service';

@Global()
@Module({
  providers: [
    CacheService,
    {
      provide: 'CACHE_ADAPTER',
      useClass: RedisService,
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
