import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { SignUpDto } from './dto/signup.dto';
import { UsersService } from '../users/services/users.service';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LogInDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private calculateTokenExpirationInMinutes(exp: number) {
    const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
    const timeRemainingInSeconds = exp - currentTime;
    return Math.ceil(timeRemainingInSeconds / 60);
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
      expiresIn:
        this.configService.get<number>('JWT_TOKEN_EXPIRATION_IN_MINUTES')! * 60,
    });
  }

  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY'),
      expiresIn:
        this.configService.get<number>(
          'JWT_REFRESH_TOKEN_EXPIRATION_IN_MINUTES',
        )! * 60,
    });
  }

  async signUp(signUpDto: SignUpDto): Promise<void> {
    const { firstName, lastName, email, password } = signUpDto;

    const salt = await bcrypt.genSalt(
      this.configService.get<number>('SALT_ROUNDS'),
    );
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.usersService.create({
      firstName: firstName.toLocaleLowerCase().trim(),
      lastName: lastName.toLocaleLowerCase().trim(),
      password: hashedPassword,
      email: email.toLocaleLowerCase().trim(),
    });
  }

  async validateUser(
    loginDto: LogInDto,
  ): Promise<Pick<User, 'email' | 'password'>> {
    const { email, password } = loginDto;
    const user = await this.usersService.findOneByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    throw new UnauthorizedException('Invalid credentials!');
  }

  async login(
    user: Pick<User, 'email' | 'password'>,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = { email: user.email };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshToken(
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string | null }> {
    try {
      const { email, exp } = this.jwtService.verify<JwtPayload>(
        oldRefreshToken,
        { secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY') },
      );

      const user = await this.usersService.findOneByEmail(email);
      if (!user) throw new UnauthorizedException();

      const remainingMins = this.calculateTokenExpirationInMinutes(exp!);
      const rotateRefreshToken =
        remainingMins <=
        this.configService.get<number>(
          'JWT_REFRESH_TOKEN_ROTATION_PERIOD_IN_MINUTES',
        )!;

      const [accessToken, refreshToken] = await Promise.all([
        this.generateAccessToken({ email }),
        rotateRefreshToken ? this.generateRefreshToken({ email }) : null,
      ]);

      return { accessToken, refreshToken };
    } catch (e) {
      console.log('🚀 ~ AuthService ~ e:', e);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
