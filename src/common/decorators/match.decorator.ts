import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      name: 'Match',
      target: target.constructor as NewableFunction,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const relatedPropertyName = args.constraints[0] as string;
          const obj = args.object as Record<string, unknown>;
          const relatedValue = obj[relatedPropertyName];
          return value === relatedValue;
        },
      },
    });
  };
}
