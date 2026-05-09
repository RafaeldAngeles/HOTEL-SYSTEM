import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { RoomType } from './entities/room-type.enum';
import { Room } from './entities/room.entity';

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

  // function create
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
});
