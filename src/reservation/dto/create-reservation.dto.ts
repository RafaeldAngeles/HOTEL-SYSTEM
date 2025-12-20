import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReservationDto {
  room_id: number;

  @IsString()
  @Transform(({ value }) => {
    const [day, month, year] = value.split('/');
    return new Date(`${year}-${month}-${day}`);
  })
  start_date: Date;

  @IsString()
  @Transform(({ value }) => {
    const [day, month, year] = value.split('/');
    return new Date(`${year}-${month}-${day}`);
  })
  end_date: Date;
}
