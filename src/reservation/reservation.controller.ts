import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('reservation')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post("reservation-create")
  @Roles(UserRole.User)
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationService.create(createReservationDto);
  }

  @Get()
  @Roles(UserRole.User)
  findAll() {
    return this.reservationService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.User)
  findById(@Param('id') id: string) {
    return this.reservationService.findById(+id);
  }

  @Delete(':id')
  @Roles(UserRole.User)
  delete(@Param('id') id: string) {
    return this.reservationService.delete(+id);
  }
}
