import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsEmailExistedValidator } from '../validators/is-email-existed.validator';

export function IsEmailUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsEmailExistedValidator,
    })
  }
}
