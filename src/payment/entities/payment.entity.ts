import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { PaymentMethod } from './payment-method.enum';
import { PaymentStatus } from './payment-status.enum';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  payment_id!: number;

  @ManyToOne(() => Reservation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservation_id' })
  reservation!: Reservation;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  method!: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.Pending,
  })
  status!: PaymentStatus;

  @Column({ type: 'int', default: 1 })
  installments!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  card_token!: string | null;

  @Column({ type: 'text', nullable: true })
  pix_code!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  pix_key!: string | null;

  @Column({ type: 'datetime', nullable: true })
  pix_expires_at!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  paid_at!: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  created!: Date;
}
