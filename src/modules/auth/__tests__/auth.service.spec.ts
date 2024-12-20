import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { LogInDto } from '../dto/login.dto';
import { SignUpDto } from '../dto/signup.dto';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/services/users.service';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUsersService = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const signUpDto: SignUpDto = {
        firstName: 'sami',
        lastName: 'alesh',
        email: 'sami.alesh@test.com',
        password: 'password1234',
      };

      const hashedPassword = 'hashedPassword1234';
      bcrypt.hash = jest.fn().mockResolvedValue(hashedPassword);
      mockUsersService.create = jest.fn().mockResolvedValue(undefined);

      await authService.signUp(signUpDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(
        'password1234',
        expect.any(String),
      );

      expect(mockUsersService.create).toHaveBeenCalledWith({
        firstName: 'sami',
        lastName: 'alesh',
        email: 'sami.alesh@test.com',
        password: hashedPassword,
      });
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens for valid user credentials', async () => {
      const loginDto: LogInDto = {
        email: 'sami.alesh@test.com',
        password: 'password1234',
      };

      const user = { id: 1, password: 'hashedPassword' };
      const payload = { sub: user.id };
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';

      mockUsersService.findOne = jest.fn().mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      mockJwtService.signAsync = jest
        .fn()
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const result = await authService.login(loginDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password1234',
        user.password,
      );

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        payload,
        expect.any(Object),
      );
      expect(result).toEqual({ accessToken, refreshToken });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LogInDto = {
        email: 'sami.alesh@test.com',
        password: 'password4321',
      };

      const user = { id: 1, password: 'hashedPassword' };
      mockUsersService.findOne = jest.fn().mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should return new access token + refresh token for near expire refresh token', async () => {
      const oldRefreshToken = 'oldRefreshToken';
      const decodedToken = {
        sub: 1,
        exp: Math.floor(Date.now() / 1000) + 60, // add 1h
      };
      const user = { id: 1 };
      const newAccessToken = 'newAccessToken';
      const newRefreshToken = 'newRefreshToken';

      mockJwtService.verify = jest.fn().mockReturnValue(decodedToken);
      mockUsersService.findOne = jest.fn().mockResolvedValue(user);
      mockJwtService.signAsync = jest
        .fn()
        .mockResolvedValueOnce(newAccessToken)
        .mockResolvedValueOnce(newRefreshToken);
      mockConfigService.get = jest.fn().mockReturnValue(5); // Assume rotation period is 5m

      const result = await authService.refreshToken(oldRefreshToken);

      expect(mockJwtService.verify).toHaveBeenCalledWith(
        oldRefreshToken,
        expect.any(Object),
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: user.id },
        expect.any(Object),
      );
      expect(result).toEqual({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    });

    it('should return access token and null refresh token when rotation is not required', async () => {
      const oldRefreshToken = 'oldRefreshToken';
      const decodedToken = { sub: 1, exp: Math.floor(Date.now() / 1000) + 120 }; // will expire after 2m
      const user = { id: 1 };
      const newAccessToken = 'newAccessToken';

      mockJwtService.verify = jest.fn().mockReturnValue(decodedToken);
      mockUsersService.findOne = jest.fn().mockResolvedValue(user);
      mockJwtService.signAsync = jest
        .fn()
        .mockResolvedValueOnce(newAccessToken);

      mockConfigService.get = jest.fn().mockReturnValue(1); // Assume rotation period is 1m

      const result = await authService.refreshToken(oldRefreshToken);

      expect(result).toEqual({
        accessToken: newAccessToken,
        refreshToken: null,
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const oldRefreshToken = 'invalidRefreshToken';
      mockJwtService.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshToken(oldRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
