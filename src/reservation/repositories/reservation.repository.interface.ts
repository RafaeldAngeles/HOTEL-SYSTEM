import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { User } from 'src/user/entities/user.entity';
import { Reservation } from '../entities/reservation.entity';

export interface IReservationRepository {
  findAll(user: User): Promise<Reservation[]>;
  findAllPaginated(
    user: User,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Reservation>>;
  findAllAnyPaginated(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Reservation>>;
  findById(id: number, user: User): Promise<Reservation | null>;
  findByIdAny(id: number): Promise<Reservation | null>;
  create(data: Partial<Reservation>): Promise<Reservation>;
  update(
    id: number,
    data: Partial<Reservation>,
    user: User,
  ): Promise<Reservation | null>;
  updateAny(id: number, data: Partial<Reservation>): Promise<Reservation | null>;
  delete(id: number, user: User): Promise<void>;
  findByRoom(room_id: number): Promise<Reservation[]>;
  countCheckInsOn(date: Date): Promise<number>;
  countCheckOutsOn(date: Date): Promise<number>;
}
