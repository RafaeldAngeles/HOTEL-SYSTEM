import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Reservation } from "../entities/reservation.entity";
import { Repository } from "typeorm";
import { IReservationRepository } from "./reservation.repository.interface";



@Injectable()
export class ReservationRepository implements IReservationRepository{
    constructor(
        @InjectRepository(Reservation)
        private readonly repo: Repository <Reservation>,
    ){}

    findAll(): Promise<Reservation[]> {
        return this.repo.find();
    }

    findById(id_reservation: number): Promise<Reservation | null> {
        return this.repo.findOne({where: {id_reservation}})
        
    }

     create(data: Partial<Reservation>): Promise<Reservation> {
    const reservation = this.repo.create(data);
    return this.repo.save(reservation);
  }

    async delete(id: number): Promise<void> {
        await this.repo.delete(id);
    }
}
