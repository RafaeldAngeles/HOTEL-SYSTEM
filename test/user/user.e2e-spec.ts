import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { clearDatabase, createTestApp } from '../helpers/app.helper';
import { User, UserRole } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('User (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepo: ReturnType<DataSource['getRepository']>;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
    userRepo = dataSource.getRepository(User);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
  });

  async function createUser(
    email = 'rafael@test.com',
    password = 'senha123',
    role = UserRole.Guest,
  ) {
    const hash = await bcrypt.hash(password, 10);
    return userRepo.save({ name: 'Rafael', email, password: hash, role });
  }

  // ------------------------------------------------------------------
  // POST /auth/login
  // ------------------------------------------------------------------
  describe('POST /user/cadastro', () => {
    it('Deve criar um novo usuário com dados válidos', async () => {
      const res = await request(app.getHttpServer())
        .post('/user/cadastro')
        .send({
          name: 'Rafael',
          email: 'rafael@test.com',
          password: 'senha123',
        })
        .expect(201);

      expect(res.body).toHaveProperty('user_id');
      expect(res.body).not.toHaveProperty('password');
    });

    it('Deve retornar 400 se os dados forem inválidos', async () => {
      const res = await request(app.getHttpServer())
        .post('/user/cadastro')
        .send({ email: 'not-an-email', password: '123' })
        .expect(400);
    });

    it('Deve retornar 400 se o email já existir', async () => {
      await createUser();
      await request(app.getHttpServer())
        .post('/user/cadastro')
        .send({
          name: 'Rafael',
          email: 'rafael@test.com',
          password: 'senha123',
        })
        .expect(400);
    });

    it('Deve retornar 400 se o nome for curto demais (menos de 2 chars)', async () => {
      const res = await request(app.getHttpServer())
        .post('/user/cadastro')
        .send({ name: 'R', email: 'rafael@test.com', password: 'senha123' })
        .expect(400);
    });

    it('Deve retornar 400 se a senha for curta demais (menos de 8 chars)', async () => {
      const res = await request(app.getHttpServer())
        .post('/user/cadastro')
        .send({ name: 'Rafael', email: 'rafael@test.com', password: '1234567' })
        .expect(400);
    });

    it('Deve retornar 400 se o body vier vazio', async () => {
      const res = await request(app.getHttpServer())
        .post('/user/cadastro')
        .send({})
        .expect(400);
    });
  });

  async function loginAndGetToken(
    email: string,
    password: string,
  ): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
    return res.body.access_token;
  }

  // ------------------------------------------------------------------
  // GET /user
  // ------------------------------------------------------------------
  describe('GET /user', () => {
    it('deve retornar lista paginada para Admin autenticado', async () => {
      await createUser('admin@test.com', 'senha123', UserRole.Admin);
      const token = await loginAndGetToken('admin@test.com', 'senha123');

      const res = await request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('deve retornar 403 para Guest autenticado', async () => {
      await createUser('guest@test.com', 'senha123', UserRole.Guest);
      const token = await loginAndGetToken('guest@test.com', 'senha123');

      await request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('deve retornar 401 sem token', async () => {
      await request(app.getHttpServer()).get('/user').expect(401);
    });
  });

  // ------------------------------------------------------------------
  // PATCH /user/:id
  // ------------------------------------------------------------------
  describe('PATCH /user/:id', () => {
    it('deve permitir usuário atualizar o próprio perfil', async () => {
      const user = await createUser(
        'guest@test.com',
        'senha123',
        UserRole.Guest,
      );
      const token = await loginAndGetToken('guest@test.com', 'senha123');

      const res = await request(app.getHttpServer())
        .patch(`/user/${user.user_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Rafael Atualizado' })
        .expect(200);

      expect(res.body.name).toBe('Rafael Atualizado');
    });

    it('deve retornar 403 quando Guest tenta atualizar outro usuário', async () => {
      const guest = await createUser(
        'guest@test.com',
        'senha123',
        UserRole.Guest,
      );
      const outro = await createUser(
        'outro@test.com',
        'senha123',
        UserRole.Guest,
      );
      const token = await loginAndGetToken('guest@test.com', 'senha123');

      await request(app.getHttpServer())
        .patch(`/user/${outro.user_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Hacker' })
        .expect(403);
    });

    it('deve permitir Admin atualizar qualquer usuário', async () => {
      const guest = await createUser(
        'guest@test.com',
        'senha123',
        UserRole.Guest,
      );
      await createUser('admin@test.com', 'senha123', UserRole.Admin);
      const token = await loginAndGetToken('admin@test.com', 'senha123');

      const res = await request(app.getHttpServer())
        .patch(`/user/${guest.user_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Atualizado pelo Admin' })
        .expect(200);

      expect(res.body.name).toBe('Atualizado pelo Admin');
    });

    it('deve retornar 401 sem token', async () => {
      const user = await createUser();
      await request(app.getHttpServer())
        .patch(`/user/${user.user_id}`)
        .send({ name: 'Sem Auth' })
        .expect(401);
    });
  });
});
