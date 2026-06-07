import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  @Min(1)
  room_id!: number;

  @IsDateString()
  start_date!: string;

  @IsDateString()
  end_date!: string;

  @IsInt()
  @Min(1)
  guests!: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  guest_name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  guest_email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  guest_phone?: string;

  @IsOptional()
  @IsString()
  @Length(11, 20)
  guest_cpf?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
