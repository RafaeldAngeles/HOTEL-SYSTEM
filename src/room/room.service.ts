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
  
  findById(id: number) {
    return this.repository.findById(id);
  }

  findAll() {
    return this.repository.findAll()
  }


  update(id: number, updateRoomDto: UpdateRoomDto) {
    return this.repository.update(id, updateRoomDto)
  }

  remove(id: number) {
    return this.repository.delete(id)
  }
}
