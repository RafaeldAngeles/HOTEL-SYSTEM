import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { User, UserRole } from './entities/user.entity';

jest.mock('bcrypt');

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  findAndCount: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  const mockUser: any = {
    user_id: 1,
    name: 'Rafael',
    email: 'rafael@test.com',
    password: 'hashed_password',
    role: UserRole.Guest,
    reservations: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  // --------------------------------------------------------------
  // FUNCTION CREATE
  // --------------------------------------------------------------
  describe('create', () => {
    const dto = { name: 'Rafael', email: 'rafael@test.com', password: 'senha123' };

    it('deve criar um usuário com dados válidos e retornar o usuário criado', async () => {
      // ARRANGE
      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockUserRepository.create.mockReturnValue({ ...dto, password: 'hashed_password' });
      mockUserRepository.save.mockResolvedValue(mockUser);

      // ACT
      const result = await service.create(dto);

      // ASSERT
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({ ...dto, password: 'hashed_password' });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('deve lançar BadRequestException quando o e-mail já está em uso', async () => {
      // ARRANGE
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // ACT & ASSERT
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  // --------------------------------------------------------------
  // FUNCTION FINDBYEMAIL
  // --------------------------------------------------------------
  describe('findByEmail', () => {
    it('deve retornar o usuário quando o e-mail existe', async () => {
      // ARRANGE
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // ACT
      const result = await service.findByEmail('rafael@test.com');

      // ASSERT
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'rafael@test.com' } });
      expect(result).toEqual(mockUser);
    });

    it('deve retornar null quando o e-mail não existe', async () => {
      // ARRANGE
      mockUserRepository.findOne.mockResolvedValue(null);

      // ACT
      const result = await service.findByEmail('inexistente@test.com');

      // ASSERT
      expect(result).toBeNull();
    });
  });

  // --------------------------------------------------------------
  // FUNCTION FINDBYID
  // --------------------------------------------------------------
  describe('findById', () => {
    it('deve retornar o usuário quando o ID existe', async () => {
      // ARRANGE
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // ACT
      const result = await service.findById(1);

      // ASSERT
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: 1 },
        select: ['user_id', 'name', 'email', 'role'],
      });
      expect(result).toEqual(mockUser);
    });

    it('deve retornar null quando o ID não existe', async () => {
      // ARRANGE
      mockUserRepository.findOne.mockResolvedValue(null);

      // ACT
      const result = await service.findById(99);

      // ASSERT
      expect(result).toBeNull();
    });
  });

  // --------------------------------------------------------------
  // FUNCTION UPDATE
  // --------------------------------------------------------------
  describe('update', () => {
    const guestUser = { user_id: 1, role: UserRole.Guest };
    const adminUser = { user_id: 99, role: UserRole.Admin };

    it('deve atualizar o usuário e retornar o usuário atualizado', async () => {
      // ARRANGE
      const dto = { name: 'Rafael Atualizado' };
      const updatedUser = { ...mockUser, name: 'Rafael Atualizado' };
      mockUserRepository.update.mockResolvedValue(undefined);
      mockUserRepository.findOne.mockResolvedValue(updatedUser);

      // ACT
      const result = await service.update(1, dto, guestUser);

      // ASSERT
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, { name: 'Rafael Atualizado' });
      expect(result).toEqual(updatedUser);
    });

    it('deve hashear a senha quando ela for atualizada', async () => {
      // ARRANGE
      const dto = { password: 'novaSenha123' };
      (bcrypt.hash as jest.Mock).mockResolvedValue('nova_hash');
      mockUserRepository.update.mockResolvedValue(undefined);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // ACT
      await service.update(1, dto, guestUser);

      // ASSERT
      expect(bcrypt.hash).toHaveBeenCalledWith('novaSenha123', 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, { password: 'nova_hash' });
    });

    it('deve lançar ForbiddenException quando um guest tenta atualizar outro usuário', async () => {
      // ARRANGE
      const outroGuest = { user_id: 2, role: UserRole.Guest };

      // ACT & ASSERT
      await expect(service.update(1, { name: 'Hacker' }, outroGuest)).rejects.toThrow(ForbiddenException);
    });

    it('deve permitir que um Admin atualize qualquer usuário', async () => {
      // ARRANGE
      const dto = { name: 'Atualizado pelo Admin' };
      mockUserRepository.update.mockResolvedValue(undefined);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // ACT & ASSERT
      await expect(service.update(1, dto, adminUser)).resolves.not.toThrow();
    });

    it('deve lançar BadRequestException quando o novo e-mail já está em uso por outro usuário', async () => {
      // ARRANGE
      const dto = { email: 'outro@test.com' };
      const outroUsuario = { ...mockUser, user_id: 2, email: 'outro@test.com' };
      mockUserRepository.findOne.mockResolvedValue(outroUsuario);

      // ACT & ASSERT
      await expect(service.update(1, dto, guestUser)).rejects.toThrow(BadRequestException);
    });
  });

  // --------------------------------------------------------------
  // FUNCTION FINDALL
  // --------------------------------------------------------------
  describe('findAll', () => {
    const pagination = { page: 1, limit: 10, offset: 0 };

    it('deve retornar lista paginada de usuários com totalPages calculado corretamente', async () => {
      // ARRANGE
      mockUserRepository.findAndCount.mockResolvedValue([[mockUser], 1]);

      // ACT
      const result = await service.findAll(pagination as any);

      // ASSERT
      expect(mockUserRepository.findAndCount).toHaveBeenCalledWith({
        skip: pagination.offset,
        take: pagination.limit,
        select: ['user_id', 'name', 'email', 'role'],
      });
      expect(result).toEqual({
        data: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('deve calcular totalPages corretamente quando há múltiplas páginas', async () => {
      // ARRANGE
      mockUserRepository.findAndCount.mockResolvedValue([[], 25]);

      // ACT
      const result = await service.findAll(pagination as any);

      // ASSERT
      expect(result.totalPages).toBe(3);
    });
  });
});
