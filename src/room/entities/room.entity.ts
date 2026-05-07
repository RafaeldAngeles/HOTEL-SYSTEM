import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { RoomType } from './room-type.enum';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  room_id: number;

  @Column()
  number_room: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_room: number;

  @Column({ type: 'text' })
  description_room: string;

  @Column()
  capacity_room: number;

  @Column({ type: 'enum', enum: RoomType, default: RoomType.Single })
  type: RoomType;

  @OneToMany(() => Reservation, (reservation) => reservation.room)
  reservations: Reservation[];
}
