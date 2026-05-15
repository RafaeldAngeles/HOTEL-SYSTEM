import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { clearDatabase, createTestApp } from '../helpers/app.helper';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Room } from 'src/room/entities/room.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { RoomType } from 'src/room/entities/room-type.enum';

describe('Reservation (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepo: ReturnType<DataSource['getRepository']>;
  let roomRepo: ReturnType<DataSource['getRepository']>;
  let reservationRepo: ReturnType<DataSource['getRepository']>;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
    userRepo = dataSource.getRepository(User);
    roomRepo = dataSource.getRepository(Room);
    reservationRepo = dataSource.getRepository(Reservation);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
  });

  function futureDate(daysFromNow: number): string {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
  }

  async function createUser(
    email = 'guest@test.com',
    password = 'senha123',
    role = UserRole.Guest,
  ) {
    const hash = await bcrypt.hash(password, 10);
    return userRepo.save({ name: 'Guest', email, password: hash, role });
  }

  async function loginAndGetToken(email: string, password: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
    return res.body.access_token;
  }

  async function createRoom(overrides: Partial<Room> = {}) {
    return roomRepo.save({
      number_room: 101,
      price_room: 250.0,
      description_room: 'Quarto teste',
      capacity_room: 2,
      type: RoomType.Double,
      ...overrides,
    });
  }

  async function createReservation(user: any, room: any, startDays = 1, endDays = 3) {
    return reservationRepo.save({
      user,
      room,
      start_date: new Date(futureDate(startDays)),
      end_date: new Date(futureDate(endDays)),
    });
  }

  // ------------------------------------------------------------------
  // POST /reservation/reservation-create
  // ------------------------------------------------------------------
  describe('POST /reservation/reservation-create', () => {
    it('deve criar reserva com dados válidos (Guest)', async () => {
      await createUser();
      const token = await loginAndGetToken('guest@test.com', 'senha123');
      const room = await createRoom();

      const res = await request(app.getHttpServer())
        .post('/reservation/reservation-create')
        .set('Authorization', `Bearer ${token}`)
        .send({ room_id: room.room_id, start_date: futureDate(5), end_date: futureDate(10) })
        .expect(201);

      expect(res.body).toHaveProperty('id_reservation');
      expect(res.body.room.room_id).toBe(room.room_id);
    });

    it('deve retornar 401 sem token', async () => {
      const room = await createRoom();

      await request(app.getHttpServer())
        .post('/reservation/reservation-create')
        .send({ room_id: room.room_id, start_date: futureDate(5), end_date: futureDate(10) })
        .expect(401);
    });

    it('deve retornar 403 para Admin (rota exclusiva de Guest)', async () => {
      await createUser('admin@test.com', 'senha123', UserRole.Admin);
      const token = await loginAndGetToken('admin@test.com', 'senha123');
      const room = await createRoom();

      await request(app.getHttpServer())
        .post('/reservation/reservation-create')
        .set('Authorization', `Bearer ${token}`)
        .send({ room_id: room.room_id, start_date: futureDate(5), end_date: futureDate(10) })
        .expect(403);
    });

    it('deve retornar 400 com body vazio', async () => {
      await createUser();
      const token = await loginAndGetToken('guest@test.com', 'senha123');

      await request(app.getHttpServer())
        .post('/reservation/reservation-create')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);
    });

    it('deve retornar 400 quando start_date está no passado', async () => {
      await createUser();
      const token = await loginAndGetToken('guest@test.com', 'senha123');
      const room = await createRoom();

      await request(app.getHttpServer())
        .post('/reservation/reservation-create')
        .set('Authorization', `Bearer ${token}`)
        .send({ room_id: room.room_id, start_date: '2020-01-01', end_date: futureDate(5) })
        .expect(400);
    });

    it('deve retornar 400 quando end_date <= start_date', async () => {
      await createUser();
      const token = await loginAndGetToken('guest@test.com', 'senha123');
      const room = await createRoom();

      await request(app.getHttpServer())
        .post('/reservation/reservation-create')
        .set('Authorization', `Bearer ${token}`)
        .send({ room_id: room.room_id, start_date: futureDate(10), end_date: futureDate(5) })
        .expect(400);
    });

    it('deve retornar 404 quando o quarto não existe', async () => {
      await createUser();
      const token = await loginAndGetToken('guest@test.com', 'senha123');

      await request(app.getHttpServer())
        .post('/reservation/reservation-create')
        .set('Authorization', `Bearer ${token}`)
        .send({ room_id: 9999, start_date: futureDate(5), end_date: futureDate(10) })
        .expect(404);
    });

    it('deve retornar 400 quando há conflito de datas no mesmo quarto', async () => {
      const user = await createUser();
      const token = await loginAndGetToken('guest@test.com', 'senha123');
      const room = await createRoom();
      await createReservation(user, room, 5, 10);

      await request(app.getHttpServer())
        .post('/reservation/reservation-create')
        .set('Authorization', `Bearer ${token}`)
        .send({ room_id: room.room_id, start_date: futureDate(7), end_date: futureDate(12) })
        .expect(400);
    });
  });

  // ------------------------------------------------------------------
  // GET /reservation
  // ------------------------------------------------------------------
  describe('GET /reservation', () => {
    it('deve retornar reservas paginadas do usuário autenticado', async () => {
      const user = await createUser();
      const token = await loginAndGetToken('guest@test.com', 'senha123');
      const room = await createRoom();
      await createReservation(user, room, 1, 3);
      await createReservation(user, room, 5, 8);

      const res = await request(app.getHttpServer())
        .get('/reservation')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body.data.length).toBe(2);
    });

    it('não deve retornar reservas de outro usuário', async () => {
      const outroUser = await createUser('outro@test.com', 'senha123');
      const room = await createRoom();
      await createReservation(outroUser, room, 1, 3);

      await createUser('guest@test.com', 'senha123');
      const token = await loginAndGetToken('guest@test.com', 'senha123');

      const res = await request(app.getHttpServer())
        .get('/reservation')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res.body.data.length).toBe(0);
    });

    it('deve retornar 401 sem token', async () => {
      await request(app.getHttpServer()).get('/reservation').expect(401);
    });

    it('deve retornar 403 para Admin', async () => {
      await createUser('admin@test.com', 'senha123', UserRole.Admin);
      const token = await loginAndGetToken('admin@test.com', 'senha123');

      await request(app.getHttpServer())
        .get('/reservation')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });

  // ------------------------------------------------------------------
  // GET /reservation/:id
  // ------------------------------------------------------------------
  describe('GET /reservation/:id', () => {
    it('deve retornar a reserva pelo id (Guest dono)', async () => {
      const user = await createUser();
      const token = await loginAndGetToken('guest@test.com', 'senha123');
      const room = await createRoom();
      const reservation = await createReservation(user, room);

      const res = await request(app.getHttpServer())
        .get(`/reservation/${reservation.id_reservation}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.id_reservation).toBe(reservation.id_reservation);
    });

    it('deve retornar 401 sem token', async () => {
      const user = await createUser();
      const room = await createRoom();
      const reservation = await createReservation(user, room);

      await request(app.getHttpServer())
        .get(`/reservation/${reservation.id_reservation}`)
        .expect(401);
    });

    it('deve retornar 403 para Admin', async () => {
      const guest = await createUser('guest@test.com', 'senha123');
      const room = await createRoom();
      const reservation = await createReservation(guest, room);
      await createUser('admin@test.com', 'senha123', UserRole.Admin);
      const token = await loginAndGetToken('admin@test.com', 'senha123');

      await request(app.getHttpServer())
        .get(`/reservation/${reservation.id_reservation}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });

  // ------------------------------------------------------------------
  // PATCH /reservation/:id
  // ------------------------------------------------------------------
  describe('PATCH /reservation/:id', () => {
    it('deve atualizar datas da reserva (Guest dono)', async () => {
      const user = await createUser();
      const token = await loginAndGetToken('guest@test.com', 'senha123');
      const room = await createRoom();
      const reservation = await createReservation(user, room, 5, 10);

      const res = await request(app.getHttpServer())
        .patch(`/reservation/${reservation.id_reservation}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ start_date: futureDate(6), end_date: futureDate(11) })
        .expect(200);

      expect(res.body.id_reservation).toBe(reservation.id_reservation);
    });

    it('deve retornar 404 quando tentar atualizar reserva de outro usuário', async () => {
      const outroUser = await createUser('outro@test.com', 'senha123');
      const room = await createRoom();
      const reservation = await createReservation(outroUser, room, 5, 10);

      await createUser('guest@test.com', 'senha123');
      const token = await loginAndGetToken('guest@test.com', 'senha123');

      await request(app.getHttpServer())
        .patch(`/reservation/${reservation.id_reservation}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ end_date: futureDate(12) })
        .expect(404);
    });

    it('deve retornar 400 quando end_date <= start_date', async () => {
      const user = await createUser();
      const token = await loginAndGetToken('guest@test.com', 'senha123');
      const room = await createRoom();
      const reservation = await createReservation(user, room, 5, 10);

      await request(app.getHttpServer())
        .patch(`/reservation/${reservation.id_reservation}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ start_date: futureDate(10), end_date: futureDate(5) })
        .expect(400);
    });

    it('deve retornar 401 sem token', async () => {
      const user = await createUser();
      const room = await createRoom();
      const reservation = await createReservation(user, room);

      await request(app.getHttpServer())
        .patch(`/reservation/${reservation.id_reservation}`)
        .send({ end_date: futureDate(10) })
        .expect(401);
    });

    it('deve retornar 403 para Admin', async () => {
      const guest = await createUser('guest@test.com', 'senha123');
      const room = await createRoom();
      const reservation = await createReservation(guest, room, 5, 10);
      await createUser('admin@test.com', 'senha123', UserRole.Admin);
      const token = await loginAndGetToken('admin@test.com', 'senha123');

      await request(app.getHttpServer())
        .patch(`/reservation/${reservation.id_reservation}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ end_date: futureDate(12) })
        .expect(403);
    });
  });

  // ------------------------------------------------------------------
  // DELETE /reservation/:id
  // ------------------------------------------------------------------
  describe('DELETE /reservation/:id', () => {
    it('deve deletar a reserva (Guest dono)', async () => {
      const user = await createUser();
      const token = await loginAndGetToken('guest@test.com', 'senha123');
      const room = await createRoom();
      const reservation = await createReservation(user, room);

      await request(app.getHttpServer())
        .delete(`/reservation/${reservation.id_reservation}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const removida = await reservationRepo.findOne({
        where: { id_reservation: reservation.id_reservation },
      });
      expect(removida).toBeNull();
    });

    it('deve retornar 404 quando tentar deletar reserva de outro usuário', async () => {
      const outroUser = await createUser('outro@test.com', 'senha123');
      const room = await createRoom();
      const reservation = await createReservation(outroUser, room);

      await createUser('guest@test.com', 'senha123');
      const token = await loginAndGetToken('guest@test.com', 'senha123');

      await request(app.getHttpServer())
        .delete(`/reservation/${reservation.id_reservation}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('deve retornar 401 sem token', async () => {
      const user = await createUser();
      const room = await createRoom();
      const reservation = await createReservation(user, room);

      await request(app.getHttpServer())
        .delete(`/reservation/${reservation.id_reservation}`)
        .expect(401);
    });

    it('deve retornar 403 para Admin', async () => {
      const guest = await createUser('guest@test.com', 'senha123');
      const room = await createRoom();
      const reservation = await createReservation(guest, room);
      await createUser('admin@test.com', 'senha123', UserRole.Admin);
      const token = await loginAndGetToken('admin@test.com', 'senha123');

      await request(app.getHttpServer())
        .delete(`/reservation/${reservation.id_reservation}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });
});
