import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { hashPassword } from 'src/utils/hashing';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PublicUser, AuthUser } from './user.type';
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(dto: PaginationDto): Promise<PublicUser[]> {
    const { page, limit } = dto;

    return await this.prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      omit: { password: true },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<PublicUser> {
    const { email, password, name, avatarUrl } = createUserDto;

    const hashedPassword = await hashPassword(password);

    return await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        avatarUrl,
      },
      omit: { password: true },
    });
  }

  async findById(id: number): Promise<PublicUser | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });
  }

  async getById(id: number): Promise<PublicUser> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<PublicUser | null> {
    if (!email) return null;
    return await this.prisma.user.findUnique({
      where: { email },
      omit: { password: true },
    });
  }

  async findByEmailForAuth(email: string): Promise<AuthUser | null> {
    if (!email) return null;

    return await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<PublicUser> {
    await this.getById(id);
    const { email, password, name, avatarUrl } = updateUserDto;
    const hashedPassword = password ? await hashPassword(password) : undefined;

    return await this.prisma.user.update({
      where: { id },
      data: {
        email,
        password: hashedPassword,
        name,
        avatarUrl,
      },
      omit: { password: true },
    });
  }

  async remove(id: number): Promise<PublicUser> {
    await this.getById(id);
    return await this.prisma.user.delete({
      where: { id },
      omit: { password: true },
    });
  }

  async incrementTokenVersion(userId: number): Promise<number> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newTokenVersion = user.tokenVersion + 1;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { tokenVersion: newTokenVersion },
    });

    return newTokenVersion;
  }
}
