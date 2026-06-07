import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevokedToken } from '../entities/revoked-token.entity';

@Injectable()
export class RevokedTokenRepository {
  constructor(
    @InjectRepository(RevokedToken)
    private readonly repo: Repository<RevokedToken>,
  ) {}

  async isRevoked(jti: string): Promise<boolean> {
    const count = await this.repo.count({ where: { jti } });
    return count > 0;
  }

  async revoke(
    jti: string,
    user_id: number,
    expires_at: Date,
  ): Promise<void> {
    const existing = await this.repo.findOne({ where: { jti } });
    if (existing) return;
    const entity = this.repo.create({ jti, user_id, expires_at });
    await this.repo.save(entity);
  }
}
