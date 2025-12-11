import { Room } from "../entities/room.entity";

export interface IRoomRepository {
    findAll(): Promise <Room[]>
    findById(id: number): Promise<Room | null>;
    create (data: Partial<Room>): Promise<Room>;
    delete (id: number): Promise<void>

}