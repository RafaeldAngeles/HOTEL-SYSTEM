import { Injectable } from "@nestjs/common";
import { IReservationRepository } from "./reservatio.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Reservation } from "../entities/reservation.entity";
import { Repository } from "typeorm";



@Injectable()
export class ReservationRepository implements IReservationRepository{
    constructor(
        @InjectRepository(Reservation)
        private readonly repo: Repository <Reservation>,
    ){}

    findAll(): Promise<Reservation[]> {
        return this.repo.find();
    }

    findById(id: number): Promise<Reservation | null> {
        return this.repo.findOne({where: {id}})
        
    }

     create(data: Partial<Reservation>): Promise<Reservation> {
    const reservation = this.repo.create(data);
    return this.repo.save(reservation);
  }

    async delete(id: number): Promise<void> {
        await this.repo.delete(id);
    }
}