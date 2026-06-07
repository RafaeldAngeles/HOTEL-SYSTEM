import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRoomRepository } from './room.repository.interfaces';
import { Room } from '../entities/room.entity';
import { RoomStatus } from '../entities/room-status.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { ReservationStatus } from 'src/reservation/entities/reservation-type.enum';

@Injectable()
export class RoomRepository implements IRoomRepository {
  constructor(
    @InjectRepository(Room)
    private readonly repo: Repository<Room>,
  ) {}

  findAll(): Promise<Room[]> {
    return this.repo.find();
  }

  async findAllPaginated(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Room>> {
    const [data, total] = await this.repo.findAndCount({
      skip: pagination.offset,
      take: pagination.limit,
    });

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  findById(room_id: number): Promise<Room | null> {
    return this.repo.findOne({ where: { room_id } });
  }

  create(data: Partial<Room>): Promise<Room> {
    const room = this.repo.create(data);
    return this.repo.save(room);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async update(id: number, data: Partial<Room>): Promise<Room | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  findAvailable(
    checkIn: Date,
    checkOut: Date,
    guests: number,
  ): Promise<Room[]> {
    return this.repo
      .createQueryBuilder('room')
      .where('room.status = :available', { available: RoomStatus.Available })
      .andWhere('room.capacity_room >= :guests', { guests })
      .andWhere((qb) => {
        const sub = qb
          .subQuery()
          .select('1')
          .from('reservation', 'r')
          .where('r.room_id = room.room_id')
          .andWhere('r.status != :cancelled', {
            cancelled: ReservationStatus.Cancelled,
          })
          .andWhere('r.start_date < :checkOut')
          .andWhere('r.end_date > :checkIn')
          .getQuery();
        return `NOT EXISTS ${sub}`;
      })
      .setParameter('checkIn', checkIn)
      .setParameter('checkOut', checkOut)
      .getMany();
  }
}
