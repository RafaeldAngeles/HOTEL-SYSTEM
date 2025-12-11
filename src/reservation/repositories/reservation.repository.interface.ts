

import { Reservation } from "../entities/reservation.entity";

export interface IReservationRepository{
    findAll(): Promise<Reservation[]>;
    findById(id: number): Promise<Reservation | null>;
    create (data: Partial<Reservation>): Promise<Reservation>;
    delete (id: number): Promise<void>

}