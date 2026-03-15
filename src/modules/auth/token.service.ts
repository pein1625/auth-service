import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CacheService } from 'src/common/cache/cache.service';
import {
  getBlacklistCacheKey,
  getUserTokenVersionCacheKey,
} from 'src/common/constants/cache-keys';
import { AccessTokenPayload } from './auth.type';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cache: CacheService,
    private readonly userService: UserService,
  ) {}

  async signAccessToken(userId: number): Promise<string> {
    const tokenVersion = await this.getTokenVersion(userId);
    return this.jwtService.sign(
      { sub: userId, jti: randomUUID(), ver: tokenVersion },
      { expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '900') },
    );
  }

  async verifyAccessToken(payload: AccessTokenPayload): Promise<boolean> {
    const { jti, sub, ver } = payload;

    if (await this.isInBlacklist(jti)) {
      throw new UnauthorizedException('Invalid token (1)');
    }

    const tokenVersion = await this.getTokenVersion(sub);

    if (tokenVersion !== ver) {
      throw new UnauthorizedException('Invalid token (2)');
    }

    return true;
  }

  async revokeAccessToken(payload: AccessTokenPayload): Promise<void> {
    await this.addToBlacklist(payload);
  }

  async addToBlacklist(user: AccessTokenPayload): Promise<void> {
    const { jti, exp } = user;
    const ttl = exp - Math.floor(Date.now() / 1000);
    await this.cache.set(getBlacklistCacheKey(jti), '1', ttl);
  }

  async isInBlacklist(jti: string): Promise<boolean> {
    return await this.cache.exists(getBlacklistCacheKey(jti));
  }

  async getTokenVersion(userId: number): Promise<number> {
    const cacheKey = getUserTokenVersionCacheKey(userId);
    const tokenVersion = await this.cache.get(cacheKey);

    if (tokenVersion !== null) {
      return parseInt(tokenVersion);
    }

    const user = await this.userService.getById(userId);

    await this.setTokenVersion(userId, user.tokenVersion);

    return user.tokenVersion;
  }

  async setTokenVersion(userId: number, tokenVersion: number): Promise<void> {
    const cacheKey = getUserTokenVersionCacheKey(userId);
    await this.cache.set(cacheKey, tokenVersion.toString());
  }

  async incrementTokenVersion(userId: number): Promise<number> {
    const user = await this.userService.getById(userId);
    const newTokenVersion = user.tokenVersion + 1;

    await this.userService.update(user.id, {
      tokenVersion: newTokenVersion,
    });
    await this.setTokenVersion(userId, newTokenVersion);

    return newTokenVersion;
  }
}
