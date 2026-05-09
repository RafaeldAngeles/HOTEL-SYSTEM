import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { RoomType } from './entities/room-type.enum';
import { Room } from './entities/room.entity';
import { off } from 'process';

// o mock do repositório: cada método é a função jest.fn() que pode ser configurada para retornar o que quisermos
const mockRoomRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAllPaginated: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
};

describe('RoomService', () => {
  let service: RoomService;

  beforeEach(async () => {
    // Limpa o histórico de chamadas do mock antes de cada teste
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: 'IRoomRepository',
          useValue: mockRoomRepository,
        },
      ],
    }).compile();
    service = module.get<RoomService>(RoomService);
  });

  // --------------------------------------------------------------
  // FUNCTION CREATE
  // --------------------------------------------------------------
  describe('create', () => {
    it('deve chamar repository.create com os dados corrretos e retornar o quarto criado', async () => {
      // ARRANGE: define o que o mock vai retornar quando chamado
      const dto = {
        number_room: 101,
        price_room: 250.0,
        description_room: 'Quarto confortável com vista para o mar',
        capacity_room: 2,
        type: RoomType.Double,
      };
      const roomCriado: Room = { room_id: 1, ...dto, reservations: [] };
      mockRoomRepository.create.mockResolvedValue(roomCriado);

      // ACT: chama o método do serviço
      const result = await service.create(dto);

      // ASSERT: Verifica o que aconteceu
      expect(mockRoomRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(roomCriado);
    });
  });

  // --------------------------------------------------------------
  // FUNCTION FINDBYID
  // --------------------------------------------------------------
  describe('findById', () => {
    it('deve chamar o repository.findById com o id correto e retornar o quarto encontrado', async () => {
      // ARRANGE
      const roomId = 1;
      const roomEncontrado: Room = {
        room_id: roomId,
        number_room: 101,
        price_room: 250.0,
        description_room: 'Quarto confortável com vista para o mar',
        capacity_room: 2,
        type: RoomType.Double,
        reservations: [],
      };
      mockRoomRepository.findById.mockResolvedValue(roomEncontrado);

      // ACT
      const result = await service.findById(roomId);

      // ASSERT
      expect(mockRoomRepository.findById).toHaveBeenCalledWith(roomId);
      expect(result).toEqual(roomEncontrado);
    });
  });

  // --------------------------------------------------------------
  // FUNCTION FINDALL
  // --------------------------------------------------------------
  describe('findAll', () => {
    it('deve chamar o repository.findAll com os parâmetros corretos e retornar os quartos encontrados', async () => {
      // ARRANGE
      const pagination = { page: 1, limit: 10, offset: 0 };
      const paginatedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };
      mockRoomRepository.findAllPaginated.mockResolvedValue(paginatedResult);

      const result = await service.findAll(pagination);

      expect(mockRoomRepository.findAllPaginated).toHaveBeenCalledWith(
        pagination,
      );
      expect(result).toEqual(paginatedResult);
    });
  });

  // --------------------------------------------------------------
  // FUNCTION UPDATE
  // --------------------------------------------------------------
  describe('update', () => {
    it('deve chamar o repository.update com os parâmetros corretos e retornar o quarto atualizado', async () => {
      // ARRANGE
      const roomId = 1;
      const updateDto = {
        number_room: 202,
        price_room: 250.0,
        description_room: 'Quarto atualizado com vista para o mar',
        capacity_room: 2,
      };
      const roomAtualizado: Room = {
        room_id: 1,
        number_room: 202,
        price_room: 250.0,
        description_room: 'Quarto atualizado com vista para o mar',
        capacity_room: 2,
        type: RoomType.Single,
        reservations: [],
      };
      mockRoomRepository.update.mockResolvedValue(roomAtualizado);

      const result = await service.update(1, updateDto);

      expect(mockRoomRepository.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(roomAtualizado);
    });
  });

  // --------------------------------------------------------------
  // FUNCTION REMOVE
  // --------------------------------------------------------------

  describe('remove', () => {
    it('deve chamar repository.delete com o id correto', async () => {
      mockRoomRepository.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockRoomRepository.delete).toHaveBeenCalledWith(1);
      expect(mockRoomRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
