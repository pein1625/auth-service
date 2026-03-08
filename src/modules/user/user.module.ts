import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma/prisma.service';
import { IsEmailExistedValidator } from './validators/is-email-existed.validator';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, IsEmailExistedValidator],
})
export class UserModule {}
