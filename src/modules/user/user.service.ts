import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import type { User } from '../../generated/prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name, avatarUrl } = createUserDto;

    return await this.prisma.user.create({
      data: {
        email,
        password,
        name,
        avatarUrl,
      },
    });
  }

  async getById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { email, password, name, avatarUrl } = updateUserDto;

    await this.getById(id);

    return await this.prisma.user.update({
      where: { id },
      data: { email, password, name, avatarUrl },
    });
  }

  async remove(id: number): Promise<User> {
    await this.getById(id);
    return await this.prisma.user.delete({ where: { id } });
  }
}
