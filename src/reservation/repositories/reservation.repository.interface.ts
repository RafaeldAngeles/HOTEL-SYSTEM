

import { User } from "src/user/entities/user.entity";
import { Reservation } from "../entities/reservation.entity";

export interface IReservationRepository{
    findAll(user:User): Promise<Reservation[]>;
    findById(id: number): Promise<Reservation | null>;
    create (data: Partial<Reservation>): Promise<Reservation>;
    delete (id: number): Promise<void>
    findByRoom(room_id:number): Promise<Reservation[]>

}