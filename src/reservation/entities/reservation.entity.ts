import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RoomType } from '../../room/entities/room-type.enum';

@Entity()
export class Reservation {
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
}
