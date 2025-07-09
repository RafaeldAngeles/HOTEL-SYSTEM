import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RoomModule } from './room/room.module';
import { ReservationModule } from './reservation/reservation.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    RoomModule,
    ReservationModule,
  ],
})
export class AppModule {}
