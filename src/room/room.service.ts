import { Inject, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { IRoomRepository } from './repositories/room.repository.interfaces';

@Injectable()
export class RoomService {

  constructor(
    @Inject ("IRoomRepository")
    private readonly repository: IRoomRepository,
  ){}

  create(data: CreateRoomDto) {
    return this.repository.create(data)
  }

  findAll() {
    return `This action returns all room`;
  }

  findOne(id: number) {
    return `This action returns a #${id} room`;
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`;
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }
}
