/** Shared cache key for user token version. Used by Auth (TokenService) and User (sync on update). */
export const getUserTokenVersionCacheKey = (userId: number): string =>
  `user:${userId}:tokenVersion`;

export const getBlacklistCacheKey = (jti: string): string => `blackList:${jti}`;
