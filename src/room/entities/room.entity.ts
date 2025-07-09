import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RoomType } from './room-type.enum';

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
}
