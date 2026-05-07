import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { Room } from '../entities/room.entity';

export interface IRoomRepository {
  findAll(): Promise<Room[]>;
  findAllPaginated(pagination: PaginationDto): Promise<PaginatedResult<Room>>;
  findById(id: number): Promise<Room | null>;
  create(data: Partial<Room>): Promise<Room>;
  delete(id: number): Promise<void>;
  update(id: number, data: Partial<Room>): Promise<Room | null>;
}
