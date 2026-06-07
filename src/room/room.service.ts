import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AvailableRoomsQueryDto } from './dto/available-rooms.dto';
import { IRoomRepository } from './repositories/room.repository.interfaces';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { Room } from './entities/room.entity';
import { RoomStatus } from './entities/room-status.enum';

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

  async findAvailable(query: AvailableRoomsQueryDto): Promise<Room[]> {
    const checkIn = new Date(query.checkIn);
    const checkOut = new Date(query.checkOut);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      throw new BadRequestException('Datas inválidas');
    }
    if (checkOut <= checkIn) {
      throw new BadRequestException(
        'checkOut deve ser posterior a checkIn',
      );
    }

    return this.repository.findAvailable(checkIn, checkOut, query.guests);
  }

  async updateStatus(id: number, status: RoomStatus): Promise<Room> {
    const room = await this.repository.findById(id);
    if (!room) {
      throw new NotFoundException('Quarto não encontrado');
    }
    const updated = await this.repository.update(id, { status });
    return updated as Room;
  }
}
