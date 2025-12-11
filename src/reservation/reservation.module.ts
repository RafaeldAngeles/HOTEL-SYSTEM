import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationRepository } from './repositories/reservation.repository';


@Module({
  imports: [TypeOrmModule.forFeature([Reservation])],
  controllers: [ReservationController],
  providers: [ReservationService,
  {provide:"IReservationRepository", useClass:ReservationRepository}],

  exports:[{provide: "IReservationRepository", useClass: ReservationRepository}]
})
export class ReservationModule {}
