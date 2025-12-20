import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('reservation')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('reservation-create')
  @Roles(UserRole.User)
  create(@Body() createReservationDto: CreateReservationDto, @Req() req) {
    return this.reservationService.create(createReservationDto, req.user);
  }

  @Get()
  @Roles(UserRole.User)
  findAll(@Req() req) {
    return this.reservationService.findAll(req.user);
  }

  @Get(':id')
  @Roles(UserRole.User)
  findById(@Param('id') id: string, @Req() req) {
    return this.reservationService.findById(+id, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.User)
  delete(@Param('id') id: string) {
    return this.reservationService.delete(+id);
  }
}
