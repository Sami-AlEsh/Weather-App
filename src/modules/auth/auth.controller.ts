import {
  Controller,
  Post,
  Body,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { LogInDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { Cookies } from 'src/common/decorators/cookies.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginResponseDto } from './dto/login-response.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  async signup(@Body() signUpDto: SignUpDto): Promise<void> {
    return this.authService.signUp(signUpDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ type: LoginResponseDto })
  async login(
    @Body() loginDto: LogInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge:
        this.configService.get<number>(
          'JWT_REFRESH_TOKEN_EXPIRATION_IN_MINUTES',
        )! *
        60 *
        1000,
    });

    return { access_token: accessToken };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token, and rotate refresh token' })
  @ApiResponse({ type: LoginResponseDto })
  async refresh(
    @Cookies('refresh_token') oldRefreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    if (!oldRefreshToken) {
      res.clearCookie('refresh_token');
      throw new UnauthorizedException('Invalid tokens');
    }

    const { accessToken, refreshToken } =
      await this.authService.refreshToken(oldRefreshToken);

    // Rotate refresh token
    if (refreshToken) {
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'strict',
        path: '/auth/refresh',
        maxAge:
          this.configService.get<number>(
            'JWT_REFRESH_TOKEN_EXPIRATION_IN_MINUTES',
          )! *
          60 *
          1000,
      });
    }

    return { access_token: accessToken };
  }
}
