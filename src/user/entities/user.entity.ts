import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.enum';
import { Reservation } from 'src/reservation/entities/reservation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Guest,
  })
  role: Role;

  @OneToMany(() => Reservation, (reservation) => reservation.user_id)
  reservations: Reservation[];
}
