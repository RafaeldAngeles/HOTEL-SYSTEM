import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { RevokedToken } from './entities/revoked-token.entity';
import { RevokedTokenRepository } from './repositories/revoked-token.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([RevokedToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES', '15m'),
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    RevokedTokenRepository,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
