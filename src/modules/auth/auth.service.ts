import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { PublicUser } from '../user/user.type';
import { LoginDto } from './dto/login.dto';
import { verifyPassword } from 'src/utils/hashing';
import { JwtService } from '@nestjs/jwt';
import { RefreshService } from './refresh/refresh.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private refreshService: RefreshService,
  ) {}

  async register(dto: RegisterDto): Promise<PublicUser> {
    const { email, password } = dto;

    const user = await this.userService.create({
      email,
      password,
    });

    return user;
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = dto;

    const user = await this.userService.findByEmailForAuth(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await verifyPassword(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign(
      { sub: user.id },
      {
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '900'),
      },
    );

    const refreshToken = await this.refreshService.create(user.id);

    return { accessToken, refreshToken };
  }

  async logout(userId: number, refreshToken: string): Promise<void> {
    if (!userId) return;

    await this.refreshService.revokeByToken(refreshToken);
  }

  async logoutAllDevices(userId: number): Promise<void> {
    await this.userService.incrementTokenVersion(userId);
    await this.refreshService.revokeByUserId(userId);
  }
}
