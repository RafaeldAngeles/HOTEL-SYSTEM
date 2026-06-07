import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Room } from 'src/room/entities/room.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Payment } from 'src/payment/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Reservation, Payment])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
