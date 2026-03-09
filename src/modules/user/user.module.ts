import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { IsEmailExistedValidator } from './validators/is-email-existed.validator';

@Module({
  controllers: [UserController],
  providers: [UserService, IsEmailExistedValidator],
})
export class UserModule {}
