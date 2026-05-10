import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationStatus } from './entities/reservation-type.enum';

const mockReservationRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findAllPaginated: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByRoom: jest.fn(),
};

const mockRoomRepository = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findAllPaginated: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ReservationService', () => {
  let service: ReservationService;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockUser: any = {
    user_id: 1,
    name: 'Rafael',
    email: 'rafael@test.com',
    password: 'senha123',
    role: 'guest',
    reservations: [],
  };

  const mockRoom = {
    room_id: 1,
    number_room: 101,
    price_room: 250.0,
    description_room: 'Quarto confortável com vista para o mar',
    capacity_room: 2,
    type: 'double',
    reservations: [],
  };

  const mockReservation = {
    id_reservation: 1,
    user: mockUser,
    room: mockRoom,
    start_date: new Date('2027-01-10'),
    end_date: new Date('2027-01-15'),
    status: ReservationStatus.Reservado,
    created: new Date('2026-05-10'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: 'IReservationRepository',
          useValue: mockReservationRepository,
        },
        {
          provide: 'IRoomRepository',
          useValue: mockRoomRepository,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
  });

  // --------------------------------------------------------------
  // FUNCTION CREATE
  // --------------------------------------------------------------
  describe('create', () => {
    const dto = {
      room_id: 1,
      start_date: '2027-01-10',
      end_date: '2027-01-15',
    };

    it('deve criar uma reserva com dados válidos e retornar a reserva criada', async () => {
      // ARRANGE
      mockRoomRepository.findById.mockResolvedValue(mockRoom);
      mockReservationRepository.findByRoom.mockResolvedValue([]);
      mockReservationRepository.create.mockResolvedValue(mockReservation);

      // ACT
      const result = await service.create(dto, mockUser);

      // ASSERT
      expect(mockRoomRepository.findById).toHaveBeenCalledWith(dto.room_id);
      expect(mockReservationRepository.findByRoom).toHaveBeenCalledWith(mockRoom.room_id);
      expect(mockReservationRepository.create).toHaveBeenCalledWith({
        room: mockRoom,
        user: mockUser,
        start_date: new Date(dto.start_date),
        end_date: new Date(dto.end_date),
      });
      expect(result).toEqual(mockReservation);
    });

    it('deve lançar NotFoundException quando o quarto não existe', async () => {
      // ARRANGE
      mockRoomRepository.findById.mockResolvedValue(null);

      // ACT & ASSERT
      await expect(service.create(dto, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException quando a data de início está no passado', async () => {
      // ARRANGE
      const dtoPassado = { room_id: 1, start_date: '2020-01-01', end_date: '2020-01-05' };

      // ACT & ASSERT
      await expect(service.create(dtoPassado, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException quando a data de saída é anterior à de entrada', async () => {
      // ARRANGE
      const dtoInvalido = { room_id: 1, start_date: '2027-01-15', end_date: '2027-01-10' };

      // ACT & ASSERT
      await expect(service.create(dtoInvalido, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException quando há conflito de reserva para o período', async () => {
      // ARRANGE
      mockRoomRepository.findById.mockResolvedValue(mockRoom);
      mockReservationRepository.findByRoom.mockResolvedValue([mockReservation]);

      // ACT & ASSERT
      await expect(service.create(dto, mockUser)).rejects.toThrow(BadRequestException);
    });
  });

  // --------------------------------------------------------------
  // FUNCTION FINDALL
  // --------------------------------------------------------------
  describe('findAll', () => {
    it('deve chamar o repository.findAllPaginated com os parâmetros corretos e retornar as reservas', async () => {
      // ARRANGE
      const pagination = { page: 1, limit: 10, offset: 0 };
      const paginatedResult = {
        data: [mockReservation],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockReservationRepository.findAllPaginated.mockResolvedValue(paginatedResult);

      // ACT
      const result = await service.findAll(mockUser, pagination);

      // ASSERT
      expect(mockReservationRepository.findAllPaginated).toHaveBeenCalledWith(mockUser, pagination);
      expect(result).toEqual(paginatedResult);
    });
  });

  // --------------------------------------------------------------
  // FUNCTION FINDBYID
  // --------------------------------------------------------------
  describe('findById', () => {
    it('deve chamar o repository.findById com o id e usuário corretos e retornar a reserva', async () => {
      // ARRANGE
      mockReservationRepository.findById.mockResolvedValue(mockReservation);

      // ACT
      const result = await service.findById(1, mockUser);

      // ASSERT
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(1, mockUser);
      expect(result).toEqual(mockReservation);
    });
  });

  // --------------------------------------------------------------
  // FUNCTION UPDATE
  // --------------------------------------------------------------
  describe('update', () => {
    it('deve atualizar a reserva e retornar o resultado atualizado', async () => {
      // ARRANGE
      const updateDto = { start_date: '2027-02-01', end_date: '2027-02-10' };
      const reservaAtualizada = {
        ...mockReservation,
        start_date: new Date('2027-02-01'),
        end_date: new Date('2027-02-10'),
      };
      mockReservationRepository.findById.mockResolvedValue(mockReservation);
      mockReservationRepository.update.mockResolvedValue(reservaAtualizada);

      // ACT
      const result = await service.update(1, updateDto, mockUser);

      // ASSERT
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(1, mockUser);
      expect(mockReservationRepository.update).toHaveBeenCalledWith(
        1,
        { start_date: new Date(updateDto.start_date), end_date: new Date(updateDto.end_date) },
        mockUser,
      );
      expect(result).toEqual(reservaAtualizada);
    });

    it('deve lançar NotFoundException quando a reserva não existe', async () => {
      // ARRANGE
      mockReservationRepository.findById.mockResolvedValue(null);

      // ACT & ASSERT
      await expect(service.update(1, {}, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException quando a nova data de saída é anterior à de entrada', async () => {
      // ARRANGE
      const updateDtoInvalido = { start_date: '2027-02-10', end_date: '2027-02-01' };
      mockReservationRepository.findById.mockResolvedValue(mockReservation);

      // ACT & ASSERT
      await expect(service.update(1, updateDtoInvalido, mockUser)).rejects.toThrow(BadRequestException);
    });
  });

  // --------------------------------------------------------------
  // FUNCTION DELETE
  // --------------------------------------------------------------
  describe('delete', () => {
    it('deve deletar a reserva e retornar mensagem de sucesso', async () => {
      // ARRANGE
      mockReservationRepository.findById.mockResolvedValue(mockReservation);
      mockReservationRepository.delete.mockResolvedValue(undefined);

      // ACT
      const result = await service.delete(1, mockUser);

      // ASSERT
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(1, mockUser);
      expect(mockReservationRepository.delete).toHaveBeenCalledWith(1, mockUser);
      expect(result).toBe('A reserva 1 foi deletada com sucesso!');
    });

    it('deve lançar NotFoundException quando a reserva não existe', async () => {
      // ARRANGE
      mockReservationRepository.findById.mockResolvedValue(null);

      // ACT & ASSERT
      await expect(service.delete(1, mockUser)).rejects.toThrow(NotFoundException);
    });
  });
});
