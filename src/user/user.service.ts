import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    const userExists = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (userExists) {
      throw new BadRequestException('Este e-mail já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const saved = await this.userRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = saved;
    return result as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { user_id: id },
      select: ['user_id', 'name', 'email', 'role'],
    });
  }

  async update(
    id: number,
    dto: UpdateUserDto,
    requestingUser: { user_id: number; role: UserRole },
  ): Promise<User | null> {
    if (
      requestingUser.role !== UserRole.Admin &&
      requestingUser.user_id !== id
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar este usuário',
      );
    }

    if (dto.email) {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existing && existing.user_id !== id) {
        throw new BadRequestException('Este e-mail já está em uso.');
      }
    }

    const updateData: Partial<User> = { ...dto };
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    await this.userRepository.update(id, updateData);
    return this.findById(id);
  }

  async updatePasswordDirect(id: number, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(id, { password: hashed });
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<User>> {
    const [data, total] = await this.userRepository.findAndCount({
      skip: pagination.offset,
      take: pagination.limit,
      select: ['user_id', 'name', 'email', 'role'],
    });

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }
}
