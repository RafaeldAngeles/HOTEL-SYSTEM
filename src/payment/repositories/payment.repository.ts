import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { IPaymentRepository } from './payment.repository.interfaces';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  findAll(): Promise<Payment[]> {
    return this.repo.find({
      relations: { reservation: true },
      order: { created: 'DESC' },
    });
  }

  findById(payment_id: number): Promise<Payment | null> {
    return this.repo.findOne({
      where: { payment_id },
      relations: { reservation: true },
    });
  }

  findByReservation(reservationId: number): Promise<Payment | null> {
    return this.repo.findOne({
      where: { reservation: { id_reservation: reservationId } },
      relations: { reservation: true },
      order: { created: 'DESC' },
    });
  }

  create(data: Partial<Payment>): Promise<Payment> {
    const payment = this.repo.create(data);
    return this.repo.save(payment);
  }

  async update(id: number, data: Partial<Payment>): Promise<Payment | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }
}
