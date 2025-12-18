import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationRepository } from './repositories/reservation.repository';
import { RoomRepository } from 'src/room/repositories/room.repository';
import { RoomModule } from 'src/room/room.module';


@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), RoomModule],
  controllers: [ReservationController],
  providers: [ReservationService,
  {provide:"IReservationRepository", useClass:ReservationRepository}],
  

  exports: ["IReservationRepository"],
})
export class ReservationModule {}
