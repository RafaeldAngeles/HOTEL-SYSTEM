import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { clearDatabase, createTestApp } from '../helpers/app.helper';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Room } from 'src/room/entities/room.entity';
import { RoomType } from 'src/room/entities/room-type.enum';

describe('Room (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepo: ReturnType<DataSource['getRepository']>;
  let roomRepo: ReturnType<DataSource['getRepository']>;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
    userRepo = dataSource.getRepository(User);
    roomRepo = dataSource.getRepository(Room);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
  });

  async function createUser(
    email = 'admin@test.com',
    password = 'senha123',
    role = UserRole.Admin,
  ) {
    const hash = await bcrypt.hash(password, 10);
    return userRepo.save({ name: 'Admin', email, password: hash, role });
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

  const validRoomDto = {
    number_room: 101,
    price_room: 250.0,
    description_room: 'Quarto confortável com vista para o mar',
    capacity_room: 2,
    type: RoomType.Double,
  };

  // ------------------------------------------------------------------
  // POST /room/create
  // ------------------------------------------------------------------
  describe('POST /room/create', () => {
    it('deve criar um quarto com dados válidos (Admin)', async () => {
      await createUser();
      const token = await loginAndGetToken('admin@test.com', 'senha123');

      const res = await request(app.getHttpServer())
        .post('/room/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validRoomDto)
        .expect(201);

      expect(res.body).toHaveProperty('room_id');
      expect(res.body.number_room).toBe(validRoomDto.number_room);
      expect(res.body.type).toBe(RoomType.Double);
    });

    it('deve retornar 401 sem token', async () => {
      await request(app.getHttpServer())
        .post('/room/create')
        .send(validRoomDto)
        .expect(401);
    });

    it('deve retornar 403 para Guest autenticado', async () => {
      await createUser('guest@test.com', 'senha123', UserRole.Guest);
      const token = await loginAndGetToken('guest@test.com', 'senha123');

      await request(app.getHttpServer())
        .post('/room/create')
        .set('Authorization', `Bearer ${token}`)
        .send(validRoomDto)
        .expect(403);
    });

    it('deve retornar 400 com dados inválidos', async () => {
      await createUser();
      const token = await loginAndGetToken('admin@test.com', 'senha123');

      await request(app.getHttpServer())
        .post('/room/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ number_room: -1, price_room: 'invalido', type: 'inexistente' })
        .expect(400);
    });

    it('deve retornar 400 com body vazio', async () => {
      await createUser();
      const token = await loginAndGetToken('admin@test.com', 'senha123');

      await request(app.getHttpServer())
        .post('/room/create')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);
    });

    it('deve retornar 400 se capacity_room for zero ou negativo', async () => {
      await createUser();
      const token = await loginAndGetToken('admin@test.com', 'senha123');

      await request(app.getHttpServer())
        .post('/room/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validRoomDto, capacity_room: 0 })
        .expect(400);
    });
  });

  // ------------------------------------------------------------------
  // GET /room/:id
  // ------------------------------------------------------------------
  describe('GET /room/:id', () => {
    it('deve retornar o quarto pelo id (Admin)', async () => {
      await createUser();
      const token = await loginAndGetToken('admin@test.com', 'senha123');
      const room = await createRoom();

      const res = await request(app.getHttpServer())
        .get(`/room/${room.room_id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.room_id).toBe(room.room_id);
      expect(res.body.number_room).toBe(room.number_room);
    });

    it('deve retornar 401 sem token', async () => {
      const room = await createRoom();

      await request(app.getHttpServer())
        .get(`/room/${room.room_id}`)
        .expect(401);
    });

    it('deve retornar 403 para Guest autenticado', async () => {
      await createUser('guest@test.com', 'senha123', UserRole.Guest);
      const token = await loginAndGetToken('guest@test.com', 'senha123');
      const room = await createRoom();

      await request(app.getHttpServer())
        .get(`/room/${room.room_id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });

  // ------------------------------------------------------------------
  // GET /room (paginado)
  // ------------------------------------------------------------------
  describe('GET /room', () => {
    it('deve retornar lista paginada de quartos (Admin)', async () => {
      await createUser();
      const token = await loginAndGetToken('admin@test.com', 'senha123');
      await createRoom({ number_room: 101 });
      await createRoom({ number_room: 102 });

      const res = await request(app.getHttpServer())
        .get('/room')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it('deve retornar lista vazia quando não há quartos cadastrados', async () => {
      await createUser();
      const token = await loginAndGetToken('admin@test.com', 'senha123');

      const res = await request(app.getHttpServer())
        .get('/room')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res.body.data).toHaveLength(0);
      expect(res.body.total).toBe(0);
    });

    it('deve retornar 401 sem token', async () => {
      await request(app.getHttpServer()).get('/room').expect(401);
    });

    it('deve retornar 403 para Guest autenticado', async () => {
      await createUser('guest@test.com', 'senha123', UserRole.Guest);
      const token = await loginAndGetToken('guest@test.com', 'senha123');

      await request(app.getHttpServer())
        .get('/room')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });

  // ------------------------------------------------------------------
  // PATCH /room/:id
  // ------------------------------------------------------------------
  describe('PATCH /room/:id', () => {
    it('deve atualizar o quarto com dados válidos (Admin)', async () => {
      await createUser();
      const token = await loginAndGetToken('admin@test.com', 'senha123');
      const room = await createRoom();

      const res = await request(app.getHttpServer())
        .patch(`/room/${room.room_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price_room: 500.0, description_room: 'Descrição atualizada' })
        .expect(200);

      expect(Number(res.body.price_room)).toBe(500.0);
      expect(res.body.description_room).toBe('Descrição atualizada');
    });

    it('deve retornar 400 com dados inválidos no body', async () => {
      await createUser();
      const token = await loginAndGetToken('admin@test.com', 'senha123');
      const room = await createRoom();

      await request(app.getHttpServer())
        .patch(`/room/${room.room_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price_room: 'invalido' })
        .expect(400);
    });

    it('deve retornar 401 sem token', async () => {
      const room = await createRoom();

      await request(app.getHttpServer())
        .patch(`/room/${room.room_id}`)
        .send({ price_room: 500.0 })
        .expect(401);
    });

    it('deve retornar 403 para Guest autenticado', async () => {
      await createUser('guest@test.com', 'senha123', UserRole.Guest);
      const token = await loginAndGetToken('guest@test.com', 'senha123');
      const room = await createRoom();

      await request(app.getHttpServer())
        .patch(`/room/${room.room_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price_room: 500.0 })
        .expect(403);
    });
  });

  // ------------------------------------------------------------------
  // DELETE /room/:id
  // ------------------------------------------------------------------
  describe('DELETE /room/:id', () => {
    it('deve remover o quarto (Admin)', async () => {
      await createUser();
      const token = await loginAndGetToken('admin@test.com', 'senha123');
      const room = await createRoom();

      await request(app.getHttpServer())
        .delete(`/room/${room.room_id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const removido = await roomRepo.findOne({ where: { room_id: room.room_id } });
      expect(removido).toBeNull();
    });

    it('deve retornar 401 sem token', async () => {
      const room = await createRoom();

      await request(app.getHttpServer())
        .delete(`/room/${room.room_id}`)
        .expect(401);
    });

    it('deve retornar 403 para Guest autenticado', async () => {
      await createUser('guest@test.com', 'senha123', UserRole.Guest);
      const token = await loginAndGetToken('guest@test.com', 'senha123');
      const room = await createRoom();

      await request(app.getHttpServer())
        .delete(`/room/${room.room_id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });
});
