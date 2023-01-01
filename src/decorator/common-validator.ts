import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function IsNumberFromString(options?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: {
        validate(value: string, args: ValidationArguments) {
          if(value == '') return true

          const isNumber = parseInt(value)
          if(!Number.isNaN(isNumber)) return true
          else return false
        }
      }
    });
  }
}

export function IsBooleanFromString(options?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: {
        validate(value: string, args: ValidationArguments) {
          if(value.toLowerCase() == 'true' || value.toLowerCase() == 'false') return true
          else return false
        }
      }
    });
  }
}