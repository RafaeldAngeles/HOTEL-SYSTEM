import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaymentMethod } from '../entities/payment-method.enum';

export class CreatePaymentDto {
  @IsInt()
  @Min(1)
  bookingId!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsInt()
  @Min(1)
  installments!: number;

  @IsOptional()
  @IsString()
  cardToken?: string;
}
