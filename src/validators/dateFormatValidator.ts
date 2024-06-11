import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export function IsDateFormat(
  property: string,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isDateFormat",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Check if the date format is dd/mm/yyyy
          return (
            typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${propertyName} must be in the format dd/mm/yyyy`;
        },
      },
    });
  };
}
