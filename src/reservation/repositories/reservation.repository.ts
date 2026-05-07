import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { IReservationRepository } from './reservation.repository.interface';
import { User } from 'src/user/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';

@Injectable()
export class ReservationRepository implements IReservationRepository {
  constructor(
    @InjectRepository(Reservation)
    private readonly repo: Repository<Reservation>,
  ) {}

  findAll(user: User): Promise<Reservation[]> {
    return this.repo.find({
      where: { user: { user_id: user.user_id } },
    });
  }

  async findAllPaginated(
    user: User,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Reservation>> {
    const [data, total] = await this.repo.findAndCount({
      where: { user: { user_id: user.user_id } },
      skip: pagination.offset,
      take: pagination.limit,
      order: { created: 'DESC' },
    });

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
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

  async update(
    id: number,
    data: Partial<Reservation>,
    user: User,
  ): Promise<Reservation | null> {
    await this.repo.update(
      { id_reservation: id, user: { user_id: user.user_id } },
      data,
    );
    return this.findById(id, user);
  }

  async delete(id: number, user: User): Promise<void> {
    await this.repo.delete({
      id_reservation: id,
      user: { user_id: user.user_id },
    });
  }

  findByRoom(room_id: number): Promise<Reservation[]> {
    return this.repo.find({
      where: { room: { room_id } },
    });
  }
}
