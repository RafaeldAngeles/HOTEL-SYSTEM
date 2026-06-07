import { Payment } from '../entities/payment.entity';

export interface IPaymentRepository {
  findAll(): Promise<Payment[]>;
  findById(id: number): Promise<Payment | null>;
  findByReservation(reservationId: number): Promise<Payment | null>;
  create(data: Partial<Payment>): Promise<Payment>;
  update(id: number, data: Partial<Payment>): Promise<Payment | null>;
}
