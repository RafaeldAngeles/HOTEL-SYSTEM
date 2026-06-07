import { IsEnum } from 'class-validator';
import { RoomStatus } from '../entities/room-status.enum';

export class UpdateRoomStatusDto {
  @IsEnum(RoomStatus)
  status!: RoomStatus;
}
