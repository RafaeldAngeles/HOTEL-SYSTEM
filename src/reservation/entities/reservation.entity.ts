import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { User } from 'src/user/entities/user.entity';
import { Room } from 'src/room/entities/room.entity';
import { ReservationStatus } from './reservation-type.enum';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  // RELAÇÃO COM USER
  @ManyToOne(() => User, (user) => user.reservations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // RELAÇÃO COM ROOM
  @ManyToOne(() => Room, (room) => room.reservations)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.Disponivel,
  })
  status: ReservationStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;
}
