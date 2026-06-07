import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { StatsTodayResponseDto } from './dto/stats-today.dto';
import { IReservationRepository } from './repositories/reservation.repository.interface';
import { IRoomRepository } from 'src/room/repositories/room.repository.interfaces';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Reservation } from './entities/reservation.entity';
import { ReservationStatus } from './entities/reservation-type.enum';
import { Room } from 'src/room/entities/room.entity';
import { RoomStatus } from 'src/room/entities/room-status.enum';
import { Payment } from 'src/payment/entities/payment.entity';
import { PaymentStatus } from 'src/payment/entities/payment-status.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';

@Injectable()
export class ReservationService {
  constructor(
    @Inject('IReservationRepository')
    private readonly repository: IReservationRepository,
    @Inject('IRoomRepository')
    private readonly repositoryRoom: IRoomRepository,
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async create(data: CreateReservationDto, user: User): Promise<Reservation> {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    this.validateDateRange(startDate, endDate);

    const room = await this.findRoomOrFail(data.room_id);
    await this.ensureNoReservationConflict(room.room_id, startDate, endDate);

    return this.repository.create({
      room,
      user,
      start_date: startDate,
      end_date: endDate,
      guests: data.guests,
      guest_name: data.guest_name ?? null,
      guest_email: data.guest_email ?? null,
      guest_phone: data.guest_phone ?? null,
      guest_cpf: data.guest_cpf ?? null,
      notes: data.notes ?? null,
      status: ReservationStatus.Confirmed,
    });
  }

  private validateDateRange(startDate: Date, endDate: Date): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      throw new BadRequestException('Data de início não pode ser no passado!');
    }

    if (endDate <= startDate) {
      throw new BadRequestException(
        'Data de saída deve ser após a data de entrada!',
      );
    }
  }

  private async findRoomOrFail(roomId: number): Promise<Room> {
    const room = await this.repositoryRoom.findById(roomId);
    if (!room) {
      throw new NotFoundException('Quarto não encontrado');
    }
    return room;
  }

  private async ensureNoReservationConflict(
    roomId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const reservations = await this.repository.findByRoom(roomId);

    const hasConflict = reservations.some((reservation) => {
      if (reservation.status === ReservationStatus.Cancelled) return false;
      const existingStart = new Date(reservation.start_date);
      const existingEnd = new Date(reservation.end_date);
      return startDate < existingEnd && endDate > existingStart;
    });

    if (hasConflict) {
      throw new BadRequestException('Conflito de reserva para este período!');
    }
  }

  findAll(
    user: User,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Reservation>> {
    if (user.role === UserRole.Admin) {
      return this.repository.findAllAnyPaginated(pagination);
    }
    return this.repository.findAllPaginated(user, pagination);
  }

  findMy(
    user: User,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Reservation>> {
    return this.repository.findAllPaginated(user, pagination);
  }

  async findById(id: number, user: User): Promise<Reservation | null> {
    if (user.role === UserRole.Admin) {
      return this.repository.findByIdAny(id);
    }
    return this.repository.findById(id, user);
  }

  async update(
    id: number,
    dto: UpdateReservationDto,
    user: User,
  ): Promise<Reservation | null> {
    const existing =
      user.role === UserRole.Admin
        ? await this.repository.findByIdAny(id)
        : await this.repository.findById(id, user);
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
    if (dto.guests !== undefined) updateData.guests = dto.guests;
    if (dto.guest_name !== undefined) updateData.guest_name = dto.guest_name;
    if (dto.guest_email !== undefined) updateData.guest_email = dto.guest_email;
    if (dto.guest_phone !== undefined) updateData.guest_phone = dto.guest_phone;
    if (dto.guest_cpf !== undefined) updateData.guest_cpf = dto.guest_cpf;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const newStartDate = updateData.start_date ?? new Date(existing.start_date);
    const newEndDate = updateData.end_date ?? new Date(existing.end_date);

    if (newEndDate <= newStartDate) {
      throw new BadRequestException(
        'Data de saída deve ser após a data de entrada!',
      );
    }

    if (user.role === UserRole.Admin) {
      return this.repository.updateAny(id, updateData);
    }
    return this.repository.update(id, updateData, user);
  }

  async delete(id: number, user: User): Promise<string> {
    const reservation =
      user.role === UserRole.Admin
        ? await this.repository.findByIdAny(id)
        : await this.repository.findById(id, user);

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada');
    }

    await this.repository.updateAny(id, {
      status: ReservationStatus.Cancelled,
    });

    return `A reserva ${id} foi cancelada com sucesso!`;
  }

  async checkIn(id: number): Promise<Reservation> {
    const reservation = await this.repository.findByIdAny(id);
    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada');
    }

    if (
      reservation.status !== ReservationStatus.Confirmed &&
      reservation.status !== ReservationStatus.Pending &&
      reservation.status !== ReservationStatus.Reservado
    ) {
      throw new BadRequestException(
        `Não é possível fazer check-in em uma reserva com status "${reservation.status}"`,
      );
    }

    await this.repository.updateAny(id, {
      status: ReservationStatus.CheckedIn,
    });
    await this.roomRepo.update(reservation.room.room_id, {
      status: RoomStatus.Occupied,
    });

    return (await this.repository.findByIdAny(id)) as Reservation;
  }

  async checkOut(id: number): Promise<Reservation> {
    const reservation = await this.repository.findByIdAny(id);
    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada');
    }

    if (reservation.status !== ReservationStatus.CheckedIn) {
      throw new BadRequestException(
        `Só é possível fazer check-out de reservas com status "checked_in" (atual: "${reservation.status}")`,
      );
    }

    await this.repository.updateAny(id, {
      status: ReservationStatus.CheckedOut,
    });
    await this.roomRepo.update(reservation.room.room_id, {
      status: RoomStatus.Cleaning,
    });

    return (await this.repository.findByIdAny(id)) as Reservation;
  }

  async statsToday(): Promise<StatsTodayResponseDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [checkInsToday, checkOutsToday, totalRooms, occupiedRooms, pendingPayments] =
      await Promise.all([
        this.repository.countCheckInsOn(today),
        this.repository.countCheckOutsOn(today),
        this.roomRepo.count(),
        this.roomRepo.count({ where: { status: RoomStatus.Occupied } }),
        this.paymentRepo.count({ where: { status: PaymentStatus.Pending } }),
      ]);

    const occupancyRate =
      totalRooms === 0
        ? 0
        : Math.round((occupiedRooms / totalRooms) * 1000) / 10;

    return {
      checkInsToday,
      checkOutsToday,
      pendingPayments,
      occupancyRate,
    };
  }

  ensureOwnerOrAdmin(reservation: Reservation, user: User): void {
    if (
      user.role !== UserRole.Admin &&
      reservation.user?.user_id !== user.user_id
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta reserva',
      );
    }
  }
}
