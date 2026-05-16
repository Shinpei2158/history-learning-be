import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  Res,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from "express";
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiBearerAuth()
  async getMe(@Req() req: Request) {
    return this.authService.getMe(req.user);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    if (!registerDto.password || !registerDto.email || !registerDto.username || !registerDto.fullName) {
      throw new BadRequestException('Username, email và password là bắt buộc');
    }
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.login(loginDto);

    // Set cookies với các options bảo mật
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 10, // 10 ngày
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 ngày
    });

    return {
      message: 'Đăng nhập thành công',
      user
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new BadRequestException('Refresh token không tồn tại');
    }

    const result = await this.authService.refreshToken(refreshToken);

    // Set new access token cookie
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 15, // 15 phút
    });

    return { message: 'Token đã được làm mới' };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies['refreshToken']; // đọc cookie

    // Clear cookie
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    if (refreshToken) {
      // Remove refreshToken trong DB
      await this.authService.removeRefreshTokenByToken(refreshToken);
    }

    return { message: 'Đăng xuất thành công' };
  }


  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Token xác thực là bắt buộc');
    return this.authService.verifyEmail(token);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email là bắt buộc');
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!token || !newPassword) {
      throw new BadRequestException('Token và mật khẩu mới là bắt buộc');
    }
    return this.authService.resetPassword(token, newPassword);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() req: Request) {
    const user = req.user;
    return this.authService.getMe(user);
  }
}