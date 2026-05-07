import { Inject, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { IRoomRepository } from './repositories/room.repository.interfaces';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomService {
  constructor(
    @Inject('IRoomRepository')
    private readonly repository: IRoomRepository,
  ) {}

  create(data: CreateRoomDto) {
    return this.repository.create(data);
  }

  findById(id: number) {
    return this.repository.findById(id);
  }

  findAll(pagination: PaginationDto): Promise<PaginatedResult<Room>> {
    return this.repository.findAllPaginated(pagination);
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return this.repository.update(id, updateRoomDto);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}
