import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import type { Test } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTestDto): Promise<Test> {
    const { name } = dto;

    const test = await this.prisma.test.create({
      data: {
        name,
      },
    });

    return test;
  }

  async findOne(id: number): Promise<Test> {
    const test = await this.prisma.test.findUnique({
      where: { id: Number(id) },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    return test;
  }
}
