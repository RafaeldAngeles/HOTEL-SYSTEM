import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RoomType } from './room-type.enum';
import { Reservation } from 'src/reservation/entities/reservation.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: number;

  @Column({
    type: 'enum',
    enum: RoomType,
    default: RoomType.Single,
  })
  type: RoomType;

  @Column()
  price: number;

  @OneToMany(() => Reservation, (reservation) => reservation.room)
  reservations: Reservation[];
}
