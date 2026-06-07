import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';
import { PaymentMethod } from './entities/payment-method.enum';
import { PaymentStatus } from './entities/payment-status.enum';
import { IPaymentRepository } from './repositories/payment.repository.interfaces';
import { IReservationRepository } from 'src/reservation/repositories/reservation.repository.interface';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { ReservationStatus } from 'src/reservation/entities/reservation-type.enum';
import { Room } from 'src/room/entities/room.entity';
import { RoomStatus } from 'src/room/entities/room-status.enum';
import { UserRole } from 'src/user/entities/user.entity';

interface RequestingUser {
  user_id: number;
  role: UserRole;
}

@Injectable()
export class PaymentService {
  constructor(
    @Inject('IPaymentRepository')
    private readonly repository: IPaymentRepository,
    @Inject('IReservationRepository')
    private readonly reservationRepo: IReservationRepository,
    @InjectRepository(Reservation)
    private readonly reservationOrm: Repository<Reservation>,
    @InjectRepository(Room)
    private readonly roomOrm: Repository<Room>,
  ) {}

  async create(dto: CreatePaymentDto, requester: RequestingUser) {
    const reservation = await this.reservationRepo.findByIdAny(dto.bookingId);
    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada');
    }
    this.ensureOwnerOrAdmin(reservation, requester);

    if (reservation.status === ReservationStatus.Cancelled) {
      throw new BadRequestException(
        'Não é possível pagar uma reserva cancelada',
      );
    }

    if (
      dto.method === PaymentMethod.CreditCard &&
      (!dto.cardToken || dto.cardToken.trim().length === 0)
    ) {
      throw new BadRequestException(
        'cardToken é obrigatório para pagamento com cartão',
      );
    }

    const amount = this.computeAmount(reservation);

    const isCard = dto.method === PaymentMethod.CreditCard;
    const isPix = dto.method === PaymentMethod.Pix;

    const pix = isPix ? this.generatePix(amount) : null;

    return this.repository.create({
      reservation,
      amount,
      method: dto.method,
      installments: dto.installments,
      status: isCard ? PaymentStatus.Paid : PaymentStatus.Pending,
      card_token: isCard ? dto.cardToken ?? null : null,
      paid_at: isCard ? new Date() : null,
      pix_code: pix?.pixCode ?? null,
      pix_key: pix?.pixKey ?? null,
      pix_expires_at: pix?.expiresAt ?? null,
    });
  }

  findAll() {
    return this.repository.findAll();
  }

  async findByReservation(
    reservationId: number,
    requester: RequestingUser,
  ): Promise<Payment> {
    const reservation = await this.reservationRepo.findByIdAny(reservationId);
    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada');
    }
    this.ensureOwnerOrAdmin(reservation, requester);

    const payment = await this.repository.findByReservation(reservationId);
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado para esta reserva');
    }
    return payment;
  }

  async refund(paymentId: number): Promise<Payment> {
    const payment = await this.repository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }
    if (payment.status === PaymentStatus.Refunded) {
      throw new BadRequestException('Pagamento já foi estornado');
    }

    await this.repository.update(paymentId, {
      status: PaymentStatus.Refunded,
    });

    if (payment.reservation) {
      await this.reservationOrm.update(payment.reservation.id_reservation, {
        status: ReservationStatus.Cancelled,
      });

      const reservationWithRoom = await this.reservationRepo.findByIdAny(
        payment.reservation.id_reservation,
      );
      if (reservationWithRoom?.room) {
        await this.roomOrm.update(reservationWithRoom.room.room_id, {
          status: RoomStatus.Available,
        });
      }
    }

    return (await this.repository.findById(paymentId)) as Payment;
  }

  async pixGenerate(
    reservationId: number,
    requester: RequestingUser,
  ) {
    const reservation = await this.reservationRepo.findByIdAny(reservationId);
    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada');
    }
    this.ensureOwnerOrAdmin(reservation, requester);

    const amount = this.computeAmount(reservation);
    const pix = this.generatePix(amount);

    return {
      pixCode: pix.pixCode,
      pixKey: pix.pixKey,
      amount,
      expiresAt: pix.expiresAt,
    };
  }

  private ensureOwnerOrAdmin(
    reservation: Reservation,
    requester: RequestingUser,
  ): void {
    if (
      requester.role !== UserRole.Admin &&
      reservation.user?.user_id !== requester.user_id
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta reserva',
      );
    }
  }

  private computeAmount(reservation: Reservation): number {
    const start = new Date(reservation.start_date);
    const end = new Date(reservation.end_date);
    const msPerDay = 24 * 60 * 60 * 1000;
    const nights = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / msPerDay),
    );
    const pricePerNight = Number(reservation.room?.price_room ?? 0);
    return Number((nights * pricePerNight).toFixed(2));
  }

  private generatePix(amount: number) {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const amountStr = amount.toFixed(2);
    const pixCode = `00020126540014BR.GOV.BCB.PIX0114+5511999998888520400005303986540${amountStr.length}${amountStr}5802BR5913HOTEL GV6009SAO PAULO62070503***6304ABCD`;
    return {
      pixCode,
      pixKey: 'hotel-grandvenue@pix.com.br',
      expiresAt,
    };
  }
}
