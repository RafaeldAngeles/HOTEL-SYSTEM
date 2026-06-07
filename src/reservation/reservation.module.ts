import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationRepository } from './repositories/reservation.repository';
import { RoomModule } from 'src/room/room.module';
import { Room } from 'src/room/entities/room.entity';
import { Payment } from 'src/payment/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, Room, Payment]),
    RoomModule,
  ],
  controllers: [ReservationController],
  providers: [
    ReservationService,
    { provide: 'IReservationRepository', useClass: ReservationRepository },
  ],

  exports: ['IReservationRepository'],
})
export class ReservationModule {}
