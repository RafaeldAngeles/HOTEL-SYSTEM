import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RevokedToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  jti!: string;

  @Column({ type: 'int' })
  user_id!: number;

  @Column({ type: 'datetime' })
  expires_at!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  revoked_at!: Date;
}
