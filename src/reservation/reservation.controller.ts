import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/user/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @Roles(UserRole.Guest, UserRole.Admin)
  create(@Body() createReservationDto: CreateReservationDto, @Req() req) {
    return this.reservationService.create(createReservationDto, req.user);
  }

  @Get('my')
  @Roles(UserRole.Guest, UserRole.Admin)
  findMy(@Req() req, @Query() pagination: PaginationDto) {
    return this.reservationService.findMy(req.user, pagination);
  }

  @Get('stats/today')
  @Roles(UserRole.Admin)
  statsToday() {
    return this.reservationService.statsToday();
  }

  @Post(':id/checkin')
  @Roles(UserRole.Admin)
  checkIn(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.checkIn(id);
  }

  @Post(':id/checkout')
  @Roles(UserRole.Admin)
  checkOut(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.checkOut(id);
  }

  @Get()
  @Roles(UserRole.Admin)
  findAll(@Req() req, @Query() pagination: PaginationDto) {
    return this.reservationService.findAll(req.user, pagination);
  }

  @Get(':id')
  @Roles(UserRole.Guest, UserRole.Admin)
  findById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.reservationService.findById(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.Admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationDto,
    @Req() req,
  ) {
    return this.reservationService.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.Guest, UserRole.Admin)
  delete(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.reservationService.delete(id, req.user);
  }
}
