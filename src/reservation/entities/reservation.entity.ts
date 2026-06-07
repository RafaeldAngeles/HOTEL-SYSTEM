import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Room } from 'src/room/entities/room.entity';
import { ReservationStatus } from './reservation-type.enum';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id_reservation!: number;

  @ManyToOne(() => User, (user) => user.reservations)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Room, (room) => room.reservations)
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date' })
  end_date!: Date;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.Reservado,
  })
  status!: ReservationStatus;

  @Column({ type: 'int', default: 1 })
  guests!: number;

  @Column({ type: 'varchar', length: 120, nullable: true })
  guest_name!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  guest_email!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  guest_phone!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  guest_cpf!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created!: Date;
}
