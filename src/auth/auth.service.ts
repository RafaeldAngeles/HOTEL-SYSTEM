import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UserService } from 'src/user/user.service';
import { User, UserRole } from 'src/user/entities/user.entity';
import { LoginDto } from './dto/login-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RevokedTokenRepository } from './repositories/revoked-token.repository';

interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  jti: string;
}

interface ResetPayload {
  sub: number;
  purpose: 'pwd_reset';
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly revokedTokens: RevokedTokenRepository,
  ) {}

  async login(data: LoginDto) {
    const user = await this.userService.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('Usuário ou Senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuário ou Senha inválidos');
    }

    return this.issueTokenPair(user);
  }

  async refreshTokens(requestingUser: {
    user_id: number;
    email: string;
    role: UserRole;
  }) {
    const access_token = await this.signAccess({
      sub: requestingUser.user_id,
      email: requestingUser.email,
      role: requestingUser.role,
      jti: randomUUID(),
    });

    return { access_token };
  }

  async logout(
    accessJti: string,
    accessExp: number,
    userId: number,
    refreshToken?: string,
  ): Promise<{ ok: true }> {
    await this.revokedTokens.revoke(
      accessJti,
      userId,
      new Date(accessExp * 1000),
    );

    if (refreshToken) {
      try {
        const decoded = await this.jwtService.verifyAsync<JwtPayload>(
          refreshToken,
          {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          },
        );
        if (decoded.jti) {
          await this.revokedTokens.revoke(
            decoded.jti,
            decoded.sub,
            new Date((decoded as any).exp * 1000),
          );
        }
      } catch {
        // refresh token inválido/expirado — apenas seguimos
      }
    }

    return { ok: true };
  }

  async me(userId: number): Promise<Omit<User, 'password' | 'reservations'>> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
    } as User;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      return { ok: true };
    }

    const token = await this.jwtService.signAsync(
      { sub: user.user_id, purpose: 'pwd_reset' } as ResetPayload,
      {
        secret: this.configService.get<string>('JWT_RESET_SECRET'),
        expiresIn: this.configService.get<string>('JWT_RESET_EXPIRES', '15m'),
      },
    );

    const isProd =
      this.configService.get<string>('NODE_ENV') === 'production';

    if (isProd) {
      this.logger.log(
        `Token de reset gerado para user ${user.user_id} (enviar por email em produção)`,
      );
      return { ok: true };
    }

    return { ok: true, token };
  }

  async resetPassword(dto: ResetPasswordDto) {
    let payload: ResetPayload;
    try {
      payload = await this.jwtService.verifyAsync<ResetPayload>(dto.token, {
        secret: this.configService.get<string>('JWT_RESET_SECRET'),
      });
    } catch {
      throw new BadRequestException('Token inválido ou expirado');
    }

    if (payload.purpose !== 'pwd_reset') {
      throw new BadRequestException('Token com propósito inválido');
    }

    await this.userService.updatePasswordDirect(payload.sub, dto.password);
    return { ok: true };
  }

  private async issueTokenPair(user: User) {
    const accessJti = randomUUID();
    const refreshJti = randomUUID();

    const [access_token, refresh_token] = await Promise.all([
      this.signAccess({
        sub: user.user_id,
        email: user.email,
        role: user.role,
        jti: accessJti,
      }),
      this.signRefresh({
        sub: user.user_id,
        email: user.email,
        role: user.role,
        jti: refreshJti,
      }),
    ]);

    return { access_token, refresh_token };
  }

  private signAccess(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES', '15m'),
    });
  }

  private signRefresh(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES', '7d'),
    });
  }
}
