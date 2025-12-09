import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Room } from 'src/room/entities/room.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Room, Reservation],
      synchronize: true,
      logging: true,
    }),
  ],
})
export class DatabaseModule {}
