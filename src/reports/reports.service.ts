import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from 'src/room/entities/room.entity';
import { RoomStatus } from 'src/room/entities/room-status.enum';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { ReservationStatus } from 'src/reservation/entities/reservation-type.enum';
import { Payment } from 'src/payment/entities/payment.entity';
import { PaymentStatus } from 'src/payment/entities/payment-status.enum';
import { RevenueQueryDto, RangeQueryDto } from './dto/range-query.dto';
import { TopRoomsQueryDto } from './dto/top-rooms-query.dto';

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async dashboard() {
    const today = this.startOfDay(new Date());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [
      totalRooms,
      occupiedRooms,
      monthRevenueRow,
      checkInsToday,
      avgDailyRateRow,
      weekRevenue,
      roomMap,
      pendingCheckins,
      pendingCheckouts,
      pendingPayments,
      recentBookings,
    ] = await Promise.all([
      this.roomRepo.count(),
      this.roomRepo.count({ where: { status: RoomStatus.Occupied } }),
      this.paymentRepo
        .createQueryBuilder('p')
        .select('COALESCE(SUM(p.amount), 0)', 'total')
        .where('p.status = :status', { status: PaymentStatus.Paid })
        .andWhere('p.paid_at BETWEEN :from AND :to', {
          from: monthStart,
          to: this.endOfDay(monthEnd),
        })
        .getRawOne<{ total: string }>(),
      this.reservationRepo
        .createQueryBuilder('r')
        .where('r.start_date = :date', {
          date: this.toDateOnly(today),
        })
        .andWhere('r.status IN (:...statuses)', {
          statuses: [
            ReservationStatus.Confirmed,
            ReservationStatus.Reservado,
          ],
        })
        .getCount(),
      this.paymentRepo
        .createQueryBuilder('p')
        .select('COALESCE(AVG(p.amount), 0)', 'avg')
        .where('p.status = :status', { status: PaymentStatus.Paid })
        .getRawOne<{ avg: string }>(),
      this.weekRevenue(today),
      this.roomRepo.find({
        select: ['room_id', 'number_room', 'floor', 'type', 'status'],
        order: { floor: 'ASC', number_room: 'ASC' },
      }),
      this.reservationRepo.find({
        where: {
          start_date: this.toDateOnly(today) as unknown as Date,
          status: ReservationStatus.Confirmed,
        },
        relations: { room: true, user: true },
        take: 20,
      }),
      this.reservationRepo.find({
        where: {
          end_date: this.toDateOnly(today) as unknown as Date,
          status: ReservationStatus.CheckedIn,
        },
        relations: { room: true, user: true },
        take: 20,
      }),
      this.paymentRepo.find({
        where: { status: PaymentStatus.Pending },
        relations: { reservation: true },
        take: 20,
        order: { created: 'DESC' },
      }),
      this.reservationRepo.find({
        relations: { room: true, user: true },
        order: { created: 'DESC' },
        take: 5,
      }),
    ]);

    const occupancyRate =
      totalRooms === 0
        ? 0
        : Math.round((occupiedRooms / totalRooms) * 1000) / 10;

    return {
      kpis: {
        occupancyRate,
        monthRevenue: Number(monthRevenueRow?.total ?? 0),
        checkInsToday,
        avgDailyRate: Number(avgDailyRateRow?.avg ?? 0),
      },
      weekRevenue,
      roomMap: roomMap.map((r) => ({
        number: String(r.number_room),
        floor: r.floor,
        type: r.type,
        status: r.status,
      })),
      todayActions: {
        pendingCheckins,
        pendingCheckouts,
        pendingPayments,
      },
      recentBookings,
    };
  }

  async revenue(query: RevenueQueryDto) {
    const from = this.startOfDay(new Date(query.from));
    const to = this.endOfDay(new Date(query.to));
    const groupBy = query.groupBy ?? 'day';

    const dateExpr =
      groupBy === 'day'
        ? "DATE_FORMAT(p.paid_at, '%Y-%m-%d')"
        : groupBy === 'week'
          ? "DATE_FORMAT(p.paid_at, '%x-W%v')"
          : "DATE_FORMAT(p.paid_at, '%Y-%m')";

    const rows = await this.paymentRepo
      .createQueryBuilder('p')
      .select(`${dateExpr}`, 'period')
      .addSelect('SUM(p.amount)', 'revenue')
      .addSelect('COUNT(*)', 'payments')
      .where('p.status = :status', { status: PaymentStatus.Paid })
      .andWhere('p.paid_at BETWEEN :from AND :to', { from, to })
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany<{ period: string; revenue: string; payments: string }>();

    const data = rows.map((r) => ({
      period: r.period,
      revenue: Number(r.revenue),
      bookings: Number(r.payments),
    }));

    const total = data.reduce((acc, x) => acc + x.revenue, 0);

    return { data, total };
  }

  async occupancy(query: RangeQueryDto) {
    const from = this.startOfDay(new Date(query.from));
    const to = this.startOfDay(new Date(query.to));
    const totalRooms = await this.roomRepo.count();

    const data: {
      date: string;
      occupied: number;
      total: number;
      rate: number;
    }[] = [];

    for (
      let day = new Date(from);
      day.getTime() <= to.getTime();
      day.setDate(day.getDate() + 1)
    ) {
      const dateStr = this.toDateOnly(day);
      const occupied = await this.reservationRepo
        .createQueryBuilder('r')
        .where('r.start_date <= :d', { d: dateStr })
        .andWhere('r.end_date > :d', { d: dateStr })
        .andWhere('r.status IN (:...statuses)', {
          statuses: [
            ReservationStatus.Confirmed,
            ReservationStatus.CheckedIn,
            ReservationStatus.Reservado,
          ],
        })
        .getCount();

      const rate =
        totalRooms === 0
          ? 0
          : Math.round((occupied / totalRooms) * 1000) / 10;

      data.push({ date: dateStr, occupied, total: totalRooms, rate });
    }

    const avgRate =
      data.length === 0
        ? 0
        : Math.round(
            (data.reduce((acc, x) => acc + x.rate, 0) / data.length) * 10,
          ) / 10;

    return { data, avgRate };
  }

  async topRooms(query: TopRoomsQueryDto) {
    const limit = query.limit ?? 5;

    const rows = await this.reservationRepo
      .createQueryBuilder('r')
      .innerJoin('r.room', 'room')
      .leftJoin(
        'payment',
        'p',
        'p.reservation_id = r.id_reservation AND p.status = :paid',
        { paid: PaymentStatus.Paid },
      )
      .select('room.room_id', 'roomId')
      .addSelect('room.number_room', 'number')
      .addSelect('room.type', 'type')
      .addSelect('COUNT(DISTINCT r.id_reservation)', 'bookings')
      .addSelect('COALESCE(SUM(p.amount), 0)', 'revenue')
      .where('r.status != :cancelled', {
        cancelled: ReservationStatus.Cancelled,
      })
      .groupBy('room.room_id')
      .addGroupBy('room.number_room')
      .addGroupBy('room.type')
      .orderBy('revenue', 'DESC')
      .addOrderBy('bookings', 'DESC')
      .limit(limit)
      .getRawMany<{
        roomId: number;
        number: number;
        type: string;
        bookings: string;
        revenue: string;
      }>();

    return {
      data: rows.map((r) => ({
        roomId: Number(r.roomId),
        number: String(r.number),
        type: r.type,
        bookings: Number(r.bookings),
        revenue: Number(r.revenue),
      })),
    };
  }

  private async weekRevenue(reference: Date) {
    const start = this.startOfDay(new Date(reference));
    start.setDate(start.getDate() - 6);
    const end = this.endOfDay(new Date(reference));

    const rows = await this.paymentRepo
      .createQueryBuilder('p')
      .select("DATE_FORMAT(p.paid_at, '%Y-%m-%d')", 'date')
      .addSelect('SUM(p.amount)', 'total')
      .where('p.status = :status', { status: PaymentStatus.Paid })
      .andWhere('p.paid_at BETWEEN :from AND :to', { from: start, to: end })
      .groupBy('date')
      .getRawMany<{ date: string; total: string }>();

    const map = new Map(rows.map((r) => [r.date, Number(r.total)]));
    const result: { day: string; value: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = this.toDateOnly(d);
      result.push({
        day: DAYS_PT[d.getDay()],
        value: map.get(key) ?? 0,
      });
    }

    return result;
  }

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private endOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  private toDateOnly(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
