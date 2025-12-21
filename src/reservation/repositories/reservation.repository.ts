import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from '../entities/reservation.entity';
import { IReservationRepository } from './reservation.repository.interface';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReservationRepository implements IReservationRepository {
  constructor(
    @InjectRepository(Reservation)
    private readonly repo: Repository<Reservation>,
  ) {}

  findAll(user: User): Promise<Reservation[]> {
    return this.repo.find({
      where: {
        user: { user_id: user.user_id },
      },
    });
  }

  findById(id_reservation: number, user: User): Promise<Reservation | null> {
    return this.repo.findOne({
      where: { id_reservation, user: { user_id: user.user_id } },
    });
  }

  create(data: Partial<Reservation>): Promise<Reservation> {
    const reservation = this.repo.create(data);
    return this.repo.save(reservation);
  }

  async delete(id: number, user: User): Promise<void> {
    await this.repo.delete({
      id_reservation: id,
      user: { user_id: user.user_id },
    });
  }

  findByRoom(number_room: number): Promise<Reservation[]> {
    return this.repo.find({
      where: {
        room: {
          room_id: number_room,
        },
      },
    });
  }
}
