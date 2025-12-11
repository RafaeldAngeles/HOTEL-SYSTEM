import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";
import { IRoomRepository } from "./room.repository.interfaces";
import { Room } from "../entities/room.entity";




@Injectable()
export class RoomRepository implements IRoomRepository{
    constructor(
        @InjectRepository(Room)
        private readonly repo: Repository <Room>,
    ){}

    findAll(): Promise<Room[]> {
        return this.repo.find();
    }

    findById(room_id: number): Promise<Room | null> {
        return this.repo.findOne({where: {room_id}})
        
    }

     create(data: Partial<Room>): Promise<Room> {
    const reservation = this.repo.create(data);
    return this.repo.save(reservation);
  }

    async delete(id: number): Promise<void> {
        await this.repo.delete(id);
    }
}
