import { IsEnum, IsInt, IsNumber, IsString, Min, MinLength } from 'class-validator';
import { RoomType } from '../entities/room-type.enum';

export class CreateRoomDto {
  @IsInt()
  @Min(1)
  number_room: number;

  @IsNumber()
  @Min(0)
  price_room: number;

  @IsString()
  @MinLength(1)
  description_room: string;

  @IsInt()
  @Min(1)
  capacity_room: number;

  @IsEnum(RoomType)
  type: RoomType;
}
