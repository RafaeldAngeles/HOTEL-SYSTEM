import { Inject, Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { IReservationRepository } from './repositories/reservatio.repository';

@Injectable()
export class ReservationService {

  constructor(
    @Inject ('IReservationRepository')
    private readonly repository: IReservationRepository,
  ){


  }
  create(data: CreateReservationDto) {
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
