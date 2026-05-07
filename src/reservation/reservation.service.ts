import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { IReservationRepository } from './repositories/reservation.repository.interface';
import { IRoomRepository } from 'src/room/repositories/room.repository.interfaces';
import { User } from 'src/user/entities/user.entity';
import { Reservation } from './entities/reservation.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';

@Injectable()
export class ReservationService {
  constructor(
    @Inject('IReservationRepository')
    private readonly repository: IReservationRepository,
    @Inject('IRoomRepository')
    private readonly repositoryRoom: IRoomRepository,
  ) {}

  async create(data: CreateReservationDto, user: User) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (startDate < now) {
      throw new BadRequestException('Data de início não pode ser no passado!');
    }

    if (endDate <= startDate) {
      throw new BadRequestException(
        'Data de saída deve ser após a data de entrada!',
      );
    }

    const room = await this.repositoryRoom.findById(data.room_id);
    if (!room) {
      throw new NotFoundException('Quarto não encontrado');
    }

    const reservationRoom = await this.repository.findByRoom(room.room_id);
    for (const reservation of reservationRoom) {
      const existingStart = new Date(reservation.start_date);
      const existingEnd = new Date(reservation.end_date);
      const hasConflict = startDate < existingEnd && endDate > existingStart;

      if (hasConflict) {
        throw new BadRequestException('Conflito de reserva para este período!');
      }
    }

    return this.repository.create({ room, user, start_date: startDate, end_date: endDate });
  }

  findAll(user: User, pagination: PaginationDto): Promise<PaginatedResult<Reservation>> {
    return this.repository.findAllPaginated(user, pagination);
  }

  findById(id: number, user: User) {
    return this.repository.findById(id, user);
  }

  async update(id: number, dto: UpdateReservationDto, user: User): Promise<Reservation | null> {
    const existing = await this.repository.findById(id, user);
    if (!existing) {
      throw new NotFoundException('Reserva não encontrada');
    }

    const updateData: Partial<Reservation> = {};

    if (dto.start_date) {
      updateData.start_date = new Date(dto.start_date);
    }
    if (dto.end_date) {
      updateData.end_date = new Date(dto.end_date);
    }

    const newStartDate = updateData.start_date ?? new Date(existing.start_date);
    const newEndDate = updateData.end_date ?? new Date(existing.end_date);

    if (newEndDate <= newStartDate) {
      throw new BadRequestException(
        'Data de saída deve ser após a data de entrada!',
      );
    }

    return this.repository.update(id, updateData, user);
  }

  async delete(id: number, user: User): Promise<string> {
    const reservation = await this.repository.findById(id, user);

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada');
    }

    await this.repository.delete(id, user);

    return `A reserva ${id} foi deletada com sucesso!`;
  }
}
