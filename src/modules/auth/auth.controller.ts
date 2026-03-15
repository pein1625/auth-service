import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import type { AccessTokenPayload } from './auth.type';
import type { Request, Response } from 'express';

const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: parseInt(process.env.JWT_EXPIRES_IN || '900'),
    });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800'),
    });

    return { message: 'Login Successfully', accessToken, refreshToken };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as AccessTokenPayload | undefined;

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const cookies = req.cookies as Record<string, string> | undefined;
    const refreshToken: string = cookies?.refresh_token ?? '';

    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);

    await this.authService.logout(user, refreshToken);

    return { message: 'Logout Successfully' };
  }

  @Post('logout-all-devices')
  async logoutAllDevices(@Req() req: Request) {
    const user = req.user as AccessTokenPayload | undefined;
    const userId: number | undefined = user?.sub ?? 0;
    await this.authService.logoutAllDevices(userId);

    return { message: 'Logout All Devices Successfully' };
  }

  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }
}
