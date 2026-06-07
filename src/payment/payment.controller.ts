import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PixGenerateQueryDto } from './dto/pix-generate.dto';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto, @Req() req) {
    return this.paymentService.create(dto, req.user);
  }

  @Get()
  @Roles(UserRole.Admin)
  findAll() {
    return this.paymentService.findAll();
  }

  @Get('pix/generate')
  pixGenerate(@Query() query: PixGenerateQueryDto, @Req() req) {
    return this.paymentService.pixGenerate(query.bookingId, req.user);
  }

  @Patch(':id/refund')
  @Roles(UserRole.Admin)
  refund(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.refund(id);
  }

  @Get(':bookingId')
  findByReservation(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Req() req,
  ) {
    return this.paymentService.findByReservation(bookingId, req.user);
  }
}
