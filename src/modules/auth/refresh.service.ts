import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class RefreshService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async create(userId: number): Promise<string> {
    const expiresIn = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800');
    const expiresAt = new Date(
      Math.round(Date.now() / 1000 + expiresIn) * 1000,
    );

    const token = this.jwtService.sign(
      { sub: userId, jti: randomUUID() },
      { expiresIn },
    );

    await this.prisma.refreshToken.create({
      data: { userId, expiresAt },
    });

    return token;
  }

  async revokeByToken(token: string): Promise<void> {
    if (!token) return;

    const payload = this.jwtService.decode(token);

    const jti = payload?.jti;
    if (!jti) {
      throw new Error('Invalid token: jti not found');
    }

    await this.revokeById(String(jti));
  }

  async revokeById(id: string): Promise<void> {
    if (!id) return;

    await this.prisma.refreshToken.deleteMany({
      where: { id },
    });
  }

  async revokeByUserId(userId: number): Promise<void> {
    if (!userId) return;

    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async clearExpired(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
