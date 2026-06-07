import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class RangeQueryDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}

export class RevenueQueryDto extends RangeQueryDto {
  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  groupBy?: 'day' | 'week' | 'month' = 'day';
}
