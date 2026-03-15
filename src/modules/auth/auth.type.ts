export type AccessTokenPayload = {
  sub: number;
  iat: number;
  exp: number;
};

export type RefreshTokenPayload = {
  sub: number;
  jti: string;
  iat: number;
  exp: number;
};
