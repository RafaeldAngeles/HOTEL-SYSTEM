import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { IReservationRepository } from './repositories/reservation.repository.interface';
import { IRoomRepository } from 'src/room/repositories/room.repository.interfaces';

@Injectable()
export class ReservationService {

  constructor(
    
    @Inject("IReservationRepository")
    private readonly repository: IReservationRepository,
    
    @Inject("IRoomRepository")
    private readonly repositoryRoom: IRoomRepository
  ){}
  
  async create(data: CreateReservationDto) {

    const now = new Date()
    if (data.start_date < now) {
      throw new BadRequestException('Data inválida!')
    }

    const room = await this.repositoryRoom.findById(data.room_id)
    if (!room){
      throw new NotFoundException("Sala não encontrada")
    }

  // confirmar se quarta está sendo usado nessa data

    return this.repository.create(data)
  }

  findAll() {
      return this.repository.findAll();
  }

  findById(id: number) {
    return this.repository.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}
