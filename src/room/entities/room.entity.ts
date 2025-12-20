import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Reservation } from 'src/reservation/entities/reservation.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  room_id: number;

  @Column()
  number_room: number;

  @Column()
  price_room: number;

  @Column({ type: 'text' })
  description_room: string;

  @Column()
  capacity_room: number;

  @OneToMany(() => Reservation, (reservation) => reservation.room)
  reservations: Reservation[];
}
