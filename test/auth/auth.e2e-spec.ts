import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { clearDatabase, createTestApp } from '../helpers/app.helper';
import { User, UserRole } from 'src/user/entities/user.entity';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepo: ReturnType<DataSource['getRepository']>;

  // Sobe a app uma vez para toda a suite — subir é caro, não faz sentido repetir por teste
  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
    userRepo = dataSource.getRepository(User);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  // Limpa o banco antes de cada teste para garantir isolamento total
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
  describe('POST /auth/login', () => {
    it('deve retornar access_token e refresh_token com credenciais válidas', async () => {
      // ARRANGE: cria o usuário direto no banco de teste
      await createUser();

      // ACT + ASSERT
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'rafael@test.com', password: 'senha123' })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('refresh_token');
      expect(typeof res.body.access_token).toBe('string');
    });

    it('deve retornar 401 quando a senha está errada', async () => {
      await createUser();

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'rafael@test.com', password: 'senhaErrada' })
        .expect(401);

      expect(res.body).not.toHaveProperty('access_token');
    });

    it('deve retornar 401 quando o usuário não existe', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'naoexiste@test.com', password: 'qualquer' })
        .expect(401);
    });

    it('deve retornar 400 quando o email é malformado', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nao-e-email', password: 'senha123' })
        .expect(400);
    });

    it('deve retornar 400 quando o body está vazio', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });

  // ------------------------------------------------------------------
  // POST /auth/refresh
  // ------------------------------------------------------------------
  describe('POST /auth/refresh', () => {
    it('deve retornar novo access_token com refresh_token válido', async () => {
      await createUser();

      // Passo 1: login para obter o refresh_token
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'rafael@test.com', password: 'senha123' });

      const { refresh_token } = loginRes.body;

      // Passo 2: token vai no body, não no header (estratégia usa fromBodyField)
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
    });

    it('deve retornar 401 quando o refresh_token é inválido', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refresh_token: 'token_invalido' })
        .expect(401);
    });

    it('deve retornar 401 quando não há refresh_token no body', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(401);
    });
  });
});
