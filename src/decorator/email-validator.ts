import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { PrismaClient } from '@prisma/client';

@ValidatorConstraint({ async: true })
class IsUserAlreadyExistConstraint implements ValidatorConstraintInterface {
  private readonly prisma: PrismaClient = new PrismaClient()

  public async validate(email: any): Promise<boolean> {
    if(typeof email != 'string') return true  

    return this.prisma.user.findFirst({ where: { email }}).then((user): boolean => user ? false : true)
  }
}

export function IsEmailAlreadyExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUserAlreadyExistConstraint,
    });
  };
}