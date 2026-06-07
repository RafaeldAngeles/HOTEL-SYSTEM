import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class PixGenerateQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  bookingId!: number;
}
