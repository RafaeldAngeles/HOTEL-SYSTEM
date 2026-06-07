import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RevokedTokenRepository } from './repositories/revoked-token.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly revokedTokens: RevokedTokenRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (payload.jti && (await this.revokedTokens.isRevoked(payload.jti))) {
      throw new UnauthorizedException('Token revogado');
    }
    return {
      user_id: payload.sub,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}
