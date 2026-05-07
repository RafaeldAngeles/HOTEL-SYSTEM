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

  @Post('reservation-create')
  @Roles(UserRole.Guest)
  create(@Body() createReservationDto: CreateReservationDto, @Req() req) {
    return this.reservationService.create(createReservationDto, req.user);
  }

  @Get()
  @Roles(UserRole.Guest)
  findAll(@Req() req, @Query() pagination: PaginationDto) {
    return this.reservationService.findAll(req.user, pagination);
  }

  @Get(':id')
  @Roles(UserRole.Guest)
  findById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.reservationService.findById(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.Guest)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationDto,
    @Req() req,
  ) {
    return this.reservationService.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.Guest)
  delete(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.reservationService.delete(id, req.user);
  }
}
