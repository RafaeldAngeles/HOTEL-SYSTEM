import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { ReservationStatus } from '../entities/reservation-type.enum';
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
      relations: { room: true },
    });

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findAllAnyPaginated(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Reservation>> {
    const [data, total] = await this.repo.findAndCount({
      skip: pagination.offset,
      take: pagination.limit,
      order: { created: 'DESC' },
      relations: { room: true, user: true },
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
      relations: { room: true },
    });
  }

  findByIdAny(id_reservation: number): Promise<Reservation | null> {
    return this.repo.findOne({
      where: { id_reservation },
      relations: { room: true, user: true },
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

  async updateAny(
    id: number,
    data: Partial<Reservation>,
  ): Promise<Reservation | null> {
    await this.repo.update({ id_reservation: id }, data);
    return this.findByIdAny(id);
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

  countCheckInsOn(date: Date): Promise<number> {
    return this.repo
      .createQueryBuilder('r')
      .where('r.start_date = :date', { date: this.toDateOnly(date) })
      .andWhere('r.status IN (:...statuses)', {
        statuses: [ReservationStatus.Confirmed, ReservationStatus.Reservado],
      })
      .getCount();
  }

  countCheckOutsOn(date: Date): Promise<number> {
    return this.repo
      .createQueryBuilder('r')
      .where('r.end_date = :date', { date: this.toDateOnly(date) })
      .andWhere('r.status = :status', {
        status: ReservationStatus.CheckedIn,
      })
      .getCount();
  }

  private toDateOnly(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
