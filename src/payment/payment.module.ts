import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { PaymentRepository } from './repositories/payment.repository';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Room } from 'src/room/entities/room.entity';
import { ReservationModule } from 'src/reservation/reservation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Reservation, Room]),
    ReservationModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    { provide: 'IPaymentRepository', useClass: PaymentRepository },
  ],
})
export class PaymentModule {}
