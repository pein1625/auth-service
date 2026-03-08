import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UserService } from '../user.service';

@ValidatorConstraint({ name: 'IsEmailExisted', async: true })
@Injectable()
export class IsEmailExistedValidator implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(email: string, args: ValidationArguments) {
    const user = await this.userService.findByEmail(email)

    return !user
  }

  defaultMessage(args: ValidationArguments) {
    return 'Email already exists';
  }
}
