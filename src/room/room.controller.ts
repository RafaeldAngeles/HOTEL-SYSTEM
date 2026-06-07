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
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UpdateRoomStatusDto } from './dto/update-room-status.dto';
import { AvailableRoomsQueryDto } from './dto/available-rooms.dto';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/user/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Public()
  @Get('available')
  available(@Query() query: AvailableRoomsQueryDto) {
    return this.roomService.findAvailable(query);
  }

  @Post('create')
  @Roles(UserRole.Admin)
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Public()
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.findById(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.Admin)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoomStatusDto,
  ) {
    return this.roomService.updateStatus(id, dto.status);
  }

  @Patch(':id')
  @Roles(UserRole.Admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.remove(id);
  }

  @Public()
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.roomService.findAll(pagination);
  }
}
