import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  @Min(1)
  room_id!: number;

  @IsDateString()
  start_date!: string;

  @IsDateString()
  end_date!: string;
}
