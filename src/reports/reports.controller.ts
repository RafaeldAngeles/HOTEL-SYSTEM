import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/user/entities/user.entity';
import { RangeQueryDto, RevenueQueryDto } from './dto/range-query.dto';
import { TopRoomsQueryDto } from './dto/top-rooms-query.dto';

@Controller('reports')
@Roles(UserRole.Admin)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  dashboard() {
    return this.reportsService.dashboard();
  }

  @Get('revenue')
  revenue(@Query() query: RevenueQueryDto) {
    return this.reportsService.revenue(query);
  }

  @Get('occupancy')
  occupancy(@Query() query: RangeQueryDto) {
    return this.reportsService.occupancy(query);
  }

  @Get('rooms/top')
  topRooms(@Query() query: TopRoomsQueryDto) {
    return this.reportsService.topRooms(query);
  }
}
