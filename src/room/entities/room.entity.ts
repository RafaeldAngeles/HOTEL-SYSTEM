import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { RoomType } from './room-type.enum';
import { RoomStatus } from './room-status.enum';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  room_id!: number;

  @Column()
  number_room!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_room!: number;

  @Column({ type: 'text' })
  description_room!: string;

  @Column()
  capacity_room!: number;

  @Column({ type: 'enum', enum: RoomType, default: RoomType.Single })
  type!: RoomType;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.Available,
  })
  status!: RoomStatus;

  @Column({ type: 'int', nullable: true })
  floor!: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url!: string | null;

  @OneToMany(() => Reservation, (reservation) => reservation.room)
  reservations!: Reservation[];
}
