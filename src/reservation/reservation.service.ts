import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { IReservationRepository } from './repositories/reservation.repository.interface';
import { IRoomRepository } from 'src/room/repositories/room.repository.interfaces';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ReservationService {
  constructor(
    @Inject("IReservationRepository")
    private readonly repository: IReservationRepository,
    @Inject("IRoomRepository")
    private readonly repositoryRoom: IRoomRepository
  ){}
  
  async create(data: CreateReservationDto, user: User){
    const now = new Date()
    if (data.start_date < now) {
      throw new BadRequestException('Data inválida!')
    }
    const room = await this.repositoryRoom.findById(data.room_id)
    if (!room){
      throw new NotFoundException("Sala não encontrada")
    }

    const reservationRoom = await this.repository.findByRoom(room.room_id)
    for (const reservation of reservationRoom ){
      const hasConflit =
        data.start_date < reservation.end_date &&
        data.end_date > reservation.start_date
      
      if (hasConflit){
        throw new BadRequestException("conflito de reserva")
      }
    }

    return this.repository.create({...data, user: user, room: room})
  }

  findAll(user: User) {
  return this.repository.findAll(user);
}


  findById(id: number) {
    return this.repository.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}
