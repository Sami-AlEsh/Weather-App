import {
  Controller,
  Post,
  Body,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { LogInDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { Cookies } from 'src/common/decorators/cookies.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  async login(@Body() loginDto: LogInDto, @Res() res: Response) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge:
        this.configService.get<number>('JWT_TOKEN_EXPIRATION_IN_MINUTES')! *
        60 *
        1000,
    });

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

    res.send({ message: 'Login successful' });
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token, and rotate refresh token' })
  async refresh(
    @Cookies('refresh_token') oldRefreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!oldRefreshToken) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      throw new UnauthorizedException('Invalid tokens');
    }

    const { accessToken, refreshToken } =
      await this.authService.refreshToken(oldRefreshToken);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge:
        this.configService.get<number>('JWT_TOKEN_EXPIRATION_IN_MINUTES')! *
        60 *
        1000,
    });

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

    res.send({ message: 'Token refreshed' });
  }
}
