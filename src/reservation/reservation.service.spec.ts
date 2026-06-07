import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReservationService } from './reservation.service';
import { ReservationStatus } from './entities/reservation-type.enum';
import { Room } from 'src/room/entities/room.entity';
import { Payment } from 'src/payment/entities/payment.entity';

const mockReservationRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAny: jest.fn(),
  findAll: jest.fn(),
  findAllPaginated: jest.fn(),
  update: jest.fn(),
  updateAny: jest.fn(),
  delete: jest.fn(),
  findByRoom: jest.fn(),
  countCheckInsOn: jest.fn(),
  countCheckOutsOn: jest.fn(),
};

const mockRoomRepository = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findAllPaginated: jest.fn(),
  findAvailable: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockRoomTypeOrmRepository = {
  count: jest.fn(),
  update: jest.fn(),
};

const mockPaymentTypeOrmRepository = {
  count: jest.fn(),
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
    status: 'available',
    floor: null,
    reservations: [],
  };

  const mockReservation = {
    id_reservation: 1,
    user: mockUser,
    room: mockRoom,
    start_date: new Date('2027-01-10'),
    end_date: new Date('2027-01-15'),
    status: ReservationStatus.Confirmed,
    guests: 2,
    guest_name: null,
    guest_email: null,
    guest_phone: null,
    guest_cpf: null,
    notes: null,
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
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomTypeOrmRepository,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentTypeOrmRepository,
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
      guests: 2,
    };

    it('deve criar uma reserva com dados válidos e retornar a reserva criada', async () => {
      mockRoomRepository.findById.mockResolvedValue(mockRoom);
      mockReservationRepository.findByRoom.mockResolvedValue([]);
      mockReservationRepository.create.mockResolvedValue(mockReservation);

      const result = await service.create(dto, mockUser);

      expect(mockRoomRepository.findById).toHaveBeenCalledWith(dto.room_id);
      expect(mockReservationRepository.findByRoom).toHaveBeenCalledWith(
        mockRoom.room_id,
      );
      expect(mockReservationRepository.create).toHaveBeenCalledWith({
        room: mockRoom,
        user: mockUser,
        start_date: new Date(dto.start_date),
        end_date: new Date(dto.end_date),
        guests: dto.guests,
        guest_name: null,
        guest_email: null,
        guest_phone: null,
        guest_cpf: null,
        notes: null,
        status: ReservationStatus.Confirmed,
      });
      expect(result).toEqual(mockReservation);
    });

    it('deve lançar NotFoundException quando o quarto não existe', async () => {
      mockRoomRepository.findById.mockResolvedValue(null);

      await expect(service.create(dto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException quando a data de início está no passado', async () => {
      const dtoPassado = {
        room_id: 1,
        start_date: '2020-01-01',
        end_date: '2020-01-05',
        guests: 1,
      };

      await expect(service.create(dtoPassado, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException quando a data de saída é anterior à de entrada', async () => {
      const dtoInvalido = {
        room_id: 1,
        start_date: '2027-01-15',
        end_date: '2027-01-10',
        guests: 1,
      };

      await expect(service.create(dtoInvalido, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException quando há conflito de reserva para o período', async () => {
      mockRoomRepository.findById.mockResolvedValue(mockRoom);
      mockReservationRepository.findByRoom.mockResolvedValue([mockReservation]);

      await expect(service.create(dto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // --------------------------------------------------------------
  // FUNCTION FINDALL
  // --------------------------------------------------------------
  describe('findAll', () => {
    it('deve chamar o repository.findAllPaginated com os parâmetros corretos e retornar as reservas', async () => {
      const pagination = { page: 1, limit: 10, offset: 0 };
      const paginatedResult = {
        data: [mockReservation],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockReservationRepository.findAllPaginated.mockResolvedValue(
        paginatedResult,
      );

      const result = await service.findAll(mockUser, pagination);

      expect(mockReservationRepository.findAllPaginated).toHaveBeenCalledWith(
        mockUser,
        pagination,
      );
      expect(result).toEqual(paginatedResult);
    });
  });

  // --------------------------------------------------------------
  // FUNCTION FINDBYID
  // --------------------------------------------------------------
  describe('findById', () => {
    it('deve chamar o repository.findById com o id e usuário corretos e retornar a reserva', async () => {
      mockReservationRepository.findById.mockResolvedValue(mockReservation);

      const result = await service.findById(1, mockUser);

      expect(mockReservationRepository.findById).toHaveBeenCalledWith(
        1,
        mockUser,
      );
      expect(result).toEqual(mockReservation);
    });
  });

  // --------------------------------------------------------------
  // FUNCTION UPDATE
  // --------------------------------------------------------------
  describe('update', () => {
    it('deve atualizar a reserva e retornar o resultado atualizado', async () => {
      const updateDto = { start_date: '2027-02-01', end_date: '2027-02-10' };
      const reservaAtualizada = {
        ...mockReservation,
        start_date: new Date('2027-02-01'),
        end_date: new Date('2027-02-10'),
      };
      mockReservationRepository.findById.mockResolvedValue(mockReservation);
      mockReservationRepository.update.mockResolvedValue(reservaAtualizada);

      const result = await service.update(1, updateDto, mockUser);

      expect(mockReservationRepository.findById).toHaveBeenCalledWith(
        1,
        mockUser,
      );
      expect(mockReservationRepository.update).toHaveBeenCalledWith(
        1,
        {
          start_date: new Date(updateDto.start_date),
          end_date: new Date(updateDto.end_date),
        },
        mockUser,
      );
      expect(result).toEqual(reservaAtualizada);
    });

    it('deve lançar NotFoundException quando a reserva não existe', async () => {
      mockReservationRepository.findById.mockResolvedValue(null);

      await expect(service.update(1, {}, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException quando a nova data de saída é anterior à de entrada', async () => {
      const updateDtoInvalido = {
        start_date: '2027-02-10',
        end_date: '2027-02-01',
      };
      mockReservationRepository.findById.mockResolvedValue(mockReservation);

      await expect(
        service.update(1, updateDtoInvalido, mockUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // --------------------------------------------------------------
  // FUNCTION DELETE (soft-delete: marca como cancelada)
  // --------------------------------------------------------------
  describe('delete', () => {
    it('deve marcar a reserva como cancelada e retornar mensagem de sucesso', async () => {
      mockReservationRepository.findById.mockResolvedValue(mockReservation);
      mockReservationRepository.updateAny.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.Cancelled,
      });

      const result = await service.delete(1, mockUser);

      expect(mockReservationRepository.findById).toHaveBeenCalledWith(
        1,
        mockUser,
      );
      expect(mockReservationRepository.updateAny).toHaveBeenCalledWith(1, {
        status: ReservationStatus.Cancelled,
      });
      expect(result).toBe('A reserva 1 foi cancelada com sucesso!');
    });

    it('deve lançar NotFoundException quando a reserva não existe', async () => {
      mockReservationRepository.findById.mockResolvedValue(null);

      await expect(service.delete(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // --------------------------------------------------------------
  // FUNCTION CHECKIN
  // --------------------------------------------------------------
  describe('checkIn', () => {
    it('deve mover reserva para checked_in e marcar room como occupied', async () => {
      mockReservationRepository.findByIdAny
        .mockResolvedValueOnce(mockReservation)
        .mockResolvedValueOnce({
          ...mockReservation,
          status: ReservationStatus.CheckedIn,
        });

      const result = await service.checkIn(1);

      expect(mockReservationRepository.updateAny).toHaveBeenCalledWith(1, {
        status: ReservationStatus.CheckedIn,
      });
      expect(mockRoomTypeOrmRepository.update).toHaveBeenCalledWith(
        mockRoom.room_id,
        { status: 'occupied' },
      );
      expect(result.status).toBe(ReservationStatus.CheckedIn);
    });

    it('deve lançar NotFoundException quando reserva não existe', async () => {
      mockReservationRepository.findByIdAny.mockResolvedValue(null);

      await expect(service.checkIn(99)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException quando reserva já cancelada', async () => {
      mockReservationRepository.findByIdAny.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.Cancelled,
      });

      await expect(service.checkIn(1)).rejects.toThrow(BadRequestException);
    });
  });

  // --------------------------------------------------------------
  // FUNCTION CHECKOUT
  // --------------------------------------------------------------
  describe('checkOut', () => {
    it('deve mover reserva para checked_out e marcar room como cleaning', async () => {
      mockReservationRepository.findByIdAny
        .mockResolvedValueOnce({
          ...mockReservation,
          status: ReservationStatus.CheckedIn,
        })
        .mockResolvedValueOnce({
          ...mockReservation,
          status: ReservationStatus.CheckedOut,
        });

      const result = await service.checkOut(1);

      expect(mockReservationRepository.updateAny).toHaveBeenCalledWith(1, {
        status: ReservationStatus.CheckedOut,
      });
      expect(mockRoomTypeOrmRepository.update).toHaveBeenCalledWith(
        mockRoom.room_id,
        { status: 'cleaning' },
      );
      expect(result.status).toBe(ReservationStatus.CheckedOut);
    });

    it('deve lançar BadRequestException quando reserva não está em checked_in', async () => {
      mockReservationRepository.findByIdAny.mockResolvedValue(mockReservation);

      await expect(service.checkOut(1)).rejects.toThrow(BadRequestException);
    });
  });

  // --------------------------------------------------------------
  // FUNCTION STATS TODAY
  // --------------------------------------------------------------
  describe('statsToday', () => {
    it('deve retornar KPIs do dashboard', async () => {
      mockReservationRepository.countCheckInsOn.mockResolvedValue(3);
      mockReservationRepository.countCheckOutsOn.mockResolvedValue(2);
      mockRoomTypeOrmRepository.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(7);
      mockPaymentTypeOrmRepository.count.mockResolvedValue(4);

      const result = await service.statsToday();

      expect(result).toEqual({
        checkInsToday: 3,
        checkOutsToday: 2,
        pendingPayments: 4,
        occupancyRate: 70,
      });
    });

    it('deve retornar occupancyRate 0 quando não há quartos', async () => {
      mockReservationRepository.countCheckInsOn.mockResolvedValue(0);
      mockReservationRepository.countCheckOutsOn.mockResolvedValue(0);
      mockRoomTypeOrmRepository.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      mockPaymentTypeOrmRepository.count.mockResolvedValue(0);

      const result = await service.statsToday();

      expect(result.occupancyRate).toBe(0);
    });
  });
});
