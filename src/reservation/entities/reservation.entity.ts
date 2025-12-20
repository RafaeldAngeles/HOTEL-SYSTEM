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
  id_reservation: number;

  @ManyToOne(() => User, (user) => user.reservations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Room, (room) => room.reservations)
  @JoinColumn({ name: 'number_room' })
  room: Room;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created: Date;
}
