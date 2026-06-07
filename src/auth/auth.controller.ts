import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-auth.dto';
import { LogoutDto } from './dto/logout.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ strict: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Public()
  @Throttle({ strict: { limit: 5, ttl: 60000 } })
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(@Req() req) {
    return this.authService.refreshTokens(req.user);
  }

  @Post('logout')
  async logout(@Req() req, @Body() dto: LogoutDto) {
    return this.authService.logout(
      req.user.jti,
      req.user.exp,
      req.user.user_id,
      dto.refresh_token,
    );
  }

  @Get('me')
  async me(@Req() req) {
    return this.authService.me(req.user.user_id);
  }

  @Public()
  @Throttle({ strict: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Throttle({ strict: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
