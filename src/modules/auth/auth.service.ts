import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { PublicUser } from '../user/user.type';
import { LoginDto } from './dto/login.dto';
import { verifyPassword } from 'src/utils/hashing';
import { TokenService } from './token.service';
import { RefreshService } from './refresh.service';
import { AccessTokenPayload } from './auth.type';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
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

    const accessToken = await this.tokenService.signAccessToken(user.id);
    const refreshToken = await this.refreshService.create(user.id);

    return { accessToken, refreshToken };
  }

  async logout(
    accessTokenPayload: AccessTokenPayload,
    refreshToken: string,
  ): Promise<void> {
    await this.tokenService.revokeAccessToken(accessTokenPayload);
    await this.refreshService.revokeByToken(refreshToken);
  }

  async logoutAllDevices(userId: number): Promise<void> {
    await this.tokenService.incrementTokenVersion(userId);
    await this.refreshService.revokeByUserId(userId);
  }
}
