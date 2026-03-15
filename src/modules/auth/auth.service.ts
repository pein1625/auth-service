import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { PublicUser } from '../user/user.type';
import { LoginDto } from './dto/login.dto';
import { verifyPassword } from 'src/utils/hashing';
import { TokenService } from './token.service';
import { RefreshService } from './refresh.service';
import { AccessTokenPayload, RefreshTokenPayload } from './auth.type';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private refreshService: RefreshService,
    private jwtService: JwtService,
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

  async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    await this.refreshService.revokeByToken(refreshToken);

    const payload: RefreshTokenPayload = this.jwtService.decode(refreshToken);

    const { sub: userId, jti } = payload;

    if (!jti) {
      throw new Error('Invalid token: jti not found');
    }

    const newAccessToken = await this.tokenService.signAccessToken(userId);
    const newRefreshToken = await this.refreshService.create(userId);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const { password } = dto;

    const user = await this.userService.getByIdForAuth(userId);

    const isNewPasswordSameAsOldPassword = await verifyPassword(
      user.password,
      password,
    );

    if (isNewPasswordSameAsOldPassword) {
      throw new BadRequestException(
        'New password cannot be the same as the old password',
      );
    }

    await this.userService.update(userId, { password });
  }
}
